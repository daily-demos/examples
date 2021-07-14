const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  '@dailyjs/shared',
  '@dailyjs/basic-call',
]);

const packageJson = require('./package.json');

module.exports = withPlugins([withTM], {
  env: {
    PROJECT_TITLE: packageJson.description,
  },
});
