from os import environ


DATABASE_URL = environ['DATABASE_URL']
SECRET_KEY = environ["SECRET_KEY"]
SECRET_KEY_MAIL_LINK = environ["SECRET_KEY_MAIL_LINK"]
API_URL = environ["API_URL"]
FRONT_URL = environ["FRONT_URL"]

# Mailing with SMTP MailMug
SMTP_PORT = environ["SMTP_PORT"]
SMTP_SERVER = environ["SMTP_SERVER"]
SMTP_USERNAME = environ["SMTP_USERNAME"]
SMTP_PASSWORD = environ["SMTP_PASSWORD"]
EMAIL_HYPERTUBE = environ["EMAIL_HYPERTUBE"]

# Redis
REDIS_HOST = environ["REDIS_HOST"]
REDIS_PORT = environ["REDIS_PORT"]

# External streaming sources
TMDB_API_KEY = environ["TMDB_API_KEY"]
TMDB_API_BEARER_TOKEN = environ["TMDB_API_BEARER_TOKEN"]
# OMDB_API_KEY = environ["OMDB_API_KEY"]

# OAuth Credentials
OAUTH42_CLIENT_ID = environ["OAUTH42_CLIENT_ID"]
OAUTH42_CLIENT_SECRET = environ["OAUTH42_CLIENT_SECRET"]
OAUTH42_REDIRECT_URI = environ["OAUTH42_REDIRECT_URI"]

OAUTH_GOOGLE_CLIENT_ID = environ["OAUTH_GOOGLE_CLIENT_ID"]
OAUTH_GOOGLE_CLIENT_SECRET = environ["OAUTH_GOOGLE_CLIENT_SECRET"]
OAUTH_GOOGLE_REDIRECT_URI = environ["OAUTH_GOOGLE_REDIRECT_URI"]

OAUTH_GITHUB_CLIENT_ID = environ["OAUTH_GITHUB_CLIENT_ID"]
OAUTH_GITHUB_CLIENT_SECRET = environ["OAUTH_GITHUB_CLIENT_SECRET"]
OAUTH_GITHUB_REDIRECT_URI = environ["OAUTH_GITHUB_REDIRECT_URI"]
