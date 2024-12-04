import random

def generate_otp():
    return str(random.randint(100000, 999999))


__all__ = ["generate_otp"]
