import toml
from flask import Flask, request, url_for, session

from datetime import datetime

from flaskext.mysql import MySQL
#!pip install Flask-Mail
from flask_mail import Mail, Message

from components.account_management import login_user, logout_user
# utility functions
from utility import email_check, password_check, hash_password
import uuid

app = Flask(__name__)
app.config.from_file("config.toml", load=toml.load)

mail = Mail(app)
db = MySQL(app).connect().cursor()

##############
# Mail Setup #
##############
# app.config.update(
#     MAIL_SERVER='smtp.office365.com',
#     MAIL_PORT=587,
#     MAIL_USE_TLS=True,
#     MAIL_USE_SSL=False,
#     MAIL_USERNAME = 'inf2003ispcompare@outlook.sg', # Can change
#     MAIL_PASSWORD = 'P@ssw0rdP@ssw0rd'
# )


#####################
# Throwaway globals #
#####################
# Since database does not exist yet,
# this variable acts in place of the database, storing email verification link uuid and when email was sent
signup_uuid_dict = {}

########
# APIs #
########


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route("/api/login", methods=["POST"])
def login():
    print(session.get("uid"))
    return login_user(db, request.json)


@app.route("/api/logout", methods=["GET"])
def logout():
    return logout_user()


@app.route('/signup', methods = ['POST'])
def signup():
    ''' Signup API
    
    Form Parameters
    ---------------
    name: str
        Name of user. Should contain only normal characters.
    email: str
        Email address of user. 
    password: str
        Password of user. Should have at least 8 characters, 1 symbol, 1 uppercase, 1 lowercase, digit
        
    Return code
    ----------------
    400: 
        Invalid/Bad email, password or name. (Will return error messages "Invalid email" or "Invalid password")
    403: 
        Existing account with email already exists.
    '''
    signup_form_data = request.form
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
    signup_uuid = uuid.uuid4()
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


@app.route('/join/<path:signup_uuid>')
def signup_confirmation(signup_uuid):
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


if __name__ == '__main__':
    app.run()
