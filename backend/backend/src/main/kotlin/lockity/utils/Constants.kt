package lockity.utils

const val AUTHENTICATED = "Authenticated"
object ROLE {
    const val ADMIN = "Administrator"
    const val REGISTERED = "Registered"
    const val VIP = "Vip"
}

const val JWT_COOKIE_NAME = "jwt"

object CONFIG {
    const val ENV = "environment"

    const val JWT_SECRET = "jwt.secret"
    const val JWT_SESSION_TIME_MILLIS = "jwt.sessionTimeMillis"

    const val DATABASE_URL = "database.url"
    const val DATABASE_USER = "database.user"
    const val DATABASE_PASSWORD = "database.password"

    const val STORAGE = "storage"
    const val ROOT_PATH = "rootPath"

    const val EMAIL_HOST = "email.host"
    const val EMAIL_PORT = "email.port"
    const val EMAIL_USER = "email.user"
    const val EMAIL_PASSWORD = "email.password"
}

object USER {
    const val ID = "user.id"
    const val  ROLE = "user.role"
    const val  PASSWORD = "user.password"
    const val  CONFIRMED = "user.confirmed"
}