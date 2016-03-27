--
-- Database: `common`
--
CREATE DATABASE IF NOT EXISTS `common` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `common`;

DELIMITER $$
--
-- Procedures
--
DROP PROCEDURE IF EXISTS `limitResultSet`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `limitResultSet` (`rowsCount` INT, `startRow` INT, `orderBy` VARCHAR(10))  MODIFIES SQL DATA
begin
	set @startRow = startRow, @rowsCount = rowsCount;
	drop table if exists limitedResultSet;
	set @query = concat('create temporary table limitedResultSet as
			select * from resultSet order by ', orderBy);
	if rowsCount is not null and rowsCount > 0 then
		set @query = concat(@query, ' limit ?');
		if startRow is not null and startRow >= 0 then
			set @query = concat(@query, ', ?');
			prepare prepQuery from @query;
			execute prepQuery using @startRow, @rowsCount;
		else
			prepare prepQuery from @query;
			execute prepQuery using @rowsCount;
		end if;
	else
		prepare prepQuery from @query;
		execute prepQuery;
	end if;
	deallocate prepare prepQuery;
	drop table resultSet;
end$$