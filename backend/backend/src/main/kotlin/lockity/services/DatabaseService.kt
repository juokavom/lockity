package lockity.services

import com.mysql.cj.jdbc.MysqlDataSource
import lockity.utils.CONFIG
import org.jooq.SQLDialect
import org.jooq.impl.DSL

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
}