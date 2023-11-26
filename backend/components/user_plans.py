from re import match
from flask import session
from pymysql import IntegrityError

from CustomDictCursor import CustomDictCursor

get_user_plans_sql = """
    SELECT u.id,
       u.insured_name,
       u.insured_dob,
       TIMESTAMPDIFF(YEAR, insured_dob, CURRENT_DATE) + 1 AS age_next_birthday,
       u.plan_id,
       u.rider_id,
       p.name AS plan_name,
       r.name AS rider_name,
       mp.amount AS medishield_life_premium,
       pp.amount AS plan_premium,
       rp.amount AS rider_premium,
       mp.amount + pp.amount + COALESCE(rp.amount, 0) AS total_premium,
       mp.amount + LEAST(annual_withdrawal_limit, pp.amount) AS payable_by_medisave,
       GREATEST(0, pp.amount - annual_withdrawal_limit) + COALESCE(rp.amount, 0) AS payable_by_cash
    FROM userplan u
    LEFT JOIN plan p ON u.plan_id = p.id
    LEFT JOIN rider r ON u.rider_id = r.id
    LEFT JOIN medishieldlifepremium mp
        ON TIMESTAMPDIFF(YEAR, insured_dob, CURRENT_DATE) + 1 = mp.age
    LEFT JOIN planpremium pp
        ON TIMESTAMPDIFF(YEAR, insured_dob, CURRENT_DATE) + 1 = pp.age
        AND pp.plan_id = u.plan_id
    LEFT JOIN riderpremium rp
        ON TIMESTAMPDIFF(YEAR, insured_dob, CURRENT_DATE) + 1 = rp.age
        AND rp.rider_id = u.rider_id
    WHERE user_id = %s
"""


def get_user_plan_data(db, mongo):

    user_id = mongo.session.find_one({"session_id": session.get("uid")}).get("user_id")

    cursor = db.cursor(CustomDictCursor)
    cursor.execute(get_user_plans_sql, (user_id,))
    user_plans = cursor.fetchall()

    grand_total_premiums = round((sum([user_plan.get("total_premium") for user_plan in user_plans])), 2)
    total_payable_by_medisave = round(sum([user_plan.get("payable_by_medisave") for user_plan in user_plans]), 2)
    total_payable_by_cash = round(sum([user_plan.get("payable_by_cash") for user_plan in user_plans]), 2)

    return {"status": "successful", "data": {
        "grand_total_premiums": grand_total_premiums,
        "total_payable_by_medisave": total_payable_by_medisave,
        "total_payable_by_cash": total_payable_by_cash,
        "user_plans": user_plans
    }}


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

def delete_user_plans(db, mongo, userplan_id):

    plan_ids = userplan_id

    values = []

    user_id = mongo.session.find_one({"session_id": session.get("uid")}).get("user_id")

    values.append(user_id)
    values.append(plan_ids)

    sql = "DELETE FROM userplan WHERE user_id = %s AND plan_id = %s"

    try:
        cursor = db.cursor()

        cursor.execute(sql, values)

        db.commit()

        return {"status": "successful", "message": "User plan deleted successfully"}

    except Exception as e:
        print("Error: ")
        print(e)
        return {"status": "error", "message": "Database query failure"}


