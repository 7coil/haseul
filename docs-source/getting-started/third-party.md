You may want to use the `Message` object provided by third party libraries such as Discord.js and Eris to perform actions such as replying to the user.
When using the `router.route()` method, you can pass the object as the **second** argument, and be able to retrieve it later.

```javascript
const Discord = require('discord.js');
const HaSeul = require('haseul').default;

const client = new Discord.Client();
const router = new HaSeul();

router
  .command('hello', ({ message }) => {
    // We use the "message" object passed in from below.
    message.reply('Hello world!')
  })

client.on('message', (message) => {
  // Pass in the user's message as the first argument.
  // Pass in the "message" object as the second argument.
  router.route(message.content, message);
});

client.login('your token here');
```
