DELIMITER //

CREATE FUNCTION bin_to_uuid(b BINARY(16))
    RETURNS CHAR(36)
BEGIN
   DECLARE hexStr CHAR(32);
   SET hexStr = HEX(b);
RETURN LOWER(CONCAT(
        SUBSTR(hexStr, 1, 8), '-',
        SUBSTR(hexStr, 9, 4), '-',
        SUBSTR(hexStr, 13, 4), '-',
        SUBSTR(hexStr, 17, 4), '-',
        SUBSTR(hexStr, 21)
    ));
END//

CREATE FUNCTION uuid_to_bin(uuid CHAR(36))
    RETURNS BINARY(16)
BEGIN
RETURN UNHEX(REPLACE(uuid, '-', ''));
END//

DELIMITER ;