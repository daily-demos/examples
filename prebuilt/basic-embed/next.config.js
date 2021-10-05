const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')(['@custom/shared']);

const packageJson = require('./package.json');

module.exports = withPlugins([withTM], {
  env: {
    PROJECT_TITLE: packageJson.description,
  },
});
