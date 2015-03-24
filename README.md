more-router
===========

Introduction
------------

more-router is a routing library. It can run both on the client as
well as on the server.

Its possibly special qualities include:

* it has a precedence system: given the pattern `/foo` and the pattern
  `/{myvariable}`, the path `/foo` will match the pattern `/foo`, not
  the variable.

* you mix text and variables in a single segment: `/prefix{variable}`

* a publisher abstraction where you can express routes only respond to
  particular requests, i.e. only GET requests.

Usage
-----

```javascript
  var moreRouter = require('more-router');

  var router = new moreRouter.Router();

  // second argument can be anything you like; here we use a string
  // for easy demonstration of the API
  router.addPattern('a', 'found a');
  router.addPattern('a/{v}', 'found a/{v}')

  router.resolve('a')
  // returns
  // {
  //   value: "found a",
  //   stack: [],
  //   variables: {}
  // }

  router.resolve('a/foo')
  // returns
  // {
  //   value: "found a/{v}",
  //   stack: [],
  //   variables: {'v': 'foo'}
  // }

  // alternate consume interface which taxes a stack
  router.consume(['foo', 'a'])
  // returns
  // {
  //   value: "found a/{v}",
  //   stack: [],
  //   variables: {'v': 'foo'}
  // }

  // if no match exists, value is null, unmatched segments are on stack
  router.resolve('notthere')
  // returns
  // {
  //   value: null,
  //   stack: ['notthere'],
  //   variables: {}
  // }
```

Publisher
---------

To be documented.

Background
----------

more-router is derived from the routing code in the Morepath web
framework written in Python.