This example includes `/** @type { HaSeul<eris.Message> } */`.
This tells your text editor that the message that is routed is from Eris, which gives you access to available variables and methods.

```javascript
const eris = require('eris');
const HaSeul = require('haseul').default;

const client = new eris.Client('your token here');

/** @type { HaSeul<eris.Message> } */
const router = new HaSeul();

client.on('ready', () => {
  console.log('Eris Example is ready!');
});

router
  .set('prefix', ['!'])
  .command('ping', ({ message }) => {
    message.channel.createMessage('pong!')
  })

client.on('message', (message) => {
  router.route(message.content, message);
});

client.connect();
```

![](media://eris-intellisense.png)
