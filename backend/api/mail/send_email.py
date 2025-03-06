import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from api.config import SMTP_USERNAME, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVER, EMAIL_HYPERTUBE, FRONT_URL
from api.login.security import create_token_user_for_mail_link, ACCESS_TOKEN_EXPIRE_MINUTES_RESET_PASSWORD
from api.users import models as user_models

import os
import aiosmtplib
from email.message import EmailMessage



async def send_email_reset_password(user: user_models.User):
    msg = EmailMessage()
    msg["From"] = EMAIL_HYPERTUBE
    msg["To"] = user.email
    msg["Subject"] = "Reset password"

    file_path = "/app/api/mail/templates/reset_password.html"
    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    access_token, token_type = create_token_user_for_mail_link(user, ACCESS_TOKEN_EXPIRE_MINUTES_RESET_PASSWORD)
    link = f"{FRONT_URL}/?access_token={access_token}&token_type={token_type}&context=reset_password"
    html_content = html_content.replace("{{LINK}}", link)
    print("Reset password link: ", link)

    msg.add_alternative(html_content, subtype="html")

    await aiosmtplib.send(
        msg,
        hostname=SMTP_SERVER,
        port=SMTP_PORT,
        username=SMTP_USERNAME,
        password=SMTP_PASSWORD,
        start_tls=True
    )
