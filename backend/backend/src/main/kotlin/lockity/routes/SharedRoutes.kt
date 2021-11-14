package lockity.routes

import database.schema.tables.records.SharedAccessRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.SharedAccessCount
import lockity.models.UploadableSharedAccess
import lockity.models.isValuesValid
import lockity.repositories.FileRepository
import lockity.repositories.RoleRepository
import lockity.repositories.SharedAccessRepository
import lockity.repositories.UserRepository
import lockity.services.EmailService
import lockity.services.FileService
import lockity.services.jwtUser
import lockity.utils.AUTHENTICATED
import lockity.utils.DatabaseService
import lockity.utils.respondJSON
import lockity.utils.withErrorHandler
import org.koin.ktor.ext.inject
import java.time.LocalDateTime
import java.util.*
import javax.naming.NoPermissionException

fun Application.sharedRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val databaseService: DatabaseService by inject()
    val roleRepository: RoleRepository by inject()
    val fileService: FileService by inject()
    val fileRepository: FileRepository by inject()
    val sharedAccessRepository: SharedAccessRepository by inject()


    routing {
        route("/shared-access") {
            authenticate(AUTHENTICATED) {
                get("/offset/{offset}/limit/{limit}") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this shared access")
                        val offset = call.parameters["offset"]?.toIntOrNull()
                            ?: throw BadRequestException("Offset is not present in the parameters or in bad format.")
                        val limit = call.parameters["limit"]?.toIntOrNull()
                            ?: throw BadRequestException("Limit is not present in the parameters or in bad format.")
                        if (limit > 20) throw BadRequestException("Maximum limit(20) is exceeded.")

                        call.respond(
                            sharedAccessRepository.fetchOwnerFilesWithOffsetAndLimit(
                                userBinId = currentUser.id!!,
                                offset = offset,
                                limit = limit
                            )
                        )
                    }
                }

                get("/info") {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this file metadata")
                        call.respond(
                            SharedAccessCount(
                                sharedAccessCount = sharedAccessRepository.fetchOwnerSharedAccessCount(currentUser.id!!)
                            )
                        )
                    }
                }

                post {
                    call.withErrorHandler {
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this users received access")

                        val newAccess = call.receive<UploadableSharedAccess>()
                        newAccess.isValuesValid()
                        if (!userRepository.userExist(UUID.fromString(newAccess.userId)))
                            throw BadRequestException("Receiver doesn't exist")
                        if (!fileRepository.fileExist(UUID.fromString(newAccess.fileId)))
                            throw BadRequestException("File doesn't exist")
                        val fileOwner = fileRepository.fileOwner(
                            UUID.fromString(newAccess.fileId)
                        )
                        if (fileOwner == null || !fileOwner.contentEquals(currentUser.id))
                            throw NoPermissionException("User is not the owner of the file")
                        if (fileOwner.contentEquals(databaseService.uuidToBin(UUID.fromString(newAccess.userId)))) {
                            throw BadRequestException("Owner cannot be recipient of the shared file")
                        }
                        if (!sharedAccessRepository.isUniqueFileAndRecipientEntry(
                                fileUuid = UUID.fromString(newAccess.fileId),
                                recipientUuid = UUID.fromString(newAccess.userId)
                            )
                        ) throw BadRequestException("Shared access with the same file and recipient already exists")

                        sharedAccessRepository.insert(
                            SharedAccessRecord(
                                id = databaseService.uuidToBin(),
                                fileId = databaseService.uuidToBin(UUID.fromString(newAccess.fileId)),
                                ownerId = fileOwner,
                                recipientId = databaseService.uuidToBin(UUID.fromString(newAccess.userId)),
                                created = LocalDateTime.now()
                            )
                        )

                        call.respondJSON(
                            "Shared access created successfully",
                            HttpStatusCode.Created
                        )
                    }
                }
//
//                get("/{shareId}") {
//                    call.withErrorHandler {
//                        val shareId = call.parameters["shareId"]
//                            ?: throw BadRequestException("Share id is not present in the parameters.")
//                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
//                            ?: throw NotFoundException("Shared access was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this users shared access")
//                        val fileOwner = fileRepository.fileOwner(
//                            UUID.fromString(databaseService.binToUuid(sharedAccessRecord.fileId!!).toString())
//                        )
//                        if (fileOwner == null || !fileOwner.contentEquals(currentUser.id))
//                            throw NoPermissionException("User is not the owner of the file")
//                        call.respond(sharedAccessRepository.fromRecord(sharedAccessRecord))
//                    }
//                }
//
//                put("/{shareId}") {
//                    call.withErrorHandler {
//                        val shareId = call.parameters["shareId"]
//                            ?: throw BadRequestException("Share id is not present in the parameters.")
//                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
//                            ?: throw NotFoundException("Shared access was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to get this users received access")
//                        if (!sharedAccessRecord.ownerId.contentEquals(currentUser.id))
//                            throw NoPermissionException("User do not have permission to get this users received access")
//
//                        val newAccess = call.receive<SharedAccess>()
//                        newAccess.isValuesValid()
//                        if (!userRepository.userExist(UUID.fromString(newAccess.recipientId)))
//                            throw BadRequestException("Receiver doesn't exist")
//                        if (!fileRepository.fileExist(UUID.fromString(newAccess.fileId)))
//                            throw BadRequestException("File doesn't exist")
//                        val fileOwner = fileRepository.fileOwner(
//                            UUID.fromString(newAccess.fileId)
//                        )
//                        if (fileOwner == null || !fileOwner.contentEquals(currentUser.id))
//                            throw NoPermissionException("User is not the owner of the file")
//
//                        if (fileOwner.contentEquals(databaseService.uuidToBin(UUID.fromString(newAccess.recipientId)))) {
//                            throw BadRequestException("Owner cannot be recipient of the shared file")
//                        }
//                        if (!sharedAccessRepository.isUniqueFileAndRecipientEntry(
//                                fileUuid = UUID.fromString(newAccess.fileId),
//                                recipientUuid = UUID.fromString(newAccess.recipientId)
//                            )
//                        ) throw BadRequestException("Shared access with the same file and recipient already exists")
//
//                        val updatedSharedAccessRecord = SharedAccessRecord(
//                            id = sharedAccessRecord.id,
//                            fileId = databaseService.uuidToBin(UUID.fromString(newAccess.fileId)),
//                            ownerId = currentUser.id,
//                            recipientId = databaseService.uuidToBin(UUID.fromString(newAccess.recipientId))
//                        )
//                        sharedAccessRepository.update(updatedSharedAccessRecord)
//                        call.respond(
//                            call.respond(sharedAccessRepository.fromRecord(sharedAccessRecord))
//                        )
//                    }
//                }
//
//                delete("/{shareId}") {
//                    call.withErrorHandler {
//                        val shareId = call.parameters["shareId"]
//                            ?: throw BadRequestException("Share id is not present in the parameters.")
//                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
//                            ?: throw NotFoundException("Shared access was not found")
//                        val currentUser = call.jwtUser()
//                            ?: throw NoPermissionException("User do not have permission to delete this access")
//                        if (!sharedAccessRecord.ownerId.contentEquals(currentUser.id))
//                            throw NoPermissionException("User do not have permission to delete this access")
//
//                        sharedAccessRepository.delete(databaseService.binToUuid(sharedAccessRecord.id!!))
//                        call.respondJSON(
//                            "Shared access deletion successful.",
//                            HttpStatusCode.OK
//                        )
//                    }
//                }
            }
        }
    }
}