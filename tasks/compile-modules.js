/* jshint node:true, undef:true, unused:true */

module.exports = function(grunt) {

    var libpath = require('path');
    var libfs = require('fs');
    var libmodule = require('module');
    var recast = require('recast');
    var Module = require('es6-module-transpiler/lib/module');
    var formatters = require('es6-module-transpiler/lib/formatters');
    var FileResolver = require('es6-module-transpiler/lib/file_resolver');
    var Container = require('es6-module-transpiler/lib/container');
    var FileResolver = require('es6-module-transpiler/lib/file_resolver');
    var formatter = formatters[formatters.DEFAULT];
    var resolverClasses = [FileResolver];

    /**
     * Provides "mock" Module object for external modules which should be ignored.
     *
     * @constructor
     */
    function NPMResolver(externalModules) {
        this.paths = [libpath.resolve("./")];
    }

    /**
     * Resolves `importedPath` imported by the given module `fromModule` to a
     * an npm module.
     *
     * @param {string} importedPath
     * @param {?Module} fromModule
     * @param {Container} container
     * @return {?Module}
     */
    NPMResolver.prototype.resolveModule = function (importedPath, fromModule, container) {
      if (importedPath.charAt(0) !== '.' && !~importedPath.indexOf('/')) {
          console.log('INFO: External module detected: "%s"', importedPath);
          var resolvedPath = this.resolvePath(importedPath, fromModule);
          if (resolvedPath) {
            var cachedModule = container.getCachedModule(resolvedPath);
            if (cachedModule) {
              return cachedModule;
            } else {
              console.log('INFO: External module found at: "%s"', resolvedPath);
              return new Module(resolvedPath, importedPath, container);
            }
          }
      }
      return null;
    };

    /**
     * Resolves `importedPath` against the importing module `fromModule`, if given,
     * within this resolver's paths.
     *
     * @private
     * @param {string} importedModuleName
     * @param {?Module} fromModule
     * @return {string}
     */
    NPMResolver.prototype.resolvePath = function(importedModuleName, fromModule) {
        var main, parent, resolved,
            parentPackagePath = this.resolvePackage(fromModule ? fromModule.path : libpath.resolve("./")),
            packagePath, pkg;

        if (!parentPackagePath) {
            console.error('ERROR: Parent module not found for: "%s"', importedModuleName);
            return null;
        }

        try {
            packagePath = this.resolvePackage(libmodule._resolveFilename(importedModuleName, libmodule._cache[parentPackagePath]));
        } catch (e1) {
            console.error('ERROR: Unable to resolve package information for module: "%s"', importedModuleName);
            return null;
        }

        try {
            pkg = require(packagePath);
            main = pkg["jsnext:main"].toString();
        } catch (e) {
            console.error('ERROR: External module without "jsnext:main" directive at: "%s"', importedModuleName);
            return null;
        }

        resolved = libpath.resolve(libpath.dirname(packagePath), main);
        if (libfs.existsSync(resolved)) {
          return resolved;
        }

        console.error('ERROR: Lookup fails for module "%s" at "%s"', importedModuleName, resolved);
        return null;
    };

    /**
     * Resolves the fullpath to the nearest `package.json` for a given module path.
     *
     * @private
     * @param {string} modulePath
     * @return {string}
     */
    NPMResolver.prototype.resolvePackage = function(modulePath) {
        var paths = libmodule._nodeModulePaths(libpath.dirname(modulePath)),
            i, p;

        for (i = 0; i < paths.length; i++) {
            p = libpath.resolve(paths[i], '../package.json');
            if (libfs.existsSync(p)) {
                require(p);
                return p;
            }
        }

        return null;
    };

    resolverClasses.push(NPMResolver);

    grunt.registerTask('compile-modules', 'transpile ES6 modules into ES5 bundles', function () {
        var config = grunt.config.data['compile-modules'] || {};

        if (typeof formatter === 'function') {
          formatter = new formatter();
        }

        var resolvers = resolverClasses.map(function(resolverClass) {
          return new resolverClass([libpath.resolve(config.cwd)]);
        });

        var container = new Container({
          formatter: formatter,
          resolvers: resolvers
        });

        try {
            container.getModule(config.src);
            var outputs = container.convert();
        } catch (err) {
            grunt.fatal('Error converting ES6 modules: ' + err);
        }

        try {
            var code = recast.print(outputs[0]).code;
        } catch (err) {
            grunt.fatal('Error printing AST: ' + err);
        }

        grunt.file.mkdir(libpath.dirname(config.dest));
        grunt.file.write(config.dest, code, {encoding: 'utf8'});

        grunt.log.ok('Transpiled module in ' + config.dest);
    });

};
