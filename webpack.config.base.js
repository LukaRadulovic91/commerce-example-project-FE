'use strict';
const path = require('path');
const webpack = require('webpack');

module.exports = {
	target: 'web',
	resolve: {
		modules: [path.resolve(__dirname, 'src'), 'node_modules'],
		alias: {
			'@': path.resolve(__dirname, 'src/js/'),
			'@ui': path.resolve(__dirname, 'src/js/components/ui/'),
			'@audio': path.resolve(__dirname, 'src/audio'),
		},
		symlinks: false,
	},
	output: {
		path: path.resolve(__dirname, 'dist/assets/'),
		publicPath: 'assets/',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: {
					cacheDirectory: true,
				},
			},
			{
				test: /\.css$/,
				use: [
					{ loader: "style-loader" },
					{
						loader: 'css-loader',
					},
					{
						loader: 'postcss-loader',
					},
				],
			},
			{ 
				test: /\.(eot|svg|ttf|woff|woff2)$/, 
				use: "url-loader?name=[name].[ext]"
			},
			{
				test: /\.(png|jpg|gif|mp4|ogg|webm|aac|opus|pdf)$/,
				loader: 'file-loader',
				options: {
					esModule: false,
					name: '[name].[ext]'
				},
			},
		],
	},
	plugins: [new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)],
};
