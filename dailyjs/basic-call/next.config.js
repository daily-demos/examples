const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')(['@dailyjs/shared']);

module.exports = withPlugins([withTM]);
