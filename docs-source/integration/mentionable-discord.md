Some users may wish for their bot to reply in Discord whenever their bot is "mentioned" using the `@username` syntax.
To achieve this, add the `router.set()` call inside the Discord library "ready" event, and use the client ID to set "`<@client-id>`" as the prefix.

```javascript
client.on('ready', () => {
  // Set the router prefix to the ID of the bot.
  router.set('prefix', [`<@${client.id}>`])
});

router
  .command('ping', ({ message }) => {
    message.channel.send('pong!')
  })
```
