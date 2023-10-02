import toml
from flask import Flask, request, session



#!pip install flaskext
#!pip install flask-mysql
from flaskext.mysql import MySQL
#!pip install Flask-Mail
from flask_mail import Mail, Message

from components.account_management import login_user, logout_user, handle_signup, handle_signup_confirmation

app = Flask(__name__)
app.config.from_file("config.toml", load=toml.load)
mail = Mail(app)
db = MySQL(app).connect()
db_cursor = db.cursor()

########
# APIs #
########


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route("/api/login", methods=["POST"])
def login():
    print(session.get("uid"))
    return login_user(db, db_cursor, request.json)


@app.route("/api/logout", methods=["GET"])
def logout():
    return logout_user()


@app.route('/api/signup', methods = ['POST'])
def signup():
    ''' Signup API
    
    JSON Body Parameters
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
        Invalid/Bad email, password or name.
        
        JSON Body
            "status": "error" 
            
            Invalid email -> "message": "Invalid email"
            
            Invalid name -> "message": "Invalid name"
            
            Bad password -> "message": "Bad password"
            
            Other: "message" -> "message": "Invalid email, name or password"
            
    403: 
        Existing account with email already exists.
    '''
    return handle_signup(db,db_cursor, request)



@app.route('/join/<path:signup_token>')
def signup_confirmation(signup_token):
    return handle_signup_confirmation(signup_token)


if __name__ == '__main__':
    app.run()
