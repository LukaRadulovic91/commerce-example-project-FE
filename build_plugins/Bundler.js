const fs = require('fs');
const path = require('path');

class Bundler {
	constructor(options) {
		this.options = options;
	}
	apply(compiler) {
		compiler.hooks.done.tap('Bundler', compilation => {
			const stats = compilation.toJson();
			if (stats.errors.length !== 0) {
				return;
			}

			let chunkNames = {};
			const mainChunks = stats.assetsByChunkName.main;
			if (typeof mainChunks === 'string') {
				chunkNames[path.extname(mainChunks)] = mainChunks;
			} else {
				for (let chunk of mainChunks) {
					chunkNames[path.extname(chunk)] = chunk;
				}
			}

			const html = fs.readFileSync(
				'index.html',
				'utf8'
			);
			fs.writeFileSync(
				path.join('dist/', 'index.html'),
				html
					.replace('bundle.js', chunkNames['.js'])
					.replace(
						'<!-- %CSS% -->',
						chunkNames['.css']
							? '<link rel="stylesheet" type="text/css" href="assets/' + chunkNames['.css'] + '">'
							: ''
					)
			);

			const config = fs.readFileSync(
				'web.config',
				'utf8'
			);
			fs.writeFileSync(
				path.join('dist/', 'web.config'),
				config
			);
		});
	}
}

module.exports = Bundler;
