/*global define */
define([
	'compose',
	'ksf/dom/composite/Composite',
	'ksf/utils/bindProps',
	'ksf/components/HtmlElement',
	'ksf/components/HtmlContainer',
	'ksf/components/form/Textbox',
	'ksf/components/form/Checkbox',

], function (
	compose,
	Composite,
	bindProps,
	HtmlElement,
	HtmlContainer,
	Textbox,
	Checkbox


) {
	'use strict';
	var ENTER_KEY = 13;

	var TodoEditor = compose(
		Composite,
		function (todo) {
			var self = this;

			this._components.factories.addEach({
				container: function () {
					return new HtmlContainer('li');
				},
				displayContainer: function () {
					var div = new HtmlContainer('div');
					div.style.set('view', 'view');
					div.on('dblclick', function () {
						self.set('mode', 'edit');
					});
					return div;
				},
				completed: function () {
					var checkbox = new Checkbox();
					checkbox.style.set('toggle', 'toggle');
					return checkbox;
				},
				label: function () {
					return new HtmlElement('label');
				},
				destroy: function () {
					var button = new HtmlElement('button');
					button.style.set('destroy', 'destroy');
					return button;
				},
				editView: function () {
					var textbox = new Textbox();
					textbox.style.set('edit', 'edit');
					return textbox;
				},
			});

			this._components.whenDefined('container', [
				function (container) {
					container.style.setR('completed', todo.getR('completed').map(function (b) {
							return b ? 'completed' : undefined;
						}));
				},
				function (container) {
					container.style.setR('editing', self.getR('mode').map(function (mode) {
							return (mode === 'edit') ? 'editing' : undefined;
						}));
				},
			]);
			this._components.whenDefined('label',
				bindProps('textContent', '<<->', 'title').bind(todo)
			);
			this._components.whenDefined('completed',
				bindProps('value', '<<->', 'completed').bind(todo)
			);
			this._components.whenDefined('editView', [
				bindProps('value', '<<->', 'title').bind(todo),
				function (editView) {
					return editView.on('keyup', function (e) {
						// console.log('keypress', e.keyCode);
						if (e.keyCode === 27) {
							editView.revert();
						}
						if (e.keyCode === ENTER_KEY || e.keyCode === 27) {
							self.set('mode', 'display');
						}
					});
				},
			]);
			this._components.whenDefined('destroy', function (destroy) {
				return destroy.on('click', function () {
					self._emit('destroyRequest');
				});
			});

			this._layout.configs.set('display', [
				'container', [
					['displayContainer', [
						'completed',
						'label',
						'destroy',
					]],
				]
			]);

			this._layout.configs.set('edit', [
				'container', [
					'editView',
				]
			]);

			this.set('mode', 'display');
			this.getR('mode').onValue(function (mode) {
				if (mode === 'edit') {
					this._layout.set('config', 'edit');
				} else {
					this._layout.set('config', 'display');
				}

			}.bind(this));
		}
	);
	return TodoEditor;
});