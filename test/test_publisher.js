import chai from 'chai';
import Publisher from '../src/publisher';

let assert = chai.assert;

suite('publisher', function() {
    test("name and method", function() {
        function not_found(variables, request) {
            return 'not_found';
        };

        function method_not_allowed(variables, request) {
            return 'method_not_allowed';
        };

        let p = new Publisher([{name: 'name', defaultKey: '',
                                fallback: not_found,
                                extract: (request) => request.viewName},
                               {name: 'method', defaultKey: 'GET',
                                fallback: method_not_allowed}]);
        p.register(
            'animals/{id}', {method: 'GET'},
            (variables, request) => {
                return 'GET animal: ' + variables.id;
            });
        p.register(
            'animals/{id}', {method: 'GET', name: 'edit'},
            (variables, request) => {
                return 'GET animal edit: ' + variables.id;
            });
        p.register(
            'animals', {method: 'POST'},
            (variables, request) => {
                return 'POST to animal: ' + request.requestText;
            });

        assert.equal(p.resolve('animals/chicken', {}),
                     'GET animal: chicken');
        assert.equal(p.resolve('animals/chicken', { method: 'GET'}),
                     'GET animal: chicken');
        assert.equal(p.resolve('animals/chicken', { method: 'POST'}),
                     'method_not_allowed');
        assert.equal(p.resolve('animals/chicken/edit',
                               { method: 'GET'}),
                     'GET animal edit: chicken');
        assert.equal(p.resolve('animals/chicken/edit',
                               {method: 'POST' }),
                     'method_not_allowed');
        assert.equal(p.resolve('animals',
                                {method: 'GET'}),
                     'method_not_allowed');
        // this is not_found because no path is registered
        assert.equal(p.resolve('nonexistent', {}),
                     null);
        assert.equal(p.resolve('animals/chicken/noview', {}),
                     'not_found');
        assert.equal(p.resolve('animals', {method: 'POST',
                                           requestText: 'foo'}),
                     'POST to animal: foo');

    });

});
