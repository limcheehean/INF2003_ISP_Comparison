from uuid import uuid4

# utility functions
from utility import email_check, password_check, hash_password

from bcrypt import checkpw
from flask import session, url_for

from datetime import datetime

invalid_email_password_error = {"status": "error", "message": "Invalid username or password"}, 401


#####################
# Throwaway globals #
#####################
# Since database does not exist yet,
# this variable acts in place of the database, storing email verification link uuid and when email was sent
signup_uuid_dict = {}

############################
# Authentication functions #
############################

def login_user(db, data):

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
    if not checkpw(password, password_hash):
        return invalid_email_password_error

    # TODO: Save login status (in MongoDB)?
    session_id = uuid4()
    session["uid"] = session_id

    return {"status": "success", "message": "Login successful"}


def logout_user():
    return {}

def handle_signup(request):
    signup_form_data = request.json
    signup_name = signup_form_data['name']
    signup_email = signup_form_data['email']
    signup_password = signup_form_data['password']
    
    # <!> Name validation
    
    # Email & password validation
    normalized_email = email_check(signup_email, deliverability=True)
    if not normalized_email:
        return "Invalid email", 400
    
    if (not password_check(signup_password)["password_ok"]):
        print(password_check(signup_password))
        return "Bad password", 400
    
    #   Store normalized email in variable
    signup_email = normalized_email
    
    #   Hash password
    hashed_password = hash_password(signup_password)

    # Generate UUID and email confirmation link 
    #   (UUID is used in the confirmation link)
    #   Python's UUID4 uses urandom (cannot be seeded)
    signup_uuid = uuid4()
    signup_confirmation_link = url_for('signup_confirmation', _external = True, signup_uuid = str(signup_uuid)) 

    # <!> Store signup details (name, normalized email, hashed password), sign up UUID, into database
    # <!> consider hashing the UUID
    #   Check if email already exists or not

    print("Sign up email: ", signup_email)
    print("Sign up password: ", signup_password)
    print("Hashed password: ", hashed_password)
    print("Sign up UUID: ", str(signup_uuid))
    print("Sign up confirmation link: ", signup_confirmation_link)
    
    signup_uuid_dict.update({str(signup_uuid): datetime.now()})

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

def handle_signup_confirmation(signup_uuid):
    print("UUID received: ", signup_uuid)
    
    # <!> Check against database records for UUID, and check if it expired
    #   <!> If uuid does not exist
    if (signup_uuid not in signup_uuid_dict):
        print(signup_uuid_dict)
        return "Invalid confirmation link", 403
    #   <!> If more than 10 mins passed, delete record, return error
    if ((datetime.now()-signup_uuid_dict[signup_uuid]).total_seconds() > 10 * 60):
        signup_uuid_dict.pop(signup_uuid)
        return "Confirmation link expired", 403
    
    print ((datetime.now()-signup_uuid_dict[signup_uuid]).total_seconds())
    signup_uuid_dict.pop(signup_uuid)
    
    # <!> Add user to database

    return "Confirmation received"