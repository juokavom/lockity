package lockity.routes

import database.schema.tables.records.UserRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.*
import lockity.repositories.FileRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.EmailService
import lockity.services.FileService
import lockity.services.jwtUser
import lockity.services.unsetResponseJwtCookieHeader
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.util.*
import javax.naming.NoPermissionException
import javax.security.auth.login.AccountLockedException

fun Application.userRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val databaseService: DatabaseService by inject()
    val roleRepository: RoleRepository by inject()
    val fileService: FileService by inject()
    val fileRepository: FileRepository by inject()

    routing {
        route("/user") {
            authenticate(ROLE.ADMIN) {

                /**
                 * Description: Creates new user
                 * Params: null
                 * Body: CreatableUser { name?, surname?, email, password, registered?,
                 * lastActive?, confirmed, subscribed, storageSize }
                 * Validation: Check if required values are not empty, email matches regex,
                 * email is unique
                 * OK Response: message
                 * Scope: Admin
                 */
                post {
                    call.withErrorHandler {
                        val newUser = call.receive<CreatableUser>()
                        newUser.isValuesValid()
                        if (!emailService.isEmailValid(newUser.email)) throw BadRequestException("Email is not in correct format.")
                        if (!userRepository.isEmailUnique(newUser.email)) throw BadRequestException("User exists.")

                        val userId = databaseService.uuidToBin()
                        userRepository.insertUser(
                            UserRecord(
                                id = userId,
                                name = newUser.name,
                                surname = newUser.surname,
                                email = newUser.email,
                                password = bcryptPassword(newUser.password),
                                role = roleRepository.roleUUID(newUser.role),
                                registered = newUser.registered,
                                lastActive = newUser.lastActive,
                                confirmed = if (newUser.confirmed) "1".toByte() else "0".toByte(),
                                subscribed = if (newUser.subscribed) "1".toByte() else "0".toByte(),
                                storageSize = newUser.storageSize
                            )
                        )
                        call.respondJSON(
                            "User registration successful.",
                            HttpStatusCode.Created
                        )
                    }
                }

                /**
                 * Description: Delete user, his files, shared list (db on delete cascade)
                 * Params: {userId}
                 * Body: null
                 * Validation: Check if user exist
                 * OK Response: message, delete user files and shared lists
                 * Scope: Admin
                 */
                delete("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        userRepository.fetch(UUID.fromString(userId))
                            ?: throw NotFoundException("User was not found")
                        val userUUID = UUID.fromString(userId)
                        val successfulDeletion = fileService.deletePhysicalUserFiles(userUUID)
                        if (!successfulDeletion) throw AccountLockedException("Unable to delete physical files")
                        fileRepository.deleteUserFiles(userUUID)
                        if (databaseService.binToUuid(call.jwtUser()!!.id!!) == userUUID) {
                            call.unsetResponseJwtCookieHeader()
                        }
                        userRepository.delete(userUUID)
                        call.respondJSON(
                            "User deletion successful.",
                            HttpStatusCode.OK
                        )
                    }
                }
            }
            authenticate(AUTHENTICATED) {
                /**
                 * Description: Gets user storage info
                 * Params: { userId }
                 * Body: null
                 * Validation: Check if user exist and requester have permission
                 * OK Response: StorageData { totalSize, usedSize }
                 * Scope: Authenticated
                 */
                get("/{userId}/storage") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val userUuid = UUID.fromString(userId)
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this users storage info")
                        val currentUserRole = roleRepository.fetch(currentUser.role!!)
                        if (!currentUser.id.contentEquals(databaseService.uuidToBin(userUuid))
                            && currentUserRole!!.name != ROLE.ADMIN
                        ) {
                            throw NoPermissionException("\"User do not have permission to get this users storage info")
                        }

                        val userRecord = userRepository.fetch(userUuid)
                            ?: throw NotFoundException("User was not found")

                        call.respond(
                            StorageData(
                                totalSize = userRecord.storageSize!!,
                                usedSize = fileRepository.userFileSizeSum(userRecord.id!!)?.toLong() ?: 0L
                            )
                        )
                    }
                }

                /**
                 * Description: Get full user
                 * Params: {userId}
                 * Body: null
                 * Validation: Check if user exist and requester have permission
                 * OK Response: Full User
                 * Scope: Registered (his own file), Admin (all)
                 */
                get("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val userUuid = UUID.fromString(userId)
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this user")
                        val currentUserRole = roleRepository.fetch(currentUser.role!!)
                        if (!currentUser.id.contentEquals(databaseService.uuidToBin(userUuid))
                            && currentUserRole!!.name != ROLE.ADMIN
                        ) {
                            throw NoPermissionException("User do not have permission to get this user")
                        }
                        val userRecord = userRepository.fetch(userUuid)
                            ?: throw NotFoundException("User was not found")
                        call.respond(
                            fullUserFromUserRecordAndRole(
                                userId = userId,
                                userRecord = userRecord,
                                role = roleRepository.fetch(userRecord.role!!)!!.name!!
                            )
                        )
                    }
                }

                /**
                 * Description: Edit user
                 * Params: {userId}
                 * Body: CreatableUser { name?, surname?, email, password, registered?,
                 * lastActive?, confirmed, subscribed, storageSize }
                 * Validation: Too much to summarize :-)
                 * OK Response: Full User
                 * Scope: Registered (himself), Admin (all)
                 */
                put("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val userUUID = UUID.fromString(userId)
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to edit this user")
                        val currentUserRole = roleRepository.fetch(currentUser.role!!)
                        if (!currentUser.id.contentEquals(databaseService.uuidToBin(userUUID))
                            && currentUserRole!!.name != ROLE.ADMIN
                        ) {
                            throw NoPermissionException("User do not have permission to edit this user")
                        }

                        val editedUser = call.receive<EditableUser>()
                        editedUser.isValuesValid()
                        if (!emailService.isEmailValid(editedUser.email))
                            throw BadRequestException("Email is not in correct format.")
                        if (!userRepository.isAnyoneElseEmailUnique(userUUID, editedUser.email))
                            throw BadRequestException("Email exists.")

                        val userRecord = userRepository.fetch(userUUID)
                            ?: throw NotFoundException("User was not found")

                        val editedUserRecord =
                            if (currentUserRole!!.name == ROLE.ADMIN)
                                UserRecord(
                                    id = userRecord.id,
                                    name = editedUser.name,
                                    surname = editedUser.surname,
                                    email = editedUser.email,
                                    password = if (editedUser.password != "")
                                        bcryptPassword(editedUser.password) else userRecord.password,
                                    role = roleRepository.roleUUID(editedUser.role),
                                    registered = editedUser.registered,
                                    lastActive = editedUser.lastActive,
                                    confirmed = if (editedUser.confirmed) "1".toByte() else "0".toByte(),
                                    subscribed = if (editedUser.subscribed) "1".toByte() else "0".toByte(),
                                    storageSize = editedUser.storageSize
                                )
                            else
                                UserRecord(
                                    id = userRecord.id,
                                    name = editedUser.name,
                                    surname = editedUser.surname,
                                    email = editedUser.email,
                                    password = if (editedUser.password != "")
                                        bcryptPassword(editedUser.password) else userRecord.password,
                                    role = userRecord.role,
                                    registered = userRecord.registered,
                                    lastActive = userRecord.lastActive,
                                    confirmed = userRecord.confirmed,
                                    subscribed = if (editedUser.subscribed) "1".toByte() else "0".toByte(),
                                    storageSize = userRecord.storageSize
                                )

                        userRepository.updateUser(editedUserRecord)
                        call.respond(
                            fullUserFromUserRecordAndRole(
                                userId = userId,
                                userRecord = editedUserRecord,
                                role = roleRepository.fetch(editedUserRecord.role!!)!!.name!!
                            )
                        )
                    }
                }

                /**
                 * Description: Get user list with %like% parameter
                 * Params: { emailLike }
                 * Body: null
                 * Validation: Email like
                 * OK Response: FrontEndUser { name, surname, email, password, subscribed, role }
                 * Scope: Authenticated
                 */
                get("/email-like/{emailLike}") {
//                    call.withErrorHandler {
//                        var emailLike = call.parameters["emailLike"] ?: ""
//                        emailLike = if (emailLike == "*") "%" else "%$emailLike%"
//                        val fetchedUserRecords = userRepository.fetchWithEmailLike(emailLike)
//                        call.respond(
//                            fetchedUserRecords.map {
//                                frontendUserFromUserRecordAndRole(
//                                    userId = databaseService.binToUuid(it.id!!).toString(),
//                                    userRecord = it,
//                                    role = roleRepository.fetch(it.role!!)!!.name!!
//                                )
//                            }
//                        )
//                    }
                }
            }
        }
    }
}