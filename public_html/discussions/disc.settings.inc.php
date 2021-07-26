<?php
/*
	Settings for: discussions/disc.php.
	
*/

define('DISC_ENABLED', true);						// Enable discussions	(REQUIRES SQLite)
define('MAX_MSG_LENGTH', 1024);						// Max. message length, in characters
define('MSGS_PER_PAGE', 5);							// Number of comments to show per page
define('ADMIN_CONTACT_LINK', '/authors/Creator.html#contact');	// Posting of comments must be enabled by admin, this link will be presented 
																// to users so they can contact the admin and ask for permission to post comments
