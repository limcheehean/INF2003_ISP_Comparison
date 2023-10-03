import toml
from flask import Flask, request
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
from flaskext.mysql import MySQL

from components.password_management import handle_forgot_password, handle_reset_token
from components.account_management import login_user, logout_user, handle_signup, handle_signup_confirmation, \
    require_login


app = Flask(__name__)
app.config.from_file("config.toml", load=toml.load)
mail = Mail(app)
db = MySQL(app).connect()
db_cursor = db.cursor()
mongo = PyMongo(app).db


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route("/api/login", methods=["POST"])
def login():
    return login_user((db_cursor, mongo), request.json)


@app.route("/api/logout", methods=["GET"])
def logout():
    return logout_user(mongo)


@app.route("/api/check_login", methods=["GET"])
@require_login
def check_login():
    return {"status": "success"}


@app.route('/api/signup', methods=['POST'])
def signup():
    """ Signup API

    This API allows users to sign up for your service.

    JSON Body Parameters:
    ---------------------
    - name (str): Name of the user. Should contain only normal characters.
    - email (str): Email address of the user.
    - password (str): Password of the user. Should have at least 8 characters, 1 symbol, 1 uppercase letter, 1 lowercase letter, and 1 digit.

    Return Codes:
    -------------
    - 200 OK: Successful signup.
        - JSON Body:
            - "status" (str): "success"
            - "message" (str): "Signup successful"

    - 400 Bad Request: Invalid input.
        - JSON Body:
            - "status" (str): "error"
            - "message" (str): A descriptive error message.
                - Invalid email -> "Invalid email"
                - Invalid name -> "Invalid name"
                - Bad password -> "Password must have at least 8 characters, 1 symbol, 1 uppercase letter, 1 lowercase letter, and 1 digit"
                - Other -> "Invalid email, name, or password"

    - 409 Conflict: Existing account with the provided email already exists.
        - JSON Body:
            - "status" (str): "error"
            - "message" (str): "An account with this email already exists"
    
    - 429 Too Many Request: User re-registered with same email too soon
        - JSON Body:
            - "status" (str): "error"
            - "message" (str): "Account re-registration made too soon. Please try again later"

    Example Request:
    ---------------
    POST /signup
    Content-Type: application/json
    {
        "name": "John Doe",
        "email": "johndoe@example.com",
        "password": "P@ssw0rd"
    }

    Example Response:
    ----------------
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
        "status": "success",
        "message": "Signup successful"
    }
"""
    return handle_signup(db, db_cursor, mail, request)


@app.route('/join/<path:signup_token>')
def signup_confirmation(signup_token):
    """ Signup Confirmation API

    This API allows users to confirm their account registration and activate their account, with a signup token provided previously

    Path Parameters:
    ---------------------
    - signup_token (str): Account registration token

    Return Codes:
    -------------
    - 200 OK: Successful account activation.
        - JSON Body:
            - "status" (str): "success"
            - "message" (str): "Account successfully activated."

    - 403 Bad Request: Invalid input.
        - JSON Body:
            - "status" (str): "error"
            - "message" (str): A descriptive error message.
                - Invalid signup token -> "Invalid signup token."
                - Expired signup token -> "Confirmation link expired. Please register again."
    """
    return handle_signup_confirmation(db, db_cursor, signup_token)

@app.route('/api/forgotPassword', methods=['POST'])
def forgot_password():
    return handle_forgot_password(db, db_cursor, request)

@app.route('/resetPassword/<path:reset_token>', methods=['POST'])
def reset_password(reset_token):
    return handle_reset_token(reset_token, db, db_cursor, request)

if __name__ == '__main__':
    app.run()
