The following example configures three commands - A "hello", "dogs" and a "cats" command.

```javascript
const HaSeul = require('haseul').default;
const router = new HaSeul();

router
  .command('hello', () => {
    console.log('Hello world!')
  })
  .command('dogs', () => {
    console.log('Dogs!')
  })
  .command('cats', () => {
    console.log('Cats!')
  })
```

You can then pass your input by calling `router.route()`, like the following examples.

```javascript
// The following prints out "Hello world!", as the inputs begin with "hello"
// Note that a space is not required after the command.
router.route('hello');
router.route('hello loonatheworld!');
router.route('helloloonatheworld!');

// The following prints out "Dogs!", as the inputs begin with "dogs"
router.route('dogs');
router.route('dogs rule!');
router.route('dogs are cool!');

// The following prints out "Cats!", as the inputs begin with "cats"
// Note that the capitalisation of a command does not affect whether or not the command is called or not.
router.route('cats the movie is good');
router.route('CATS surround hyunjin');

// The following does not print anything, as the input does not match any of the commands.
router.route('olivia hye is left out again')
```
