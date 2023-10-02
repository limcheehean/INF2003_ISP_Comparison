from datetime import datetime
from uuid import uuid4

from bcrypt import checkpw, hashpw, gensalt
from flask import session
# utility functions
from utility import email_check, password_check, hash_password, name_check

from bcrypt import checkpw
from flask import session, url_for

from datetime import datetime


#####################
# Throwaway globals #
#####################
# Since database does not exist yet,
# this variable acts in place of the database, storing email verification link uuid and when email was sent
signup_uuid_dict = {}

############################
# Authentication functions #
############################

invalid_email_password_error = {"status": "error", "message": "Invalid username or password"}, 401


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

def handle_signup(db, db_cursor,request):
    signup_form_data = request.json
    signup_name = signup_form_data['name']
    signup_email = signup_form_data['email']
    signup_password = signup_form_data['password']
    
    # <!> Add max length validation for all 3 parameters
    
    # Name validation
    if not name_check(signup_name):
        return {"status": "error", "message":"Invalid name"}, 400 
    
    # Email & password validation
    normalized_email = email_check(signup_email, deliverability=True)
    if not normalized_email:
        return {"status": "error", "message":"Invalid email"}, 400
    
    if (not password_check(signup_password)["password_ok"]):
        print(password_check(signup_password))
        return {"status": "error", "message":"Password must have at least 8 characters, 1 symbol, 1 uppercase letter, 1 lowercase letter, and 1 digit"}, 400
    
    #   Store normalized email in variable
    signup_email = normalized_email

    #   Hash password
    hashed_password = hash_password(signup_password)

    # Generate UUID and email confirmation link
    #   (UUID is used in the confirmation link)
    #   Python's UUID4 uses urandom (cannot be seeded)
    signup_token = uuid4()
    signup_confirmation_link = url_for('signup_confirmation', _external = True, signup_token = str(signup_token)) 

    token_created = datetime.now()
    # Store signup details (name, normalized email, hashed password), sign up UUID, into database
    # <!> consider hashing the UUID
    #   <!> Check if email already exists or not
    try:
        db_cursor.execute("INSERT INTO USER (name, email, password_hash, activated, token, token_created) "
                f"VALUES('{signup_name}', '{normalized_email}', '{hashed_password}', false, '{signup_token}', '{token_created.strftime('%Y-%m-%d %H:%M:%S')}') ")
        
        db.commit()
    except Exception as e:
        print("Error: ", e)
        return {"status": "error", "message":"Invalid email, name or password"}, 400

    print("Sign up email: ", signup_email)
    print("Sign up name: ", signup_name)
    print("Sign up password: ", signup_password)
    print("Hashed password: ", hashed_password)
    print("Sign up UUID: ", str(signup_token))
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
    if (signup_token not in signup_uuid_dict):
        print(signup_uuid_dict)
        return "Invalid confirmation link", 403
    #   <!> If more than 10 mins passed, delete record, return error
    if ((datetime.now()-signup_uuid_dict[signup_token]).total_seconds() > 10 * 60):
        signup_uuid_dict.pop(signup_token)
        return "Confirmation link expired", 403
    
    print ((datetime.now()-signup_uuid_dict[signup_token]).total_seconds())
    signup_uuid_dict.pop(signup_token)
    
    # <!> Add user to database

    return "Confirmation received"