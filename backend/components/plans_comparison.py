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

riderbenefitdetailquery = """
SELECT rbd.detail, rb.name, rbd.rider_benefit_id, rbd.rider_id
FROM riderbenefitdetail AS rbd
JOIN riderbenefit as rb 
    ON rbd.rider_benefit_id = rb.id
WHERE rbd.rider_id in ("""

ridernamequery = """
SELECT r.id, r.name
FROM rider AS r
WHERE r.id in ("""

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
    '''
    This method performs 2 queries: 
        one to get the rider benefits, while another to get the rider names. 
    
    It dynamically generates the queries based on the number of rider ids provided.
    
    Parameterized queries are used to prevent sql injection.
    '''
    
    request_data = request.json
    rider_ids = request_data["rider_ids"]
    
    # Add in the conditions (i.e. what rider ids to look for) into the rider benefit query
    not_first = 0
    #   Store query
    generated_riderbenefitsquery = riderbenefitdetailquery 
    generated_ridernamequery = ridernamequery
    #   Start adding in rider_ids into the query
    for rider_id in rider_ids:
        if not_first:
            generated_riderbenefitsquery += " , %s"
            generated_ridernamequery += " , %s"
        else:
            not_first = 1
            generated_riderbenefitsquery += "%s" 
            generated_ridernamequery += "%s"
    generated_riderbenefitsquery += ") ORDER BY rbd.rider_id;"
    generated_ridernamequery += ");"
    print("Generated_riderbenefitsquery: ", generated_riderbenefitsquery)
    print("Generated_ridernamequery: ", generated_ridernamequery)
         
    try:
        # Get rider benefits from database
        db_cursor.execute(generated_riderbenefitsquery, tuple(rider_ids))
        
        #Reference: https://stackoverflow.com/questions/43796423/python-converting-mysql-query-result-to-json
        details_row_headers=[x[0] for x in db_cursor.description] #this will extract row headers
        
        print("Row headers: ", details_row_headers)

        queried_riderbenefits = db_cursor.fetchall()
        
        # Get rider names
        db_cursor.execute(generated_ridernamequery, tuple(rider_ids))
        details_row_headers=[x[0] for x in db_cursor.description] #this will extract row headers
        print("Row headers: ", details_row_headers)
        queried_ridernames = db_cursor.fetchall()
        
        # Convert queried results into json
        #json_data=[]
        json_data = []
        rider_benefits = {}
        riders = {}
        for result in queried_ridernames:
            riders[result[0]] = ({
                "rider_id": result[0],
                "rider_name": result[1]
            }
            )
            '''
            json_data[result[0]] = ({
                "rider_id": result[0],
                "rider_name": result[1],
                "benefits": []
            })
            '''
        print("All rider layout: ", json_data)
        for result in queried_riderbenefits:
            if not rider_benefits.get(result[2]): rider_benefits[result[2]] = { "rider_benefit_id": result[2], "rider_benefit_name": result[1]}
            '''
            json_data[result[3]]["benefits"].append(
                {"rider_benefit_id": result[2],
                 "rider_id": result[3],
                    "detail": result[0]
                    }
            )
            '''
            json_data.append({
                "rider_id": result[3],
                "rider_benefit_id": result[2],
                "detail": result[0]
            })
        
        json_data = {
            "rider_benefits": list(rider_benefits.values()),
            "riders": list(riders.values()),
            "rider_benefit_details": json_data
        }
        
        #json_data.append(dict(zip(details_row_headers,result)))

    except Exception as e:
        print("Error: ")
        print(e)
        return {"status": "error", "message": "Database query failure"}

    return json_data