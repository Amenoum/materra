<?php
/*
	Used for discussions.
*/

require('disc.settings.inc.php');

if (!DISC_ENABLED) {
	echo '0';
	exit;
}

if (!isset($_GET['cmd']) || !preg_match('/^[a-z_]+$/', $_GET['cmd'])) exit;

require('../users/users.functions.inc.php');

function getDbName($fname) {
	return '../'.preg_replace('/\.html?$/', '', $fname).'.cmts.db';
}

$cmd = $_GET['cmd'];
switch ($cmd) {
	case 'get':	// get comments
		if (!isset($_GET['db']) || !preg_match('/^([A-Za-z0-9]+\/|)[A-Za-z0-9_\.,\(\)\[\]]+\.html?$/', $_GET['db'])) {
			echo '-1';
			exit;
		}
		if (!file_exists('../'.$_GET['db'])) {
			echo '-1';
			exit;
		}
		$database = getDbName($_GET['db']);
		$db = new SQLite3($database);
		$msg_cnt = 0;
		$res = $db->query("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='messages'");
		if ($row = $res->fetchArray()) {
			if ($row[0] > 0) {
				$res = $db->query("SELECT COUNT(*) FROM messages");
				if ($row = $res->fetchArray())
					$msg_cnt = $row[0];
			}
		}
		echo '<div class="comments">'.PHP_EOL;
		$id = ''; $pw_hash = '';
		if (isset($_GET['id']) && preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id']))
			$id = $_GET['id'];
		if (isset($_GET['ph']) && preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph']))
			$pw_hash = $_GET['ph'];
		if ($msg_cnt > 0) {
			$cur_pg = ((isset($_GET['pg']) && is_numeric($_GET['pg']))?$_GET['pg']:1);
			$limit = MSGS_PER_PAGE;
			if (isset($_GET['pg']) && $_GET['pg'] == 'last') {
				$cur_pg = ceil($msg_cnt / $limit);
			}
			$sort_by = 'id'; $sort_order = 'ASC'; $offset = ($cur_pg-1)*$limit;
			$disc_enabled = false;
			if ($id != '' && $pw_hash != '' && isDiscEnabled($id, $pw_hash)) $disc_enabled = true;
			$mpanel = '';
			if (isAdmin($id) && loginOk($id, $pw_hash))
				$mpanel = ' [ <a href="#!" class="msg_remove" data-msg-id="%MID%" noref="1" ignore_build_local>&cross;</a> ]';
			$res = $db->query("SELECT id, post_date, uid, msg, tup, tdown FROM messages ORDER BY $sort_by $sort_order LIMIT $limit OFFSET $offset");
			while ($row = $res->fetchArray()) {
				echo '<div class="msg_block" data-id="'.$row['id'].'">'.PHP_EOL;
				echo '<div class="cmt_header"><span class="uid">'.$row['uid'].'</span> posted on <span class="post_date">'.date('Y.m.d H:i', $row['post_date']).'</span>'.str_replace('%MID%', $row['id'], $mpanel).'</div>'.PHP_EOL;
				echo '<div class="cmt_msg">'.$row['msg'].'</div>'.PHP_EOL;
				echo '<div class="thumbs"><span data-id="tup">'.$row['tup'].'</span>'.($disc_enabled?'<a href="#!" data-thumb="1" data-msg-id="'.$row['id'].'" title="I agree" noref="1" ignore_build_local>':'').'<img src="/discussions/tup16.png">'.($disc_enabled?'</a>':'').'<span data-id="tdown">'.$row['tdown'].'</span>'.($disc_enabled?'<a href="#!" data-thumb="0" data-msg-id="'.$row['id'].'" title="I don\'t agree" noref="1" ignore_build_local>':'').'<img src="/discussions/tdown16.png">'.($disc_enabled?'</a>':'').'</div>'.PHP_EOL;
				echo '</div>'.PHP_EOL;
			}
		}
		if ($id != '' && $pw_hash != '') {
			if (isDiscEnabled($id, $pw_hash)) {
				$rpanel = ' <span class="emos"><input type="button" class="emos_cmds" data-cmd="b" noref="1" ignore_build_local value="B"> ';
				$rpanel .= '<input type="button" class="emos_cmds" data-cmd="em" noref="1" ignore_build_local value="I"> ';
				$rpanel .= '<input type="button" class="emos_cmds" data-cmd="e" data-begin="$" data-end="$" title="inline equation" noref="1" ignore_build_local value="e"> ';
				$rpanel .= '<input type="button" class="emos_cmds" data-cmd="x" data-begin="$" data-end="$" title="equation" noref="1" ignore_build_local value="x"> ';
				$rpanel .= '</span>';
				echo '<div class="reply_block">'.PHP_EOL;
				echo '<div class="cmt_header"><span class="uid">'.$id.'</span>'.$rpanel.'</div>'.PHP_EOL;
				echo '<div class="cmt_msg"><textarea name="msgbox" maxlength="'.MAX_MSG_LENGTH.'" placeholder="Post a comment"></textarea></div>'.PHP_EOL;
				echo '<input type="button" id="post_reply" value="Submit">'.PHP_EOL;
				echo '</div>'.PHP_EOL;
			}
			else echo '<div style="margin-top:12px">To enable commenting, please <a href="'.ADMIN_CONTACT_LINK.'" noref="1">contact the admin</a> and supply your username.</div>';
		}
		else echo '<div style="margin-top:12px">To post comments, log in to your account or register (using <em>reg</em> command) if you don\'t have one.</div>';
		echo '</div>'.PHP_EOL;
		if ($msg_cnt > MSGS_PER_PAGE) {
			echo '<div class="pagelist nobold">';
			$tot_pages = ceil($msg_cnt / $limit); $max_pages = 40; $max_pages_half = $max_pages / 2;
			for ($i=1; $i<=$tot_pages; $i++) {
				if ($tot_pages > $max_pages && $i == $max_pages_half) {
					echo '... ';
					$i = $tot_pages - $max_pages_half;
				}
				echo ($i==$cur_pg?'':'<a href="#!" data-pg="'.$i.'" noref="1" ignore_build_local>').$i.($i==$cur_pg?' ':'</a> ');
			}
			echo '</div>'.PHP_EOL;
		}
		break;
	case 'thumb':	// thumb up/down
		if (!isset($_GET['db']) || !preg_match('/^([A-Za-z0-9]+\/|)[A-Za-z0-9_\.,\(\)\[\]]+\.html?$/', $_GET['db'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['id']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['msg_id']) || !is_numeric($_GET['msg_id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['thumb']) || !preg_match('/^[0-1]$/', $_GET['thumb'])) {
			echo '-1';
			exit;
		}
		if (!file_exists('../'.$_GET['db'])) {
			echo '-1';
			exit;
		}
		$thumb = $_GET['thumb'];
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw_hash = $_GET['ph'];
		if (!isDiscEnabled($id, $pw_hash)) {
			echo '-3';
			exit;
		}
		$database = getDbName($_GET['db']);
		$db = new SQLite3($database);
		$res = $db->query("SELECT thumb FROM thumbs WHERE msg_id = {$_GET['msg_id']} AND uid = '$id_esc' COLLATE NOCASE");
		if ($row = $res->fetchArray()) {
			if ($row['thumb'] != $thumb) {
				if ($db->exec("UPDATE thumbs SET thumb = $thumb WHERE msg_id = {$_GET['msg_id']} AND uid = '$id_esc' COLLATE NOCASE")) {
					if ($thumb == 1) 
						$db->exec("UPDATE messages SET tup = tup + 1, tdown = tdown - 1 WHERE id = {$_GET['msg_id']}");
					else
						$db->exec("UPDATE messages SET tup = tup - 1, tdown = tdown + 1 WHERE id = {$_GET['msg_id']}");
				}
			}
		}
		else {
			if ($db->exec("INSERT INTO thumbs(msg_id, uid, thumb) VALUES({$_GET['msg_id']}, '$id_esc', $thumb)")) {
				$db->exec("UPDATE messages SET ".($thumb>0?'tup = tup + 1':'tdown = tdown + 1')." WHERE id = {$_GET['msg_id']}");
			}
		}
		$res = $db->query("SELECT tup, tdown FROM messages WHERE id = {$_GET['msg_id']}");
		if ($row = $res->fetchArray())
			echo $row['tup'].','.$row['tdown'];
		setActiveNoDb($id);
		break;
	case 'post':	// post new comment
		if (!isset($_GET['db']) || !preg_match('/^([A-Za-z0-9]+\/|)[A-Za-z0-9_\.,\(\)\[\]]+\.html?$/', $_GET['db'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['id']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-1';
			exit;
		}
		if (!isset($_POST['msg']) || strlen($_POST['msg']) > MAX_MSG_LENGTH) {
			echo '-2';
			exit;
		}
		$msg = trim(preg_replace('/\<(e|x|b)\s[^\>]*\>/', '<$1>', preg_replace('/\<(em)[^\>]+\>/', '<$1>', strip_tags($_POST['msg'], '<e><x><b><em>'))));
		if (strlen($msg) < 1) {
			echo '-2';
			exit;
		}
		if (!file_exists('../'.$_GET['db'])) {
			echo '-1';
			exit;
		}
		$msg_esc = SQLite3::escapeString($msg);
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw_hash = $_GET['ph'];
		if (!isDiscEnabled($id, $pw_hash)) {
			echo '-3';
			exit;
		}
		$database = getDbName($_GET['db']);
		$db = new SQLite3($database);
		$db->exec("CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY AUTOINCREMENT, post_date INTEGER, last_update INTEGER DEFAULT 0, uid CHAR(16) COLLATE NOCASE, msg TEXT, tup INTEGER DEFAULT 0, tdown INTEGER DEFAULT 0)");
		$db->exec("CREATE TABLE IF NOT EXISTS thumbs(msg_id INTEGER, uid CHAR(16) COLLATE NOCASE, thumb INTEGER DEFAULT 1)");
		if ($db->exec("INSERT INTO messages(post_date, uid, msg) VALUES(".time().", '$id_esc', '$msg_esc')")) {
			echo '1';
			setActiveNoDb($id);
		}
		else
			echo '0';
		break;
	case 'remove':	// remove comment
		if (!isset($_GET['db']) || !preg_match('/^([A-Za-z0-9]+\/|)[A-Za-z0-9_\.,\(\)\[\]]+\.html?$/', $_GET['db'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['id']) || !isAdmin($_GET['id']) || !preg_match('/^[A-Za-z0-9\_]{3,16}$/', $_GET['id'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['ph']) || !preg_match('/^[A-Za-z0-9]{64}$/', $_GET['ph'])) {
			echo '-1';
			exit;
		}
		if (!isset($_GET['msg_id']) || !is_numeric($_GET['msg_id'])) {
			echo '-1';
			exit;
		}
		if (!file_exists('../'.$_GET['db'])) {
			echo '-1';
			exit;
		}
		$id = $_GET['id']; $id_esc = SQLite3::escapeString($id);
		$pw_hash = $_GET['ph'];
		if (!loginOk($id, $pw_hash)) {
			echo '-1';
			exit;
		}
		$database = getDbName($_GET['db']);
		$db = new SQLite3($database);
		if ($db->exec("DELETE FROM messages WHERE id = '{$_GET['msg_id']}'")) {
			echo '1';
			setActiveNoDb($id);
		}
		else
			echo '0';
		break;
	default:
}