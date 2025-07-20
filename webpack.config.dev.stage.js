'use strict';
const webpack = require('webpack');
const merge = require('webpack-merge');
const devConfig = require('./webpack.config.dev.js');

module.exports = merge(devConfig, {
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('development'),
				API_ENDPOINT: JSON.stringify('staging'),
			},
		}),
	],
});
