A prefix (when developing bots), is a string of characters a user will have to type before a command, to denote input intended for your bot.
The following example adds a (bad) prefix.

```javascript
const HaSeul = require('haseul').default;
const router = new HaSeul();

router
  .set('prefix', ['!']) // Set the prefix to !
  .command('hello', () => {
    console.log('Hello world!')
  })

// This input matches both the prefix, and the command "hello".
router.route('!hello')

// This input does not match the prefix, so does not print "Hello world!".
router.route('hello')
```

When developing bots for public use, be mindful of using a prefix that is:
- Unique
  - Don't use `!` or any other single character, as conflicts are bound to occur.
- Easy to Type
  - The prefix `€£$` may not be possible to type on some user's keyboards.
  - Some users may not know how to type a specific character, such as `é`.

## Multiple Prefixes
Some people may wish to add more than one prefix to their bot.
To do this, add more than one prefix to the array.

```javascript
router.set('prefix', ['!', 'oppa'])
```

### Incorrect Example
```javascript
// WRONG
// WRONG
// WRONG
router
  .set('prefix', ['!'])
  .set('prefix', ['oppa'])
```

This incorrect example will have the `oppa` prefix overwriting the `!` prefix.
