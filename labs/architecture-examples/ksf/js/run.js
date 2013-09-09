require({
    baseUrl: 'bower_components',
    paths: {
        collections: 'collections-amd',
        bacon: 'ksf/utils/Bacon',
        todomvc: '../js'
    },
    packages: [
        'ksf',
        { name: 'compose', location: 'compose', main: 'compose' },
        { name: 'originalBacon', location: 'bacon.js/dist', main: 'Bacon' }
    ]
}, [
	'todomvc/components/TodosManager',
	'ksf/collections/OrderableSet',
	'todomvc/models/Todo',
], function(
	TodosManager,
	OrderableSet,
	Todo
) {
	var todo1 = window.todo1 = new Todo({title: 'Create a TodoMVC template', completed: true});
	var todo2 = window.todo2 = new Todo({title: 'Rule the web'});

	var todosManager = window.todosManager = new TodosManager({
		id: 'todoapp',
		todos: new OrderableSet([
			todo1,
			// todo2,
		]),
		mode: 'all', // 'active', 'completed'
	});
	document.body.replaceChild(todosManager.get('domNode'), document.getElementById("todoapp"));
	todosManager.startLiveRendering();
});