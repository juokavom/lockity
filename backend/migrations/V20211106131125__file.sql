CREATE TABLE `File`
(
    `id`            binary(16) NOT NULL,
    `title`         varchar(255) NOT NULL,
    `location`      varchar(255) NOT NULL,
    `user`          binary(16) NULL,
    `link`          varchar(255) NULL,
    `uploaded`      DATE NOT NULL,
    `lastAccessed`  DATE NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `User_ibfk_2` FOREIGN KEY (`user`) REFERENCES `User` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
