/*global describe, it, expect, Handlebars*/
describe('Handlebars Intl Helper', function () {

    it('Formats numbers correctly', function () {
        var template = Handlebars.compile('{{#intl locales="es-AR"}}{{formatNumber 1000}}{{/intl}}');
        expect(template()).to.equal('1.000');
    });

    it('Formats dates correctly', function () {
        var template = Handlebars.compile(
'{{#intl locales="es-AR"}}{{formatDate now weekday="long" timeZone="UTC"}}{{/intl}}'
        );

        var date = new Date(2014, 8, 22, 0, 0, 0, 0);
        expect(template({now: date})).to.equal('lunes');
    });

    it('Formats messages correctly', function () {
        var template = Handlebars.compile('{{formatMessage (intlGet "messages.photos") numPhotos=numPhotos}}');

        var MESSAGES = {
            photos: 'You have {numPhotos, plural, =0 {no photos} =1 {one photo} other {# photos}}.'
        };
        var intlData = {
            locales: 'en-US',
            messages: MESSAGES
        };

        var html = template({numPhotos: 1}, {
            data: {intl: intlData}
        });

        expect(html).to.equal('You have one photo.');
    });

});
