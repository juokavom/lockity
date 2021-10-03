package lockity.utils

object ROLE {
    const val ADMIN = "administrator"
    const val REGISTERED = "registered"
    const val VIP = "vip"
}
const val JWT_COOKIE_NAME = "jwt"
const val ROLE_NAME = "role"
object CONFIG {
    const val JWT_SECRET = "jwt.secret"
    const val JWT_SESSION_TIME_MILLIS = "jwt.sessionTimeMillis"
    const val DATABASE_URL = "database.url"
    const val DATABASE_USER = "database.user"
    const val DATABASE_PASSWORD = "database.password"
}