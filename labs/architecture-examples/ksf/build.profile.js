var profile = (function () {
    return {
        basePath: 'bower_components',
        releaseDir: '..',
        releaseName: 'build',
        action: 'release',
        layerOptimize: false,//'uglify',
        optimize: false,
        cssOptimize: 'comments',
        mini: true,
        stripConsole: 'warn',

        layers: {
            'dojo/dojo': {
                include: [ 'todomvc/main' ],
                customBase: true,
                boot: true
            }
        },

        packages: [{
            name: 'todomvc',
            resourceTags: {
                amd: function (filename) {
                    return (/\.js$/).test(filename);
                }
            }
        }, {
            name: 'todomvc-common'
        }, {
            name: 'css',
            location: '../css'
        }]
    };
})();