<?php
/*
	Handles uploads.
	
	A header (upload.header.inc.txt) will be added to uploaded webpages. It can be modified, but make sure it contains the opening html (<html>) and body tag (<body>)
*/

/***** SETTINGS: BEGIN *****/
require('upload.settings.inc.php');
/****** SETTINGS: END ******/

if (!isset($_POST['html']) || !isset($_POST['title']) || !isset($_POST['key'])) exit;

if (!UPLOADS_ENABLED) {
	echo '-1';
	exit;
}
if ($_POST['key'] != UPLOAD_KEY) {
	echo 0;
	exit;
}
$html = $_POST['html'];
$title_stripped = strip_tags($_POST['title']);
$title = preg_replace('/[^a-z0-9_\-]+/i', '_', $title_stripped);
$is_log = false;
$out_dir = MAIN_DIR;
if (strpos($html, 'log_header') !== false && preg_match('/\<log_id\>.*?\<\/log_id\>/s', $html)) {
	$is_log = true;
	$out_dir = LOG_DIR;
	if (preg_match('/\<div class="spirit[^"]+log_header[^"]*"[^\>]*\>[^\<]*\<h2[^\>]*\>.*?\<\/h2\>(.*?)\<\/div\>/s', $html, $matches))
		$html = $matches[1].preg_replace('/\<div class="spirit[^"]+log_header[^"]*"[^\>]*\>[^\<]*\<h2[^\>]*\>.*?\<\/h2\>.*?\<\/div\>/s', '', $html);
}

$i = 2;
$filename = $title.'.html';
while (file_exists($out_dir.'/'.$filename)) $filename = $title.($i++).'.html';
file_put_contents($out_dir.'/'.$filename, str_replace(array('{$TITLE}', '{$HEADER_PRE_TITLE}'), array($title_stripped, HEADER_PRE_TITLE), file_get_contents('upload.header.inc.txt')).$html.PHP_EOL.'</body>'.PHP_EOL.'</html>');

if (!$is_log && UPDATE_MENU) {
	$menu = file_get_contents(MENU);
	$menu = preg_replace('/\}[\s\r\n]*\][\s\r\n]*\}[\s\r\n]*$/', '},
		{
			"title" : "'.addslashes($_POST['title']).'",
			"url"	: "/'.$filename.'",
		}
	]
}', $menu);
	file_put_contents(MENU, $menu);
}

echo 1;