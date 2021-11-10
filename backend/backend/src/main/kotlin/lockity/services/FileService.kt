package lockity.services

import lockity.repositories.FileRepository
import lockity.utils.CONFIG
import lockity.utils.DatabaseService
import java.io.File
import java.io.InputStream
import java.io.OutputStream
import java.util.*

class FileService(
    private val configurationService: ConfigurationService,
    private val fileRepository: FileRepository,
    private val databaseService: DatabaseService
) {
    private val storagePath = configurationService.configValue(CONFIG.FILEPATH_STORAGE)
    private val uploadsPath = configurationService.configValue(CONFIG.FILEPATH_UPLOADS)

    fun uploadsLocation(fileName: String) = "$storagePath$uploadsPath/$fileName"

    fun copyTo(inputStream: InputStream, outputStream: OutputStream) {
        var bytesCopied: Long = 0
        val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
        var bytes = inputStream.read(buffer)
        while (bytes >= 0) {
            outputStream.write(buffer, 0, bytes)
            bytesCopied += bytes
            bytes = inputStream.read(buffer)
        }
    }

    fun deleteUserFiles(uuid: UUID) {
        val userFiles = fileRepository.fetchUserFiles(uuid)
        userFiles.forEach {
            File(
                uploadsLocation(databaseService.binToUuid(it.id!!).toString())
            ).deleteRecursively()
        }
//        fileRepository.deleteUserFiles(uuid)
    }
}