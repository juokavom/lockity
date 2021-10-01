package com.akramas.lockity.config

import com.mysql.cj.jdbc.Driver
import org.jooq.codegen.GenerationTool
import org.jooq.codegen.KotlinGenerator
import org.jooq.meta.jaxb.*
import org.jooq.meta.jaxb.Target
import org.jooq.meta.mysql.MySQLDatabase

fun generateJooq() = GenerationTool.generate(
    Configuration().apply {
        jdbc = Jdbc().apply {
            driver = Driver::class.qualifiedName
            url = config.connectionUrl
            user = config.user
            password = config.password
        }
        this.generator = generator.apply {
            generate = Generate().apply {
                isDeprecationOnUnknownTypes = false
                isJavaTimeTypes = true
                isGeneratedAnnotation = false
                if (name != KotlinGenerator::class.qualifiedName) {
                    isNullableAnnotation = true
                    isNonnullAnnotation = true
                    isConstructorPropertiesAnnotation = true
                }
            }
            config.jooq.target.let { targetConfig ->
                target = Target().apply {
                    packageName = targetConfig.packageName
                    directory = "$projectDir/${targetConfig.directory}"
                }
            }
            database = Database().apply {
                name = MySQLDatabase::class.qualifiedName
                inputSchema = config.database
                excludes = "flyway_schema_history"
                this.forcedTypes = forcedTypes
            }
        }
    })
