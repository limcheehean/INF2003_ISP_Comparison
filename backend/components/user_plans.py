from re import match
from flask import session
from pymysql import IntegrityError


def update_user_plans(db, mongo, request):

    data = request.json

    fields = [
        {"name": "plan_id", "required": True},
        {"name": "rider_id", "required": False},
        {"name": "insured_name", "required": True, "format": "uppercase"},
        {"name": "insured_dob", "required": True, "format": "date"},
    ]

    # Ensure fields are correct
    values = []
    for field in fields:
        name = field.get("name")
        value = data.get(name)
        if field.get("required") and not value:
            return {"status": "error", "message": f"{name} is required"}, 400
        if field.get("format") == "uppercase":
            value = value.upper()
        if field.get("format") == "date" and not match("^\\d{4}-\\d{2}-\\d{2}$", value):
            return {"status": "error", "message": f"Invalid date format for {name}"}
        values.append(value)

    # Already checked for login status in @require_login
    user_id = mongo.session.find_one({"session_id": session.get("uid")}).get("user_id")

    cursor = db.cursor()

    # Update existing plan
    if user_plan_id := data.get("id"):
        sql = "UPDATE UserPlan SET plan_id = %s, rider_id = %s, insured_name = %s, insured_dob = %s WHERE id = %s AND user_id = %s"
        values.extend([user_plan_id, user_id])

        try:
            count = cursor.execute(sql, values)

            # No rows affected
            if count != 1:
                raise IntegrityError()

        except IntegrityError:
            db.rollback()
            return {"status": "error", "message": "User plan update failed"}, 400

        # Update successful
        db.commit()
        return {"status": "successful", "message": "User plan updated successfully"}

    # Insert new plan
    sql = "INSERT INTO UserPlan (plan_id, rider_id, insured_name, insured_dob, user_id) VALUES (%s, %s, %s, %s, %s)"
    values.append(user_id)
    try:
        count = cursor.execute(sql, values)

        # No rows affected
        if count != 1:
            raise IntegrityError()

    except IntegrityError:
        db.rollback()
        return {"status": "error", "message": "User plan insert failed"}, 400

    db.commit()
    return {"status": "successful", "message": "User plan inserted successfully"}
