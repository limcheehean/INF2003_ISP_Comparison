from flask import Flask, request, url_for
import hashlib, uuid

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'

@app.route('/signup', methods = ['POST'])
def signup():
    signup_form_data = request.form
    signup_email = signup_form_data['email']
    signup_password = signup_form_data['password']

    # Hash password
    #   Using hashlib for SHA512 for now, may use bcrypt for better security in the future
    salt = uuid.uuid4().hex
    hashed_password = hashlib.sha512((signup_password + salt).encode('UTF-8')).hexdigest()

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
