<?php

/**
 * Converts a PHP array to HTML option tags, returning
 * them as a string.
 *
 * This function returns a string of HTML option tags,
 * using $options elements to create them: these can be
 * either arrays or anything castable to a string. In the
 * former case, every key-value pair is turned to an HTML
 * attribute-value pair, provided its value is set; the text
 * of the option tag is the value of the special key 'text'.
 * In the latter case, the element itself is used as text
 * for the option tag, and the key may be used as value for
 * 'value' HTML property, depending on $keysAsValues being set.
 *
 * @param mixed[] $options Its elements can be either arrays or anything castable to a string. In the former case, every key-value pair is turned to an HTML attribute-value pair; in the latter one, the element itself is used as text for the option tag.
 * @param boolean $keysAsValues If true, values are added to option> elements using keys of $options.
 * @return string The concatenation of $options elements into HTML option tags.
 */
function makeOptions($options, $keysAsValues = false) {
	foreach ($options as $key => $option) {
		$pieces[] = '<option';
		if (is_array($option)) {
			$text = ">${option['text']}</option>";
			unset($option['text']);
			foreach ($option as $attribute => $value) {
				if (isset($value))
					$pieces[] = " $attribute='$value'";
			}
			$pieces[] = $text;
		}
		else {
			if ($keysAsValues)
				$pieces[] = " value='$key'";
			$pieces[] = ">$option</option>";
		}
	}
	return implode('', $pieces);
}

/**
 * Retrieves one or more column from a bidimensional array
 *
 * This function behaves similar to PHP built-in {@link https://secure.php.net/manual/en/function.array-column.php array_column}
 * but can retrieve multiple columns.
 *
 * The input array must be a numeric array of arrays having
 * the same keys, for example the typical representation of
 * a relational database query result.
 *
 * The function returns a similar array, but only having
 * columns with specified keys, optionally aliasing them,
 * either with user-provided values or with ones from specified
 * columns of the input array
 *
 * @param mixed[] $array Bidimensional array from which columns are pulled
 * @param (string|int)[] $keys Contains the keys of the columns that will be pulled
 * @param (string|int)[] $aliases Optional, has the aliases of column indexes in the returned array: if not passed on, $keys will be used
 * @param boolean $reindex If true, aliases will be used to get keys for the result array from the input one, instead of being the keys themselves
 * @return mixed[] A subset of the input array only having specified columns
 */
function array_columns($array, $keys, $aliases, $reindex = false) {
	if (!is_array($aliases))
		$aliases = $keys;

	return array_map(function ($line) use ($keys, $aliases, $reindex) {
		/*
			Using array_map since parallel arrays would be tedious without:
			this leads to the use of unpacking and array_merge
		*/
		return array_merge(...array_map(function ($key, $alias) use (&$line, $reindex) {
			return [$reindex ? $line[$alias] : $alias => $line[$key]];
		}, $keys, $aliases));
	}, $array);
}

/**
 * Groups rows of a bidimensional array having the same value of
 * a cell, using this as key for the group in the returned array
 *
 * This function takes as input a bidimensional array and performs
 * a task somewhat similar to SQL group by: groups in an array the
 * rows having the same value of $column cell and uses it as key for
 * the rows group in the result array.
 *
 * Note that $column cell is removed from groups in the result array
 *
 * @param mixed[] $array Bidimensional array from which groups are pulled
 * @param string|int $column Index of the column the input will be grouped by
 * @return mixed[] Keys are distinct values of $column cell; values are arrays of rows that share the same value of $column cell, but without it
 */
function array_group($array, $column) {
	$columnValues = array_unique(array_column($array, $column));
	return array_combine($columnValues, array_map(function($value) use ($array, $column) {
		/*
			array_merge is necessary to have contiguos keys, since array_filter preserves them.
			$row is passed by reference, so that $column key can be removed while filtering.
		*/
		return array_merge(array_filter($array, function (&$row) use ($value, $column) {
			if ($row[$column] == $value) {
				unset($row[$column]);
				return true;
			}
			return false;
		}));
	}, $columnValues));
}

/**
 * Type-safe wrapper for array_merge.
 *
 * This function actually calls array_merge
 * only when both arguments are arrays: if
 * only one is, it is returned untouched,
 * if none is, it returns null.
 *
 * @param mixed[] $array0 First array, will come first in the result.
 * @param mixed[] $array1 Second array, will come second in the result.
 * @return mixed[]|null Has first the elements of $params0, then those of $params1. If only one of the arguments is an array it is returned, otherwise null.
*/
function safe_array_merge($array0, $array1) {
   $isArray0 = is_array($array0);
   $isArray1 = is_array($array1);

   if ($isArray0 && $isArray1)
	   return array_merge($array0, $array1);

   if ($isArray0)
	   return $array0;

   if ($isArray1)
	   return $array1;

   return null;
}

/**
 * Reads an associative array from a JSON file.
 *
 * This function returns the associative array
 * represented in a JSON file. If $toHTMLEntities
 * is true, all special characters but quotes
 * in the file will be converted to HTML entities.
 *
 * @param string $filePath The path of the JSON file.
 * @param boolean $toHTMLEntities If true, all special characters but quote will be converted into HTML entities.
 * @return mixed[] The associative array represented by the JSON file.
 */
function readJSONFile($filePath, $toHTMLEntities = true) {
	$fileContents = file_get_contents($filePath);
	if ($toHTMLEntities)
		$fileContents = htmlentities($fileContents, ENT_NOQUOTES, 'utf-8');
	return json_decode($fileContents, true);
}