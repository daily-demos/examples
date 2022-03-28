const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  '@custom/shared',
  '@custom/basic-call',
  '@custom/text-chat',
  '@custom/live-streaming',
  '@custom/recording',
  '@custom/pagination',
  '@custom/active-speaker',
]);

const packageJson = require('./package.json');

module.exports = withPlugins([withTM], {
  env: {
    PROJECT_TITLE: packageJson.description,
  },
});
