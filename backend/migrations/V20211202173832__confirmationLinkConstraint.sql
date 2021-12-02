ALTER TABLE `ConfirmationLink` DROP CONSTRAINT User_ibfk_1;
ALTER TABLE `ConfirmationLink` ADD CONSTRAINT `User_ibfk_1` FOREIGN KEY (`user`) REFERENCES `User` (id) ON DELETE CASCADE;
