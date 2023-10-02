from uuid import uuid4

from bcrypt import checkpw
from flask import session

invalid_email_password_error = {"status": "error", "message": "Invalid username or password"}, 401


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
