package com.akramas.lockity

import io.ktor.http.*
import io.ktor.server.testing.*
import lockity.plugins.configureRouting
import org.junit.Test
import kotlin.test.assertEquals

class ApplicationTest {
    @Test
    fun testRoot() {
        withTestApplication({ configureRouting(null) }) {
            handleRequest(HttpMethod.Get, "/test").apply {
                assertEquals(HttpStatusCode.OK, response.status())
                assertEquals("Test!", response.content)
            }
        }
    }
}