/*global define */
define([
	'compose',
	'ksf/collections/ObservableObject',
	'ksf/dom/composite/Composite',
	'ksf/utils/bindProps',
	'ksf/components/HtmlElement',
	'ksf/components/form/HtmlElementWithChanged',
	'ksf/components/HtmlContainerIncremental',
	'ksf/components/List',
	'./TodoEditor',
	'../models/Todo',

], function (
	compose,
	ObservableObject,
	Composite,
	bindProps,
	HtmlElement,
	HtmlElementWithChanged,
	HtmlContainer,
	List,
	TodoEditor,
	Todo

) {
	'use strict';
	var defined = function (o) { return o !== undefined; };
	function isCompleted(todo) {
		return todo.get('completed');
	}
	var not = function (f) {
		return function () {
			return !f.apply(null, arguments);
		};
	};
	function equals(argument) {
		return function (value) {
			return value === argument;
		};
	}

	var SelectableHtmlElement = compose(HtmlElement, function () {
		// react to user
		this.on('click', function () {
			this.set('active', !this.get('active'));
		}.bind(this));

		// update dom
		this.getR('active').onValue(function (b) {
			this.style.set('selected', b ? 'selected' : 'unselected');
		}.bind(this));
	}, {
		_activeSetter: function (b) {
			this._active = b;
		},
		_activeGetter: function () {
			return this._active;
		},
	});


	var Presenter = compose(
		ObservableObject,
		function () {
			this.setR('completedTodos', this.getR('todos')
				.filter(defined)
				.onEach()
				.map(function (todos) {
					return todos.filter(isCompleted);
				})
			);
			this.setR('activeTodos', this.getR('todos')
				.filter(defined)
				.onEach()
				.map(function (todos) {
					return todos.filter(not(isCompleted));
				})
			);
			this.setR('displayedTodos', this.getR('mode').filter(defined).flatMapLatest(function (mode) {
				var mode2list = {
					'all': 'todos',
					'active': 'activeTodos',
					'completed': 'completedTodos',
				};
				return this.getR(mode2list[mode]);
			}.bind(this)));

			this.bindCase('mode', this, {
				'allFilter': 'all',
				'activeFilter': 'active',
				'completedFilter': 'completed'
			});

			// TODO: create a specialized component for that or simply use a string template ?
			this.setR('todoCountLabel', this.getR('activeTodos', '.length')
				.map(function (count) {
					var html = '<strong>';
					html += count;
					html += '</strong>';
					html += ' ';
					html += count === 1 ? 'item' : 'items';
					html += ' left';
					return html;
				})
			);
			this.setR('clearCompletedLabel', this.getR('completedTodos', '.length')
				.map(function (count) {
					return 'Clear completed (' + count + ')';
				})
			);
			this.setR('allCompleted', this.getR('todos', '.length').combine(this.getR('completedTodos', '.length'), function (allCount, completedCount) {
				return allCount !== undefined && allCount === completedCount;
			}));

		}, {
			clearCompleted: function () {
				var todos = this.get('todos');
				todos._startChanges();
				todos.clone().forEach(function (todo) {
					if (isCompleted(todo)) {
						todos.remove(todos.indexOf(todo));
					}
				});
				todos._stopChanges();
			},
		}
	);

	var TodosManager = compose(
		Composite,
		function (args) {
			var self = this;
			this.set('id', args && args.id);
			this.set('todos', args.todos);
			this.set('mode', args.mode);

			this._components.set('presenter', new Presenter());

			this._components.factories.addEach({
				root: function	() {
					return new HtmlContainer('section', {id: self.get('id')});
				},
				newTodo: function () {
					return new HtmlElementWithChanged('input', {
						id: 'new-todo',
						placeholder: 'What needs to be done?',
						autofocus: true,
					});
				},
				'toggle-all': function () {
					return new HtmlElement('input', {id: 'toggle-all', type: 'checkbox'});
				},
				'todo-list': function () {
					return new List({
						container: new HtmlContainer('ul', {id: 'todo-list'}),
						factory: function (todo) {
							var todoEditor = new TodoEditor(todo);
							todoEditor.on('destroyRequest', function () {
								var todos = self.get('todos');
								todos.remove(todos.indexOf(todo));
							});
							return todoEditor;
						},
					});
				},
				'todo-count': function () {
					return new HtmlElement('span', {id: 'todo-count'});
				},
				'clear-completed': function () {
					return new HtmlElement('button', {
						id: 'clear-completed',
						textContent: 'Clear completed (1)',
					});
				},
				'allButton': function () {
					return new SelectableHtmlElement('a', {textContent: 'All'});
				},
				'activeButton': function () {
					return new SelectableHtmlElement('a', {textContent: 'Active'});
				},
				'completedButton': function () {
					return new SelectableHtmlElement('a', {textContent: 'Completed'});
				},
			});

			this._components.whenDefined('presenter', [
				bindProps('todos', '<', 'todos').bind(self),
				bindProps('mode', '<<->', 'mode').bind(self),
			]);

			this._components.whenDefined('newTodo',	function (newTodo) {
				newTodo.getR('value').filter(function (title) {
					return title !== '';
				}).onValue(function (title) {
					newTodo.set('value', ''); // on ne boucle pas car on filtre sur les chaines vides, mais est-ce bien ?
					self.get('todos').add(new Todo({title: title}));
				}.bind(self));
			}.bind(self));

			this._components.whenDefined('todo-list', 'presenter',
				bindProps('content', '<', 'displayedTodos')
			);
			this._components.whenDefined('todo-count', 'presenter',
				bindProps('innerHTML', '<', 'todoCountLabel')
			);
			this._components.whenDefined('clear-completed', 'presenter', [
				bindProps('textContent', '<', 'clearCompletedLabel'),
				function (cmp, presenter) {
					return presenter.getR('completedTodos', '.length')
						.map(equals(0))
						.onValue(function (b) {
							cmp.style.set('display', b ? 'hidden' : 'display');
						});
				},
				function (cmp, presenter) {
					return cmp.on('click', function () {
						presenter.clearCompleted();
					});
				},

			]);

			this._components.whenDefined('allButton', 'presenter',
				bindProps('active', '<<->', 'allFilter')
			);
			this._components.whenDefined('activeButton', 'presenter',
				bindProps('active', '<<->', 'activeFilter')
			);
			this._components.whenDefined('completedButton', 'presenter',
				bindProps('active', '<<->', 'completedFilter')
			);
			this._components.whenDefined('toggle-all', 'presenter',
				bindProps('checked', '<<->', 'allCompleted')
			);

			var headerLayout = [new HtmlContainer('header', {id: 'header'}), [
				new HtmlElement('h1', {textContent: 'todos'}),
				'newTodo',
			]];

			this._layout.configs.set('noTodos', [
				'root', [
					headerLayout,
				]
			]);

			this._layout.configs.set('full', [
				'root', [
					headerLayout,
					[new HtmlContainer('section', {id: 'main'}), [
						'toggle-all',
						'todo-list',
					]],
					[new HtmlContainer('footer', {id: 'footer'}), [
						'todo-count',
						[new HtmlContainer('ul', {id: 'filters'}), [
							[new HtmlContainer('li'), ['allButton']],
							[new HtmlContainer('li'), ['activeButton']],
							[new HtmlContainer('li'), ['completedButton']],
						]],
						'clear-completed',
					]],
				]
			]);

			this.getR('todos', '.length').onValue(function (count) {
				this._layout.set('config', count ? 'full' : 'noTodos');
			}.bind(this));
		}
	);
	return TodosManager;
});