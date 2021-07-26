<?php
/*
	MATERRA Setup
*/
define('TALK_FILE', 'talk/talk.settings.inc.php');
define('ANSWERS_FILE', 'answers/index.settings.inc.php');
define('USERS_FILE', 'users/users.settings.inc.php');
define('DISC_FILE', 'discussions/disc.settings.inc.php');

header('Content-type: text/plain');

echo 'Checking if SQLite is enabled...';
// Disable db usage if SQLite is not installed/enabled
if (!extension_loaded('sqlite3') && !function_exists('sqlite_open')) {
	echo ' No'.PHP_EOL;
	echo 'Disabling db usage...';
	if (($f = file_get_contents(TALK_FILE)) === false) {
		echo 'ERROR: Cannot open '.TALK_FILE.'!';
		exit;
	}
	$f = preg_replace('/define\(\'USE_DB\',\s*true/', 'define(\'USE_DB\', false', $f);
	if (file_put_contents(TALK_FILE, $f) === false) {
		echo 'ERROR: Cannot write to '.TALK_FILE.'! Check permissions.';
		exit;		
	}
	
	if (($f = file_get_contents(ANSWERS_FILE)) === false) {
		echo 'ERROR: Cannot open '.ANSWERS_FILE.'!';
		exit;
	}
	$f = preg_replace('/define\(\'USE_DB\',\s*true/', 'define(\'USE_DB\', false', $f);
	if (file_put_contents(ANSWERS_FILE, $f) === false) {
		echo 'ERROR: Cannot write to '.ANSWERS_FILE.'! Check permissions.';
		exit;		
	}
	
	if (($f = file_get_contents(USERS_FILE)) === false) {
		echo 'ERROR: Cannot open '.USERS_FILE.'!';
		exit;
	}
	$f = preg_replace('/define\(\'REG_ENABLED\',\s*true/', 'define(\'REG_ENABLED\', false', $f);
	if (file_put_contents(USERS_FILE, $f) === false) {
		echo 'ERROR: Cannot write to '.USERS_FILE.'! Check permissions.';
		exit;		
	}
	
	if (($f = file_get_contents(DISC_FILE)) === false) {
		echo 'ERROR: Cannot open '.DISC_FILE.'!';
		exit;
	}
	$f = preg_replace('/define\(\'DISC_ENABLED\',\s*true/', 'define(\'DISC_ENABLED\', false', $f);
	if (file_put_contents(DISC_FILE, $f) === false) {
		echo 'ERROR: Cannot write to '.DISC_FILE.'! Check permissions.';
		exit;		
	}
	
	echo ' Done.'.PHP_EOL;
	echo 'Note that, due to SQLite requirement, user registration and discussions have been disabled.'.PHP_EOL;
}
else echo ' Yes. Nothing to do.'.PHP_EOL;
echo PHP_EOL.'All done.';