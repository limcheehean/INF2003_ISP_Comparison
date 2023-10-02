import toml
from flask import Flask, request, session
from flask_mail import Mail
from flask_pymongo import PyMongo
from flaskext.mysql import MySQL

from components.account_management import login_user, logout_user, handle_signup, handle_signup_confirmation

app = Flask(__name__)
app.config.from_file("config.toml", load=toml.load)
mail = Mail(app)
db = MySQL(app).connect().cursor()
mongo = PyMongo(app).db


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route("/api/login", methods=["POST"])
def login():
    return login_user((db, mongo), request.json)


@app.route("/api/logout", methods=["GET"])
def logout():
    return logout_user(mongo)


@app.route('/api/signup', methods=['POST'])
def signup():
    """ Signup API

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
        Invalid/Bad email, password or name. (Will return error messages "Invalid email" or "Invalid password")
    403:
        Existing account with email already exists.
    """
    return handle_signup(request)


@app.route('/join/<path:signup_uuid>')
def signup_confirmation(signup_uuid):
    return handle_signup_confirmation(signup_uuid)


if __name__ == '__main__':
    app.run()
