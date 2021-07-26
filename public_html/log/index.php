<?php
/*
	Generates the index page for the journal. 
	Output is cached, new index is generated only after cache expires or if cache file is missing.
	If you are using <update> tags in your documents and AUTO_UPDATE, you should set CACHE_EXPIRE equal to or less than default value (1*24*60 minutes = 24 h), 
	otherwise some auto-generated dates in <update> might not match the actual dates of updates. 
	
	index.header.inc.php contains the intro body.
*/

/* SETTINGS: BEGIN */
require('index.settings.inc.php');
/* SETTINGS: END */

define('CACHE_ALLOWED_TAGS', CACHE_DIR.'/index_allowed_tags'.CACHE_FILE_EXT);
$tags_str = '';
if (file_exists(CACHE_ALLOWED_TAGS))
	$tags_str = file_get_contents(CACHE_ALLOWED_TAGS);
if (isset($_GET['tag']) && $tags_str != '') {
	$tag = trim($_GET['tag']);
	$tags = explode(',', $tags_str);
	if (in_array($tag, $tags)) {
		define('TAG', $tag);
		define('CACHE_FILE', CACHE_DIR.'/index_'.md5($tag).CACHE_FILE_EXT);
	}
	else {
		//define('TAG', false);
		define('TAG', $tag);
		define('CACHE_FILE', CACHE_DIR.'/index'.CACHE_FILE_EXT);
	}
}
else {
	define('TAG', false);
	define('CACHE_FILE', CACHE_DIR.'/index'.CACHE_FILE_EXT);
}

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
        if (!is_dir($fullpath)) {
            if ($only != '')
                if (!preg_match('/\.('.$only.')$/i', $file)) continue;
			if (!AUTO_UPDATE && preg_match('/\.[a-z]{2,3}\.[^\.]+$/', $file)) continue;	// We're not listing translations (files ending with .lang.html), but need to update these too if AUTO_UPDATE is on
            //$return_array[] = $fullpath;
			$f = file_get_contents($fullpath);
			$f_title = ''; $f_date = ''; $f_update = ''; $f_desc = ''; $f_tags = ''; $f_category = ''; $f_alt_lang = ''; $f_alt_title = ''; $f_alt_file = ''; $f_tags_arr_trimmed = array();
			if (preg_match('/^.*?main_head.+?\<title\>(.*?)\<\/title\>/s', $f, $matches) && $matches[1] != '') $f_title = trim($matches[1]);
			elseif (preg_match('/^.*?main_head.+?\<h1\>(.*?)\<\/h1\>/s', $f, $matches)) $f_title = trim($matches[1]);
			if (preg_match('/^.*?\<log_date\>([^\<]+)\<\/log_date\>/s', $f, $matches)) $f_date = trim($matches[1]);
			if (AUTO_UPDATE) {	// checks if file is modified and updates relevant tags with modification date (would be better to make a hash tag and use hash check here)
				if (isset($matches[1])) {
					$f_modified = filemtime($fullpath);
					$f_updated1 = date('Y.m.d', $f_modified); $f_updated2 = date('Y.n.j', $f_modified);
					$f = str_replace('<update>', '<update date="'.$f_updated1.'">', $f, $up_count);
					$file_updated = false;
					if ($f_date != $f_updated1 && $f_date != $f_updated2) {
						if (preg_match('/^.*?\<log_update\>([^\<]*)\<\/log_update\>/s', $f, $matches)) $f_update = trim($matches[1]);
						if ($f_update != $f_updated1 && $f_update != $f_updated2) {
							if (isset($matches[1]))
								$f = preg_replace('/\<log_update\>[^\<]*\<\/log_update\>/s', '<log_update>'.$f_updated1.'</log_update>', $f);
							else
								$f = preg_replace('/\<\/log_date\>/s', '</log_date>'.PHP_EOL.'<log_update>'.$f_updated1.'</log_update>', $f);
							$f_mtime = '';
							if (preg_match('/^.*?\<log_mtime\>([^\<]*)\<\/log_mtime\>/s', $f, $matches)) $f_mtime = trim($matches[1]);
							if ($f_mtime != $f_updated1 && $f_mtime != $f_updated2) {
								$f_update = $f_updated1;
								$f_updated1 = date('Y.m.d');
								if (isset($matches[1]))
									$f = preg_replace('/\<log_mtime\>[^\<]*\<\/log_mtime\>/s', '<log_mtime>'.$f_updated1.'</log_mtime>', $f);
								else
									$f = preg_replace('/\<\/log_update\>/s', '</log_update>'.PHP_EOL.'<log_mtime>'.$f_updated1.'</log_mtime>', $f);
								file_put_contents($fullpath, $f);
								$file_updated = true;
							}
						}
					}
					if ($up_count > 0 && !$file_updated) {
						$f = preg_replace('/\<log_mtime\>[^\<]*\<\/log_mtime\>/s', '<log_mtime>'.date('Y.m.d').'</log_mtime>', $f);
						file_put_contents($fullpath, $f);
					}
				}
				if (preg_match('/\.[a-z]{2,3}\.[^\.]+$/', $file)) continue;	// We're not listing translations (files ending with .lang.html)
			}
			elseif (preg_match('/^.*?\<log_update\>([^\<]*)\<\/log_update\>/s', $f, $matches)) $f_update = trim($matches[1]);
			if (preg_match('/^.*?\<log_desc\>([^\<]+)\<\/log_desc\>/s', $f, $matches)) $f_desc = trim($matches[1]);
			if (preg_match('/^.*?\<log_lang_alt\>([^\<]+)\<\/log_lang_alt\>/s', $f, $matches)) {
				$f_alt_lang = trim($matches[1]);
				$f_alt_file = preg_replace('/\.([^\.]+)$/', '.'.$f_alt_lang.'.$1', $file);
				$f_alt = file_get_contents(preg_replace('/\.([^\.]+)$/', '.'.$f_alt_lang.'.$1', $fullpath));
				if (preg_match('/^.*?main_head.+?\<title\>(.*?)\<\/title\>/s', $f_alt, $matches) && $matches[1] != '') $f_alt_title = trim($matches[1]);
				elseif (preg_match('/^.*?main_head.+?\<h1\>(.*?)\<\/h1\>/s', $f_alt, $matches)) $f_alt_title = trim($matches[1]);
				if (preg_match('/^.*?\<log_tags\>([^\<]+)\<\/log_tags\>/s', $f_alt, $matches)) {
					$f_tags_alt = trim($matches[1]);
					$f_tags_arr = explode(',', $f_tags_alt);
					foreach ($f_tags_arr as $ft) {
						$ft = trim($ft);
						if (!in_array($ft, $tags)) $tags[] = $ft;
						$f_tags_arr_trimmed[] = $ft;
					}
				}

			}
			if (preg_match('/^.*?\<log_category\>([^\<]+)\<\/log_category\>/s', $f, $matches)) $f_category = trim($matches[1]);
			if (preg_match('/^.*?\<log_tags\>([^\<]+)\<\/log_tags\>/s', $f, $matches)) {
				$f_tags = trim($matches[1]);
				$f_tags_arr = explode(',', $f_tags);
				foreach ($f_tags_arr as $ft) {
					$ft = trim($ft);
					if (!in_array($ft, $tags)) $tags[] = $ft;
					$f_tags_arr_trimmed[] = $ft;
				}
			}
			$file_pre = preg_replace('/^.*[\/\\\]([^\/\\\]*)$/', '$1', rtrim($path, '/\\'));
			$ret = array('FILE' => $file_pre.'/'.$file, 'TITLE' => $f_title, 'DATE' => $f_date, 'UPDATE' => $f_update, 'DESC' => $f_desc, 'CATEGORY' => $f_category, 'TAGS_STR' => $f_tags, 'TAGS' => $f_tags_arr_trimmed, 'ALT_LANG' => $f_alt_lang, 'ALT_TITLE' => $f_alt_title, 'ALT_FILE' => $file_pre.'/'.$f_alt_file);
			if (preg_match('/^([0-9]+)_/', $file, $matches)) {
				$i = 0;
				while (isset($return_array[$matches[1]])) $matches[1] .= $i++;
				$return_array[$matches[1]] = $ret;
			}
			else
				$return_array[] = $ret;
        }
    }
	$tags_str = '';
	foreach ($tags as $t) $tags_str .= ($tags_str!=''?',':'').$t;
	file_put_contents(CACHE_ALLOWED_TAGS, $tags_str);
    return $return_array;
}

$files = traverse_hierarchy(getcwd(), ALLOWED_EXT);
$files_cnt = count($files);
if (PARSE_CATEGORIES) {
	function datecmp($a, $b) {
		$ret = strcmp($a['DATE'], $b['DATE']);
		if (SORT_DESCENDING && $ret != 0) $ret *= -1;
		return $ret;
	}
	$afiles = array();
	foreach ($files as $f) {
		if (!isset($afiles[$f['CATEGORY']])) $afiles[$f['CATEGORY']] = array();
		$afiles[$f['CATEGORY']][] = $f;
	}
	sort($afiles);
	$files = array();
	foreach ($afiles as $af) {
		usort($af, 'datecmp');
		foreach ($af as $f) {
			$files[] = $f;
		}
	}
}
elseif (SORT_DESCENDING)
	rsort($files);
$max_rows = round($files_cnt / TABLE_MAX_COLS);
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
<set_body_class>log</set_body_class>
<set_body_numbering>0</set_body_numbering>
<!--<set_body_expanders>1</set_body_expanders>-->		<!-- 1 is default -->

<!-- JOURNAL INDEX GENERATED: <?=date('Y.m.d H:i:s')?> -->

<div class="spirit main_head">
<h1><?=LOG_TITLE?></h1>
</div>

<spirit>
<?php echo file_get_contents('index.header.inc.php'); ?>
<sub1><?=(TAG!==false?ARTICLES_HEADING_ON.' <em>'.htmlentities(TAG, ENT_COMPAT, 'UTF-8').'</em>':ARTICLES_HEADING)?></sub1>
<?php
$i = 0; $j = 0; $last_cat = '';
echo '<div><div class="log_block">';
function niceDate($date) {
	return preg_replace('/\.[0-9]+$/', '', $date);
}
foreach ($files as $f) {
	if (TAG !== false && !in_array(TAG, $f['TAGS'])) continue;
	if (PARSE_CATEGORIES && $last_cat != $f['CATEGORY']) {
		echo '</div></div><div'.($i>0?' class="padtop" style="float:left;clear:both"':'').'><sub2 style="clear: both">'.ucwords($f['CATEGORY']).'</sub2><div class="log_block">';
		$last_cat = $f['CATEGORY'];
		$j = 0;
	}
	$file = $f['FILE'];
	$ftitle = ($f['TITLE'] != ''?$f['TITLE']:ucfirst(str_replace('_', ' ', preg_replace('/\.[^\.]*$/', '', preg_replace('/^[^\/]*\/[0-9_]*/', '', $f['FILE'])))));
	$f_alt_link = '';
	if ($f['ALT_LANG'] != '') {
		$f_alt_title = ($f['ALT_TITLE'] != ''?$f['ALT_TITLE']:ucfirst(str_replace('_', ' ', preg_replace('/\.[^\.]*$/', '', preg_replace('/^[^\/]*\/[0-9_]*/', '', $f['ALT_FILE'])))));
		$f_alt_link = ' (<a href="/'.$f['ALT_FILE'].'" noref="1" title="'.strtoupper($f['ALT_LANG']).'">'.$f_alt_title.'</a>)';
	}
	++$i;
	echo (USE_NUMBERING?"$i. ":'').(ECHO_DATE?'<span>'.niceDate($f['DATE']).'</span> ':'').'<a href="/'.$f['FILE'].'" noref="1" desc="'.htmlentities($f['DESC'], ENT_COMPAT, 'UTF-8').'" title="'.LANG_CREATED.' '.htmlentities($f['DATE'], ENT_COMPAT, 'UTF-8').($f['UPDATE'] != ''?', '.LANG_UPDATED.' '.htmlentities($f['UPDATE'], ENT_COMPAT, 'UTF-8'):'').' ('.LANG_TAGS.': '.htmlentities($f['TAGS_STR'], ENT_COMPAT, 'UTF-8').')">'.$ftitle.'</a>'.$f_alt_link.'<br noformat>';
	if (++$j > $max_rows) {
		echo '</div><div class="log_block">';
		$j = 0;
	}
}
?>
</div></div>
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