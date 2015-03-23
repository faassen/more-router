import chai from 'chai';
import {NestedMap, Router, Publisher} from '../src/main';

let assert = chai.assert;

suite('imports', function() {
    test("main", function() {
        assert.ok(NestedMap);
        assert.ok(Router);
        assert.ok(Publisher);
    });
});
