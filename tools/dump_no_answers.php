<?php

// Dumps no_answers db to OUTPUT

//define('DB_FILE', 'db_test.db');
define('DB_FILE', '../public_html/talk/subs_queries.db');
define('OUTPUT', 'no_aswers_out.txt');

if ($fp = fopen(OUTPUT, 'w')) {
	
	fwrite($fp, '[THIS MAY BE IN QUESTION/ANSWER FORMAT]'.PHP_EOL.'[IN CASE OF MULTIPLE ANSWERS, THESE SHOULD BE SEPARATED BY ||. YOU CAN USE NEWLINES BUT BREAK ON THE SEPARATOR.]'.PHP_EOL.'[A LINE CANNOT BEGIN WITH ||, IT CAN ONLY END WITH ||.]'.PHP_EOL.'[IN CASE OF MULTIPLE QUESTIONS FOR THE SAME SET OF ANSWERS, THESE SHOULD BE SEPARATED WITH ||]'.PHP_EOL.PHP_EOL);
	
	$db = new SQLite3(DB_FILE);

	$res = $db->query('SELECT * FROM no_answers ORDER BY count DESC');
	while ($row = $res->fetchArray()) {
		echo "id: {$row['id']}, prev_quote: \"{$row['prev_quote']}\", user_quote: \"{$row['user_quote']}\", count: {$row['count']}".PHP_EOL;
		if ($row['count'] > 1) fwrite($fp, '[ID: '.$row['id'].', COUNT: '.$row['count'].']'.PHP_EOL);
		fwrite($fp, $row['prev_quote'].PHP_EOL);
		fwrite($fp, $row['user_quote'].PHP_EOL.PHP_EOL);
	}
	
	fclose($fp);
}
else {
	echo 'ERROR: Can\'t create '.OUTPUT.'!'.PHP_EOL;
}

