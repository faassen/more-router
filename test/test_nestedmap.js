import chai from 'chai';
import NestedMap from '../src/nestedmap';

let assert = chai.assert;

suite('nested map', function() {
    test("name and method", function() {
        let m = new NestedMap([{name: 'name', defaultKey: ''},
                               {name: 'method', defaultKey: 'GET'}]);
        m.set({}, 'GET default');
        m.set({name: 'edit'}, 'GET edit');
        m.set({method: 'POST'}, 'POST default');
        m.set({method: 'POST', name: 'edit'}, 'POST edit');

        assert.equal(m.get({}), 'GET default');
        assert.equal(m.get({method: 'GET'}), 'GET default');
        assert.equal(m.get({name: 'edit'}), 'GET edit');
        assert.equal(m.get({name: 'edit', method: 'POST'}), 'POST edit');
        assert.equal(m.get({method: 'POST'}), 'POST default');
        assert.equal(m.get({name: 'notthere'}), undefined);
    });
    test("fallback", function() {
        let m = new NestedMap([{name: 'name', defaultKey: '',
                                fallback: 'nameFallback'},
                               {name: 'method', defaultKey: 'GET',
                                fallback: 'methodFallback'}]);
        m.set({}, 'GET default');
        assert.equal(m.get({name: 'other'}), 'nameFallback');
        assert.equal(m.get({method: 'POST'}), 'methodFallback');
        assert.equal(m.get({name: 'other', method: 'POST'}),
                     'nameFallback');
    });
});
