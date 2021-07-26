/*
* MATERRA plugin that extends the editable toolbox
* This was made basically as an example of a plugin
*
* The below (title, author, desc, website, version, candisable, contributions) is used by the system
* candisable = yes|true|1 allows the user to disable autoloading of the plugin (this is default and recommended)
* please keep desc short
*
* @title EX_toolbox
* @author Amenoum
* @desc Provides additional buttons in editable toolbox
* @website https://amenoum.org
* @version 1.0
* @candisable yes
* @contributions https://amenoum.org
*/
(function($, window) {	// this is to make sure that $ used below is linked to jQuery (not currently necessary) and encapsulate the content (this is always recommended)
    
	'use strict';	// to prevent use of undeclared variables

	let ext = {
		//'italic': { title: 'Insert emphasized text', icon: '<img src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==">', metachars: ['<em>', '</em>'] },
		'italic': { title: 'Insert emphasized text', icon: '<span><em>I</em></span>', metachars: ['<em>', '</em>'] },
		'statement': { title: 'Insert special statement', icon: '<span>S</span>', metachars: ['<state>', '</state>'] },
		'const': { title: 'Insert constant', icon: '<span>C</span>', metachars: ['<c>const(\'', '\')</c>'] },
		'compute': { title: 'Insert computation (javascript)', icon: '<span>%</span>', metachars: ['<c>', '</c>'] },
		'link': { title: 'Insert link', icon: '<img src="data:image/gif;base64,R0lGODlhFgAWAOMKAB1ChDRLY19vj3mOrpGjuaezxrCztb/I19Ha7Pv8/f///////////////////////yH5BAEKAA8ALAAAAAAWABYAAARY8MlJq7046827/2BYIQVhHg9pEgVGIklyDEUBy/RlE4FQF4dCj2AQXAiJQDCWQCAEBwIioEMQBgSAFhDAGghGi9XgHAhMNoSZgJkJei33UESv2+/4vD4TAQA7">', metachars: ['<a noref="1" href="">', '</a>'] },
		'linkref': { title: 'Insert reference', icon: '<span>R</span>', metachars: ['<a href="" data-notitle="1" title="Some publication (2020), S. Author et al">', '</a>', 'ref'] }
	};
	
	$.extend(root.editable.toolboxActions, ext);

})(jQuery, window);
