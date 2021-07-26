<?php
/*
	Settings for: answers/index.php (generates the index page for the answers).
	
	Output of index.php is cached, new index is generated only after cache expires or if cache file is missing.
	
	index.header.inc.php contains the intro body, which you may also want to modify.
*/

define('PAGE_TITLE', 'A N S W E R S');			// Page title
define('HTML_TITLE', 'Amenoum - of answers');	// Webpage <title>
define('SORT_DESCENDING', false);				// Sort entries in descending order
define('CACHE_FILE_EXT', '.inc');				// Output is cached in files having this extension (If you want to refresh the cache, delete these files to regenerate them on the next index page load)
define('CACHE_EXPIRE', 1*24*60);				// Cache expiration time in minutes
define('CACHE_DIR', 'cache');					// Where to store cache files (you might need to change permissions on this directory so the script can write to it)
define('USE_NUMBERING', true);					// Numbered list?
define('USE_DB', true);							// Fetch answers from database
define('DB_FILE', '../talk/subs_queries.db');	// SQLite Database
define('ANSWERS_FILE', 'answers.txt');			// Text file with answers, used if USE_DB is false