package lockity.utils

import com.mysql.cj.jdbc.MysqlDataSource
import lockity.Service.ConfigurationService
import org.jooq.SQLDialect
import org.jooq.impl.DSL
import java.nio.ByteBuffer
import java.util.*

class DatabaseService(
    private val configurationService: ConfigurationService
) {
    val dsl = DSL.using(
        MysqlDataSource().apply {
            setURL(configurationService.configValue(CONFIG.DATABASE_URL))
            user = configurationService.configValue(CONFIG.DATABASE_USER)
            password = configurationService.configValue(CONFIG.DATABASE_PASSWORD)
        }, SQLDialect.MARIADB
    )

    fun generateBinaryUUID(uuid: UUID = UUID.randomUUID()): ByteArray {
        val bb = ByteBuffer.wrap(ByteArray(16))
        bb.putLong(uuid.mostSignificantBits)
        bb.putLong(uuid.leastSignificantBits)
        return bb.array()
    }
}