plugins {
    `kotlin-dsl` apply true
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
}

repositories {
    gradlePluginPortal()
}