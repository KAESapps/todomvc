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
    'todomvc/models/TodosList',
	'todomvc/models/Todo',
    'compose',
    'ksf/collections/Dict',
], function (
	TodosManager,
	TodosList,
	Todo,
    compose,
    Dict
) {
    'use strict';
	var todo1 = window.todo1 = new Todo({title: 'Create a TodoMVC template', completed: true});
	var todo2 = window.todo2 = new Todo({title: 'Rule the web'});

    var H = compose(
        Dict,
        function () {
            window.addEventListener('hashchange', function (e) {
                var hash = location.hash;
                if (hash !== this.get('value')) { // we use value comparison here, since the 'hashchange' event is asynchronous
                    this.set('value', hash);
                }
            }.bind(this));
            this.asStream('changed').map(this, 'get', 'value').onValue(function (value) {
                if (value !== location.hash) { // we use value comparison here, since the 'hashchange' event is asynchronous
                    location.hash = value;
                }
            });
            this.set('value', location.hash);
        }
    );
    var TodosH = compose(
        H,
        {
            _valueSetter: function (value) {
                if (value !== '#/completed' && value !== '#/active') {
                    value = '#/';
                }
                this._Setter('value', value);
            },
        }
    );
    var h = new TodosH();

    var hash2mode = function (hash) {
        if (hash === '#/completed') { return 'completed'; }
        if (hash === '#/active') { return 'active'; }
        return 'all';
    };
    var mode2hash = function (mode) {
        if (mode === 'completed') { return '#/completed'; }
        if (mode === 'active') { return '#/active'; }
        return '#/';
    };


	var todosManager = window.todosManager = new TodosManager({
		id: 'todoapp',
		todos: new TodosList([
			todo1,
			todo2,
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