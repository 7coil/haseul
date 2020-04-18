For some scenarios, you may wish to retrieve information from the user.
To do this, you can access the `content` parameter from the object that is passed into the callback function.

```javascript
router
  .command('hello', (theObject) => {
    const content = theObject.content;
    console.log(content)
  });

router.route('hello') // Prints ""
router.route('hello world!') // Prints "world!"
router.route('helloworld!') // Also prints "world!"
```

To decrease clutter in code, you can apply "Object Destructuring", so the `theObject` variable does not need to be created.

```javascript
// This router is exactly the same as above.
router
  .command('hello', ({ content }) => {
    console.log(content)
  });
```

