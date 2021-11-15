package lockity.routes

import database.schema.tables.records.SharedAccessRecord
import io.ktor.application.*
import io.ktor.auth.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.EditableSharedAccess
import lockity.models.SharedAccessCount
import lockity.models.UploadableSharedAccess
import lockity.models.isValuesValid
import lockity.repositories.FileRepository
import lockity.repositories.SharedAccessRepository
import lockity.repositories.UserRepository
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
    val userRepository: UserRepository by inject()
    val databaseService: DatabaseService by inject()
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

                get("/count") {
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

                put("/{shareId}") {
                    call.withErrorHandler {
                        val shareId = call.parameters["shareId"]
                            ?: throw BadRequestException("Share id is not present in the parameters.")
                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
                            ?: throw NotFoundException("Shared access was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to get this users received access")
                        if (!sharedAccessRecord.ownerId.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to get this users received access")

                        val editedAccess = call.receive<EditableSharedAccess>()
                        editedAccess.isValuesValid()
                        val recipientUUID = UUID.fromString(editedAccess.userId)
                        if (!userRepository.userExist(recipientUUID))
                            throw BadRequestException("Receiver doesn't exist")
                        if (sharedAccessRecord.ownerId.contentEquals(
                                databaseService.uuidToBin(UUID.fromString(editedAccess.userId))
                            )
                        ) {
                            throw BadRequestException("Owner cannot be recipient of the shared file")
                        }

                        if (!sharedAccessRepository.isUniqueFileAndRecipientEntry(
                                fileUuid = databaseService.binToUuid(sharedAccessRecord.fileId!!),
                                recipientUuid = UUID.fromString(editedAccess.userId)
                            )
                        ) throw BadRequestException("Shared access with the same file and recipient already exists")

                        sharedAccessRepository.updateRecipient(
                            sharedId = sharedAccessRecord.id!!,
                            userId = databaseService.uuidToBin(recipientUUID)
                        )

                        call.respondJSON(
                            "Shared access edited successfully",
                            HttpStatusCode.Created
                        )
                    }
                }

                delete("/{shareId}") {
                    call.withErrorHandler {
                        val shareId = call.parameters["shareId"]
                            ?: throw BadRequestException("Share id is not present in the parameters.")
                        val sharedAccessRecord = sharedAccessRepository.fetch(UUID.fromString(shareId))
                            ?: throw NotFoundException("Shared access was not found")
                        val currentUser = call.jwtUser()
                            ?: throw NoPermissionException("User do not have permission to delete this access")
                        if (!sharedAccessRecord.ownerId.contentEquals(currentUser.id))
                            throw NoPermissionException("User do not have permission to delete this access")

                        sharedAccessRepository.delete(sharedAccessRecord.id!!)
                        call.respondJSON(
                            "Shared access deleted successfully.",
                            HttpStatusCode.OK
                        )
                    }
                }
            }
        }
    }
}