import chai from 'chai';
import Router from '../src/router';

let assert = chai.assert;

suite("router", function() {
    test("basic", function() {
        let router = new Router();
        router.addPattern('/messages/{id}', "value");
        assert.deepEqual(router.consume(['1', 'messages']),
                         { value: "value",
                           stack: [],
                           variables: {'id': "1"}});
    }),
    test("simple", function() {
        let router = new Router();
        router.addPattern('a/b/c', 'abc');
        router.addPattern('a/b/d', 'abd');
        router.addPattern('x/y', 'xy');
        router.addPattern('x/z', 'xz');

        assert.deepEqual(router.consume(['c', 'b', 'a']),
                         { value: "abc",
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.consume(['d', 'b', 'a']),
                         { value: "abd",
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.consume(['y', 'x']),
                         { value: "xy",
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.consume(["z", "x"]),
                         { value: "xz",
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.consume(["d", "c", "b", "a"]),
                         { value: "abc",
                           stack: ['d'],
                           variables: {}
                         });
        assert.deepEqual(router.consume(["d", "d", "b", "a"]),
                         { value: "abd",
                           stack: ['d'],
                           variables: {}
                         });
        assert.deepEqual(router.consume(['3', '2', '1', 'y', 'x']),
                         { value: "xy",
                           stack: ['3', '2', '1'],
                           variables: {}
                         });
        assert.deepEqual(router.consume(['3', '2', '1']),
                         { value: null,
                           stack: ['3', '2', '1'],
                           variables: {}
                         });
        assert.deepEqual(router.consume(['b', 'a']),
                         { value: null,
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.consume(['nomatchforsure']),
                         { value: null,
                           stack: ["nomatchforsure"],
                           variables: {}
                         });

    })
    test("specific first", function() {
        let router = new Router();
        router.addPattern('a/{x}/b', 'axb');
        router.addPattern('a/prefix{x}/b', 'aprefixb');
        assert.deepEqual(router.consume(['b', 'lah', 'a']),
                         { value: 'axb',
                           stack: [],
                           variables: { 'x': 'lah'}
                         });
        assert.deepEqual(router.consume(['b', 'prefixlah', 'a']),
                         { value: 'aprefixb',
                           stack: [],
                           variables: { 'x': 'lah'}
                         });
    });
    test("multiple steps with variables", function() {
        let router = new Router();
        router.addPattern("{x}/{y}", "xy");
        assert.deepEqual(router.consume(['y', 'x']),
                         { value: "xy",
                           stack: [],
                           variables: {'x': 'x',
                                       'y': 'y'}
                         });
    });
    test("greedy middle prefix", function() {
        let router = new Router();
        router.addPattern('a/prefix{x}/y', 'prefix');
        router.addPattern('a/{x}/z', 'no_prefix');

        assert.deepEqual(router.consume(['y', 'prefixX', 'a']),
                         { value: "prefix",
                           stack: [],
                           variables: {'x': 'X'}
                         });
        assert.deepEqual(router.consume(['z', 'prefixX', 'a']),
                         { value: null,
                           stack: ['z'],
                           variables: {'x': 'X'}
                         });
        assert.deepEqual(router.consume(['z', 'blah', 'a']),
                         { value: 'no_prefix',
                           stack: [],
                           variables: { 'x': 'blah'}
                         });
    });
    test("resolve", function() {
        let router = new Router();
        router.addPattern('a', 'a found');

        assert.deepEqual(router.resolve('a'),
                         { value: 'a found',
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.resolve('/a'),
                         { value: 'a found',
                           stack: [],
                           variables: {}
                         });
        assert.deepEqual(router.resolve('/a/'),
                         { value: 'a found',
                           stack: [],
                           variables: {}
                         });
    });

});

