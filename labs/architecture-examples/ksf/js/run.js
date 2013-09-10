require({
    baseUrl: 'bower_components',
    paths: {
        collections: 'collections-amd',
        bacon: 'ksf/utils/Bacon',
        todomvc: '../js'
    },
    packages: [
        'ksf',
        'dojo',
        { name: 'compose', location: 'compose', main: 'compose' },
        { name: 'originalBacon', location: 'bacon.js/dist', main: 'Bacon' }
    ]
}, [
	'todomvc/components/TodosManager',
	'ksf/collections/OrderableSet',
	'todomvc/models/Todo',
    'dojo/hash',
    'dojo/topic',
    'compose',
    'ksf/collections/Dict',
], function (
	TodosManager,
	OrderableSet,
	Todo,
    hash,
    topic,
    compose,
    Dict
) {
    'use strict';
	var todo1 = window.todo1 = new Todo({title: 'Create a TodoMVC template', completed: true});
	// var todo2 = window.todo2 = new Todo({title: 'Rule the web'});

    console.log('hash', !!hash());
    var H = compose(
        Dict,
        function () {
            this.set('value', hash());
            var changing = false;
            topic.subscribe('/dojo/hashchange', function (hash) {
                if (!changing) {
                    changing = true;
                    this.set('value', hash);
                    changing = false;
                }
            }.bind(this));
            this.getR('value').changes().onValue(function (value) {
                if (!changing) {
                    changing = true;
                    hash(value);
                    changing = false;
                }
            });
        }
    );
    var h = new H();

    var hash2mode = function (hash) {
        if (hash === '/completed') { return 'completed'; }
        if (hash === '/active') { return 'active'; }
        return 'all';
    };
    var mode2hash = function (mode) {
        if (mode === 'completed') { return '/completed'; }
        if (mode === 'active') { return '/active'; }
        return '/';
    };


	var todosManager = window.todosManager = new TodosManager({
		id: 'todoapp',
		todos: new OrderableSet([
			todo1,
			// todo2,
		]),
		mode: hash2mode(h.get('value')), // 'all', 'active', 'completed'
	});

    todosManager.bind('mode', h, 'value', {
        convert: hash2mode,
        revert: mode2hash,
    });

	document.body.replaceChild(todosManager.get('domNode'), document.getElementById('todoapp'));
	todosManager.startLiveRendering();

});