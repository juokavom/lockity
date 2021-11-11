CREATE TABLE `SharedAccess`
(
    `id`          binary(16) NOT NULL,
    `fileId`      binary(16) NOT NULL,
    `ownerId`     binary(16) NOT NULL,
    `recipientId` binary(16) NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `File_ibfk_1` FOREIGN KEY (`fileId`) REFERENCES `File` (id) ON DELETE CASCADE,
    CONSTRAINT `Owner_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `User` (id) ON DELETE CASCADE,
    CONSTRAINT `Recipient_ibfk_1` FOREIGN KEY (`recipientId`) REFERENCES `User` (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;