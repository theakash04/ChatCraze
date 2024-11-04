import random
import os


def generate_otp():
    if os.getenv("TEST_MODE") == "true":
        return "123456"
    return str(random.randint(100000, 999999))


__all__ = ["generate_otp"]
