<?php
/*
	Settings for: uploads/upload.php (Handles uploads).
	
	A header (upload.header.inc.txt) will be added to uploaded webpages. It can be modified, but make sure it contains the opening html (<html>) and body tag (<body>).
*/

define('UPLOADS_ENABLED', false);										// Enable uploads?	(if you enable uploads, you will probably also want to change the UPLOAD_KEY below)
define('UPLOAD_KEY', 'jZkaFka29FG10#mAxjFAfhjdkfhe#4kf21vmkfd94');		// Upload key	
define('HEADER_PRE_TITLE', 'MATERRA Web - ');							// A prefix for webpage title (<title>) 
define('UPDATE_MENU', true);											// If true, adds a link to uploaded webpage to menu (unless the webpage is a log entry)
define('MENU', '../menu.json');											// File containing the website menu

define('MAIN_DIR', '..');
define('LOG_DIR', '../log');
