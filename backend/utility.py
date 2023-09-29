
'''Server utility files

Contains useful methods, such as email and password validation

    * email_check: Validates email
    * password_check: Checks password complexity
    
'''

#!pip install email-validator
#   Not only checks syntax, but also deliverability (queries DNS), and also normalizes email 
from email_validator import validate_email, EmailNotValidError

import re


def email_check(email, deliverability=False):
    """Validates email address, and returns normalized email address
    
        Parameters:
            email (str) -- email address to validate
            
            deliverability (bool) -- If true, will query the DNS to check email deliverability. Should not be used for login, but for account creation.
            
        Returns:
		    normalized_email (str): Normalized email address. However, if email is not valid, it returns None instead.
    """
    try:
        # Checks syntax and deliverability
        #   Note:
        emailinfo = validate_email(email, check_deliverability=deliverability)
        # Normalizes email
        email = emailinfo.normalized
        return email

    except EmailNotValidError as e:
        print(str(e))
        return None
    
# https://stackoverflow.com/questions/16709638/checking-the-strength-of-a-password-how-to-check-conditions#32542964
def password_check(password):
    """
    Verify the strength of 'password'
    Returns a dict indicating the wrong criteria
    A password is considered strong if:
        8 characters length or more
        1 digit or more
        1 symbol or more
        1 uppercase letter or more
        1 lowercase letter or more
    """

    # calculating the length
    length_error = len(password) < 8

    # searching for digits
    digit_error = re.search(r"\d", password) is None

    # searching for uppercase
    uppercase_error = re.search(r"[A-Z]", password) is None

    # searching for lowercase
    lowercase_error = re.search(r"[a-z]", password) is None

    # searching for symbols
    symbol_error = re.search(r"\W", password) is None

    # overall result
    password_ok = not ( length_error or digit_error or uppercase_error or lowercase_error or symbol_error )

    return {
        'password_ok' : password_ok,
        'length_error' : length_error,
        'digit_error' : digit_error,
        'uppercase_error' : uppercase_error,
        'lowercase_error' : lowercase_error,
        'symbol_error' : symbol_error,
    }
