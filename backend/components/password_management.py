from datetime import datetime
from uuid import uuid4

from bcrypt import hashpw, gensalt
from flask import url_for
from flask_mail import Message
from utility import send_mail_async

password_uuid_dict = {}

############################
# Password functions #
############################

password_uuid_dict = {}


def handle_forgot_password(db, mail, request):

    db_cursor = db.cursor()

    forgotPwd_form_data = request.json

    # Check if 'email' key exists in the JSON data
    if not forgotPwd_form_data or 'email' not in forgotPwd_form_data:
        return {"status": "error", "message": "Email is missing from the request"}, 400

    forgotPwd_email = forgotPwd_form_data['email']

    print("lel: ", forgotPwd_email)

    frontend_base_url = 'localhost:3000'

    forgotPwd_token = uuid4()
    # forgotPwd_link = url_for('reset_password', _external=True, reset_token=str(forgotPwd_token))
    # forgotPwd_link = f'http://{frontend_base_url}{url_for("reset_password", reset_token=str(forgotPwd_token))}'

    forgotPwd_link = f'http://{frontend_base_url}/resetPassword/{forgotPwd_token}'

    print("link: ", forgotPwd_link)
    print("token: ", forgotPwd_token)

    token_created = datetime.now()

    try:
        db_cursor.execute("SELECT email FROM user WHERE email = %s", forgotPwd_email)

        user_email = db_cursor.fetchone()

        print("user: ", user_email)

        # Use parameterized query, which prevents sql injection, and also offers precompilation
        parameterized_update_query = """
         UPDATE user SET token = %s, token_created = %s WHERE email = %s
        """

        forgotPwd_tuple = (forgotPwd_token, token_created.strftime('%Y-%m-%d %H:%M:%S'), forgotPwd_email)

        db_cursor.execute(parameterized_update_query, forgotPwd_tuple)

        db.commit()
    except Exception as e:
        print("Error: ", e)
        return {"status": "error", "message": "Invalid email"}, 400


    msg = Message("Password Reset Link", sender=("ISP Comparison", "admin@ispcompare.spmovy.com"), recipients=[forgotPwd_email])
    msg.body = f"""
    Dear User,
    
    You are receiving this email because a request was made to reset the password associated with your account. If you did not make this request, please ignore this email or contact our support team immediately.
    To reset your password, please click on the link below:
    
    {forgotPwd_link}
    
    This link will expire in 10 mintues for security reasons.
    If you have any issues or did not request a password reset, please contact our support team at admin@ispcompare.spmovy.com.
    
    Best Regards,
    The ISP Comparison Team
    """
    #mail.send(msg)
    send_mail_async(mail,msg)


    password_uuid_dict.update({str(forgotPwd_token): datetime.now()})

    return {"status": "success", "message": "Password reset link has been sent to your email!"}, 200


def handle_reset_token(reset_token, db, request):
    print("UUID received: ", reset_token)

    db_cursor = db.cursor()

    resetPwd_form_data = request.json
    reset_password = resetPwd_form_data['password']
    reset_confirm_password = resetPwd_form_data['confirmPassword']

    #   Hash password
    hashed_password = hashpw(reset_password.encode("utf-8"), gensalt())
    print("hashed: ",hashed_password)

    if reset_password != reset_confirm_password:
        return "Passwords do not match!"

    try:
        db_cursor.execute("SELECT email FROM user WHERE token = %s", reset_token)

        user_email = db_cursor.fetchone()[0]

        print("Email: ", user_email)

        # Use parameterized query, which prevents sql injection, and also offers precompilation
        parameterized_update_query = """
         UPDATE user SET password_hash = %s, token = NULL, token_created = NULL WHERE email = %s
        """

        resetPwd_tuple = (hashed_password, user_email)

        db_cursor.execute(parameterized_update_query, resetPwd_tuple)

        db.commit()

    except Exception as e:
        print("Error: ", e)
        return {"status": "error", "message": "Invalid email"}, 400

    print((datetime.now() - password_uuid_dict[reset_token]).total_seconds())
    password_uuid_dict.pop(reset_token)

    return {"status": "success", "message": "Password has been reset."}, 200