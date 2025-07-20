'use strict';
const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = merge.strategy({
	'module.rules': 'prepend',
})(baseConfig, {
	mode: 'development',
	devtool: 'eval-cheap-module-source-map',
	devServer: {
		clientLogLevel: 'silent',
		hot: true,
		port: 8000,
		publicPath: '/assets/',
		historyApiFallback: true,
		open: true,
		overlay: true,
		disableHostCheck: true,
		watchOptions: {
			ignored: /node_modules/,
		},
	},
	output: {
		filename: 'bundle.js',
		pathinfo: false,
	},
	stats: 'minimal',
	// module: {
	// 	rules: [
	// 		{
	// 			test: /\.css$/,
	// 			use: [
	// 				'style-loader',
	// 				{
	// 					loader: 'css-loader',
	// 					options: {
	// 						importLoaders: 1,
	// 						modules: true,
	// 					},
	// 				},
	// 				{
	// 					loader: 'postcss-loader',
	// 				},
	// 			],
	// 		},
	// 	],
	// },
	plugins: [new ReactRefreshWebpackPlugin()],
});
