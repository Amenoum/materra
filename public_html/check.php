<?php
/*
	Used to check for updates. 
	Returns a list of files with CRC32 checksums.
	Output is cached, new list is generated only after cache expires or if cache file is missing.
	
	WARNING: If you have any files (having one of the extensions listed in ALLOWED_EXT in the settings file) you don't want to go public, make sure to exclude the location (directory) of these 
	files from the check in the settings file (check.settings.inc.php)
	
*/

/* SETTINGS: BEGIN */
require('check.settings.inc.php');
/* SETTINGS: END */

define('CACHE_FILE', CACHE_DIR.'/check'.CACHE_FILE_EXT);

header('Content-Type: text-plain');

if (USE_CACHE && file_exists(CACHE_FILE)) {
	$modified = filemtime(CACHE_FILE);
	if ($modified + CACHE_EXPIRE*60 > time()) {
		echo file_get_contents(CACHE_FILE);
		exit;
	}
}

function traverse_hierarchy($path, $only='') {
	global $exclude_dirs;
    $return_array = array();
    $dir = opendir($path);
	$tags = array();
    while(($file = readdir($dir)) !== false) {
        if($file == '.' || $file == '..') continue;
        $fullpath = $path . '/' . $file;
        if (!is_dir($fullpath)) {
            if ($only != '')
                if (!preg_match('/\.('.$only.')$/i', $file)) continue;
            $return_array[] = $fullpath;
        }
		elseif (!in_array($file, $exclude_dirs)) $return_array = array_merge($return_array, traverse_hierarchy($fullpath, $only));
    }
    return $return_array;
}

$cur_dir = getcwd();
$files = traverse_hierarchy($cur_dir, ALLOWED_EXT);
$files_cnt = count($files);
ob_start();
$i = 0;
foreach ($files as $f) {
	$crc32 = hash_file('CRC32', $f);
	echo str_replace($cur_dir, '', $f)." $crc32".PHP_EOL;
}
$content = ob_get_contents();
ob_end_clean();
if (USE_CACHE) file_put_contents(CACHE_FILE, $content);
echo $content;