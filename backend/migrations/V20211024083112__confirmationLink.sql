CREATE TABLE `ConfirmationLink`
(
    `id`        binary(16) NOT NULL,
    `user`      binary(16) NOT NULL,
    `link`      varchar(255) NOT NULL,
    `validUntil`    DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `User_ibfk_1` FOREIGN KEY (`user`) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;