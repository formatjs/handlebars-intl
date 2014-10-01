/*global describe, it, expect, Handlebars*/
describe('Handlebars Intl Helper', function () {

    it('Formats numbers correctly', function () {
        var template = Handlebars.compile('{{#intl locales="es-AR"}}{{formatNumber 1000}}{{/intl}}');
        expect(template()).to.equal('1.000');
    });

    it('Formats dates correctly', function () {
        var template = Handlebars.compile(
'{{#intl locales="es-AR"}}{{formatDate now weekday="long" month="long" year="numeric" timeZone="UTC"}}{{/intl}}'
        );

        var date = new Date(Date.UTC(2014, 9, 20, 0, 0, 0, 0));
        expect(template({now: date})).to.contain('lunes')
            .and.to.contain('octubre')
            .and.to.contain('2014');
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
