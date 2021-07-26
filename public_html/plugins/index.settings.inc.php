<?php
/*
	Settings for: plugins/index.php (Generates the list of plugins).
	Output is cached, new index is generated only after cache expires or if cache file is missing.
*/

define('ALLOWED_EXT', 'js');		// Allowed file extensions of plugins (use | as delimiter)
define('CACHE_FILE_EXT', '.inc');	// Output is cached in files having this extension (If you want to refresh the cache, delete these files to regenerate them on the next load of the page)
define('CACHE_EXPIRE', 1*24*60);	// Cache expiration time in minutes
define('CACHE_DIR', '.');			// Where to store cache files (you might need to change permissions on this directory so the script can write to it)
