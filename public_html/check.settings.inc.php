<?php
/*
	Settings for: check.php (Used to check for updates).
	check.php returns a list of files with CRC32 checksums.
	Output of check.php is cached, new list is generated only after cache expires or if cache file is missing.
	
	WARNING: If you have any files (having one of the extensions listed in ALLOWED_EXT) you don't want to go public, make sure to exclude the location (directory) of these files from the check here

*/

define('ALLOWED_EXT', 'html|htm|js|header\.inc\.php|txt|css|json|code');	// File extensions to check (use | as delimiter)
define('USE_CACHE', true);			// Use cache?
define('CACHE_FILE_EXT', '.inc');	// Output is cached in files having this extension (If you want to refresh the cache, delete these files to regenerate them on the next load of the page)
define('CACHE_EXPIRE', 12*60);		// Cache expiration time in minutes
define('CACHE_DIR', 'cache');		// Where to store cache files (you might need to change permissions on this directory so the script can write to it)

$exclude_dirs = array('cache', 'images', 'textures', 'jquery-editable-master', 'MathJax-master', 'unready', 'tmp');			// Directories to exclude from checking
