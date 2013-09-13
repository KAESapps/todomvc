require({
    basePath: 'bower_components',
    packages: [
        'ksf',
        { name: 'todomvc', location: '../js' }
    ]
}, ['ksf/require-config'], function (cfg) {
    require(cfg);
});