CREATE TABLE `ForgotPasswordLink`
(
    `id`        binary(16) NOT NULL,
    `user`      binary(16) NOT NULL,
    `link`      varchar(255) NOT NULL,
    `validUntil`    DATETIME NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `Password_ibfk_2` FOREIGN KEY (`user`) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;