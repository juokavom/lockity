package lockity

import lockity.plugins.configureRouting
import io.ktor.application.*

//fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.main() {
    configureRouting()
//    configureSerialization()
//    configureSecurity()
}