Sometimes, your bot will fail performing an action, maybe due to bugs or a bad network request.
In order to catch these and present them to the end user, you will need to create an `error` handler.

Any errors that could be produced can either be _thrown_ within a command handler, or passed into the _next_ function.

```javascript
router
  .command('error', ({ content }) => {
    // Errors produced by the error function is thrown, and caught by HaSeul.
    throw new Error('Cannot process Go Won\'s crunchy voice');
  })
  .command('mei', ({ content, next }) => {
    // Errors produced by the fetch function is passed into the `next` function.
    fetch('http://example.com/')
      .then(data => data.text())
      .then(data => console.log(data))
      .catch(error => next(error))
  })
  .error(({ err }) => {
    console.log('An error was caught!');
    console.log(err);
  })
```

This error handler will catch errors thrown by handlers created _before_ the error handler.
