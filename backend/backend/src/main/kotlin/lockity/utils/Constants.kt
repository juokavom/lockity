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

    const val FILEPATH_STORAGE = "filePath.storage"
    const val FILEPATH_ROOT_PATH = "filePath.rootPath"
    const val FILEPATH_DEFAULT_USER_IMAGE = "filePath.defaultUserImage"

    const val EMAIL_HOST = "email.host"
    const val EMAIL_PORT = "email.port"
    const val EMAIL_USER = "email.user"
    const val EMAIL_PASSWORD = "email.password"

    const val FRONTEND_DOMAIN = "frontendDomain"

    const val LINK_EXPIRY_MINUTES = "link.expiryMinutes"
}

object USER {
    const val ID = "user.id"
    const val ROLE = "user.role"
    const val PASSWORD = "user.password"
    const val CONFIRMED = "user.confirmed"
}

const val DEFAULT_STORAGE_BYTES = 1_000_000_000L // 1GB