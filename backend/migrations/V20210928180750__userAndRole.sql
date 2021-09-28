CREATE TABLE `Role`
(
    `id`        binary(16) NOT NULL,
    `name`      varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `User`
(
    `id`        binary(16) NOT NULL,
    `name`      varchar(255) NULL,
    `surname`   varchar(255) NULL,
    `email`     varchar(255) NOT NULL,
    `role`      binary(16) NULL,
    `registered`    DATE NULL,
    `lastActive`    DATE NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `Role_ibfk_1` FOREIGN KEY (`role`) REFERENCES `Role` (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
