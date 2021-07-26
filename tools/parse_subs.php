<?php
/*
	parse_subs.php
	
	Parsing of files with sentences (typically in the form of questions and answers) to be used by MATERRA conversation (query) engine. 
	Data is stored in SQLite database (so make sure SQLite is enabled in php.ini if you use this).
	
*/

date_default_timezone_set('Europe/Zagreb');

/****************** SETTINGS: START ******************/
define('SOURCE', '../source_subs');								// Source directory
define('USE_GENERIC', true);									// Parses FILE_GENERIC in addition to other files specified by ONLY_EXT, FILE_GENERIC is parsed in a similar manner but with additional rules
define('USE_ANSWERS', true);									// Parses FILE_ANSWERS in addition to other files specified by ONLY_EXT, FILE_ANSWERS is parsed differently yet
define('FILE_ANSWERS', '../public_html/answers/answers.txt');		// Path to FILE_ANSWERS
define('FILE_GENERIC', '../source_subs/generic.txt');				// Path to FILE_GENERIC
define('USE_OUTPUT', false);									// Used for testing, debugging
define('OUTPUT', 'subs_out.txt');								// If USE_OUTPUT is true, this is where it will be written
define('USE_DB', true);											// Uses SQLite database to store data
define('DB_FILE', '../public_html/talk/subs_queries.db');			// If USE_DB is true, database will be stored here
define('DB_TEST', false);										// If true, will dump generated database (main table) to QUERY_OUTPUT.'_generated.txt'
define('QUERY_OUTPUT', 'subs_queries.txt');						// Used for data, if USE_DB is false

$exclude_dirs = array('MathJax-master', 'tmp');					// Subdirectories to exclude from parsing

// Parse only specified file types (extensions) - use | as delimiter, or set to empty ('') to parse all files, regardless of type
define('ONLY_EXT', 'srt');

/******************* SETTINGS: END *******************/


// returns all files in a dir and subdirs,
// only -> returns only files with specified extensions (delimiter = |)
function traverse_hierarchy($path, $only='') {
	global $exclude_dirs, $cur_dir;
    $return_array = array();
    $dir = opendir($path);
    while(($file = readdir($dir)) !== false) {
        if($file == '.' || $file == '..') continue;
        $fullpath = $path . '/' . $file;
        if (is_dir($fullpath)) {
			if (in_array($file, $exclude_dirs)) continue;
            $return_array = array_merge($return_array, traverse_hierarchy($fullpath, $only));
		}
        else {
            if ($only != '')
                if (!preg_match('/\.('.$only.')$/i', $file)) continue;
            $return_array[] = $fullpath;
        }
    }
    return $return_array;
}

// Hashing function, used as primary key for searches (this function should be equal to one in /talk/talk.php
function hash_str($str, $try = 0, $only_str = false) {
	$str = strtolower($str);
	$str = str_replace('\'ll', ' will', $str);
	$str = preg_replace(array('/(\b)I\'m(\b)/', '/(\b)don\'t(\b)/', '/(\b)didn\'t(\b)/', '/(\b)can\'t(\b)/', '/(\b)shall(\b)/', '/(\b)\'em(\b)/', '/(\b)(he|she|that|it|there|what|who)\'s(\b)/', '/(\b)y\'all(\b)/', '/(\b)(you|we|they)\'re(\b)/'), array('$1I am$2', '$1do not$2', '$1did not$2', '$1cannot$2', '$1will$2', '$1them$2', '$1$2 is$3', '$1you all$2', '$1$2 are$3'), $str);
	$str = preg_replace(array('/(\b)u(\b)/', '/(\b)r(\b)/'), array('$1you$1', '$1are$1'), $str);
	$str = trim(preg_replace('/\s{2,}/', ' ', preg_replace('/\bthe\b/', ' ', preg_replace('/[^a-z0-9\s]/', ' ', preg_replace('/\b[a-z]\b/', ' ', $str)))));
	if ($try > 0) {
		while ($try-- && strlen($str) > 10)
			$str = rtrim(preg_replace('/(\b)[a-z0-9]+$/', '$1', $str));
	}
	return ($only_str?$str:md5($str));
}

// Fixes ALL CAPS in strings, returns All Caps
function fixAllCaps($str) {
	if (strlen($str) > 3 && !preg_match('/[a-z]/', $str)) return ucwords(strtolower($str));
	return $str;
}

@unlink(OUTPUT);
echo 'Processing '.SOURCE.'...'.PHP_EOL.PHP_EOL;
$files = traverse_hierarchy(SOURCE, ONLY_EXT);

$i = 0; $queries = array(); $queries_links = array();
$j = 0; $lines = array(); $j_init = 0;
foreach ($files as $f) {
	$filename = preg_replace('/^.*\/([^\/]+)$/', '$1', $f);
	echo $filename;
	if ($fp = fopen($f, 'r')) {
		++$i;
		$append = false;
		while (!feof($fp)) {
			$line_init = trim(preg_replace('/\<[^\>]*\>/', '', preg_replace('/\[[^\]]*\]/', '', preg_replace('/\([^\)]*\)/', '', preg_replace('/[\´\`]/', "'", preg_replace('/^.*\:([^\:]*)$/', '$1', preg_replace('/["\s\t\*\♪]+/', ' ', fgets($fp))))))), "'- \t\r\n\0");
			if (preg_match('/^[0-9\:,\-\>\s]+$/', $line_init) || preg_match('/^[\(\[\{].*[\)\]\}]$/', $line_init) || strlen($line_init) < 2) {
				if (0 && $append) {
					$lines[$j] = rtrim($lines[$j], ',');
					$lines[$j++] .= '.';
					$append = false;
				}
				continue;
			}			
			//if (preg_match('/^"[^"]*$/', $line_init)) $line_init .= '"';	// sometimes the quotes span multiple lines so this would prevent append
			$line = ($append?$line.' ':'').$line_init;
			$append = false;
			if (!preg_match('/[\.\?\!\*\"]$/', $line)) {
				$append = true;
				$lines[$j] = $line;
			}
			else $lines[$j++] = $line;
		}
		if ($append) {
			$lines[$j] = rtrim($lines[$j], ',;');
			$lines[$j++] .= '.';
		}
		fclose($fp);
		if (!USE_OUTPUT || $fp = fopen(OUTPUT, 'a')) {
			$prev_line = '';
			$lines_total = $j;
			for ($x = $j_init; $x<$lines_total; $x++) {
				$line = $lines[$x];
				$next_line = (isset($lines[$x+1])?$lines[$x+1]:'');
				if ($line != $prev_line && $next_line != '') {
					$q_md5 = hash_str($line);	// PRIMARY KEY generation
					if (isset($queries[$q_md5])) {
						$queries[$q_md5][$x] = fixAllCaps($next_line);	// Might want to check for duplicates before adding, but we are then discarding possibility of context conservation (storage of $x in database becomes obsolete)
					}
					else
						$queries[$q_md5] = array($x => fixAllCaps($next_line));
					if (USE_OUTPUT) fwrite($fp, $line.PHP_EOL);
				}
				$prev_line = $line;
			}
			if (USE_OUTPUT) fclose($fp);
			echo ' [SUCCESS]';
		}
		else echo ' [ERROR: Can\'t write!]';
		$j_init = $lines_total;
	}
	else echo ' [ERROR: Can\'t open!]';
	echo PHP_EOL;
	//break;
}
$f = FILE_GENERIC;
if (USE_GENERIC && file_exists($f)) {
	echo ($i==0?'':PHP_EOL).'Processing '.$f.'...';
	//$j = 0; $lines = array();
	if ($fp = fopen($f, 'r')) {
		++$i;
		$append = false;
		while (!feof($fp)) {
			$line_init = trim(preg_replace('/\'([^\']*)\'\s*$/', '$1', preg_replace('/\<[^\>]*\>/', '', preg_replace('/\[[^\]]*\]/', '', preg_replace('/\([^\)]*\)/', '', preg_replace('/\´([^\´]*)\´/', '$1', preg_replace('/^.*\:([^\:]*)$/', '$1', preg_replace('/["\s\t\*\♪]+/', ' ', fgets($fp)))))))), "- \t\r\n\0");
			if (preg_match('/^[0-9\:,\-\>\s]+$/', $line_init) || preg_match('/^[\(\[\{].*[\)\]\}]$/', $line_init) || strlen($line_init) < 2)
				continue;
			$line_init = preg_replace('/([^a-z])\'$/i', '$1', ltrim($line_init, "'"));
			$line = ($append?$line:'').$line_init;
			$append = false;
			if (preg_match('/\|\|$/', $line)) {
				$append = true;
				$lines[$j] = $line;
			}
			else $lines[$j++] = $line;
		}
		if ($append) {
			$lines[$j] = rtrim($lines[$j], ',;');
			$lines[$j++] .= '.';
		}
		fclose($fp);
		if (!USE_OUTPUT || $fp = fopen(OUTPUT, 'a')) {
			$lines_total = $j;
			for ($x = $j_init, $j = $j_init; $j<$lines_total; $j++) {
				$line = $lines[$j];
				if (strpos($line, '||') !== false) {
					$tmp = explode('||', $line);
					$line = $tmp[0];
					$q_md5 = hash_str($line);	// PRIMARY KEY generation
					$tmp_cnt = count($tmp);
					for ($k=1; $k<$tmp_cnt; $k++) {
						$alt_line = trim($tmp[$k]);
						$queries_links[] = array('LINK' => hash_str($alt_line), 'SOURCE' => $q_md5);
					}
				}
				else $q_md5 = hash_str($line);	// PRIMARY KEY generation
				$next_line = (isset($lines[$j+1])?$lines[$j+1]:'');
				if ($next_line != '') {
					$next_lines = explode('||', $next_line);
					$next_lines_cnt = count($next_lines);
					for ($k=0; $k<$next_lines_cnt; $k++) {
						$next_line = $next_lines[$k];
						if (isset($queries[$q_md5])) {
							$queries[$q_md5][$x++] = fixAllCaps($next_line);	// Might want to check for duplicates before adding, but we are then discarding possibility of context conservation (storage of $x in database becomes obsolete)
						}
						else
							$queries[$q_md5] = array($x++ => fixAllCaps($next_line));
					}
				}
				if (USE_OUTPUT) fwrite($fp, $line.PHP_EOL);
			}
			if (USE_OUTPUT) fclose($fp);
			echo ' [SUCCESS]';
		}
		else echo ' [ERROR: Can\'t write!]';
	}
	else echo ' [ERROR: Can\'t open '.$f.'!]';
}
elseif (!USE_GENERIC) echo 'NOTE: '.$f.' not parsed, does not exist!';

$queries_answers = array(); $queries_answers_links = array();
$f = FILE_ANSWERS;
if (USE_ANSWERS && file_exists($f)) {
	echo ($i==0?'':PHP_EOL).'Processing '.$f.'...';
	$j = -1; $lines = array();
	if ($fp = fopen($f, 'r')) {
		++$i;
		while (!feof($fp)) {
			$line = preg_replace('/[ \t]+/', ' ', fgets($fp));
			$line_init = trim($line, "- \t\r\n\0");
			if (preg_match('/^[\(\[\{].*[\)\]\}]$/', $line_init) || strlen($line_init) < 2)
				continue;
			if (preg_match('/\?$/', $line_init)) {
				$lines[++$j] = $line_init;
				++$j;
			}
			elseif ($j > 0)
				$lines[$j] = (isset($lines[$j])?$lines[$j]:'').$line;
		}
		fclose($fp);
		if (!USE_OUTPUT || $fp = fopen(OUTPUT, 'a')) {
			$lines_total = $j+1;
			for ($j = 0; $j<$lines_total; $j++) {
				$line = $lines[$j];
				if (preg_match('/\?$/', $line)) {
					if (strpos($line, '||') !== false) {
						$tmp = explode('||', $line);
						$line = $tmp[0];
						$q_md5 = hash_str($line);	// PRIMARY KEY generation
						$tmp_cnt = count($tmp);
						for ($k=1; $k<$tmp_cnt; $k++) {
							$alt_line = trim($tmp[$k]);
							$queries_answers_links[] = array('LINK' => hash_str($alt_line), 'SOURCE' => $q_md5);
						}
					}
					else $q_md5 = hash_str($line);	// PRIMARY KEY generation
					$queries_answers[$q_md5] = array('QUESTION' => $line, 'ANSWER' => '');
				}
				else
					$queries_answers[$q_md5]['ANSWER'] = trim($line);
				if (USE_OUTPUT) fwrite($fp, $line.PHP_EOL);
			}
			if (USE_OUTPUT) fclose($fp);
			echo ' [SUCCESS]';
		}
		else echo ' [ERROR: Can\'t write!]';
	}
	else echo ' [ERROR: Can\'t open '.$f.'!]';
}
elseif (!USE_ANSWERS) echo 'NOTE: '.$f.' not parsed, does not exist!';

if (USE_DB) {
	echo PHP_EOL.PHP_EOL.'Writing to database...';
	
	//@unlink(DB_FILE);		// We're gonna drop tables instead
		
	$db = new SQLite3(DB_FILE);
	
	$db->exec("PRAGMA synchronous = OFF");	// Disables writing to hdd after each insert
	//$db->exec("PRAGMA cache_size=10000");	// May want to increase cache size if using transactions
	
	$db->exec("DROP TABLE IF EXISTS subs_links");
	$db->exec("DROP TABLE IF EXISTS subs");
	$db->exec("DROP TABLE IF EXISTS answers_links");
	$db->exec("DROP TABLE IF EXISTS answers");
	
	if (0) $db->exec("DROP TABLE IF EXISTS no_answers");
	$db->exec("CREATE TABLE IF NOT EXISTS no_answers(id CHAR(32) PRIMARY KEY, prev_quote TEXT, user_quote TEXT, count INTEGER DEFAULT 0)");

	$db->exec("CREATE TABLE IF NOT EXISTS subs(id CHAR(32) PRIMARY KEY, quotes TEXT)");
	$x = 0;
	$db->exec("BEGIN TRANSACTION");
	foreach ($queries as $q_key => $q_val) {
		$quotes = '';
		foreach ($q_val as $q_val_key => $q_val_val)
			$quotes .= $q_val_key.':'.$q_val_val.'||';
		$escaped = SQLite3::escapeString(rtrim($quotes, '|'));
		$db->exec("INSERT INTO subs(id, quotes) VALUES('$q_key', '$escaped')");
		++$x;
		if ($x % 10000 == 0) echo '.';
	}
	$db->exec("END TRANSACTION");
	
	$db->exec("CREATE TABLE IF NOT EXISTS subs_links(id CHAR(32) PRIMARY KEY, source CHAR(32))");	// source is a foreign key (subs.id), but we don't need that declared
	$y = 0;
	$db->exec("BEGIN TRANSACTION");
	foreach ($queries_links as $link) {
		$db->exec("INSERT INTO subs_links(id, source) VALUES('".$link['LINK']."', '".$link['SOURCE']."')");
		++$y;
		if ($y % 10000 == 0) echo '.';
	}
	$db->exec("END TRANSACTION");

	$db->exec("CREATE TABLE IF NOT EXISTS answers(id CHAR(32) PRIMARY KEY, question TEXT, answer TEXT)");
	$w = 0;
	$db->exec("BEGIN TRANSACTION");
	foreach ($queries_answers as $q_key => $q_val) {
		$escaped_question = SQLite3::escapeString($q_val['QUESTION']);
		$escaped_answer = SQLite3::escapeString($q_val['ANSWER']);
		$db->exec("INSERT INTO answers(id, question, answer) VALUES('$q_key', '$escaped_question', '$escaped_answer')");
		++$w;
		if ($w % 10000 == 0) echo '.';
	}
	$db->exec("END TRANSACTION");
	
	$db->exec("CREATE TABLE IF NOT EXISTS answers_links(id CHAR(32) PRIMARY KEY, source CHAR(32))");	// source is a foreign key (answers.id), but we don't need that declared
	$z = 0;
	$db->exec("BEGIN TRANSACTION");
	foreach ($queries_answers_links as $link) {
		$db->exec("INSERT INTO answers_links(id, source) VALUES('".$link['LINK']."', '".$link['SOURCE']."')");
		++$z;
		if ($z % 10000 == 0) echo '.';
	}
	$db->exec("END TRANSACTION");
	
	// Original idea, creates a table for each q_key, more elegant solution, but it turns out to be highly inefficient for reads (SELECT) in SQLite
	/*
	foreach ($queries as $q_key => $q_val) {
		$tbl_name = 'tbl_'.$q_key;
		$db->exec("CREATE TABLE IF NOT EXISTS $tbl_name(id INTEGER PRIMARY KEY, quote TEXT)");
		$db->exec("BEGIN TRANSACTION");
		foreach ($q_val as $q_val_key => $q_val_val) {
			$escaped = SQLite3::escapeString($q_val_val);
			$db->exec("INSERT INTO $tbl_name(id, quote) VALUES($q_val_key, '$escaped')");
		}
		$db->exec("END TRANSACTION");
	}
	*/
	
	if (DB_TEST) {
		// Dump subs to file for check/debug
		$fp = fopen(QUERY_OUTPUT.'_generated.txt', 'w');
		foreach ($queries as $q_key => $q_val) {
			$line = $q_key.': [';
			$res = $db->query("SELECT * FROM subs WHERE id = '$q_key'");
			while ($row = $res->fetchArray()) {
				//echo "{$row['id']} {$row['quote']} \n";
				$line .= $row['quotes'].', ';
			}
			$line = rtrim($line, ', ');
			$line .= ']'.PHP_EOL;
			fwrite($fp, $line);
		}
		fclose($fp);
	}
	
	// Original dump
	/*
	$fp = fopen(QUERY_OUTPUT.'_generated.txt', 'w');
	foreach ($queries as $q_key => $q_val) {
		$line = $q_key.': [';
		$tbl_name = 'tbl_'.$q_key;
		$res = $db->query("SELECT * FROM $tbl_name");
		while ($row = $res->fetchArray()) {
			//echo "{$row['id']} {$row['quote']} \n";
			$line .= $row['id'].' => "'.$row['quote'].'", ';
		}
		$line = rtrim($line, ', ');
		$line .= ']'.PHP_EOL;
		fwrite($fp, $line);
	}
	fclose($fp);
	*/
	
	echo " Done ($x main records, $y main links, $w answer records, $z answer links).".PHP_EOL;
}
elseif ($fp = fopen(QUERY_OUTPUT, 'w')) {
	foreach ($queries as $q_key => $q_val) {
		$line = $q_key.': [';
		foreach ($q_val as $q_val_key => $q_val_val) {
			$line .= $q_val_key.' => "'.$q_val_val.'", ';
		}
		$line = rtrim($line, ', ');
		$line .= ']'.PHP_EOL;
		fwrite($fp, $line);
	}
	fclose($fp);
}
else echo PHP_EOL.'ERROR: Can\'t write to '.QUERY_OUTPUT.'!'.PHP_EOL;
echo PHP_EOL."Done. Processed $i file(s).".PHP_EOL;