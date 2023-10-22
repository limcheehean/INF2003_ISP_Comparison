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

planbenefitdetailquery = """
SELECT pbd.detail, pb.name, pbd.plan_benefit_id, pbd.plan_id
FROM planbenefitdetail AS pbd
JOIN planbenefit as pb
    ON pbd.plan_benefit_id = pb.id
WHERE pbd.plan_id in ("""

plannamequery = """
SELECT p.id, p.name
FROM plan AS p
WHERE p.id in ("""

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

def filter_by_company(db, db_cursor, request):

    selectPlan_form_data = request.json
    company_id = selectPlan_form_data["company_name"]

    try:
        db_cursor.execute("SELECT * FROM PLAN WHERE company_id = %s", company_id)

        queried_plans = db_cursor.fetchall()

    except Exception as e:
        # Use , instead of +, as e is not a string
        print("Error: ", e)

def filter_by_policylimit(db, db_cursor, request):

    selectPlan_form_data = request.json
    policyLimit = selectPlan_form_data["policy_year_limit"]

    try:
        db_cursor.execute("SELECT * FROM PLAN WHERE policy_year_limit = %s", policyLimit)

        queried_plans = db_cursor.fetchall()

    except Exception as e:
        # Use , instead of +, as e is not a string
        print("Error: ", e)

def get_plan_benefits(db_cursor, request):
    '''
    Duplicated over from get_rider_benefits.

    This method performs 2 queries:
        one to get the plan benefits, while another to get the plan names.

    It dynamically generates the queries based on the number of rider ids provided.

    Parameterized queries are used to prevent sql injection.
    '''

    request_data = request.json
    plan_ids = request_data["plan_ids"]

    # Add in the conditions (i.e. what plan ids to look for) into the plan benefit query
    not_first = 0
    #  Variables to store generated queries
    generated_planbenefitsquery = planbenefitdetailquery
    generated_plannamequery = plannamequery
    #   Start adding in rider_ids into the queries
    for plan_id in plan_ids:
        if not_first:
            generated_planbenefitsquery += " , %s"
            generated_plannamequery += " , %s"
        else:
            not_first = 1
            generated_planbenefitsquery += "%s"
            generated_plannamequery += "%s"
    generated_planbenefitsquery += ") ORDER BY pbd.plan_id;"
    generated_plannamequery += ");"
    print("Generated_planbenefitsquery: ", generated_planbenefitsquery)
    print("Generated_plannamequery: ", generated_plannamequery)

    try:
        # Execute queries
        #   Get plan benefits from database
        db_cursor.execute(generated_planbenefitsquery, tuple(plan_ids))

        #   Reference: https://stackoverflow.com/questions/43796423/python-converting-mysql-query-result-to-json
        details_row_headers=[x[0] for x in db_cursor.description] #this will extract row headers

        print("Row headers: ", details_row_headers)

        queried_planbenefits = db_cursor.fetchall()

        #   Get plan names
        db_cursor.execute(generated_plannamequery, tuple(plan_ids))
        details_row_headers=[x[0] for x in db_cursor.description] #this will extract row headers
        print("Row headers: ", details_row_headers)
        queried_plannames = db_cursor.fetchall()

        # Organize the data for table use
        # Derive 3 types of data: Rows, columns, and cells
        plan_benefit_details = []
        plan_benefits = {}
        plans = {}

        # Get plans
        for result in queried_plannames:
            plans[result[0]] = ({
                "plan_id": result[0],
                "plan_name": result[1]
            }
            )
        # Get rider benefits and rider_benefit_details (cell data)
        for result in queried_planbenefits:
            if not plan_benefits.get(result[2]): plan_benefits[result[2]] = { "plan_benefit_id": result[2], "plan_benefit_name": result[1]}
            plan_benefit_details.append({
                "plan_id": result[3],
                "plan_benefit_id": result[2],
                "detail": result[0]
            })

        # Convert to json format
        json_data = {
            "plan_benefits": list(plan_benefits.values()),
            "plans": list(plans.values()),
            "plan_benefit_details": plan_benefit_details
        }

    except Exception as e:
        print("Error: ")
        print(e)
        return {"status": "error", "message": "Database query failure"}

    return {"status": "success", "data": json_data}

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
    #  Variables to store generated queries
    generated_riderbenefitsquery = riderbenefitdetailquery 
    generated_ridernamequery = ridernamequery
    #   Start adding in rider_ids into the queries
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
        # Execute queries 
        #   Get rider benefits from database
        db_cursor.execute(generated_riderbenefitsquery, tuple(rider_ids))
        
        #   Reference: https://stackoverflow.com/questions/43796423/python-converting-mysql-query-result-to-json
        details_row_headers=[x[0] for x in db_cursor.description] #this will extract row headers
        
        print("Row headers: ", details_row_headers)

        queried_riderbenefits = db_cursor.fetchall()
        
        #   Get rider names
        db_cursor.execute(generated_ridernamequery, tuple(rider_ids))
        details_row_headers=[x[0] for x in db_cursor.description] #this will extract row headers
        print("Row headers: ", details_row_headers)
        queried_ridernames = db_cursor.fetchall()
        
        # Organize the data for table use
        # Derive 3 types of data: Rows, columns, and cells
        rider_benefit_details = []
        rider_benefits = {}
        riders = {}
        
        # Get riders
        for result in queried_ridernames:
            riders[result[0]] = ({
                "rider_id": result[0],
                "rider_name": result[1]
            }
            )
        # Get rider benefits and rider_benefit_details (cell data)
        for result in queried_riderbenefits:
            if not rider_benefits.get(result[2]): rider_benefits[result[2]] = { "rider_benefit_id": result[2], "rider_benefit_name": result[1]}
            rider_benefit_details.append({
                "rider_id": result[3],
                "rider_benefit_id": result[2],
                "detail": result[0]
            })
        
        # Convert to json format
        json_data = {
            "rider_benefits": list(rider_benefits.values()),
            "riders": list(riders.values()),
            "rider_benefit_details": rider_benefit_details
        }

    except Exception as e:
        print("Error: ")
        print(e)
        return {"status": "error", "message": "Database query failure"}

    return {"status": "success", "data": json_data}