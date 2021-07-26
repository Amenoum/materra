<?php
/*
	Settings for: users/users.php.
	
*/

define('REG_ENABLED', true);						// Enable new registrations	(REQUIRES SQLite)
define('DB_USERS', '../../materra_db/users.db');	// SQLite Database of registered users
													// *** YOU WILL PROBABLY WANT TO MAKE THIS FILE INACCESSIBLE FROM THE WEB (so it should be outside of public_html 
													// or with appropriate permissions set) ***
define('HASH_SALT', 'dsk3Sz#lT');					// Change this to something random to increase security
define('REG_TIME', 6*60*60);						// After registration, prevent additional registrations from the same machine for REG_TIME seconds
define('USERS_PER_PAGE', 10);						// Number of users to show in the list per page
define('ADMIN_ID', 'Admin');						// Administrator username
define('RESERVED_ID', 'homo');						// The username specified here cannot be registered
