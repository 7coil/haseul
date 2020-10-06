You can use TypeScript to pass the `Message` type as a type parameter to HaSeul.

```typescript
import { Client as Eris, Message } from 'eris';
import HaSeul from 'haseul';

const client = new Eris('token');
const router = new HaSeul<Message>();

client.on('ready', () => {
  console.log('Eris Example is ready!');
});

router
  .set('prefix', ['!'])
  .command('ping', ({ message }) => {
    message.channel.createMessage('pong!')
  })

client.on('messageCreate', (message) => {
  router.route(message.content, message);
});

client.connect();
```

![](media://intellisense.png)
