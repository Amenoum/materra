<?php
/*
	Generates the list of plugins. 
	Output is cached, new index is generated only after cache expires or if cache file is missing.
*/

/* SETTINGS: BEGIN */
require('index.settings.inc.php');
/* SETTINGS: END */

define('CACHE_FILE', CACHE_DIR.'/index'.CACHE_FILE_EXT);

if (file_exists(CACHE_FILE)) {
	$modified = filemtime(CACHE_FILE);
	if ($modified + CACHE_EXPIRE*60 > time()) {
		echo file_get_contents(CACHE_FILE);
		exit;
	}
}

function traverse_hierarchy($path, $only='') {
    $return_array = array();
    $dir = opendir($path);
	$tags = array();
    while(($file = readdir($dir)) !== false) {
        if($file == '.' || $file == '..') continue;
        $fullpath = $path . '/' . $file;
        if (is_dir($fullpath))
			$return_array = array_merge($return_array, traverse_hierarchy($fullpath, $only));
		else {
            if ($only != '')
                if (!preg_match('/\.('.$only.')$/i', $file)) continue;
			$f = file_get_contents($fullpath);
			$f_title = $file; $f_ver = ''; $f_author = ''; $f_desc = ''; $f_website = ''; $f_contributions = ''; $f_candisable = '1';
			if (preg_match('/[\r\n]\*\s*\@version\s+([^\r\n]+)/', $f, $matches))
				$f_ver = trim($matches[1]);
			if (preg_match('/[\r\n]\*\s*\@author\s+([^\r\n]+)/', $f, $matches))
				$f_author = trim($matches[1]);
			if (preg_match('/[\r\n]\*\s*\@desc\s+([^\r\n]+)/', $f, $matches))
				$f_desc = trim($matches[1]);
			if (preg_match('/[\r\n]\*\s*\@title\s+([^\r\n]+)/', $f, $matches))
				$f_title = trim($matches[1]);
			if (preg_match('/[\r\n]\*\s*\@website\s+([^\r\n]+)/', $f, $matches))
				$f_website = trim($matches[1]);
			if (preg_match('/[\r\n]\*\s*\@contributions\s+([^\r\n]+)/', $f, $matches))
				$f_contributions = trim($matches[1]);
			if (preg_match('/[\r\n]\*\s*\@candisable\s+([^\r\n]+)/', $f, $matches))
				$f_candisable = trim($matches[1]);
            $return_array[] = array('URL' => $fullpath, 'TITLE' => $f_title, 'VERSION' => $f_ver, 'DESC' => $f_desc, 'AUTHOR' => $f_author, 'WEBSITE' => $f_website, 'CONTRIBUTIONS' => $f_contributions, 'CANDISABLE' => $f_candisable);
        }
    }
    return $return_array;
}

$cur_dir = getcwd();
$files = traverse_hierarchy($cur_dir, ALLOWED_EXT);
$files_cnt = count($files);
//print_r($files);exit;
ob_start();

echo '{'.PHP_EOL;
echo '	"plugins": ['.PHP_EOL;
$i = 0;
foreach ($files as $f) {
	echo '		{'.PHP_EOL;
	echo '			"title"		: "'.$f['TITLE'].'",'.PHP_EOL;
	echo '			"version"	: "'.$f['VERSION'].'",'.PHP_EOL;
	echo '			"desc"		: "'.$f['DESC'].'",'.PHP_EOL;
	echo '			"author"	: "'.$f['AUTHOR'].'",'.PHP_EOL;
	echo '			"website"	: "'.$f['WEBSITE'].'",'.PHP_EOL;
	echo '			"contributions"	: "'.$f['CONTRIBUTIONS'].'",'.PHP_EOL;
	echo '			"candisable": "'.$f['CANDISABLE'].'",'.PHP_EOL;
	echo '			"url"		: "'.ltrim(preg_replace('/^'.preg_quote($cur_dir, '/').'/', '', $f['URL']), '/\\').'"'.PHP_EOL;
	echo '		}'.(++$i<$files_cnt?',':'').PHP_EOL;
}
echo '	]'.PHP_EOL;
echo '}'.PHP_EOL;

$content = ob_get_contents();
ob_end_clean();
file_put_contents(CACHE_FILE, $content);
echo $content;