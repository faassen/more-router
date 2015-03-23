import chai from 'chai';
import Publisher from '../src/publisher';

let assert = chai.assert;

suite('publisher', function() {
    test("name and method", function() {
        let p = new Publisher([{name: 'name', defaultKey: '',
                                fallback: '404',
                                extract: (request) => request.viewName},
                               {name: 'method', defaultKey: 'GET',
                                fallback: '405'}]);
        publisher.register(
            'animals/{id}', {method: 'GET'},
            (variables, request) => {
                return 'GET animal: ' + variables.id;
            });
        publisher.register(
            'animals/{id}', {method: 'GET', name: 'edit'},
            (variables, request) => {
                return 'GET animal edit: ' + variables.id;
            });
        publisher.register(
            'animals', {method: 'POST'},
            (variables, request) => {
                return 'POST to animal: ' + request.requestText;
            });

        // need fake request, move into fakeserver
        assert.equal(publisher.handle('animals/chicken'),
                     'GET animal: chicken');
        assert.equal(publisher.resolve('animals/chicken/edit'),
                     'GET animal edit: chicken');
        assert.equal(publisher.resolve('animals/chicken/edit')

    });

});
