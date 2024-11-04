def create_otp_mail_template(username: str, verifycode: str) -> str:
    return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
                .container {{ max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); }}
                .header {{ text-align: center; padding: 10px 0; background-color: #007bff; color: white; border-radius: 8px 8px 0 0; }}
                .content {{ padding: 20px; }}
                .otp {{ font-size: 24px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; }}
                .footer {{ text-align: center; font-size: 12px; color: #666; padding: 10px 0; border-top: 1px solid #eaeaea; }}
                @media (max-width: 600px) {{ .container {{ padding: 15px; }} .otp {{ font-size: 20px; }} }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>OTP Verification</h1>
                </div>
                <div class="content">
                    <p>Dear {username},</p>
                    <p>To complete your registration, please use the following One-Time Password (OTP):</p>
                    <div class="otp">{verifycode}</div>
                    <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                    <p>If you did not request this OTP, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 chatcraze. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    """


def create_verified_mail_template(username: str) -> str:
    return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Verified Successfully</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }}
                .container {{
                    max-width: 600px;
                    margin: auto;
                    background-color: #ffffff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    padding: 10px 0;
                    background-color: #28a745;
                    color: white;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    padding: 20px;
                }}
                .footer {{
                    text-align: center;
                    font-size: 12px;
                    color: #666;
                    padding: 10px 0;
                    border-top: 1px solid #eaeaea;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Account Verified Successfully!</h1>
                </div>
                <div class="content">
                    <p>Dear {username},</p>
                    <p>Congratulations! Your account has been verified successfully.</p>
                    <p>You can now enjoy all the features and benefits of our platform.</p>
                    <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 chatcraze. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    """




__all__ = [
    "create_otp_mail_template",
    "create_verified_mail_template",
]
