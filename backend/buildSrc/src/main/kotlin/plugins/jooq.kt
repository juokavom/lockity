package plugins

import com.mysql.cj.jdbc.Driver
import org.jooq.codegen.GenerationTool
import org.jooq.codegen.KotlinGenerator
import org.jooq.meta.jaxb.*
import org.jooq.meta.jaxb.Target
import org.jooq.meta.mysql.MySQLDatabase

fun generateJooq(
    jooqDir: String,
    databaseConfig: DatabasePlugins.DatabaseConfig
) = GenerationTool.generate(
    Configuration().apply {
        jdbc = Jdbc().apply {
            driver = Driver::class.qualifiedName
            url = databaseConfig.url
            user = databaseConfig.user
            password = databaseConfig.password
        }
        this.generator = Generator()
            .withName(KotlinGenerator::class.qualifiedName)
            .withStrategy(
                Strategy()
                    .withName(GeneratorStrategy::class.qualifiedName)
            ).apply {
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
                target = Target().apply {
                    packageName = "database.schema"
                    directory = jooqDir
                }
                database = Database().apply {
                    name = MySQLDatabase::class.qualifiedName
                    inputSchema = "lockity"
                    excludes = "flyway_schema_history"
                }
            }
    })
