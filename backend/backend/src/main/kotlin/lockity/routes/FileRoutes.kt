package lockity.routes

import database.schema.tables.records.FileRecord
import io.ktor.application.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.http.content.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.routing.*
import lockity.models.AnonymousFileMetadata
import lockity.repositories.ConfirmationLinkRepository
import lockity.repositories.FileRepository
import lockity.repositories.RoleRepository
import lockity.repositories.UserRepository
import lockity.services.*
import lockity.utils.*
import org.koin.ktor.ext.inject
import java.io.File
import java.time.LocalDate
import java.util.*

fun Application.fileRoutes() {
    val emailService: EmailService by inject()
    val userRepository: UserRepository by inject()
    val fileRepository: FileRepository by inject()
    val fileService: FileService by inject()
    val roleRepository: RoleRepository by inject()
    val databaseService: DatabaseService by inject()
    val confirmationLinkRepository: ConfirmationLinkRepository by inject()
    val configurationService: ConfigurationService by inject()
    val jwtService: JwtService by inject()

    routing {
        route("/file") {
            post("/anonymous/{anonymous}") {
                call.withErrorHandler {
                    val isAnonymous = call.parameters["anonymous"]?.toBooleanStrictOrNull()
                        ?: throw BadRequestException("Anonymous value is not present in the request")
                    val fileSize = call.request.headers["Content-Length"]!!.toLong()
                    if (fileSize > DEFAULT_STORAGE_BYTES) throw BadRequestException("File size exceeds 1GB")

                    val part = call.receiveMultipart().readPart()
                    val fileId = databaseService.uuidToBin()
                    val fileIdStringed = databaseService.binToUuid(fileId).toString()
                    if (part is PartData.FileItem) {
                        val fileName = part.originalFileName!!
                        File(fileService.uploadsLocation(fileIdStringed)).mkdir()
                        val fileLocation = fileService.uploadsLocation("$fileIdStringed/$fileName")
                        val inputStream = part.streamProvider()
                        val outputStream = File(fileLocation).outputStream().buffered()
                        fileService.copyTo(inputStream, outputStream)
                        part.dispose

                        val currentUserId = call.request.headers[JWT_COOKIE_NAME]?.let { jwt ->
                            if (jwtService.isValidToken(jwt)) jwtService.getJwtClaims(jwt) else null
                        }?.userId

                        val fileKey = UUID.randomUUID().toString()
                        fileRepository.insert(
                            FileRecord(
                                id = fileId,
                                title = fileName,
                                location = fileLocation,
                                user = if (isAnonymous) null else databaseService.uuidToBin(
                                    UUID.fromString(
                                        currentUserId
                                    )
                                ),
                                key = if (isAnonymous) fileKey else null,
                                link = null,
                                uploaded = LocalDate.now(),
                                lastAccessed = null
                            )
                        )
                        call.respond(AnonymousFileMetadata(fileIdStringed, fileKey))
                    } else throw BadRequestException("Multipart data is not file type")
                }
            }
            get("/{fileId}") {
//                val file = filePath("/sample.mp4")
//                call.respondFile(file)
            }
        }
    }
}