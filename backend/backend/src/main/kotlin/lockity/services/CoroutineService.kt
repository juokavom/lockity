package lockity.services

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lockity.repositories.FileRepository
import lockity.utils.CONFIG
import java.time.LocalDateTime

class CoroutineService(
    private val configurationService: ConfigurationService,
    private val fileRepository: FileRepository,
    private val fieService: FileService
) {
    suspend fun launchUnregisteredFileDeletion() = withContext(Dispatchers.Default) {
        launch {
            while (true) {
                delay(
                    configurationService.configValue(
                        CONFIG.CRON_INTERVAL_TIME_MINUTES
                    ).toLong() * 60 * 1000
                )
                val expiryDate = LocalDateTime.now().minusDays(
                    configurationService.configValue(
                        CONFIG.CRON_ANONYMOUS_EXPIRY_DAYS
                    ).toLong()
                )
                val expiredFiles = fileRepository.fetchExpiredAnonymousFiles(expiryDate)
                println("deleteUnregisteredFiles invoked. Time = ${LocalDateTime.now()}, expiry time = $expiryDate.")
                println(":::FILES :::")
                expiredFiles.forEach {
                    println(":::deleting file:::")
                    println(it)
                    if (fieService.deletePhysicalFile(it.id!!)) {
                        fileRepository.delete(it.id!!)
                    }
                    println(":::deleted:::")
                }
                println(":::END OF FILES:::")
            }
        }
    }
}

