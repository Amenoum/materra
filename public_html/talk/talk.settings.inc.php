<?php
/*
	Settings for: talk/talk.php (query engine).
	
*/

define('TALK_ENABLED', true);						// Enable query engine
define('USE_DB', true);								// Fetch answers from database (recommended, limited capabilities otherwise)
define('DB_FILE', 'subs_queries.db');				// SQLite Database
define('ANSWERS_FILE', '../answers/answers.txt');	// Text file with answers, used if USE_DB is false
define('GENERIC_FILE', 'generic.txt');				// Text file with generic answers, used if USE_DB is false
define('LOG_NO_ANSWERS', true);						// Log input for which there are no replies (answers), requires USE_DB = true