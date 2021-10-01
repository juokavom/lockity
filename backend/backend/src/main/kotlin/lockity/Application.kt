package lockity

import com.mysql.cj.jdbc.MysqlDataSource
import io.ktor.application.*
import lockity.plugins.configureRouting
import org.jooq.SQLDialect
import org.jooq.impl.DSL

//fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)


fun Application.main() {
    configureRouting(databaseConnection())
//    configureSerialization()
//    configureSecurity()
}

fun Application.databaseConnection() = DSL.using(
    MysqlDataSource().apply {
        setURL(environment.config.propertyOrNull("database.url")!!.getString())
        user = environment.config.propertyOrNull("database.user")!!.getString()
        password = environment.config.propertyOrNull("database.password")!!.getString()
    }, SQLDialect.MYSQL
)