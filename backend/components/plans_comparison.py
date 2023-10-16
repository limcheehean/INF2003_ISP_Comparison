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

# <?> Need names of riders? 
# If need, then have to add in {join rider on rider_id = rider.id}
# rbd.detail, rbd.name, rbd.rider_benefit_id, rbd.rider_id
riderbenefitsquery = """
SELECT rbd.detail, rb.name, rbd.rider_benefit_id, rbd.rider_id
from riderbenefitdetail AS rbd
join riderbenefit as rb 
    on rbd.rider_benefit_id = rb.id 
"""
riderbenefitsconditions = """
where rider_id = %s
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


def filter_by_ward(db, db_cursor, request):

    selectPlan_form_data = request.json
    ward_type = selectPlan_form_data["ward_type"]

    try:
        db_cursor.execute("SELECT * FROM PLAN WHERE ward_type = %s", ward_type)

        queried_plans = db_cursor.fetchall()

    except Exception as e:
        # Use , instead of +, as e is not a string
        print("Error: ", e)
        
def get_rider_benefits(db_cursor, request):
    
    request_data = request.json
    rider_ids = request_data["rider_ids"]
    not_first = 0
    generated_riderbenefitsquery = riderbenefitsquery
    for rider_id in rider_ids:
        if not_first:
            generated_riderbenefitsquery += " OR rider_id = %s"
        else:
            not_first = 1
            generated_riderbenefitsquery += " WHERE rider_id = %s" 
    generated_riderbenefitsquery += ";"
    print("Generated_riderbenefitsquery: ", generated_riderbenefitsquery)
            
    try:
        db_cursor.execute(generated_riderbenefitsquery, tuple(rider_ids))
        
        #Reference: https://stackoverflow.com/questions/43796423/python-converting-mysql-query-result-to-json
        row_headers=[x[0] for x in db_cursor.description] #this will extract row headers

        queried_riderbenefits = db_cursor.fetchall()
        
        json_data=[]
        for result in queried_riderbenefits:
            json_data.append(dict(zip(row_headers,result)))

    except Exception as e:
        print("Error: ", e)
        return {"status": "error", "message": "Database query failure"}
    
    #print("Json results: ", json_data)
    return json_data