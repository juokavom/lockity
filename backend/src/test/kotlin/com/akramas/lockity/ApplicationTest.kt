package com.akramas.lockity

import com.akramas.lockity.plugins.configureRouting
import io.ktor.http.*
import kotlin.test.*
import io.ktor.server.testing.*

class ApplicationTest {
    @Test
    fun testRoot() {
        withTestApplication({ configureRouting() }) {
            handleRequest(HttpMethod.Get, "/test").apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals("Test!", response.content)
            }
        }
    }
}