package lockity.services

import at.favre.lib.crypto.bcrypt.BCrypt
import database.schema.tables.records.ConfirmationLinkRecord
import database.schema.tables.records.ForgotPasswordLinkRecord
import database.schema.tables.records.UserRecord
import io.ktor.features.*
import lockity.models.*
import lockity.repositories.*
import lockity.utils.*
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException
import javax.security.auth.login.AccountLockedException

class UserService(
    private val configurationService: ConfigurationService,
    private val confirmationLinkRepository: ConfirmationLinkRepository,
    private val forgotLinkRepository: ForgotLinkRepository,
    private val emailService: EmailService,
    private val roleRepository: RoleRepository,
    private val userRepository: UserRepository,
    private val fileService: FileService,
    private val fileRepository: FileRepository
) {
    private fun passwordIsCorrect(input: String, hash: String): Boolean =
        BCrypt.verifyer().verify(input.toCharArray(), hash).verified

    private fun bcryptPassword(password: String) =
        BCrypt.withDefaults().hashToString(12, password.toCharArray())


    fun loginUser(signInUser: SignInAbleUser): FrontendUser {
        userRepository.fetchLoginUserMap(signInUser.email)?.let { dbUser ->
            dbUser[USER.CONFIRMED].let {
                if (it == null || it == "0") throw BadRequestException("User is not confirmed.")
            }
            dbUser[USER.PASSWORD].let { password ->
                if (password == null || !passwordIsCorrect(signInUser.password, password)) {
                    throw BadRequestException("Password is incorrect")
                }
            }
            dbUser[USER.ID]?.let { uid ->
                userRepository.fetch(UUID.fromString(uid))?.let { userRecord ->
                    return FrontendUser(
                        id = Misc.binToUuid(userRecord.id!!).toString(),
                        email = userRecord.email!!,
                        username = userRecord.username!!,
                        role = roleRepository.fetch(userRecord.role!!)!!.name!!
                    )
                }
            }
        } ?: throw NotFoundException("User does not exists.")
    }

    fun registerUser(registrableUser: RegistrableUser) {
        registrableUser.isValuesValid()
        if (!emailService.isEmailValid(registrableUser.email))
            throw BadRequestException("Email is not in correct format.")
        if (!userRepository.isEmailUnique(registrableUser.email))
            throw BadRequestException("User exists.")
        val userId = Misc.uuidToBin(UUID.randomUUID())
        userRepository.insertUser(
            UserRecord(
                id = userId,
                username = registrableUser.username,
                name = registrableUser.name,
                surname = registrableUser.surname,
                email = registrableUser.email,
                password = bcryptPassword(registrableUser.password),
                role = roleRepository.roleUUID(ROLE.REGISTERED),
                registered = LocalDateTime.now(),
                lastActive = LocalDateTime.now(),
                confirmed = 0,
                subscribed = 0,
                storageSize = DEFAULT_STORAGE_BYTES
            )
        )
        val confirmationLink = generateLink(userId)
        confirmationLinkRepository.insertLink(confirmationLink)
        emailService.sendEmail(
            registrableUser.email,
            "Welcome to lockity ${registrableUser.name ?: ""}!",
            emailService.confirmRegistrationTemplate(confirmationLink)
        )
    }

    fun confirmRegistration(confirmableLink: ConfirmableLink) {
        confirmableLink.isValuesValid()
        val linkData = confirmationLinkRepository
            .fetchConfirmationLinkAndUserRecordMapByLink(confirmableLink.link)
        linkData?.confirmationLink?.let {
            linkData.user.let { user ->
                if (user.confirmed == "1".toByte()) throw BadRequestException("User already confirmed")
                user.confirmed = "1".toByte()
                userRepository.updateUser(user)
                confirmationLinkRepository.delete(linkData.confirmationLink.id!!)
            }
        } ?: throw NotFoundException("Confirmation link does not exist.")
    }

    fun resetPassword(email: Email) {
        email.isValuesValid()
        if (!emailService.isEmailValid(email.email))
            throw BadRequestException("Email is not in correct format.")
        val fetchedUser = userRepository.fetchByEmail(email.email)
            ?: throw NotFoundException("User was not found")
        val passwordResetLink = generateLink(fetchedUser.id!!)
        val passwordLinkRecord = ForgotPasswordLinkRecord(
            id = passwordResetLink.id,
            user = passwordResetLink.user,
            link = passwordResetLink.link,
            validUntil = passwordResetLink.validUntil,
        )
        forgotLinkRepository.insertLink(passwordLinkRecord)
        emailService.sendEmail(
            fetchedUser.email!!,
            "Password reset in Lockity",
            emailService.resetPasswordTemplate(passwordLinkRecord)
        )
    }

    fun confirmResetedPassword(resetedPassword: ResetedPassword) {
        resetedPassword.isValuesValid()
        val linkData = forgotLinkRepository
            .fetchForgotPasswordLinkAndUserRecordMapByLink(resetedPassword.link)
        linkData?.forgotPasswordLink?.let {
            linkData.user.let { user ->
                user.password = bcryptPassword(resetedPassword.password)
                userRepository.updateUser(user)
                forgotLinkRepository.delete(linkData.forgotPasswordLink.id!!)
            }
        } ?: throw NotFoundException("Password reset link does not exist.")
    }

    private fun generateLink(userBinId: ByteArray) = ConfirmationLinkRecord(
        id = Misc.uuidToBin(UUID.randomUUID()),
        user = userBinId,
        link = UUID.randomUUID().toString(),
        validUntil = LocalDateTime.now().plusMinutes(
            configurationService.configValue(
                CONFIG.LINK_EXPIRY_MINUTES
            ).toLong()
        )
    )

    fun getUsers(offset: Int, limit: Int): List<UserData> {
        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")
        return userRepository.fetchUsersWithOffsetAndLimit(
            offset = offset,
            limit = limit
        )
    }

    fun getUsers(user: UserRecord, email: String): List<UserForSharing> = userRepository.fetchWithEmailLike(
        emailLike = "$email%"
    ).filter { it.email != user.email }.map {
        UserForSharing(
            id = Misc.binToUuid(it.id!!).toString(),
            email = it.email!!
        )
    }

    fun getUserCount() = UserCount(
        userCount = userRepository.fetchUsersCount()
    )

    fun createUser(creatableUser: CreatableUser) {
        creatableUser.isValuesValid()
        if (!emailService.isEmailValid(creatableUser.email))
            throw BadRequestException("Email is not in correct format.")
        if (!userRepository.isEmailUnique(creatableUser.email))
            throw BadRequestException("User exists.")

        val userId = Misc.uuidToBin(UUID.randomUUID())
        userRepository.insertUser(
            UserRecord(
                id = userId,
                username = creatableUser.username,
                name = creatableUser.name,
                surname = creatableUser.surname,
                email = creatableUser.email,
                password = bcryptPassword(creatableUser.password),
                role = roleRepository.roleUUID(creatableUser.role),
                registered = creatableUser.registered,
                lastActive = creatableUser.lastActive,
                confirmed = (if (creatableUser.confirmed) "1" else "0").toByte(),
                subscribed = (if (creatableUser.subscribed) "1" else "0").toByte(),
                storageSize = creatableUser.storageSize
            )
        )

    }

    fun editUser(userId: String, editableUser: EditableUser) {
        val userUUID = UUID.fromString(userId)
        val userRecord = userRepository.fetch(userUUID)
            ?: throw NotFoundException("User was not found")
        editableUser.isValuesValid()
        if (!emailService.isEmailValid(editableUser.email))
            throw BadRequestException("Email is not in correct format.")
        if (!userRepository.isAnyoneElseEmailUnique(userUUID, editableUser.email))
            throw BadRequestException("Email exists.")
        userRepository.updateUser(
            UserRecord(
                id = userRecord.id,
                username = editableUser.username,
                name = editableUser.name,
                surname = editableUser.surname,
                email = editableUser.email,
                password = if (editableUser.password != "")
                    bcryptPassword(editableUser.password) else userRecord.password,
                role = roleRepository.roleUUID(editableUser.role),
                registered = editableUser.registered,
                lastActive = editableUser.lastActive,
                confirmed = if (editableUser.confirmed) "1".toByte() else "0".toByte(),
                subscribed = if (editableUser.subscribed) "1".toByte() else "0".toByte(),
                storageSize = editableUser.storageSize
            )
        )
    }

    fun deleteUser(userId: String) {
        userRepository.fetch(UUID.fromString(userId))
            ?: throw NotFoundException("User was not found")
        val userUUID = UUID.fromString(userId)
        val successfulDeletion = fileService.deletePhysicalUserFiles(userUUID)
        if (!successfulDeletion) throw AccountLockedException("Unable to delete physical files")
        fileRepository.deleteUserFiles(userUUID)
        userRepository.delete(userUUID)
    }

    fun getUser(user: UserRecord, userId: String): UserData {
        if (!user.id.contentEquals(Misc.uuidToBin(UUID.fromString(userId))))
            throw NoPermissionException("User do not have permission to get this user data")
        return UserData(
            id = Misc.binToUuid(user.id!!).toString(),
            username = user.username!!,
            name = user.name,
            surname = user.surname,
            email = user.email!!,
            role = roleRepository.fetch(user.role!!)!!.name!!,
            registered = user.registered!!,
            lastActive = user.lastActive,
            confirmed = user.confirmed == "1".toByte(),
            subscribed = user.subscribed == "1".toByte(),
            storageSize = user.storageSize!!
        )
    }

    fun editUser(user: UserRecord, userId: String, editedSelf: EditableUserSelf) {
        val userUUID = UUID.fromString(userId)
        if (!user.id.contentEquals(Misc.uuidToBin(userUUID))) {
            throw NoPermissionException("User do not have permission to edit this user")
        }
        editedSelf.isValuesValid()
        if (!emailService.isEmailValid(editedSelf.email))
            throw BadRequestException("Email is not in correct format.")
        if (!userRepository.isAnyoneElseEmailUnique(userUUID, editedSelf.email))
            throw BadRequestException("Email exists.")
        userRepository.updateUser(
            UserRecord(
                id = user.id,
                username = editedSelf.username,
                name = editedSelf.name,
                surname = editedSelf.surname,
                email = editedSelf.email,
                password = if (editedSelf.password != "")
                    bcryptPassword(editedSelf.password) else user.password,
                role = user.role,
                registered = user.registered,
                lastActive = user.lastActive,
                confirmed = user.confirmed,
                subscribed = if (editedSelf.subscribed) "1".toByte() else "0".toByte(),
                storageSize = user.storageSize
            )
        )
    }
}