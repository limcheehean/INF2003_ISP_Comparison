from excel import Excel

company_filenames = ["AIA Plans.xlsx", "Great Eastern Plans.xlsx", "HSBC Plans.xlsx", "NTUC Income Plans.xlsx", "Prudential Plans.xlsx", "Singlife Plans.xlsx"]
combined_filename = "database.xlsx"

combined_workbook = Excel(combined_filename)

for company_filename in company_filenames:
    company_workbook = Excel(f"Company Plans/{company_filename}")

    # Get company_id
    company_id = 0
    combined_workbook.set_sheet("Company")
    companies = combined_workbook.get_rows_as_list()
    for company in companies:
        if company.get("name") in company_filename:
            company_id = company.get("id")
            break

    # Add plans
    company_workbook.set_sheet("Plans")
    company_plans = company_workbook.get_cols_as_list()
    combined_workbook.set_sheet("Plan")
    combined_workbook.add_data_to_table(company_plans, {"Company.id": company_id})
    plans = combined_workbook.get_rows_as_list()
    plan_id_map = {plan.get("short_name"): plan.get("id") for plan in plans}

    # Add riders
    company_workbook.set_sheet("Riders")
    company_riders = company_workbook.get_cols_as_list()
    for rider in company_riders:
        rider["Plan.id"] = plan_id_map.get(rider.get("plan"))
    combined_workbook.set_sheet("Rider")
    combined_workbook.add_data_to_table(company_riders)
    riders = combined_workbook.get_rows_as_list()
    rider_id_map = {rider.get("short_name"): rider.get("id") for rider in riders}

    # Add plan benefit details
    company_workbook.set_sheet("Plan Benefits")
    company_plan_benefits = company_workbook.get_cols_as_list(skip_col=[1])
    company_plan_benefit_details = []
    for plan_benefit in company_plan_benefits:
        plan_id = plan_id_map.get(plan_benefit.get("header"))
        for key, value in plan_benefit.items():
            if key == "header" or not value or value == "-":
                continue
            company_plan_benefit_details.append({"Plan.id": plan_id, "PlanBenefit.id": key, "detail": value})
    combined_workbook.set_sheet("PlanBenefitDetail")
    combined_workbook.add_data_to_table(company_plan_benefit_details)

    # Add rider benefit details
    company_workbook.set_sheet("Rider Benefits")
    company_rider_benefits = company_workbook.get_cols_as_list(skip_col=[1])
    company_rider_benefit_details = []
    for rider_benefit in company_rider_benefits:
        rider_id = rider_id_map.get(rider_benefit.get("header"))
        for key, value in rider_benefit.items():
            if key == "header" or not value or value == "-":
                continue
            company_rider_benefit_details.append({"Rider.id": rider_id, "RiderBenefit.id": key, "detail": value})
    combined_workbook.set_sheet("RiderBenefitDetail")
    combined_workbook.add_data_to_table(company_rider_benefit_details)

    # Add plan premiums
    company_workbook.set_sheet("Plan Premiums")
    company_plan_premiums = company_workbook.get_cols_as_list()
    company_plan_premium_details = []
    for plan_premium in company_plan_premiums:
        plan_id = plan_id_map.get(plan_premium.get("Age"))
        for key, value in plan_premium.items():
            if key == "Age":
                continue
            company_plan_premium_details.append({"Plan.id": plan_id, "age": key, "amount": value})
    combined_workbook.set_sheet("PlanPremium")
    combined_workbook.add_data_to_table(company_plan_premium_details)

    # Add rider premiums
    company_workbook.set_sheet("Rider Premiums")
    company_rider_premiums = company_workbook.get_cols_as_list()
    company_rider_premium_details = []
    for rider_premium in company_rider_premiums:
        rider_id = rider_id_map.get(rider_premium.get("Age"))
        for key, value in rider_premium.items():
            if key == "Age":
                continue
            company_rider_premium_details.append({"Rider.id": rider_id, "age": key, "amount": value})
    combined_workbook.set_sheet("RiderPremium")
    combined_workbook.add_data_to_table(company_rider_premium_details)

    # Add deductible
    company_workbook.set_sheet("Deductible")
    company_deductibles = company_workbook.get_cols_as_list()
    company_deductible_details = []
    for deductible in company_deductibles:
        plan_id = plan_id_map.get(deductible.get("Ward"))
        if not plan_id:
            continue
        corresponding_deductible = next(filter(lambda d: d.get("Ward") == f"{deductible.get('Ward')}^", company_deductibles))
        for key, value in deductible.items():
            if key == "Ward":
                continue
            company_deductible_details.append({"Plan.id": plan_id, "ward_type": key, "amount_below_age_threshold": value, "amount_above_age_threshold": corresponding_deductible.get(key)})
    combined_workbook.set_sheet("Deductible")
    combined_workbook.add_data_to_table(company_deductible_details)

    # Add pro ration
    company_workbook.set_sheet("ProRation")
    company_pro_ration = company_workbook.get_cols_as_list()
    company_pro_ration_details = []
    for pro_ration in company_pro_ration:
        plan_id = plan_id_map.get(pro_ration.get("Ward"))
        for key, value in pro_ration.items():
            if key == "Ward" or not value:
                continue
            company_pro_ration_details.append({"Plan.id": plan_id, "ward_type": key, "amount": value})
    combined_workbook.set_sheet("ProRation")
    combined_workbook.add_data_to_table(company_pro_ration_details)

while True:
    try:
        combined_workbook.save(f"combined_database.xlsx")
        exit(0)
    except PermissionError:
        input("File is opened by another process, please close the file and press enter to continue")
