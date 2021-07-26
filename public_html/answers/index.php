<?php
/*
	Generates the index page for the answers page. 
	Output is cached, new index is generated only after cache expires or if cache file is missing.
	
	index.header.inc.php contains the intro body.
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

function HTMList($str) {
	if (($x = strpos($str, '-')) !== false) {
		if ($x == 0) $str = preg_replace('/^\-([^\n]+)/', '<li>$1</li>', $str);
		$str = preg_replace('/\n\-([^\n]+)/', '<li>$1</li>', $str);
		$str = preg_replace('/^(.*?)\<li\>/', '$1<ul><li>', preg_replace('/^(.*)\<\/li\>/', '$1</li></ul>', $str));
	}
	return $str;
}

$lines = array(); $j = -1;
if (USE_DB) {
	$db = new SQLite3(DB_FILE);
	$res = $db->query('SELECT * FROM answers');
	while ($row = $res->fetchArray())
		$lines[++$j] = array(Q => $row['question'], 'A' => $row['answer']);
}
else {
	$fp = fopen(ANSWERS_FILE, 'r');
	if ($fp) {
		while (!feof($fp)) {
			$line_init = fgets($fp);
			$line = trim($line_init, " \t\r\n\0");
			if (preg_match('/^\[.*\]$/', $line) || strlen($line) < 2) continue;
			if (preg_match('/\?$/', $line)) {
				$tmp = explode('||', $line);
				$lines[++$j] = array('Q' => $tmp[0], 'A' => '');
				continue;
			}
			if ($j < 0) continue;
			$lines[$j]['A'] .= $line_init;
		}
		fclose($fp);
	}
}

if (SORT_DESCENDING) rsort($lines);

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
<set_body_class>answers</set_body_class>
<set_body_numbering><?=(USE_NUMBERING?'1':'0')?></set_body_numbering>
<!--<set_body_expanders>1</set_body_expanders>-->		<!-- 1 is default -->

<!-- ANSWERS INDEX GENERATED: <?=date('Y.m.d H:i:s')?> [SOURCE: <?=(USE_DB?'DB':'TEXT')?>] -->

<div class="spirit main_head">
<h1><?=PAGE_TITLE?></h1>
</div>

<spirit>
<?php
echo file_get_contents('index.header.inc.php');

foreach ($lines as $line) {
	echo '<sub1>'.$line['Q'].'</sub1>'.PHP_EOL;
	echo HTMList($line['A']).PHP_EOL;
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
file_put_contents(CACHE_FILE, $content);
echo $content;