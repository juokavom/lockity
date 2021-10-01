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
    `role`      binary(16) NOT NULL,
    `registered`    DATE NULL,
    `lastActive`    DATE NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `Role_ibfk_1` FOREIGN KEY (`role`) REFERENCES `Role` (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `Role` (`id`, `name`) VALUES (uuid_to_bin('f22be018-983c-4abd-9aa0-4ad82a7bcef3'), 'Administrator');
INSERT INTO `Role` (`id`, `name`) VALUES (uuid_to_bin('373ae29f-40a1-4986-81f4-3964f8ab6d12'), 'Registered');
INSERT INTO `Role` (`id`, `name`) VALUES (uuid_to_bin('bbfbd68a-ce4b-4f47-9a45-bb3e2aa0dcff'), 'Vip');

INSERT INTO `User` (`id`, `name`, `email`, `role`) VALUES (uuid_to_bin('877f2dca-373b-4ea2-a2d7-f9f92e180b64'), 'ROOT', 'root', uuid_to_bin('f22be018-983c-4abd-9aa0-4ad82a7bcef3'));