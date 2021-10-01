plugins {
    `kotlin-dsl`
    `maven-publish`
}

gradlePlugin {
    plugins {
        create("CustomDatabasePlugins") {
            id = "db-plugins"
            implementationClass = "plugins.DatabasePlugins"
        }
    }
}

dependencies {
    implementation("org.flywaydb:flyway-gradle-plugin:7.4.0")
    implementation("org.jooq:jooq-codegen:3.14.3")
    implementation("mysql:mysql-connector-java:8.0.22")
}

repositories {
    gradlePluginPortal()
}