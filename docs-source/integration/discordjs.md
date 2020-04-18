```javascript
const Discord = require('discord.js');
const HaSeul = require('haseul').default;

const client = new Discord.Client();
const router = new HaSeul();

client.on('ready', () => {
  console.log('Discord.js Example is ready!');
});

router
  .set('prefix', '!')
  .command('ping', ({ message }) => {
    message.channel.send('pong!')
  })

client.on('message', (message) => {
  router.route(message.content, message);
});

client.login('your token here');
```
