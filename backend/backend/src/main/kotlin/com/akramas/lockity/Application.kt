package com.akramas.lockity

import com.akramas.lockity.plugins.configureRouting
import io.ktor.application.*

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

fun Application.module() {
    configureRouting()
//    configureSerialization()
//    configureSecurity()
}