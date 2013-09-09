/*global define */
define([
	'compose',
	'ksf/collections/ObservableObject',
], function (
	compose,
	ObservableObject
) {
	'use strict';
	var Todo = compose(
		ObservableObject,
		function (args) {
			this.set('title', args.title);
			this.set('completed', args.completed);
		}
	);

	return Todo;
});