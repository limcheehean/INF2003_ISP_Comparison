from datetime import datetime, timedelta
from functools import wraps
from uuid import uuid4

import toml

from bcrypt import checkpw, hashpw, gensalt
from flask import session, url_for, Flask
from flask_mail import Mail, Message
from flaskext.mysql import MySQL
from flask_pymongo import PyMongo



app = Flask(__name__)
app.config.from_file("/Users/alainpierre/IdeaProjects/INF2003_ISP_Comparison/backend/config.toml", load=toml.load)
mail = Mail(app)
db = MySQL(app).connect()
db_cursor = db.cursor()
mongo = PyMongo(app).db

############################
# Password functions #
############################

password_uuid_dict = {}

def handle_forgot_password(db, db_cursor, request):
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



    msg = Message("Password Reset Link", sender="inf2003ispcompare@outlook.sg", recipients=['alnes.paronda@gmail.com'])
    msg.body = "You are receiving this email as you have forgotten your password. Clink on this link to reset your password: " + forgotPwd_link
    mail.send(msg)

    password_uuid_dict.update({str(forgotPwd_token): datetime.now()})

    return 'Password reset link has been sent to your email!'


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

    return "Password has been reset."