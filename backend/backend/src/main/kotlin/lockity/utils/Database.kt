package lockity.utils

import com.mysql.cj.jdbc.MysqlDataSource
import io.ktor.application.*
import lockity.configValue
import org.jooq.SQLDialect
import org.jooq.impl.DSL

fun Application.databaseConnection() = DSL.using(
    MysqlDataSource().apply {
        setURL(configValue("database.url"))
        user = configValue("database.user")
        password = configValue("database.password")
    }, SQLDialect.MARIADB
)
