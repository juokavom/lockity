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
                get("/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")

                        call.respond(
                            userRepository.fetchUsersWithOffsetAndLimit(
                                offset = offset,
                                limit = limit
                            )
                        )
                    }
                }

                get("/count") {
                    call.withErrorHandler {
                        call.respond(
                            UserCount(
                                userCount = userRepository.fetchUsersCount()
                            )
                        )
                    }
                }

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
                            "User created successfully.",
                            HttpStatusCode.Created
                        )
                    }
                }

                put("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val userUUID = UUID.fromString(userId)

                        val userRecord = userRepository.fetch(userUUID)
                            ?: throw NotFoundException("User was not found")

                        val editedUser = call.receive<EditableUser>()
                        editedUser.isValuesValid()
                        if (!emailService.isEmailValid(editedUser.email))
                            throw BadRequestException("Email is not in correct format.")
                        if (!userRepository.isAnyoneElseEmailUnique(userUUID, editedUser.email))
                            throw BadRequestException("Email exists.")

                        userRepository.updateUser(
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
                        )

                        call.respondJSON(
                            "User edited successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }

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
                            "User deleted successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }
            }
            authenticate(AUTHENTICATED) {

                get("/{userId}") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val userUuid = UUID.fromString(userId)
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this user")
                        if (!currentUser.id.contentEquals(databaseService.uuidToBin(userUuid)))
                            throw NoPermissionException("User do not have permission to get this user data")

                        call.respond(
                            UserData(
                                id = databaseService.binToUuid(currentUser.id!!).toString(),
                                name = currentUser.name,
                                surname = currentUser.surname,
                                email = currentUser.email!!,
                                role = roleRepository.fetch(currentUser.role!!)!!.name!!,
                                registered = currentUser.registered!!,
                                lastActive = currentUser.lastActive,
                                confirmed = currentUser.confirmed == "1".toByte(),
                                subscribed = currentUser.subscribed == "1".toByte(),
                                storageSize = currentUser.storageSize!!
                            )
                        )
                    }
                }

                put("/{userId}/self") {
                    call.withErrorHandler {
                        val userId = call.parameters["userId"]
                            ?: throw BadRequestException("User id is not present in the parameters.")
                        val userUUID = UUID.fromString(userId)
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to edit this user")
                        if (!currentUser.id.contentEquals(databaseService.uuidToBin(userUUID))) {
                            throw NoPermissionException("User do not have permission to edit this user")
                        }

                        val editedUser = call.receive<EditableUserSelf>()
                        editedUser.isValuesValid()
                        if (!emailService.isEmailValid(editedUser.email))
                            throw BadRequestException("Email is not in correct format.")
                        if (!userRepository.isAnyoneElseEmailUnique(userUUID, editedUser.email))
                            throw BadRequestException("Email exists.")

                        userRepository.updateUser(
                            UserRecord(
                                id = currentUser.id,
                                name = editedUser.name,
                                surname = editedUser.surname,
                                email = editedUser.email,
                                password = if (editedUser.password != "")
                                    bcryptPassword(editedUser.password) else currentUser.password,
                                role = currentUser.role,
                                registered = currentUser.registered,
                                lastActive = currentUser.lastActive,
                                confirmed = currentUser.confirmed,
                                subscribed = if (editedUser.subscribed) "1".toByte() else "0".toByte(),
                                storageSize = currentUser.storageSize
                            )
                        )

                        call.respondJSON(
                            "User edited successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }

                get("/email-starts-with/{email}") {
                    call.withErrorHandler {
                        val email = call.parameters["email"]
                            ?: throw BadRequestException("Email is not present in the parameters.")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to modify this file metadata")

                        val fetchedUserRecords = userRepository.fetchWithEmailLike(
                            emailLike = "$email%"
                        ).filter { it.email != currentUser.email }

                        call.respond(
                            fetchedUserRecords.map {
                                UserForSharing(
                                    id = databaseService.binToUuid(it.id!!).toString(),
                                    email = it.email!!
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}