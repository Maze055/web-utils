<?php

namespace Maze\db;

/**
 * Utility class with methods to work with mysql
 * using mysqli
 * 
 * This class provides an higher-level interface
 * to connect to mysql database, compared to
 * mysqli native PHP class.
 * 
 * It enhances the use of prepared statements
 * and uses bidimensional arrays instead of
 * mysqli_result objects.
 * 
 * Beware that <em>this class depends on mysqli</em>,
 * so it must be somehow provided, for example
 * throug an __autoload implementation.
 * 
 * @uses {@link https://secure.php.net/manual/en/book.mysqli.php mysqli} to connect to the database.
 */
class MySQLConn {

	/**
	 * @var mysqli Database connection.
	 */
	protected $conn;

	/**
	 * @var int mysqli::$error for non-subclasses 
	 */
	public $error;
	
	/**
	 * @var const
	 */
	const ASSOC = MYSQLI_ASSOC;
	
	/**
	 * @var const
	 */
	const NUMERIC = MYSQLI_NUM;

	/**
	 * Opens database connection.
	 * 
	 * The constructor opens the database connection,
	 * applying the charset too, and dies on failure.
	 * 
	 * All arguments are that of mysqli constructor,
	 * except for $charset, that is used in set_charset.
	 * 
	 * @param string $host Hostname of mysql database.
	 * @param string $username Username used for the connection.
	 * @param string $password Password used for the connection.
	 * @param string $schema Default schema for queries.
	 * @param string $charset Charset used when sending and receiving strings through the connection.
	 * @param int $port Port number used for the connection.
	 * @param string $socket Socket used for the connection.
	 * 
	 * @see {@link https://secure.php.net/manual/en/mysqli.construct.php mysqli::__construct} for arguments documentation.
	 * @see {@link https://secure.php.net/manual/en/mysqli.set-charset.php mysqli::set_charset} for $charset argument information.
	 */
	public function __construct($host = 'localhost', $username = 'root',
			$password = '', $schema = '', $charset = 'utf8mb4',
			$port = null, $socket = null) {
		$this -> conn = new \mysqli($host, $username, $password,
				$schema, $port, $socket);
		if ($this -> conn -> connect_errno != 0)
			die("Connection to database failed due to: {$this -> conn -> connect_error}\n");
		
		if (!$this -> conn -> set_charset($charset))
			die("Faled to set charset $charset due to: {$this -> conn -> error}\n");

		$this -> error =& $this -> conn -> error;
	}
	
	/**
	 * Closes database connection.
	 */
	public function __destruct() {
		$this -> conn -> close();
	}
	
	/**
	 * Turns resultsets to bidimensional arrays.
	 * 
	 * This method processes a mysqli_result object and
	 * retuns the corresponding bidimensional array; if
	 * $result is not a mysqli_result instance it is
	 * returned untouched.
	 * 
	 * The result array is always numeric, but its
	 * elements can be either associative or numeric.
	 * Also, a callback can be applied to every row
	 * before it is put into the result.
	 * 
	 * @param mysqli_result $result Query result to be processed.
	 * @param const $type Determines if the rows will be associative or numeric arrays: it's highly recommended to use class constants ASSOC and NUMERIC.
	 * @param callback $callback Callback to be applied to every row before it's put into the result.
	 * @return mixed[] Bidimensional array representing the resultset.
	 * 
	 * @see {@link https://secure.php.net/manual/en/class.mysqli-result.php mysqli_result}
	 */
	public static function procResult($result, $type, $callback = null) {

		// Non-resultsets arguments can't be processed: returning what mysql did
		
		if (!($result instanceof \mysqli_result))
			return $result;
		
		$processRow = is_callable($callback);
		while ($row = $result -> fetch_array($type))
			$rows[] = $processRow ? $callback($row) : $row;
		
		$result -> free();
		return isset($rows) ? $rows : [];
	}
	
	/**
	 * Interface for mysqli::prepare() method for non-subclasses.
	 * 
	 * @param string $query Query to prepare.
	 * @return mysqli_stmt The prepared statement.
	 * 
	 * @see {@link https://secure.php.net/manual/en/mysqli.prepare.php mysqli::prepare()}
	 * @see {@link https://secure.php.net/manual/en/class.mysqli-stmt.php mysli_stmt}
	 */
	public function prepare($query) {
		return $this -> conn -> prepare($query);
	}

	/**
	 * Executes a prepared statement, returning a bidimensional array.
	 * 
	 * This method executes an already-compiled prepared
	 * statement with the given parameters and processes
	 * the result into a bidimensional array.
	 * 
	 * It's meant to optimize compiling of prepared
	 * statements: they can be compiled once and then
	 * executed with different parameters using this method.
	 * 
	 * @param const $type Determines if the rows of the result will be associative or numeric arrays: it's highly recommended to use class constants ASSOC and NUMERIC.
	 * @param callback $callback Callback to be applied to every row before it's put into the result.
	 * @param mysqli_stmt $prepStatement The prepared statement that will be executed.
	 * @param mixed $params Variable number of arguments, of any type allowed by prepared statements, that will be used as parameters.
	 * @return mixed[] Bidimensional array representing the result of the query.
	 * 
	 * @see {@link https://secure.php.net/manual/en/class.mysqli-stmt.php mysqli_stmt}
	 */
	public function prepQuery($type, $callback, $prepStatement, ...$params) {
		/*
			mysqli uses a string to set parameters types when binding them
			to prepared statements: said string is the sequence of the first
			letter of PHP type of every variable, and so it's easily buildable
			with array_map
		*/
		$types = implode('', array_map(function($value) {
			return gettype($value)[0];
		}, $params));

		if (!$prepStatement -> bind_param($types, ...$params))
			die("Prepared statement binding failed\n");

		if (!$prepStatement -> execute())
			die("Prepared statement execution failed due to: {$prepStatement -> error}\n");

		if (!($result = $prepStatement -> get_result()))
			die("Prepared statement result fetching failed due to: {$prepStatement -> error}\n");
			
		return self::procResult($result, $type, $callback);
	}

	/**
	 * Executes a string of SQL code, possibly prepared
	 * statements code, and returns a bidimensional array.
	 * 
	 * This method executes a query passed in the form
	 * of a string of SQL code: it can also be a prepared
	 * statement code, and in this case parameters to
	 * be bound are required too. The resultset is
	 * processed into a bidimensional array.
	 * 
	 * @param const $type Determines if the rows of the result will be associative or numeric arrays: it's highly recommended to use class constants ASSOC and NUMERIC.
	 * @param callback $callback Callback to be applied to every row before it's put into the result.
	 * @param string $query String of SQL code, also a prepared statement code, that will be executed.
	 * @param mixed $params Variable number of arguments, of any type allowed by prepared statements, that will be used as parameters.
	 * @return mixed[] Bidimensional array representing the result of the query.
	 */
	public function query($type, $callback, $query, ...$params) {
		
		// No parameters means nothing to be bound, so no prepared statements
		
		if (count($params) > 0) {
			if (!($query = $this -> conn -> prepare($query)))
				die("Query failed due to: {$this -> conn -> error}\n");

			$result = $this -> prepQuery($type, $callback, $query, ...$params);
			if (!$query -> close())
				echo "Prepared statement closing failed due to: {$query -> error}\n";
				
			return $result;
		}
		else {
			if (!($result = $this -> conn -> query($query)))
				die("Query failed due to: {$this -> conn -> error}\n");
			
			return self::procResult($result, $type, $callback);
		}
	}
}
