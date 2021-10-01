package lockity.plugins

import database.schema.tables.references.RoleTable
import database.schema.tables.references.UserTable
import io.ktor.application.*
import io.ktor.http.content.*
import io.ktor.locations.*
import io.ktor.response.*
import io.ktor.routing.*
import org.jooq.DSLContext

fun Application.configureRouting(dsl: DSLContext) {

    install(Locations) {
    }

    routing {
        get("/user") {
            val user = dsl.select(UserTable.Name, UserTable.Email, RoleTable.Name)
                .from(UserTable)
                .join(RoleTable)
                .onKey(UserTable.Role)
                .fetchOne()?.map {
                    mapOf(
                        "name" to it[UserTable.Name],
                        "email" to it[UserTable.Email],
                        "role" to it[RoleTable.Name]
                    )
                }
            call.respondText(
                "User #1. Name is ${user?.get("name")}," +
                        " email: ${user?.get("email")} and role is ${user?.get("role")}"
            )
        }
        get("/test") {
            call.respondText("Test!")
        }
        // Static plugin. Try to access `/static/index.html`
        static("/static") {
            resources("static")
        }
        get<MyLocation> {
            call.respondText("Location: name=${it.name}, arg1=${it.arg1}, arg2=${it.arg2}")
        }
        // Register nested routes
        get<Type.Edit> {
            call.respondText("Inside $it")
        }
        get<Type.List> {
            call.respondText("Inside $it")
        }
    }
}

@Location("/location/{name}")
class MyLocation(val name: String, val arg1: Int = 42, val arg2: String = "default")

@Location("/type/{name}")
data class Type(val name: String) {
    @Location("/edit")
    data class Edit(val type: Type)

    @Location("/list/{page}")
    data class List(val type: Type, val page: Int)
}
