CREATE TABLE `API`
(
    `id`        BINARY(16) NOT NULL,
    `title`     VARCHAR (255) NOT NULL,
    `token`     VARCHAR(255) NOT NULL,
    `canRead`   BOOLEAN NOT NULL,
    `canCreate` BOOLEAN NOT NULL,
    `canUpdate` BOOLEAN NOT NULL,
    `canDelete` BOOLEAN NOT NULL,
    `validFrom` DATETIME NOT NULL,
    `validTo`   DATETIME NOT NULL,
    `created`   DATETIME NOT NULL,
    `user`      BINARY(16) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `API_ibfk_1` FOREIGN KEY (`user`) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;