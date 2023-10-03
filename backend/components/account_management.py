from datetime import datetime, timedelta
from functools import wraps
from uuid import uuid4

from bcrypt import checkpw, hashpw, gensalt
from flask import session, url_for

# utility functions
from utility import email_check, password_check, hash_password, name_check

from flask_mail import Message

from flaskext.mysql import MySQL, pymysql

#####################
# Throwaway globals #
#####################
# Since database does not exist yet,
# this variable acts in place of the database, storing email verification link uuid and when email was sent
signup_uuid_dict = {}

############################
# Authentication functions #
############################


# Decorator for endpoints that require the user to be logged in
def require_login(f):
    @wraps(f)
    def wrap(*args, **kwargs):

        from app import mongo

        # Not logged in
        if not (session_id := session.get("uid")):
            return {"status": "unauthorised", "message": "You are not allowed to access this resource"}, 401

        login = mongo.session.find_one({"session_id": session_id})

        # Session expired
        # TODO: Get session timeout from config file
        if (login.get("logged_in") + timedelta(minutes=300)) < datetime.now():
            mongo.session.delete_one({"session_id": session_id})
            return {"status": "error", "message": "Your session has timed out, please login again"}, 400

        # Renew session and continue with function
        mongo.session.update_one({"session_id": session_id}, {"$set": {"login": datetime.now()}})
        return f(*args, **kwargs)

    return wrap


invalid_email_password_error = {"status": "error", "message": "Invalid username or password"}, 400


def login_user(databases, data):
    db, mongo = databases

    # Check both username and password exist
    if not (email := data.get("email")) or not (password := data.get("password")):
        return invalid_email_password_error

    # Get password from database
    count = db.execute("SELECT password_hash FROM user WHERE email = %s", email)

    # Email not found
    if count == 0:
        return invalid_email_password_error

    # Check password
    password_hash = db.fetchone()[0]
    if not checkpw(password.encode("utf-8"), password_hash.encode("utf-8")):
        return invalid_email_password_error

    # Save login session
    session_id = uuid4().hex
    session["uid"] = session_id
    mongo.session.insert_one({"session_id": session_id, "logged_in": datetime.now()})

    return {"status": "success", "message": "Login successful"}


def logout_user(mongo):

    mongo.session.delete_one({"session_id": session.get("uid")})
    session["uid"] = None

    return {"status": "success", "message": "Logout successful"}


def handle_signup(db: pymysql.Connection, db_cursor: pymysql.Connection.cursor, mail, request):
    signup_form_data = request.json
    signup_name = signup_form_data['name']
    signup_email = signup_form_data['email']
    signup_password = signup_form_data['password']

    # <!> Add max length validation for all 3 parameters

    # Name validation
    if not name_check(signup_name):
        return {"status": "error", "message": "Invalid name"}, 400

        # Email & password validation
    normalized_email = email_check(signup_email, deliverability=False)
    if not normalized_email:
        return {"status": "error", "message": "Invalid email"}, 400

    if not password_check(signup_password)["password_ok"]:
        print(password_check(signup_password))
        return {"status": "error",
                "message": "Password must have at least 8 characters, 1 symbol, 1 uppercase letter, 1 lowercase letter, and 1 digit"}, 400

    #   Store normalized email in variable
    signup_email = normalized_email

    #   Hash password
    hashed_password = hashpw(signup_password.encode("utf-8"), gensalt())

    # Generate UUID and email confirmation link
    #   (UUID is used in the confirmation link)
    #   Python's UUID4 uses urandom (cannot be seeded)
    signup_token = uuid4()
    signup_confirmation_link = url_for('signup_confirmation', _external=True, signup_token=str(signup_token))

    token_created = datetime.now()
    # Store signup details (name, normalized email, hashed password), sign up UUID, into database
    # <!> consider hashing the UUID
    #   <!> Check if email already exists or not
    try:
        
        # Use parameterized query, which prevents sql injection, and also offers precompilation
        parameterized_insert_query = """
        INSERT INTO USER (name, email, password_hash, activated, token, token_created)
        VALUES(%s, %s, %s, false, %s, %s)
        """
        signup_tuple = (signup_name, normalized_email, hashed_password, signup_token, token_created.strftime('%Y-%m-%d %H:%M:%S'))

        db_cursor.execute(parameterized_insert_query, signup_tuple)

        db.commit()
    except Exception as e: 
        
        if ("Duplicate entry" in e.args[1]):
            return {"status": "error", "message": "An account with this email already exists"}, 409
        else:
            print("Error: ", e)
            return {"status": "error", "message": "Invalid email, name or password"}, 400

    print("Sign up email: ", signup_email)
    print("Sign up confirmation link: ", signup_confirmation_link)

    # <!> To remove, once signup_confirmation switches to database as well
    signup_uuid_dict.update({str(signup_token): datetime.now()})

    # Send confirmation email
    
    '''
    msg = Message("Confirmation link",
                  sender="inf2003ispcompare@outlook.sg",
                  recipients=[signup_email])
    
    msg.body = "signup_confirmation_link is " + signup_confirmation_link
    mail.send(msg)
    '''

    # <!> Can choose to redirect to other pages with render_template('page.html')
    return "Signup request received"


def handle_signup_confirmation(signup_token):
    print("UUID received: ", signup_token)

    # <!> Check against database records for UUID, and check if it expired
    #   <!> If uuid does not exist
    if signup_token not in signup_uuid_dict:
        print(signup_uuid_dict)
        return "Invalid confirmation link", 403
    #   <!> If more than 10 mins passed, delete record, return error
    if (datetime.now() - signup_uuid_dict[signup_token]).total_seconds() > 10 * 60:
        signup_uuid_dict.pop(signup_token)
        return "Confirmation link expired", 403

    print((datetime.now() - signup_uuid_dict[signup_token]).total_seconds())
    signup_uuid_dict.pop(signup_token)

    # <!> Add user to database

    return "Confirmation received"
