import toml
from flask import Flask, request, url_for
from flask_mail import Mail, Message
from flask_pymongo import PyMongo
from flaskext.mysql import MySQL

from components.co_payment_calculator import calculate_co_payment
from components.password_management import handle_forgot_password, handle_reset_token
from components.account_management import login_user, logout_user, handle_signup, handle_signup_confirmation, \
    require_login

from components.plans_comparison import get_premiums, get_rider_benefits, get_plan_benefits, filter_plans, filter_items
from components.user_plans import update_user_plans, get_user_plan_data


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
        "message": "Account activation link sent to email"
    }
"""
    return handle_signup(db, db_cursor, mail, request)


@app.route('/api/join/<path:signup_token>')
def signup_confirmation(signup_token):
    return handle_signup_confirmation(db, db_cursor, signup_token)


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
    - 200 OK: Premiums retrieved successfully
        - JSON Body:
            - "status" (str): "success"
            - "data" (object): Object containing table rows and columns

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
            "columns": [],
            "rows": []
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


@app.route("/api/get_plan_benefits", methods=["POST"])
def plan_benefits():
    return get_plan_benefits(db_cursor, request)


@app.route("/api/filter_plans", methods=["POST"])
def plans():
    """ Filter Plans API

    This API will filter the plans shown based on the users chosen company id or ward type.

    JSON Body Parameters:
    ---------------------
    - company_ids (list): List of objects containing company_ids
    - ward_type (list): List of objects containing ward_types

    Return Codes:
    -------------
    - 200 OK: Premiums retrieved successfully
        - JSON Body:
            - "status" (str): "success"
            - "data" (object): Object containing table rows and columns

    Example Request:
    ---------------
    POST /filter_plans
    Content-Type: application/json
    {
        "company_ids": ["1", "2"],
        "ward_types": []
    }

    Example Response:
    ----------------
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
        "status": "success",
        "data": {
                "details": [
                    {
                        "company_details": {
                            "company_id": 1,
                            "company_name": "AIA"
                        },
                        "plan_details": {
                            "plan_co_insurance": "10.00",
                            "plan_deductible_change_age": 81,
                            "plan_id": 1,
                            "plan_name": "HealthShield Gold Max A",
                            "plan_policy_year_limit": 2000000,
                            "plan_short_name": "A",
                            "plan_ward_type": "Private"
                        },
                        "rider_details": {
                            "rider_co_insurance_coverage": "0.95",
                            "rider_co_payment_cap": "3000.00",
                            "rider_deductible_coverage": "0.95",
                            "rider_id": 1,
                            "rider_name": "AIA Max VitalHealth A",
                            "rider_short_name": "A"
                        }
                    }
                ]}
    }
    """
    return filter_plans(db_cursor, request)


@app.route("/api/get_filter", methods=["POST"])
def get_filter():
    return filter_items(db, db_cursor, request)


@app.route("/api/co_payment", methods=["POST"])
def co_payment():
    """ Co-payment Calculator API

    This API allows users to calculate their co-payment amount for their hospital bill.

    JSON Body Parameters:
    ---------------------
    - total_bill (float): total hospital bill amount
    - plan_id: id of selected plan
    - rider_id: id of selected rider
    - age: age of insured
    - ward_type: ward class billed by hospital

    Return Codes:
    -------------
    - 200 OK: Premiums retrieved successfully
        - JSON Body:
            - "status" (str): "success"
            - "data" (object): Object containing data about the cash and claimable breakdown

    Example Request:
    ---------------
    POST /api/co_payment
    Content-Type: application/json
    {
        "total_bill": 200000,
         "plan_id": 3,
         "rider_id": 4,
        "age": 65,
        "ward_type": "B1"
    }

    Example Response:
    ----------------
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "data": {
        "cash_payment": 3000.0,
        "co_insurance": 9875.0,
        "co_payment": 3000.0,
        "covered": 197000.0,
        "deductible": 125.0,
        "over_limit": 0,
        "pro_ration": 0.0,
        "total_bill": 200000
      },
      "status": "success"
    }
    """
    return calculate_co_payment(request, db)


@app.route("/api/user_plans", methods=["GET"])
@require_login
def get_user_plans():
    return get_user_plan_data(db, mongo)


@app.route("/api/user_plans", methods=["POST"])
@require_login
def add_or_edit_user_plans():
    return update_user_plans(db, mongo, request)

@app.route("/api/user_plans/", methods=["Delete"])
@require_login
def delete_user_plans():
    return delete_user_plans(db, mongo, request)


if __name__ == '__main__':
    app.run()
