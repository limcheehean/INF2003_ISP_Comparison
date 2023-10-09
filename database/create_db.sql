DROP DATABASE IF EXISTS isp_comparison;

CREATE DATABASE isp_comparison;

USE isp_comparison;

# The relationship to 'Plan' is one is to one (or many)
CREATE TABLE Company (
    id INT PRIMARY KEY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    short_name VARCHAR(255),
    website VARCHAR(255),
    brochure VARCHAR(255)
);


# The relationship to 'Company' is one (and only one)
# The relationship to 'Deductible' is one is to one (or many)
# The relationship to 'ProRation' is one is to one (or many)
# The relationship to 'PlanBenefitDetail' is one is to one (or many)
# The relationship to 'PlanPremium' is one is to one (or many)
# The relationship to 'UserPlan' is zero to many
# The relationship to 'Rider' is one is to one (or many)

CREATE TABLE Plan (
    id INT PRIMARY KEY KEY AUTO_INCREMENT,
    company_id INT,
    name VARCHAR(255),
    short_name VARCHAR(255),
    ward_type VARCHAR(255),
    policy_year_limit INT,
    co_insurance DECIMAL(15, 2),
    deductible_change_age INT,
    FOREIGN KEY (company_id) REFERENCES Company(id)
);


# The relationship to 'Plan' is one (and only one)
CREATE TABLE Deductible (
    id INT PRIMARY KEY KEY AUTO_INCREMENT,
    plan_id INT,
    ward_type VARCHAR(255),
    amount DECIMAL(15, 2),
    amount_senior DECIMAL(15, 2),
    FOREIGN KEY (plan_id) REFERENCES Plan(id)
);


# The relationship to 'Plan' is one (and only one)
CREATE TABLE PlanPremium (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT,
    age INT,
    amount DECIMAL(15, 2),
    FOREIGN KEY (plan_id) REFERENCES Plan(id)
);


# The relationship to 'Plan' is one (and only one)
CREATE TABLE ProRation (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT,
    ward_type VARCHAR(255),
    amount DECIMAL(15, 2),
    FOREIGN KEY (plan_id) REFERENCES Plan(id)
);

CREATE TABLE PlanBenefit (
    id INT PRIMARY KEY  AUTO_INCREMENT,
    name VARCHAR(255)
);

# The relationship to 'Plan' is one (and only one)
# The relationship to 'PlanBenefit' is one (and only one)
CREATE TABLE PlanBenefitDetail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT,
    plan_benefit_id INT,
    detail VARCHAR(511),
    FOREIGN KEY (plan_id) REFERENCES Plan(id),
    FOREIGN KEY (plan_benefit_id) REFERENCES PlanBenefit(id)
);


# The relationship to 'Plan' is one is to one and only.
# The relationship to 'RiderBenefitDetail' is one is to one (or many)
# The relationship to 'RiderPremium' is one is to one (or many)
# The relationship to 'UserPlan' is zero to many.
CREATE TABLE Rider (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT,
    name VARCHAR(255),
    short_name VARCHAR(255),
    deductible_coverage DECIMAL(15, 2),
    co_insurance_coverage DECIMAL(15, 2),
    co_payment_cap DECIMAL(15, 2),
    FOREIGN KEY (plan_id) REFERENCES Plan(id)
);


# The relationship to 'UserPlan' is zero to many.
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activated BOOLEAN NOT NULL,
    token VARCHAR(255),
    token_created DATETIME
);


# The relationship to 'Plan' is one and only one.
# The relationship to 'User' is one and only one.
# The relationship to 'Rider' is zero or one.
CREATE TABLE UserPlan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    plan_id INT,
    rider_id INT,
    insured_name VARCHAR(255),
    insured_dob DATETIME,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (plan_id) REFERENCES Plan(id),
    FOREIGN KEY (rider_id) REFERENCES Rider(id)
);


# The relationship to 'Rider' is one and only one.
CREATE TABLE RiderPremium (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rider_id INT,
    age INT,
    amount DECIMAL(15, 2),
    FOREIGN KEY (rider_id) REFERENCES Rider(id)
);


# The relationship to 'RiderBenefitDetail' is one is to one (or many)
CREATE TABLE RiderBenefit (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255)
);

# The relationship to 'RiderBenefit' table is one and only one.
CREATE TABLE RiderBenefitDetail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    detail VARCHAR(255),
    rider_id INT,
    rider_benefit_id INT,
    FOREIGN KEY (rider_id) REFERENCES Rider(id),
    FOREIGN KEY (rider_benefit_id) REFERENCES RiderBenefit(id)
);

CREATE TABLE MediShieldLifePremium (
    id INT PRIMARY KEY AUTO_INCREMENT,
    age INT,
    amount DECIMAL(15, 2),
    annual_withdrawal_limit DECIMAL(15, 2)
);