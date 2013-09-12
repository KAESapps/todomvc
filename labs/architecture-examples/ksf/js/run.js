require({
    basePath: '../bower_components',
    packages: [
        'dojo',
        'ksf',
        { name: 'es6-shim', location: 'es6-shim', main: 'es6-shim' },
        { name: 'todomvc', location: '../js' },
        { name: 'compose', location: 'compose', main: 'compose' },
        { name: 'originalBacon', location: 'bacon.js/dist', main: 'Bacon' }
    ],
    aliases: [
        ['bacon', 'ksf/utils/Bacon']
    ]
}, ['es6-shim', 'todomvc/main']);