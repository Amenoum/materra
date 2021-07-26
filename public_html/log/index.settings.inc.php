<?php
/*
	Settings for: log/index.php (generates the index page for the journal).
	
	Output of index.php is cached, new index is generated only after cache expires or if cache file is missing.
	If you are using <update> tags in your documents and AUTO_UPDATE, you should set CACHE_EXPIRE equal to or less than default value (1*24*60 minutes = 24 h), 
	otherwise some auto-generated dates in <update> might not match the actual dates of updates. 
	
	index.header.inc.php contains the intro body, which you may also want to modify.
*/

define('LOG_TITLE', 'L O G');		// Journal title
define('HTML_TITLE', 'Amenoum - spiritual matters');	// Webpage <title>
define('ARTICLES_HEADING', 'Articles');					// Journal heading
define('ARTICLES_HEADING_ON', 'Articles on');			// Journal heading when tag param is used
define('LANG_CREATED', 'created');	// 'created' string
define('LANG_UPDATED', 'updated');	// 'updated' string
define('LANG_TAGS', 'tags');		// 'tags' string
define('ALLOWED_EXT', 'html|htm');	// File extensions of log entries (use | as delimiter)
define('TABLE_MAX_COLS', 2);		// Number of columns
define('SORT_DESCENDING', false);	// Sort entries in descending order
define('CACHE_FILE_EXT', '.inc');	// Output is cached in files having this extension (If you want to refresh the cache, delete these files to regenerate them on the next index page load)
define('CACHE_EXPIRE', 1*24*60);	// Cache expiration time in minutes
define('CACHE_DIR', 'cache');		// Where to store cache files (you might need to change permissions on this directory so the script can write to it)
define('AUTO_UPDATE', true);		// Creates/updates <log_update> and <update> tags automatically (with file modification date)
define('PARSE_CATEGORIES', true);	// List entries by category
define('USE_NUMBERING', false);		// Numbered list?
define('ECHO_DATE', true);			// Include creation dates in the list
