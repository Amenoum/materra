<?php
/*
	users.functions.inc.php
	Provides functions on users.
*/

require('users.settings.inc.php');

function isAdmin($id) {		// returns true if user is administrator, false otherwise
	return (strtolower($id) == strtolower(ADMIN_ID));
}

function isEnabled($id) {	// returns 1 if user is enabled, 0 if not, false if user doesn't exist in db
	$id_esc = SQLite3::escapeString($id);
	$db = new SQLite3(DB_USERS);
	$res = $db->query("SELECT enabled FROM users WHERE id = '$id_esc' COLLATE NOCASE");
	if ($row = $res->fetchArray())
		return $row['enabled'];
	return false;
}

function isDiscEnabled($id, $ph) {	// returns true if user can post messages in discussions, false if not, false if user doesn't exist in db
	$id_esc = SQLite3::escapeString($id);
	$ph_esc = SQLite3::escapeString($ph);
	$db = new SQLite3(DB_USERS);
	$res = $db->query("SELECT enabled, disc_enabled FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$ph_esc'");
	if ($row = $res->fetchArray())
		return ($row['enabled'] && $row['disc_enabled']);
	return false;
}

function loginOk($id, $ph) {	// returns true if login id/password hash combination is valid, false otherwise
	$id_esc = SQLite3::escapeString($id);
	$ph_esc = SQLite3::escapeString($ph);
	$db = new SQLite3(DB_USERS);
	$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$ph_esc'");
	if ($row = $res->fetchArray())
		return true;
	return false;
}

function setActive($id, &$db) {	// updates user last active time
	$id_esc = SQLite3::escapeString($id);
	return ($db->exec("UPDATE users SET last_active = ".time()." WHERE id = '$id_esc' COLLATE NOCASE")?1:0);
}

function setActiveNoDb($id) {	// updates user last active time
	$id_esc = SQLite3::escapeString($id);
	$db = new SQLite3(DB_USERS);
	return ($db->exec("UPDATE users SET last_active = ".time()." WHERE id = '$id_esc' COLLATE NOCASE")?1:0);
}