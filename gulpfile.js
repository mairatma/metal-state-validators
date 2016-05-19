'use strict';

var metal = require('gulp-metal');

metal.registerTasks({
	bundleCssFileName: 'metal-state-validators.css',
	bundleFileName: 'metal-state-validators.js',
	moduleName: 'metal-metal-state-validators',
	noSoy: true,
	testNodeSrc: [
		'env/test/node.js',
		'test/**/*.js'
	]
});
