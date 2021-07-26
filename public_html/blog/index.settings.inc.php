<?php
/*
	Settings for: blog/index.php (Generates the index page for the blog).
	Output of index.php is optionally cached, new index is generated only after cache expires or if cache file is missing.
	
	For proper sorting by date, it is advisable to use numbers when naming blog entries (filenames) so the latest entry begins with the highest number.
	NOTE_TO_SELF: Perhaps should rewrite this so it uses log_date tag for sorting.
	
	index.header.inc.php contains the intro body, if you want to modify it.
*/

define('LOG_TITLE', '<span>B</span> L O <span>G</span>');		// Blog title
define('HTML_TITLE', 'Amenoum - in blog');						// Webpage <title>
define('ALLOWED_EXT', 'html|htm');	// File extensions of log entries (use | as delimiter)
define('SORT_DESCENDING', true);	// Sort entries in descending order
define('USE_CACHE', true);			// Use cache?
define('USE_HEADER', false);		// Use intro body (header.inc.php)
define('ECHO_AUTHOR', true);		// Echo author from log_author tag
define('CACHE_FILE_EXT', '.inc');	// Output is cached in files having this extension (If you want to refresh the cache, delete these files to regenerate them on the next load of the page)
define('CACHE_EXPIRE', 1*24*60);	// Cache expiration time in minutes
define('CACHE_DIR', 'cache');		// Where to store cache files (you might need to change permissions on this directory so the script can write to it)
define('USE_NUMBERING', false);		// Numbered list?
