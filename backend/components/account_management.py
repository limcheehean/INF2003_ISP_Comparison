from datetime import datetime
from uuid import uuid4

from bcrypt import checkpw, hashpw, gensalt
from flask import session

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
