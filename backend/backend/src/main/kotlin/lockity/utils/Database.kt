package lockity.utils

import com.mysql.cj.jdbc.MysqlDataSource
import io.ktor.application.*
import lockity.configValue
import org.jooq.SQLDialect
import org.jooq.impl.DSL

fun Application.databaseConnection() = DSL.using(
    MysqlDataSource().apply {
        setURL(configValue(CONFIG.DATABASE_URL))
        user = configValue(CONFIG.DATABASE_USER)
        password = configValue(CONFIG.DATABASE_PASSWORD)
    }, SQLDialect.MARIADB
)
