<?php
/*
	Generates the index page for the blog. 
	Output is optionally cached, new index is generated only after cache expires or if cache file is missing.
	
	For proper sorting by date, it is advisable to use numbers when naming blog entries (filenames) so the latest entry begins with the highest number.
	NOTE_TO_SELF: Perhaps should rewrite this so it uses log_date tag for sorting.
	
	index.header.inc.php contains the intro body.
*/

/* SETTINGS: BEGIN */
require('index.settings.inc.php');
/* SETTINGS: END */

define('CACHE_FILE', CACHE_DIR.'/index'.CACHE_FILE_EXT);

if (USE_CACHE && file_exists(CACHE_FILE)) {
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
        if (!is_dir($fullpath)) {
            if ($only != '')
                if (!preg_match('/\.('.$only.')$/i', $file)) continue;
			if (preg_match('/^([0-9]+)/', $file, $matches))
				$return_array[$matches[1]] = $fullpath;
			else
				$return_array[] = $fullpath;
        }
    }
    return $return_array;
}

$files = traverse_hierarchy(getcwd(), ALLOWED_EXT);
$files_cnt = count($files);
if (SORT_DESCENDING) {
	//rsort($files);
	krsort($files);
}
else
	ksort($files);
//print_r($files);exit;
ob_start();
?>
<!DOCTYPE html>
<html><head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?=HTML_TITLE?></title>
	<link rel="stylesheet" href="/main.css">
	<script src="/MathJax-master/MathJax.js?config=TeX-MML-AM_CHTML" async=""></script>
	<script type="text/x-mathjax-config">
	  MathJax.Hub.Config({
		tex2jax: {inlineMath: [["$","$"]]}
	  });
	  MathJax.Hub.Register.StartupHook("End", function() {
		root.afterMathjax();
	  });
	</script>
	<script src="/jquery.min.js"></script>
	<script src="/main.js"></script>
</head>
<body id="0">
<!--PLACE-->

<!-- Override some system settings for this page -->
<set_body_class>blog</set_body_class>
<set_body_numbering>0</set_body_numbering>
<!--<set_body_expanders>1</set_body_expanders>-->		<!-- 1 is default -->

<!-- BLOG INDEX GENERATED: <?=date('Y.m.d H:i:s')?> -->

<div class="spirit main_head">
<h1><?=LOG_TITLE?></h1>
</div>

<spirit>
<?php if (USE_HEADER) echo file_get_contents('index.header.inc.php'); ?>
<?php
$i = 0;
foreach ($files as $f) {
	$content = file_get_contents($f);
	$f_date = ''; $f_author = '';
	if (preg_match('/^.*?\<log_date\>([^\<]+)\<\/log_date\>/s', $content, $matches) !== false) {
		$f_date = trim($matches[1]);
		$content = preg_replace('/^(.*?)\<log_date\>([^\<]+)\<\/log_date\>/s', '$1', $content);
	}
	if (preg_match('/^.*?\<log_author\>([^\<]+)\<\/log_author\>/s', $content, $matches) !== false) {
		$f_author = trim($matches[1]);
		$content = preg_replace('/^(.*?)\<log_author\>([^\<]+)\<\/log_author\>/s', '$1', $content);
	}
	$content = preg_replace('/^(.*?)\<sub1\>/s', '$1<sub1>[ <span class="update">'.$f_date.'</span> ] ', $content);
	$f_date = '';
	//echo trim(str_replace('<sub1>', '<sub1>('.$f_date.') ', $content)).PHP_EOL.(ECHO_AUTHOR?'<right>'.$f_author.'</right>':'');
	echo trim($content).PHP_EOL.'<br noformat><right>'.(ECHO_AUTHOR&&f_author!=''?$f_author:'').($f_date!=''?', '.$f_date:'').'</right>';
	++$i;
}
?>
</spirit>

<div class="footer">
</div>

</body>

</html>
<?php
$content = ob_get_contents();
ob_end_clean();
if (USE_CACHE) file_put_contents(CACHE_FILE, $content);
echo $content;