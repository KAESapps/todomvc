/*global define */

define([
	'compose',
	'ksf/collections/OrderableSet',
], function (
	compose,
	OrderableSet
) {
	'use strict';

	var TodosList = compose(
		OrderableSet,
		{
			removeCompleted: function () {
				this._startChanges();
				this.clone().forEach(function (todo) {
					if (todo.get('completed')) {
						this.remove(this.indexOf(todo));
					}
				}.bind(this));
				this._stopChanges();
			},
		}
	);
	return TodosList;
});