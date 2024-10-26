import random


def generate_otp():
    verify_code = str(random.randint(100000, 999999))
    return verify_code


__all__ = ["generate_otp"]