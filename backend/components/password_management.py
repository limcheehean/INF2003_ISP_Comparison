from datetime import datetime
from uuid import uuid4

from bcrypt import hashpw, gensalt
from flask import url_for
from flask_mail import Message

password_uuid_dict = {}

############################
# Password functions #
############################

password_uuid_dict = {}

def handle_forgot_password(db, db_cursor, request, mail):
    forgotPwd_form_data = request.json
    forgotPwd_email = forgotPwd_form_data['email']

    print("lel: ", forgotPwd_email)

    forgotPwd_token = uuid4()
    forgotPwd_link = url_for('reset_password', _external=True, reset_token=str(forgotPwd_token))

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

    msg = Message("Password Reset Link", sender=("ISP Comparison", "admin@ispcompare.spmovy.com"), recipients=forgotPwd_email)
    msg.body = "You are receiving this email as you have forgotten your password. Clink on this link to reset your password: " + forgotPwd_link
    mail.send(msg)

    password_uuid_dict.update({str(forgotPwd_token): datetime.now()})

    return {"status": "success", "message": "Password reset link has been sent to your email!"}, 200


def handle_reset_token(reset_token, db, db_cursor, request):
    print("UUID received: ", reset_token)
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
