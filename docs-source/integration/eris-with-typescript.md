By using TypeScript to enhance your JavaScript, you can access type information by passing the `Message` class of third party libraries into the HaSeul constructor.
This allows some advanced editors (such as Visual Studio Code) to display methods that you can run on the message variable.

```typescript
import { Client as Eris, Message } from 'eris';
import HaSeul from 'haseul';

const client = new Eris('token');
const router = new HaSeul<Message>();

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

![Visual Studio Code displaying available methods via Intellisense](/media/intellisense.png)
