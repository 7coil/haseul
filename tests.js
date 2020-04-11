const HaSeul = require('./dist/index').default;

const haseul = new HaSeul();
const nestedHaseul = new HaSeul();

nestedHaseul
  .command('a', ({ content }) => {
    console.log(content)
  })
  .command('', ({ content }) => {
    console.log('Reached a nested router.')
  })

haseul
  .set('prefix', 'haseul')
  .command('theworld', ({ content }) => {
    console.log(content);
  })
  .command('nested', nestedHaseul)

haseul.route('Failed the "Not even relevant" test.')
haseul.route('haseultheworld Passed the "no spaces" test.')
haseul.route('haseul theworld Passed the "with a space" test.')
haseul.route('       haseul    theworld          Passed the "out in space" test.')
haseul.route('haseulnested a Passed the nested router test')
haseul.route('haseul nested sas')
