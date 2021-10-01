package com.akramas.lockity.config

import org.jooq.codegen.DefaultGeneratorStrategy
import org.jooq.meta.*

class GeneratorStrategy : DefaultGeneratorStrategy() {
    override fun getJavaClassName(definition: Definition, mode: org.jooq.codegen.GeneratorStrategy.Mode): String {
        return when (definition) {
            is TableDefinition -> when (mode) {
                org.jooq.codegen.GeneratorStrategy.Mode.DEFAULT -> "${definition.outputName.toCamelCase(capitalize = true)}TableDefinition"
                org.jooq.codegen.GeneratorStrategy.Mode.RECORD -> "${definition.outputName.toCamelCase(capitalize = true)}Record"
                else -> super.getJavaClassName(definition, mode)
            }
            else -> super.getJavaClassName(definition, mode)
        }
    }

    override fun getJavaIdentifier(definition: Definition): String {
        return when (definition) {
            is TableDefinition -> "${definition.outputName.toCamelCase(capitalize = true)}Table"
            is ColumnDefinition -> definition.outputName.toCamelCase(capitalize = true)
            is ConstraintDefinition -> definition.outputName.toCamelCase(capitalize = true)
            is IndexDefinition -> "${definition.table.outputName}_${definition.outputName}".toCamelCase(capitalize = true)
            else -> super.getJavaIdentifier(definition)
        }
    }

    override fun getJavaMethodName(definition: Definition, mode: org.jooq.codegen.GeneratorStrategy.Mode): String {
        return when (definition) {
            is TableDefinition -> definition.outputName.toCamelCase(capitalize = true)
            else -> super.getJavaMethodName(definition, mode)
        }
    }

    override fun getJavaMemberName(definition: Definition, mode: org.jooq.codegen.GeneratorStrategy.Mode): String {
        return when (mode) {
            org.jooq.codegen.GeneratorStrategy.Mode.DEFAULT, org.jooq.codegen.GeneratorStrategy.Mode.POJO -> definition.outputName.toCamelCase(
                capitalize = false
            )
            else -> super.getJavaMemberName(definition, mode)
        }
    }
}

// Taken from https://github.com/apache/commons-text/blob/master/src/main/java/org/apache/commons/text/CaseUtils.java (modified)
private fun String.toCamelCase(capitalize: Boolean): String {
    if (isEmpty()) return this

    val (prefix, str) = this.splitLeadingUnderscores()
    val strLen = str.length
    val delimiterSet = generateDelimiterSet(CharArray(1) { '_' })
    val newCodePoints = IntArray(strLen)
    var capitalizeNext = capitalize
    var outOffset = 0
    var index = 0

    while (index < strLen) {
        val codePoint = str.codePointAt(index)
        if (delimiterSet.contains(codePoint)) {
            capitalizeNext = true
            if (outOffset == 0) {
                capitalizeNext = false
            }
            index += Character.charCount(codePoint)
        } else if (capitalizeNext || outOffset == 0 && capitalize) {
            val titleCaseCodePoint = Character.toTitleCase(codePoint)
            newCodePoints[outOffset++] = titleCaseCodePoint
            index += Character.charCount(titleCaseCodePoint)
            capitalizeNext = false
        } else {
            newCodePoints[outOffset++] = codePoint
            index += Character.charCount(codePoint)
        }
    }

    return prefix + (if (outOffset != 0) String(newCodePoints, 0, outOffset) else str)
}

private fun generateDelimiterSet(delimiters: CharArray): Set<Int> {
    val delimiterHashSet: MutableSet<Int> = HashSet()
    delimiterHashSet.add(Character.codePointAt(charArrayOf(' '), 0))

    if (delimiters.isEmpty()) {
        return delimiterHashSet
    }

    for (index in delimiters.indices) {
        delimiterHashSet.add(Character.codePointAt(delimiters, index))
    }

    return delimiterHashSet
}

private fun String.splitLeadingUnderscores(): Pair<String, String> {
    for (index in indices) {
        if (this[index] != '_') return Pair(substring(0, index), substring(index, length))
    }

    return Pair(this, "")
}