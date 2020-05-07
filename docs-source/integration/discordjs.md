This example includes `/** @type { HaSeul<Discord.Message> } */`.
This tells your text editor that the message that is routed is from Discord.js, which gives you access to available variables and methods.

```javascript
const Discord = require('discord.js');
const HaSeul = require('haseul').default;

const client = new Discord.Client();

/** @type { HaSeul<Discord.Message> } */
const router = new HaSeul();

client.on('ready', () => {
  console.log('Discord.js Example is ready!');
});

router
  .set('prefix', ['!'])
  .command('ping', ({ message }) => {
    message.channel.send('pong!')
  })

client.on('message', (message) => {
  router.route(message.content, message);
});

client.login('your token here');
```

![](media://discordjs-intellisense.png)
