from json import dumps
from time import time
from typing import Union

from CustomDictCursor import CustomDictCursor

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
def get_common_data(collection, query, find=None) -> Union[list, dict]:

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


def cache_set(collection, key, value):
    from app import mongo
    mongo[collection].insert_one({"key": dumps(key), "value": value})


def cache_get(collection, key):
    from app import mongo
    return (mongo[collection].find_one({"key": dumps(key)}, {"_id": False}) or {}).get("value")


def filter_items(db, request):
    request_data = request.json

    start = time()
    if data := cache_get("filter_items", request_data):
        print("filter_items cache hit")
        return {"status": "success", "data": data}
    print("filter_items cache miss")

    cursor = db.cursor(CustomDictCursor)

    company_ids = request_data.get("company_ids", [])
    ward_types = request_data.get("ward_types", [])
    plan_ids = request_data.get("plan_ids", [])

    company_sql = "SELECT id, name FROM Company"
    plan_sql = "SELECT id, name FROM Plan"
    rider_sql = "SELECT id, name, plan_id FROM Rider"

    where_ward_sql = f"ward_type IN ({', '.join('%s' for _ in range(len(ward_types)))})" if ward_types else None
    where_company_sql = f"company_id IN ({', '.join(['%s' for _ in range(len(company_ids))])})" if company_ids else None

    # Get companies
    cursor.execute(company_sql)
    companies = cursor.fetchall()

    # Get plans
    plan_where = " AND ".join([_ for _ in [where_ward_sql, where_company_sql] if _])
    plan_sql += f" WHERE {plan_where}" if plan_where else ""
    cursor.execute(plan_sql, tuple(ward_types + company_ids))
    plans = cursor.fetchall()
    filtered_plan_ids = [plan.get("id") for plan in plans]

    # Get riders
    plan_ids = list(set(plan_ids) & set(filtered_plan_ids)) if plan_ids else filtered_plan_ids
    rider_sql += f" WHERE plan_id IN ({', '.join(['%s' for _ in range(len(plan_ids))])})" if plan_ids else ""
    cursor.execute(rider_sql, tuple(plan_ids))
    riders = cursor.fetchall()

    data = {
        "wards": ["Private", "A", "B1"],
        "companies": companies,
        "plans": plans,
        "riders": riders
    }

    cache_set("filter_items", request_data, data)

    return {"status": "success", "data": data}


def get_child_columns_for_premiums_table(set_num, has_rider):
    child_columns = [
        {
            "name": f"set_{set_num}_plan_premium",
            "text": "Plan Premium",
        },
        {
            "name": f"set_{set_num}_total_premium",
            "text": "Total Premium"
        },
        {
            "name": f"set_{set_num}_cash_outlay",
            "text": "Cash Outlay"
        }
    ]
    if has_rider:
        child_columns.insert(1, {
            "name": f"set_{set_num}_rider_premium",
            "text": "Rider Premium"
        })
    return child_columns


def get_premiums(db, request):

    plans = request.json.get("plans")
    cursor = db.cursor(CustomDictCursor)

    if not plans:
        return {"status": "error", "message": "No plans to compare"}, 400

    columns = [
        {
            "name": "age",
            "text": "Age"
        },
        {
            "name": "medishield_life_premium",
            "text": "MediShield Life Premium"
        },
        {
            "name": "annual_withdrawal_limit",
            "text": "Annual Withdrawal Limit"
        }
    ]

    select_template_rider = """
        p?.amount AS set_?_plan_premium,
        r?.amount AS set_?_rider_premium,
        m.amount + p?.amount + r?.amount AS set_?_total_premium,
        GREATEST(0, p?.amount - annual_withdrawal_limit) AS set_?_cash_outlay
    """

    select_template_no_rider = """
        p?.amount AS set_?_plan_premium,
        m.amount + p?.amount AS set_?_total_premium,
        GREATEST(0, p?.amount - annual_withdrawal_limit) AS set_?_cash_outlay
    """

    from_template_rider = """
        PlanPremium p?,
        RiderPremium r?
    """

    from_template_no_rider = """
        PlanPremium p?
    """

    where_template_rider = """
        m.age = p?.age AND
        m.age = r?.age AND
        p?.plan_id = %s AND
        r?.rider_id = %s
    """

    where_template_no_rider = """
        m.age = p?.age AND
        p?.plan_id = %s
    """

    select_part = []
    from_part = []
    where_part = []
    params_part = []

    for _, plan in enumerate(plans):

        plan_id = plan.get("plan_id")
        rider_id = plan.get("rider_id")

        # Get plan and rider data
        plan = get_common_data("plans", "SELECT * FROM Plan", {"id": plan_id})
        rider = get_common_data("riders", "SELECT * FROM Rider", {"id": rider_id}) if rider_id else None

        # Add columns
        columns.append({
            "name": f"set_{_}",
            "text": f"{plan.get('name')}{' + ' + rider.get('name') if rider else ''}",
            "children": get_child_columns_for_premiums_table(_, rider is not None)
        })

        # Build sql query
        if rider:
            select_part.append(select_template_rider.replace("?", str(_)))
            from_part.append(from_template_rider.replace("?", str(_)))
            where_part.append(where_template_rider.replace("?", str(_)))
            params_part.append(plan_id)
            params_part.append(rider_id)
        else:
            select_part.append(select_template_no_rider.replace("?", str(_)))
            from_part.append(from_template_no_rider.replace("?", str(_)))
            where_part.append(where_template_no_rider.replace("?", str(_)))
            params_part.append(plan_id)

    # Combine queries
    query = f"""
        SELECT m.age, m.amount AS medishield_life_premium, m.annual_withdrawal_limit, {', '.join(select_part)}
        FROM MediShieldLifePremium m, {', '.join(from_part)}
        WHERE {' AND '.join(where_part)}
    """

    # To remove for prod
    print(query)
    print(params_part)

    cursor.execute(query, params_part)
    results = cursor.fetchall()

    return {"status": "success", "data": {"columns": columns, "rows": results}}


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