from flask import Flask, request, url_for

#!pip install Flask-Mail
from flask_mail import Mail, Message

# utility functions
from utility import email_check, password_check, hash_password
import uuid

app = Flask(__name__)

##############
# Mail Setup #
##############
app.config.update(
    MAIL_SERVER='smtp.office365.com',
    MAIL_PORT=587,
    MAIL_USE_TLS=True,
    MAIL_USE_SSL=False,
    MAIL_USERNAME = 'inf2003ispcompare@outlook.sg', # Can change
    MAIL_PASSWORD = 'P@ssw0rdP@ssw0rd'
)

mail = Mail(app)

########
# APIs #
########

@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'

@app.route('/signup', methods = ['POST'])
def signup():
    ''' Signup API
    
    Form Parameters
    ---------------
    name: str
        Name of user. No need to be unique.
    email: str
        Email address of user. 
    password: str
        Password of user. Should have at least 8 characters, 1 symbol, 1 uppercase, 1 lowercase, digit
        
    Return code
    ----------------
    400: 
        Invalid email or password. (Will return error messages "Invalid email" or "Invalid password")
    403: 
        Existing account with email already exists.
    '''
    signup_form_data = request.form
    signup_name = signup_form_data['name']
    signup_email = signup_form_data['email']
    signup_password = signup_form_data['password']
    
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

    # Store signup details, sign up UUID, into database
    # <!> consider hashing the UUID
    #   Check if email already exists or not

    print("Sign up email: ", signup_email)
    print("Sign up password: ", signup_password)
    print("Hashed password: ", hashed_password)
    print("Sign up UUID: ", str(signup_uuid))
    print("Sign up confirmation link: ", signup_confirmation_link)

    # Send confirmation email
    '''
    msg = Message("Confirmation link",
                  sender="inf2003ispcompare@outlook.sg",
                  recipients=[signup_email])
    
    msg.body = "signup_confirmation_link is " + signup_confirmation_link
    mail.send(msg)
    '''
    
    # Can choose to redirect to other pages with render_template('page.html')
    return "Signup request received"
 
@app.route('/join/<path:signup_uuid>')
def signup_confirmation(signup_uuid):
    print("UUID received: ", signup_uuid)
    

    return "Confirmation received"
    
if __name__ == '__main__':
    app.run(debug=True)
