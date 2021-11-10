package lockity.services

import lockity.repositories.FileRepository
import lockity.utils.CONFIG
import lockity.utils.DatabaseService
import sun.rmi.runtime.Log
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

    fun deletePhysicalUserFiles(uuid: UUID): Boolean {
        val userFiles = fileRepository.fetchUserFiles(uuid)
        println("Delete user files invoked. User: $uuid")
        var success = true
        userFiles.forEach {
            val folderName = databaseService.binToUuid(it.id!!).toString()
            val deleted = File(uploadsLocation(folderName)).deleteRecursively()
            println("Folder $folderName deleted. Status = $deleted")
            if(!deleted) success = false
        }
        return success
    }
}