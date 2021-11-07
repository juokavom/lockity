package lockity.services

import lockity.utils.CONFIG
import java.io.File
import java.io.InputStream
import java.io.OutputStream

class FileService(
    private val configurationService: ConfigurationService
) {
    private val storagePath = configurationService.configValue(CONFIG.FILEPATH_STORAGE)
    private val uploadsPath = configurationService.configValue(CONFIG.FILEPATH_UPLOADS)

    fun uploadsLocation(fileName: String) = "$storagePath/$uploadsPath/$fileName"

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
}