const HaSeul = require('./dist/index').default;

const router1 = new HaSeul();
const nestedRouter1 = new HaSeul();

nestedRouter1
  .command('a', ({ content }) => {
    console.log(content)
  })
  .command('', ({ content }) => {
    console.log('Reached a nested router.')
  })

router1
  .set('prefix', 'haseul')
  .command('theworld', ({ content }) => {
    console.log(content);
  })
  .command('nested', nestedRouter1)

router1.route('Failed the "Not even relevant" test.')
router1.route('haseultheworld Passed the "no spaces" test.')
router1.route('haseul theworld Passed the "with a space" test.')
router1.route('       haseul    theworld          Passed the "out in space" test.')
router1.route('haseulnested a Passed the nested router test')
router1.route('haseul nested sas')

const router2 = new HaSeul();

router2
  .set('prefix', 'discordmail')
  .set('case sensitive routing', false)
  .set('json spaces', 2)
  .command(({message, next, req}) => {
    // If the user is not a bot, continue to route.
    // if (!message.author.bot) return;

    req.locals.sqlConnection = 'Example SQL Connection';
    next();
  })
  .command('test', ({ content }) => {
    console.log('Received a test message!', `"${content}"`)
  })

router2.route('discordmailtest Test', {weird: 'object'})
router2.route('discordmailtest')
router2.route('discordmailtest a')
