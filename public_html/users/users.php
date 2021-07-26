<?php
/*
	users.php
	Handles user registration.
*/

session_start();

if (!isset($_GET['cmd']) || !preg_match('/^[a-z_]+$/', $_GET['cmd'])) exit;

require('users.functions.inc.php');

$cmd = $_GET['cmd'];

switch ($cmd) {
	case 'login':	// user login
		if (!isset($_GET['id']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['p']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['p'])) {
			echo '-1';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw = $_GET['p'];
		$pw_hash = hash('sha256', HASH_SALT.$pw);
		$db = new SQLite3(DB_USERS);
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'");
		if (!($row = $res->fetchArray())) {
			echo '-2';
			exit;
		}
		setActive($id, $db);
		echo $pw_hash;
		break;
	case 'reg':		// new user registration
		if (!REG_ENABLED) {
			echo '0';
			exit;
		}
		if (!isset($_GET['id']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['p']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['p'])) {
			echo '-1';
			exit;
		}
		if (isset($_SESSION['REGGED']) && $_SESSION['REGGED'] && ($_SESSION['REG_TIME'] + REG_TIME > time())) {
			echo '-2';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw = $_GET['p'];
		$db = new SQLite3(DB_USERS);
		if (isAdmin($id)) {
			$db->exec("CREATE TABLE IF NOT EXISTS users(id CHAR(16) PRIMARY KEY COLLATE NOCASE, pwd CHAR(64), reg_date INTEGER, last_active INTEGER DEFAULT 0, enabled INTEGER DEFAULT 1, disc_enabled INTEGER DEFAULT 0)");
			$db->exec("CREATE INDEX IF NOT EXISTS idx_reg_date ON users (reg_date)");
		}
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE");
		if ($row = $res->fetchArray() || $id == RESERVED_ID) {
			echo '1';
			exit;
		}
		$pw_hash = hash('sha256', HASH_SALT.$pw);
		if ($db->exec("INSERT INTO users(id, pwd, reg_date) VALUES('$id_esc', '$pw_hash', ".time().")")) {
			$_SESSION['REGGED'] = true;
			$_SESSION['REG_TIME'] = time();
			if (isAdmin($id)) $db->exec("UPDATE users SET disc_enabled = 1 WHERE id = '$id_esc' COLLATE NOCASE");
			echo $pw_hash;
		}
		else echo '0';
		break;
	case 'list':	// list users
		if (!isset($_GET['id']) || !isAdmin($_GET['id'])) {
			//echo '-1';
			echo '<div timerel class="past">Invalid admin id or password.</div>';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			//echo '-2';
			echo '<div timerel class="past">Invalid admin id or password.</div>';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw_hash = $_GET['ph'];
		$db = new SQLite3(DB_USERS);
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'");
		if (!($row = $res->fetchArray())) {
			//echo '-3';
			echo '<div timerel class="past">Invalid admin id or password (not registered?).</div>';
			exit;
		}
		setActive($id, $db);
		echo file_get_contents('users.header.inc.txt');
		echo '<spirit>'.PHP_EOL;
		$users_cnt = 'Unknown';
		$res = $db->query("SELECT COUNT(*) FROM users");
		if ($row = $res->fetchArray())
			$users_cnt = $row[0];
		echo '<div style="text-align:center">Total number of users: <span class="neutral">'.$users_cnt.'</span></div>'.PHP_EOL;
		echo '<table class="small">'.PHP_EOL.'<tr><th>Registered</th><th>ID</th><th>Last active</th><th>Enabled</th><th>Discussions</th></tr>'.PHP_EOL;
		$cur_pg = ((isset($_GET['pg']) && is_numeric($_GET['pg']))?$_GET['pg']:1);
		$sort_by = 'reg_date'; $sort_order = 'ASC'; $limit = USERS_PER_PAGE; $offset = ($cur_pg-1)*$limit;
		$res = $db->query("SELECT id, reg_date, last_active, enabled, disc_enabled FROM users ORDER BY $sort_by $sort_order LIMIT $limit OFFSET $offset");
		while ($row = $res->fetchArray()) {
			echo '<tr><td class="nobold">'.date('Y.m.d H:i:s', $row['reg_date']).'</td><td'.(isAdmin($id)?' class="niceblue" style="font-weight:bold"':'').'>'.$row['id'].'</td><td class="nobold">'.($row['last_active']==0?'-':date('Y.m.d H:i:s', $row['last_active'])).'</td><td><input class="chkEnable" type="checkbox" data-id="'.$row['id'].'" id="ue_'.$row['id'].'" value="1"'.($row['enabled']?' checked':'').(isAdmin($id)&&$row['enabled']?' disabled':'').'></td><td><input class="chkDiscEnable" type="checkbox" data-id="'.$row['id'].'" id="ude_'.$row['id'].'" value="1"'.($row['disc_enabled']?' checked':'').(isAdmin($id)&&$row['disc_enabled']?' disabled':'').'></td></tr>'.PHP_EOL;
		}
		echo '</table>'.PHP_EOL;
		echo '<div class="pagelist nobold">';
		$tot_pages = ceil($users_cnt / $limit); $max_pages = 40; $max_pages_half = $max_pages / 2;
		for ($i=1; $i<=$tot_pages; $i++) {
			if ($tot_pages > $max_pages && $i == $max_pages_half) {
				echo '... ';
				$i = $tot_pages - $max_pages_half;
			}
			echo ($i==$cur_pg?'':'<a href="/users/users.php?id='.$id.'&ph='.$pw_hash.'&cmd=list&pg='.$i.'" noref="1">').$i.($i==$cur_pg?'':'</a> ');
		}
		echo '</div>'.PHP_EOL;
		echo '</spirit>'.PHP_EOL;
		echo file_get_contents('users.footer.inc.txt');
		echo '</body></html>';
		break;
	case 'set_enabled':	// enable or disable user
		if (!isset($_GET['id']) || !isAdmin($_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['val']) && !preg_match('/^[0-1]$/', $_GET['val'])) {
			echo '-2';
			exit;
		}
		if (!isset($_GET['uid']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['uid'])) {
			echo '-2';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-2';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$uid = $_GET['uid']; $uid_esc = SQLite3::escapeString($uid);
		$pw_hash = $_GET['ph'];
		$db = new SQLite3(DB_USERS);
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'");
		if (!($row = $res->fetchArray())) {
			echo '-3';
			exit;
		}
		echo ($db->exec("UPDATE users SET enabled = {$_GET['val']} WHERE id = '$uid_esc' COLLATE NOCASE")?'1':'0');
		setActive($id, $db);
		break;
	case 'set_disc_enabled':	// enable or disable discussions for a user
		if (!isset($_GET['id']) || !isAdmin($_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['val']) && !preg_match('/^[0-1]$/', $_GET['val'])) {
			echo '-2';
			exit;
		}
		if (!isset($_GET['uid']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['uid'])) {
			echo '-2';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-2';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$uid = $_GET['uid']; $uid_esc = SQLite3::escapeString($uid);
		$pw_hash = $_GET['ph'];
		$db = new SQLite3(DB_USERS);
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'");
		if (!($row = $res->fetchArray())) {
			echo '-3';
			exit;
		}
		echo ($db->exec("UPDATE users SET disc_enabled = {$_GET['val']} WHERE id = '$uid_esc' COLLATE NOCASE")?'1':'0');
		setActive($id, $db);
		break;
	case 'remove':	// remove user from db
		if (!isset($_GET['id']) || !isAdmin($_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['uid']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['uid'])) {
			echo '-2';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-2';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$uid = $_GET['uid']; $uid_esc = SQLite3::escapeString($uid);
		$pw_hash = $_GET['ph'];
		$db = new SQLite3(DB_USERS);
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'");
		if (!($row = $res->fetchArray())) {
			echo '-3';
			exit;
		}
		echo ($db->exec("DELETE FROM users WHERE id = '$uid_esc' COLLATE NOCASE")?'1':'0');
		setActive($id, $db);
		break;
	case 'unreg':	// unregisters the user
		if (!isset($_GET['id']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-1';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw_hash = $_GET['ph'];
		$db = new SQLite3(DB_USERS);
		$res = $db->query("SELECT id FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'");
		if (!($row = $res->fetchArray())) {
			echo '-2';
			exit;
		}
		echo ($db->exec("DELETE FROM users WHERE id = '$id_esc' COLLATE NOCASE AND pwd = '$pw_hash'")?'1':'0');
		break;
	default:
}