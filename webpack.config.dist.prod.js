'use strict';
const webpack = require('webpack');
const merge = require('webpack-merge');
const optimizedConfig = require('./webpack.config.opt.js');

module.exports = merge(optimizedConfig, {
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production'),
				API_ENDPOINT: JSON.stringify('production'),
			},
		}),
	],
});
