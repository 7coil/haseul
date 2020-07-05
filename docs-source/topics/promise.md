You may wish to wait for when the routing is complete.

In HaSeul `1.2.0` or above, a new `done()` function is available to tell the router when
you have finished processing. This is different to the `next()` function, as `done()` does
not carry on to the next suitable router/middleware, whereas `next()` does.

```javascript
router
  .command('hello', ({ content, done }) => {
    // Process content
    done();
  })
  .command('mei', ({ content, next, done }) => {
    // Errors produced by the fetch function is passed into the `next` function.
    // When processing is complete, run the `done` function.
    fetch('http://example.com/')
      .then(data => data.text())
      .then(data => {
        console.log(data);
        done();
      })
      .catch(error => next(error))
  })
```

By calling the `done()` function, the `router.route()` function can reliably return a Promise
which will always resolve whenever you tell HaSeul that your processing is complete.

```javascript
router.route('meimei')
  .then(() => {
    // The routing has been complete
  })
```
