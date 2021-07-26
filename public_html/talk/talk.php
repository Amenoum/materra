<?php
/*
	Query/conversation engine.
	
*/

/***** SETTINGS: BEGIN *****/
require('talk.settings.inc.php');
/****** SETTINGS: END ******/

if (!TALK_ENABLED && !isset($_GET['target'])) {		// We need this to work for <answer_body> tags (target) even if talk is disabled
	echo '-1';
	exit;
}

define('MAX_INPUT_REDUCTION_TRIES_ON_ASWERS', 1);
define('MAX_INPUT_REDUCTION_TRIES', 2);

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

function log_no_answer(&$db, $user_quote) {
	if (!LOG_NO_ANSWERS || !USE_DB || isset($_GET['d'])) return;
	$prev_quote = '';
	if (isset($_GET['last_quote'])) $prev_quote = $_GET['last_quote'];
	//$db->exec("CREATE TABLE IF NOT EXISTS no_answers(id CHAR(32) PRIMARY KEY, prev_quote TEXT, user_quote TEXT, count INTEGER DEFAULT 0)");
	$q_key = hash_str($prev_quote.' | '.$user_quote);
	$e_prev_quote = SQLite3::escapeString($prev_quote);
	//$e_user_quote = SQLite3::escapeString(hash_str($user_quote, 0, true));
	$e_user_quote = SQLite3::escapeString($user_quote);
	$db->exec("INSERT OR IGNORE INTO no_answers(id, prev_quote, user_quote) VALUES('$q_key', '$e_prev_quote', '$e_user_quote')");
	$db->exec("UPDATE no_answers SET count = count + 1 WHERE id = '$q_key'");
}

$last_x = -1;
$input = '';
$last_quote = '';

if (isset($_GET['input'])) $input = trim($_GET['input']);
if (isset($_GET['x']) && is_numeric($_GET['x'])) $last_x = intval($_GET['x']);

$input_len = strlen($input);

if (!USE_DB) {
	if ($input_len > 1) {
		$try = MAX_INPUT_REDUCTION_TRIES;		// In case of !USE_DB, we use MAX_INPUT_REDUCTION_TRIES on both, answers and subs
		$input_ids = array();
		while ($try > 0) {
			$input_ids[] = hash_str($input, MAX_INPUT_REDUCTION_TRIES - $try);
			--$try;
		}
		
		// We first try answers
		$fp = fopen(ANSWERS_FILE, 'r');
		if ($fp) {
			while (!feof($fp)) {
				$line = trim(fgets($fp), " \t\r\n\0");
				if (preg_match('/^\[.*\]$/', $line) || strlen($line) < 2) continue;
				if (preg_match('/\?$/', $line)) {
					$tmp = explode('||', $line);
					$tmp_cnt = count($tmp);
					$x = $tmp_cnt;
					while ($x) {
						$id = hash_str($tmp[--$x]);
						if (in_array($id, $input_ids)) {
							$answer = '';
							while (($line_init = fgets($fp)) !== false) {
								$line = trim($line_init, " \t\r\n\0");
								if (preg_match('/\?$/', $line)) break;
								$answer .= $line_init;
							}
							echo 'Q:'.trim($tmp[$x]).'||'.trim($answer);
							exit;
						}
					}
				}
			}
			fclose($fp);
		}
		
		// Then generic
		$fp = fopen(GENERIC_FILE, 'r');
		if ($fp) {
			while (!feof($fp)) {
				$line = trim(fgets($fp), " \t\r\n\0");
				if (preg_match('/^\[.*\]$/', $line) || strlen($line) < 2) continue;
				if (preg_match('/\?$/', $line)) {
					$tmp = explode('||', $line);
					$tmp_cnt = count($tmp);
					$x = $tmp_cnt;
					while ($x) {
						$id = hash_str($tmp[--$x]);
						if (in_array($id, $input_ids)) {
							$answer = '';
							while (($line_init = fgets($fp)) !== false) {
								$line = trim($line_init, " \t\r\n\0");
								if (preg_match('/\?$/', $line)) break;
								$answer .= $line_init;
							}
							$answers = explode('||', $answer);
							$answer = $answers[mt_rand(0, count($answers)-1)];
							echo '1:'.trim($answer);
							exit;
						}
					}
				}
			}
			fclose($fp);
		}
		
	}
	else {	
		$line_init = '';
		$fp = fopen(GENERIC_FILE, 'r');
		if ($fp) {
			while (!feof($fp)) {
				$line = trim(fgets($fp), " \t\r\n\0");
				if (preg_match('/^[^a-z0-9]*\[.*\]$/i', $line) || strlen($line) < 2) continue;
				$line_init = $line;
				if (mt_rand(0,5) < 1) break;
			}
			fclose($fp);
		}
		if ($line_init != '') {
			$answers = explode('||', rtrim($line_init, '|'));
			$answer = $answers[mt_rand(0, count($answers)-1)];
			echo '1:'.trim($answer);
			exit;
		}
	}
	echo '0';
	exit;
}

$db = new SQLite3(DB_FILE);

if ($input_len > 1) {
	$try = MAX_INPUT_REDUCTION_TRIES_ON_ASWERS;
	$tried = array();
	while ($try > 0) {				// We first try answers table
		$id = hash_str($input, MAX_INPUT_REDUCTION_TRIES_ON_ASWERS - $try);
		if (in_array($id, $tried)) break;
		$tried[] = $id;
		$res = $db->query("SELECT source FROM answers_links WHERE id = '$id'");
		if ($row = $res->fetchArray())
			$id = $row['source'];
		$res = $db->query("SELECT question, answer FROM answers WHERE id = '$id'");
		if ($row = $res->fetchArray()) {
			echo 'Q:'.$row['question'].'||'.$row['answer'];
			exit;
		}
		--$try;
	}
	
	if ($last_x < 0) $preserve_context = false;
	else
		$preserve_context = (mt_rand(0, 8) > 2);
	
	$try = MAX_INPUT_REDUCTION_TRIES;
	$tried = array();
	while ($try > 0) {				// Then generic
		$id = hash_str($input, MAX_INPUT_REDUCTION_TRIES - $try);
		if (in_array($id, $tried)) break;
		$tried[] = $id;
		$res = $db->query("SELECT source FROM subs_links WHERE id = '$id'");
		if ($row = $res->fetchArray())
			$id = $row['source'];
		$res = $db->query("SELECT quotes FROM subs WHERE id = '$id'");
		if ($row = $res->fetchArray()) {
			$quotes = $row['quotes'];
			$tmp = explode('||', $quotes);
			if ($preserve_context) {
				foreach ($tmp as $q) {
					$tmp2 = explode(':', $q, 2);
					if ($tmp2[0] > $last_x) {
						echo $q;
						exit;
					}
				}
			}
			$tmp_rnd = mt_rand(0, count($tmp)-1);
			echo $tmp[$tmp_rnd];
			exit;
		}
		--$try;
	}
}
else {
	$res = $db->query("SELECT quotes FROM subs ORDER BY RANDOM() LIMIT 1");	// SQLite RANDOM() performance? Better use a seed word instead (like 'talk')
	if ($row = $res->fetchArray()) {
		$quotes = $row['quotes'];
		$tmp = explode('||', $quotes);
		$tmp_rnd = mt_rand(0, count($tmp)-1);
		echo $tmp[$tmp_rnd];
		exit;
	}
}

log_no_answer($db, $input);
echo '0';