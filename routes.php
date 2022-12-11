<?php
require_once __DIR__ . '/index.php';

$base = '';

get($base . '', 'views/home.php');
get($base . '/add-asset', 'views/add.php');
get($base . '/my-assets', 'views/me.php');
any($base . '/404', 'views/404.php');
