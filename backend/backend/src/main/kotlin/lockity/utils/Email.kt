package lockity.utils

import io.ktor.application.*
import lockity.configValue
import org.apache.commons.mail.DefaultAuthenticator
import org.apache.commons.mail.SimpleEmail
import javax.mail.*
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

fun Application.sendEmail(recipient: String, subject: String, body: String) {
    when(configValue(CONFIG.ENV)) {
        "dev" -> sendMockEmail(recipient, subject, body)
        "prod" -> sendProdEmail(recipient, subject, body)
    }
}

fun Application.sendProdEmail(recipient: String, subject: String, body: String) {
    val email = SimpleEmail()
    email.setCharset("UTF-8")
    email.hostName = configValue(CONFIG.EMAIL_HOST)
    email.setSmtpPort(configValue(CONFIG.EMAIL_PORT).toInt())
    email.setAuthenticator(DefaultAuthenticator(configValue(CONFIG.EMAIL_USER), configValue(CONFIG.EMAIL_PASSWORD)))
    email.isSSLOnConnect = true
    email.setFrom(configValue(CONFIG.EMAIL_USER))
    email.subject = subject
    email.setContent(body, "text/html")
    email.addTo(recipient)
    email.send()
}

fun Application.sendMockEmail(emailRecipient: String, emailSubjec: String, emailBody: String) {
    val tos = arrayListOf(emailRecipient)
    val from = configValue(CONFIG.EMAIL_USER)

    val properties = System.getProperties()

    with (properties) {
        put("mail.smtp.host", configValue(CONFIG.EMAIL_HOST))
        put("mail.smtp.port", configValue(CONFIG.EMAIL_PORT))
        put("mail.smtp.starttls.enable", "true")
        put("mail.smtp.auth", "true")
    }

    val auth = object: Authenticator() {
        override fun getPasswordAuthentication() =
            PasswordAuthentication(from, configValue(CONFIG.EMAIL_PASSWORD))
    }

    val session = Session.getDefaultInstance(properties, auth)

    val message = MimeMessage(session)

    with (message) {
        setFrom(InternetAddress(from))
        for (to in tos) {
            addRecipient(Message.RecipientType.TO, InternetAddress(to))
            subject = emailSubjec
            setContent(emailBody, "text/html; charset=utf-8")
        }
    }

    Transport.send(message)
}