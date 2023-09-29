from flask import Flask, request, url_for

#!pip install Flask-Mail
from flask_mail import Mail, Message

# utility functions
from utility import email_check, password_check, hash_password
import uuid

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'

@app.route('/signup', methods = ['POST'])
def signup():
    signup_form_data = request.form
    signup_email = signup_form_data['email']
    signup_password = signup_form_data['password']
    
    # Add in some email & password validation
    normalized_email = email_check(signup_email, deliverability=True)
    if not normalized_email:
        return "Invalid email", 400
    
    if (not password_check(signup_password)["password_ok"]):
        print(password_check(signup_password))
        return "Bad password", 400
    
    #   Store normalized email
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

    print("Sign up email: ", signup_email)
    print("Sign up password: ", signup_password)
    print("Hashed password: ", hashed_password)
    print("Sign up UUID: ", str(signup_uuid))
    print("Sign up confirmation link: ", signup_confirmation_link)

    # Send confirmation email

    # Can choose to redirect to other pages with render_template('page.html')
    return "Signup request received"
 
@app.route('/join/<path:signup_uuid>')
def signup_confirmation(signup_uuid):
    print("UUID received: ", signup_uuid)
    

    return "Confirmation received"
    
if __name__ == '__main__':
    app.run()
