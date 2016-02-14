<?php

/**
 * This file registers an autoload implementation
 * that simply retrieves the file having the path
 * equal to the fully qualified name class, that
 * implies a filesystem structure that reflects packages
 */

spl_autoload_register(function($className) {
	require_once str_replace('\\', DIRECTORY_SEPARATOR, $className) . '.php';
});
