# HaSeul
Express style bot framework

## Installation
```bash
yarn add haseul
# npm i --save haseul
```

## Usage

### new Haseul();
Creates a new router.

```js
// Old `require()` style imports
const Haseul = require('haseul').default;

// New ES6 imports
import Haseul from 'haseul';

// Create a new Haseul.
const router = new Haseul();
```

### router.route(content, message)
Executes the router.
Pass in the raw message next, and pass in the object.

### router.set(name, value)
Sets the setting `name` as `value`.
You can store anything you like, but some control the behaviour of the server.

name                   | default value | action
---------------------- | ------------- | -------------
prefix                 | ''            | Sets the prefix of the router
case sensitive routing | false         | If true, enables case sensitivity
json spaces            | 2             | Unused

### router.command([command, ] middleware [, middleware ...])
Creates a command.
The command executes if the user's text matches `command`, or if `command` is empty.

The callback is given an object with the following properties:

name    | description
------- | -----------
message | The original object handed in from `router.route(content, message)`
next    | A function which executes the next available command. Use `next(error)` to pass an error to the next available `route.error` handler.
content | The part of the original message without the prefix and command.

### router.error([command, ] middleware [, middleware ...])
Creates an error handler.
The error executes if the user's text matches `command`, or if `command` is empty.

The callback is given an object with the following properties:

name    | description
------- | -----------
message | The original object handed in from `router.route(content, message)`
err     | The error passed in.
next    | A function which executes the next available command. Use `next(error)` to pass an error to the next available `route.error` handler.
content | The part of the original message without the prefix and command.

## Example with Eris
```js
import Eris from 'eris';
import Haseul from 'haseul';

const bot = new Eris('token')
const router = new Haseul();
const deeperRouter = new Haseul();

bot.on('messageCreate', (message) => {
  router.route(message.content, message);
})

router
  .set('prefix', 'vivi')
  .set('case sensitive routing', true)
  .set('json spaces', 2)
  .command('hyunjin', ({message, content}) => {
    message.channel.createMessage(`This is the HyunJin command. Your input was\n${content}`)
  })
  .command('yves', ({message}) => {
    message.channel.createMessage('This is the lower-case Yves command');
  })
  .command('Yves', ({message}) => {
    message.channel.createMessage('This is the upper-case Yves command');
  })
  .command('yeojin', ({message}) => {
    message.channel.createMessage('This is the YeoJin command');
  }, ({message}) => {
    message.channel.createMessage('Since next(); is not ran, this should not print');
  })
  .command('kimlip', ({next}) => {
    next(new Error('The Kim Lip command failed!'))
  }, ({message}) => {
    message.channel.createMessage('Since next(); is ran, but contains an error, this should not print');
  })
  .command('chuu', ({message, next}) => {
    message.channel.createMessage('This is the Chuu command')
      .then(() => {
        next();
      })
  }, ({message}) => {
    message.channel.createMessage('Since next(); is ran, this should print');
  })
  .command('heejin', deeperRouter)
  .error(({message, err}) => {
    message.channel.createMessage(`Oops! The following error occurred:\n${err.message}`)
  })

deeperRouter
  // Place potential collisions `heejin` with `heejin tears` below.
  .command('tears', ({message}) => {
    message.channel.createMessage('This is the HeeJin command, with tears as a subcommand');
  })
  .command('', ({message}) => {
    message.channel.createMessage('This is the HeeJin command');
  })
```

### Screenshots

Obtaining the content of messages  
![This is the HyunJin command. Your input was: stan loona](.github/hyunjin.png)

Case sensitivity with `router.set('case sensitive routing', true)`  
![yves compared to Yves](.github/yves.png)

Usage of `next()` within middleware  
![next()](.github/next.png)

Subcommands using nested routers  
![heejintears](.github/heejintears.png)

## Links
- [npm](https://www.npmjs.com/package/haseul)
- [ViVi](https://github.com/botsto/vivi)

## Notes
- [You may be interested in this music video](https://www.youtube.com/watch?v=6a4BWpBJppI)
- This project is licenced under the MIT licence
