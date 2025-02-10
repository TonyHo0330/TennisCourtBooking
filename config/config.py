from datetime import timedelta
import string
import random

SECRET_KEY = ''.join(random.SystemRandom().choice(
    string.ascii_letters + string.digits) for _ in range(50))
PERMANENT_SESSION_LIFETIME = timedelta(hours=2)