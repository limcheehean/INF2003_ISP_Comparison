from CustomDictCursor import CustomDictCursor

co_payment_query = """
SELECT policy_year_limit,
       co_insurance,
       IF(%s < deductible_change_age, d.amount, d.amount_senior) AS deductible,
       COALESCE(pr.amount, 1) AS pro_ration,
       COALESCE(r.deductible_coverage, 0) AS deductable_coverage,
       COALESCE(r.co_insurance_coverage, 0) AS co_insurance_coverage,
       r.co_payment_cap
FROM Plan p
LEFT JOIN deductible d ON p.id = d.plan_id AND d.ward_type = %s
LEFT JOIN proration pr ON p.id = pr.plan_id AND pr.ward_type = %s
LEFT JOIN rider r ON r.id = %s
WHERE p.id = %s
"""


def calculate_co_payment(request, db):

    data = request.json

    total_bill = data.get("total_bill")
    if not total_bill:
        return {"status": "error", "message": "Total bill not specified"}, 400

    age = data.get("age")
    if not age:
        return {"status": "error", "message": "Age not specified"}, 400

    plan_id = data.get("plan_id")
    if not plan_id:
        return {"status": "error", "message": "Plan not specified"}, 400

    ward_type = data.get("ward_type")
    if not ward_type:
        return {"status": "error", "message": "Ward not specified"}, 400

    # Rider is optional
    rider_id = data.get("rider_id")
    cursor = db.cursor(CustomDictCursor)

    cursor.execute(co_payment_query, (age, ward_type, ward_type, rider_id, plan_id))
    policy_year_limit, co_insurance, deducible, pro_ration, deductible_coverage, co_insurance_coverage, co_payment_cap = cursor.fetchone().values()

    # Portion paid in cash due to ward class higher than plan
    pro_ration = total_bill * (1 - pro_ration)

    # Calculations will be performed on pro-rated bill
    pro_rated_bill = total_bill - pro_ration

    # Base amount payable before insurance kicks in
    deducible = min(pro_rated_bill, deducible)

    # Customer's split of the remaining bill
    co_insurance = (pro_rated_bill - deducible) * co_insurance * 0.01

    # Adjustment by rider
    co_insurance = co_insurance if not co_insurance_coverage else (pro_rated_bill - deducible) * (1 - co_insurance_coverage)
    deducible *= 1 - deductible_coverage

    # Total payable by customer (excluding pro-ration and over-limit)
    co_payment = min(co_payment_cap, deducible + co_insurance) if co_payment_cap else deducible + co_insurance

    # Total claimable
    covered = min(policy_year_limit, total_bill - pro_ration - co_payment)

    # Total paid by customer
    cash_payment = total_bill - covered

    # Amount exceeded annual limit
    over_limit = max(0, (total_bill - pro_ration - co_payment) - policy_year_limit)

    result = {
        "total_bill": total_bill,
        "pro_ration": pro_ration,
        "deductible": deducible,
        "co_insurance": co_insurance,
        "co_payment": co_payment,
        "over_limit": over_limit,
        "covered": covered,
        "cash_payment": cash_payment
    }

    result = {key: round(value, 2) if isinstance(value, float) else value for key, value in result.items()}

    return {"status": "success", "data": result}
