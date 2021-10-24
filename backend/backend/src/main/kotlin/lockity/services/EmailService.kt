package lockity.services

import database.schema.tables.records.ConfirmationLinkRecord
import lockity.utils.CONFIG
import org.apache.commons.mail.DefaultAuthenticator
import org.apache.commons.mail.SimpleEmail
import javax.mail.*
import javax.mail.internet.InternetAddress
import javax.mail.internet.MimeMessage

class EmailService(
    private val configurationService: ConfigurationService
) {
    fun sendEmail(recipient: String, subject: String, body: String) {
        when (configurationService.configValue(CONFIG.ENV)) {
            "dev" -> sendMockEmail(recipient, subject, body)
            "prod" -> sendProdEmail(recipient, subject, body)
        }
    }

    //TODO: pakeist i redirectinima i frona ir frontas kvies xmlHttp, del email provideriu galimo CORS konflikto
    fun confirmRegistrationTemplate(confirmationLinkRecord: ConfirmationLinkRecord) = """
       <html>
             <head>
             </head>
             <body>
                 <p>
                        Please confirm your registration until ${
        confirmationLinkRecord.validUntil!!.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
    } by clicking the following button: <button type="button" onclick="sendConfirm()">confirm registration</button>. See you!
                 </p>
             </body>
             <script>
                function sendConfirm() {
                  var xhr = new XMLHttpRequest();
                  xhr.open("POST", ${configurationService.configValue(CONFIG.FRONTEND_DOMAIN)}/confirm, true);
                  xhr.setRequestHeader('Content-Type', 'application/json');
                  xhr.send(JSON.stringify({
                      link: ${confirmationLinkRecord.link}
                  }));
                }
             </script>
       </html>
       """.trimIndent()

    fun isEmailValid(email: String): Boolean = Regex(
        "(?:[a-z0-9!#\$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#\$%&'*+/=?^_`{|}~-]+)*|\"(" +
                "?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x" +
                "01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])" +
                "?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?" +
                "[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-" +
                "z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x" +
                "01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])"
    ).matches(email)

    private fun sendProdEmail(recipient: String, subject: String, body: String) {
        val email = SimpleEmail()
        email.setCharset("UTF-8")
        email.hostName = configurationService.configValue(CONFIG.EMAIL_HOST)
        email.setSmtpPort(configurationService.configValue(CONFIG.EMAIL_PORT).toInt())
        email.setAuthenticator(
            DefaultAuthenticator(
                configurationService.configValue(CONFIG.EMAIL_USER),
                configurationService.configValue(CONFIG.EMAIL_PASSWORD)
            )
        )
        email.isSSLOnConnect = true
        email.setFrom(configurationService.configValue(CONFIG.EMAIL_USER))
        email.subject = subject
        email.setContent(body, "text/html")
        email.addTo(recipient)
        email.send()
    }

    private fun sendMockEmail(emailRecipient: String, emailSubjec: String, emailBody: String) {
        val tos = arrayListOf(emailRecipient)
        val from = configurationService.configValue(CONFIG.EMAIL_USER)

        val properties = System.getProperties()

        with(properties) {
            put("mail.smtp.host", configurationService.configValue(CONFIG.EMAIL_HOST))
            put("mail.smtp.port", configurationService.configValue(CONFIG.EMAIL_PORT))
            put("mail.smtp.starttls.enable", "true")
            put("mail.smtp.auth", "true")
        }

        val auth = object : Authenticator() {
            override fun getPasswordAuthentication() =
                PasswordAuthentication(from, configurationService.configValue(CONFIG.EMAIL_PASSWORD))
        }

        val session = Session.getDefaultInstance(properties, auth)

        val message = MimeMessage(session)

        with(message) {
            setFrom(InternetAddress(from))
            for (to in tos) {
                addRecipient(Message.RecipientType.TO, InternetAddress(to))
                subject = emailSubjec
                setContent(emailBody, "text/html; charset=utf-8")
            }
        }

        Transport.send(message)
    }
}