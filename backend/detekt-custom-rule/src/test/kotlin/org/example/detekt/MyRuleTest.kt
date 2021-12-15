package org.example.detekt

import com.google.common.truth.Truth.assertThat
import io.github.detekt.test.utils.KotlinCoreEnvironmentWrapper
import io.github.detekt.test.utils.createEnvironment
import io.gitlab.arturbosch.detekt.api.Config
import io.gitlab.arturbosch.detekt.test.compileAndLintWithContext
import io.mockk.every
import io.mockk.spyk
import org.jetbrains.kotlin.cli.jvm.compiler.KotlinCoreEnvironment
import org.junit.AfterClass
import org.junit.BeforeClass
import org.junit.Test
import org.junit.jupiter.api.TestInstance

//Todo: fix stubbing
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
internal class MyRuleTest {
    private val myRule: MyRule = spyk(
        MyRule(Config.empty)
    )
    private val leakedValue = "super_secret_api_key"

    @Test
    fun `reports inner classes`() {
        every { myRule.getParsedConfigValues() } returns listOf(leakedValue)
        val code = """
            fun calculateDistance(a: Int, b: Int, c: Int) {
                val bigBrainAnswer = a + c - b
                val testVal = "$leakedValue"
                println("Got answer = " + bigBrainAnswer)
            }
        """
        val findings = myRule.compileAndLintWithContext(env, code)
        assertThat(findings).hasSize(1)
    }

    @Test
    fun `doesn't report inner classes`() {
        every { myRule.getParsedConfigValues() } returns listOf(leakedValue)
        val code = """
            fun calculateDistance(a: Int, b: Int, c: Int) {
                val bigBrainAnswer = a + c - b
                println("Got answer = " + bigBrainAnswer)
            }
        """
        val findings = myRule.compileAndLintWithContext(env, code)
        assertThat(findings).isEmpty()
    }

    private val env: KotlinCoreEnvironment
        get() = envWrapper.env

    companion object {
        private lateinit var envWrapper: KotlinCoreEnvironmentWrapper

        @BeforeClass
        @JvmStatic
        fun setUp() {
            envWrapper = createEnvironment()
        }

        @AfterClass
        @JvmStatic
        fun tearDown() {
            envWrapper.dispose()
        }
    }
}
