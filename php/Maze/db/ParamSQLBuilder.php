<?php

namespace Maze\db;

require_once 'common.php';

/**
 * Utility class to quickly build SQL statements, either prepared or not.
 *
 * This class handles the common task of building an SQL
 * prepared statemet basing on conditions in PHP environment.
 * In these situations the main concern is that you don't
 * know which parameters will be included in SQL code, so you
 * can't bind them easily: this class solves the problem
 * by storing parameters that are actually used in an array,
 * that you can retrieve and unpack anytime in your code.
 *
 * The other main feature of this class is the building of
 * SQL code that is made up of pieces separed by the same
 * string: for example the logical and of conditions or
 * row constructors, in which columns are separed by commas.
 */
class ParamSQLBuilder {

	/**
	 * @var string $sql SQL code.
	 */
	private $sql;

	/**
	 * @var mixed[] $params Parameters.
	 */
	private $params;

	/**
	 * @var string[] $pieces Pieces of SQL code.
	 */
	private $pieces;

	/**
	 * @var mixed[] $paramPieces Parameters for $pieces SQL code.
	 */
	private $piecesParams;

	/**
	 * Creates a query with given initial SQL code and parameters.
	 *
	 * @param string $sql Initial SQL code.
	 * @param mixed[] $params Initial parameters.
	 * @throws InvalidArgumentException when $params is set but is not an array.
	 *
	 * @see {@link https://secure.php.net/manual/en/class.invalidargumentexception.php InvalidArgumentException}
	 */
	public function __construct($sql, $params) {
		if (isset($params) && !is_array($params))
			throw new \InvalidArgumentException();

		$this -> sql = "$sql";
		$this -> params = $params;
	}

	/**
	 * Adds SQL code and parameters to the query.
	 *
	 * This method adds passed SQL code and parameters
	 * to the current query. Also adds a white space
	 * before SQL code, just in case you forgot.
	 *
	 * @param string $sql SQL code to add to the current one.
	 * @param mixed[] $params Parameters to add to current ones.
	 */
	public function addSQL($sql, $params) {
		$this -> sql .= " $sql";
		$this -> params = safe_array_merge($this -> params, $params);
	}

	/**
	 * Adds a piece of SQL code and possible parameters
	 * to the set that will be contatenated.
	 *
	 * This method adds a piece to the current set: a
	 * piece is made up of SQL code and possible
	 * parameters.
	 *
	 * Pieces are meant to be concatenated later using
	 * concatPieces(): until then, neither SQL code nor
	 * parameters are added to the current query.
	 *
	 * @param string $piece SQL code to be concatenated later.
	 * @param mixerd[] $params Parameters of the SQL code.
	 *
	 * @see \Maze\db\ParamSQLBuilder::concatPieces() to know how to concatenate pieces.
	 */
	public function addPiece($piece, $params) {
		$this -> pieces[] = "$piece";
		$this -> piecesParams =
				safe_array_merge($this -> piecesParams, $params);
	}

	/**
	 * Returns whether current query has pieces
	 * to be concatenated.
	 *
	 * @return boolean
	 *
	 * @see \Maze\db\ParamSQLBuilder::addPiece() for more information about pieces.
	 */
	public function hasPieces() {
		/*
			Can use isset instead of is_array because
			of the way $this -> pieces is managed by
			the class: it's much faster
		*/
		return isset($this -> pieces);
	}

	/**
	 * Concatenates pieces and adds them to the current query
	 *
	 * This method concatenates pieces together
	 * using the given separator for SQL code: it can
	 * also be omitted, but then using pieces instead
	 * of directly adding SQL code would be pointless.
	 *
	 * Both leading and trailing white spaces are added to
	 * separator, just in case you forgot.
	 *
	 * @param string $separator String used to separe pieces of SQL code.
	 *
	 * @see \Maze\db\ParamSQLBuilder::addPiece() for more information about pieces.
	 */
	public function concatPieces($separator) {
		if ($this -> hasPieces()) {
			$this -> addSQL(implode(" $separator ", $this -> pieces),
					$this -> piecesParams);
			/*
				Unsetting both for memory efficiency and
				to allow using isset in hasPieces()
			*/
			unset($this -> pieces);
			unset($this -> piecesParams);
		}
	}

	/**
	 * <em>This method is {@link https://dev.mysql.com/ MySQL} specific.</em>
	 * Adds max number or rows and offset to the query,
	 * checking for validity of both arguments.
	 *
	 * This method adds max number of rows and offset
	 * to the query. Argument should be integers, but
	 * are both optional: if only the first argument
	 * is valid, only adds max row number of rows clause,
	 * if both are invalid does nothing.
	 *
	 * @param int $rowsCount Max number of rows for the result.
	 * @param int $startRow Offset for rows of the result.
	 */
	public function addRowsCount($rowsCount, $startRow) {
		if (is_int($rowsCount) && $rowsCount > 0) {
			$this -> sql .= ' limit ?';
			if (is_int($startRow) && $startRow >= 0) {
				$this -> sql .= ', ?';
				/*
					Note that, when valid, $startRow is added
					before $rowsCount, according to MySQL syntax
				*/
				$this -> params[] = $startRow;
			}
			$this -> params[] = $rowsCount;
		}
	}

	/**
	 * Returns current SQL code.
	 *
	 * @return string
	 */
	public function getSQL() {
		return $this -> sql;
	}

	/**
	 * Returns current parameters.
	 *
	 * @return mixed[]
	 */
	public function getParams() {
		return $this -> params;
	}
}
