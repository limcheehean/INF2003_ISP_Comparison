import toml
from flask import Flask, request, url_for
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
from flaskext.mysql import MySQL

from components.password_management import handle_forgot_password, handle_reset_token
from components.account_management import login_user, logout_user, handle_signup, handle_signup_confirmation, \
    require_login
from components.plans_comparison import get_premiums, get_rider_benefits

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

    - 403 Forbidden: Existing account with the provided email already exists.
        - JSON Body:
            - "status" (str): "error"
            - "message" (str): "An account with this email already exists"

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
    return handle_signup_confirmation(signup_token, db_cursor, signup_token)


@app.route('/api/forgotPassword', methods=['POST'])
def forgot_password():
    return handle_forgot_password(db, db_cursor, mail, request)


@app.route('/resetPassword/<path:reset_token>', methods=['POST'])
def reset_password(reset_token):
    return handle_reset_token(reset_token, db, db_cursor, request)

@app.route("/api/compare_premiums", methods=["POST"])
def compare_premiums():
    """ Compare Premiums API

    This API allows users to retrieve premiums for plans and riders.

    JSON Body Parameters:
    ---------------------
    - plans (list): List of objects containing plan_id and/or rider_id

    Return Codes:
    -------------
    - 200 OK: Successful signup.
        - JSON Body:
            - "status" (str): "success"
            - "data" (object): Object containing plan, rider and premium information

    Example Request:
    ---------------
    POST /compare_premiums
    Content-Type: application/json
    {
        "plans": [
            {
                "plan_id": 1,
                "rider_id": 1
            }
        ]
    }

    Example Response:
    ----------------
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
        "status": "success",
        "data": {
            "comparisons": [...]
            "plan": {...}
            "rider": {...}
        }
    }
    """
    return get_premiums(db, request)

# <?> Check if user is logged in?
@app.route("/api/get_rider_benefits", methods=["POST"])
def rider_benefits():
    """ Get Rider Benefits API

    This API allows users to retrieve relevant rider benefit details.

    JSON Body Parameters:
    ---------------------
    - rider_ids (list): List of objects containing rider_ids
    
    Example request body:
        {
            "rider_ids": [1,2,3]
        }

    Return Codes:
    -------------
    - 200 OK: Successfully retrieved data
        - JSON Body:
            - "status" (str): "success"
            - "data" (object): Object containing rider_benefits, riders, and rider_benefit_details
                    - "rider_benefits" (list): A list of rider benefits, which can be used as row labels.
                            (rider_benefit_id, rider_benefit_name)
                    - "riders" (list): A list of riders, which can be used as column headers.
                            (rider_id, rider_name)
                    - "rider_benefit_details" (object): List of rider benefit details 
                            (contains detail, rider_id, rider_benefit)
    
    Example on possible way to build table here:
    https://codesandbox.io/embed/material-ui-menu-test-forked-ykks5c?fontsize=14&hidenavigation=1&theme=dark

    Example Request:
    ---------------
    POST /api/get_rider_benefits
    Content-Type: application/json
    {
        "rider_ids": ["1","2","3"]
    }

    Example Response:
    ----------------
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
        "status": "success",
        "data": {
            "rider_benefit_details": [
                {
                    "detail": "Detail 1",
                    "rider_benefit_id": 1,
                    "rider_id": 1
                },
                ...
            },
            "riders": [
                {
                    "rider_id": 1,
                    "rider_name": "Rider A"
                },
                ...
            ]
            "rider_benefits": [
                {
                    "rider_benefit_id": 1,
                    "rider_benefit_name": "Outpatient benefit"
                },
                ...
            ]
        }
    }
    """
    return get_rider_benefits(db_cursor, request)
    

if __name__ == '__main__':
    app.run()
