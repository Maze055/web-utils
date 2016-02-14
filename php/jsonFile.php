<?php

/**
 * This file prints the content of a.json
 * file passed through a GET request.
 * 
 * @param string $_GET['file'] The path to the file to be printed.
 */
header('Content-type: application/json');
echo file_get_contents($_GET['file']);
