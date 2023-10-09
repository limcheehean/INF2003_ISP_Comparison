from CustomDictCursor import CustomDictCursor

standalone_plan_premiums_sql = """
SELECT p.age,
       p.amount AS plan_premium,
       m.amount + p.amount AS total,
       GREATEST(0, (p.amount - annual_withdrawal_limit)) AS cash_outlay
FROM medishieldlifepremium m, planpremium p
WHERE m.age = p.age
AND p.plan_id = %s;
"""

plan_rider_premiums_sql = """
SELECT p.age,
       p.amount AS plan_premium,
       r.amount AS rider_premium,
       m.amount + p.amount + r.amount AS total,
       GREATEST(0, (p.amount - annual_withdrawal_limit)) + r.amount AS cash_outlay
FROM medishieldlifepremium m, planpremium p, riderpremium r
WHERE m.age = p.age
AND m.age = r.age
AND p.plan_id = %s
AND r.rider_id = %s
"""


# Use this method to cache common queries that is unlikely to change
def get_common_data(collection, query, find=None):

    from app import mongo, db

    # Attempt to get from mongo first
    entry = mongo[collection].find_one(find, {'_id': False}) if find else [item for item in mongo[collection].find({}, {'_id': False})]

    # Not found in mongo, get from db
    if not entry:
        cursor = db.cursor(CustomDictCursor)
        cursor.execute(query)
        data = cursor.fetchall()
        mongo[collection].insert_many(data)
        entry = mongo[collection].find_one(find, {'_id': False}) if find else [item for item in mongo[collection].find({}, {'_id': False})]

    return entry


def get_premiums(db, request):

    plans = request.json.get("plans")
    cursor = db.cursor(CustomDictCursor)

    if not plans:
        return {"status": "error", "message": "No plans to compare"}, 400

    # Get Medishield Life data
    medishield_life = get_common_data("medishield_life", "SELECT age, amount, annual_withdrawal_limit from MediShieldLifePremium")

    comparisons = []

    # Get data for each plan + rider set
    for entry in plans:

        plan_id = entry.get("plan_id")
        rider_id = entry.get("rider_id")

        plan = get_common_data("plans", "SELECT * FROM plan", {"id": plan_id})

        # Standalone plan
        if rider_id is None:
            cursor.execute(standalone_plan_premiums_sql, (plan_id,))
            premiums = cursor.fetchall()
            comparisons.append({"plan": plan, "premiums": premiums})
        # Plan + Rider
        else:
            rider = get_common_data("riders", "SELECT * FROM rider", {"id": rider_id})
            cursor.execute(plan_rider_premiums_sql, (plan_id, rider_id))
            premiums = cursor.fetchall()
            comparisons.append({"plan": plan, "rider": rider, "premiums": premiums})

    return {"status": "success", "data": {"medishield_life": medishield_life, "comparisons": comparisons}}
