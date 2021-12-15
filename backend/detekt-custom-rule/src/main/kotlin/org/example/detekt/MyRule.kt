package org.example.detekt

import io.gitlab.arturbosch.detekt.api.*
import org.jetbrains.kotlin.com.intellij.psi.PsiElement
import java.io.File

class MyRule(config: Config) : Rule(config) {
    private lateinit var parsedConfigValues: List<String>
    private val allowedLeaks = listOf("dev", "prod")

    fun getParsedConfigValues(): List<String> {
        if (!this::parsedConfigValues.isInitialized) {
            parsedConfigValues = Regex("=.*")
                .findAll(
                    File("backend/src/main/resources/application.conf").readText()
                )
                .map {
                    it.value.drop(1).trim().trim('\"')
                }
                .filter { it.isNotEmpty() && !allowedLeaks.contains(it) }
                .toList()
        }
        return parsedConfigValues
    }

    override val issue = Issue(
        javaClass.simpleName,
        Severity.Warning,
        "Found config value from application.conf file",
        Debt.TEN_MINS
    )

    override fun visitElement(element: PsiElement) {
        super.visitElement(element)
        getParsedConfigValues().forEach { configValue ->
            if (element.node.elementType.toString() == "REGULAR_STRING_PART" && element.text == configValue) {
                report(
                    findings = listOf(
                        CodeSmell(
                            issue = issue,
                            entity = Entity.from(element),
                            message = "Leaked config value with the value of ${element.text}!"
                        )
                    )
                )
            }
        }
    }
}
