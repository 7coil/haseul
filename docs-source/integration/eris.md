```javascript
const eris = require('eris');
const HaSeul = require('haseul').default;

const client = new eris.Client('your token here');
const router = new HaSeul();

client.on('ready', () => {
  console.log('Eris Example is ready!');
});

router
  .set('prefix', '!')
  .command('ping', ({ message }) => {
    message.channel.createMessage('pong!')
  })

client.on('message', (message) => {
  router.route(message.content, message);
});

client.connect();
```
