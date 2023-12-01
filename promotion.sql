CREATE DATABASE myBoxingpromotion;
USE myBoxingpromotion;
CREATE TABLE fighters (id INT AUTO_INCREMENT,forename VARCHAR(20), surname VARCHAR(20), age INT(2), fights INT(4), wins INT(3), losses INT(3), draws INT(3), weight DECIMAL(3, 1) unsigned,PRIMARY KEY(id));
CREATE TABLE user (username VARCHAR(50), plainpassword VARCHAR(100), password VARCHAR(500), firstname VARCHAR(50), lastname VARCHAR(50), email VARCHAR(50));
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON myBoxingpromotion.* TO 'appuser'@'localhost';