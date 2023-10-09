from json import load
from re import sub
from mysql.connector import connect
from excel import Excel


# Duplicate the db_connections.json file and name it db_connections_local.json
# DO NOT edit the db_connections.json or push db_connections_local.json to the repository!
with open("db_connections_local.json", "r") as file:
    db_connections = load(file)

# Select the database specified in the file
current_db = db_connections["local"]


def get_column_name(name):
    if name == "amount_below_age_threshold":
        return "amount"
    elif name == "amount_above_age_threshold":
        return "amount_senior"
    return sub("\\.", "_", sub("([a-z])([A-Z])", "\\1_\\2", name)).lower()


# Create database and tables
db = connect(**current_db)
cursor = db.cursor()

with open("create_db.sql", "r") as file:
    cursor.execute(file.read())

# Insert data
db = connect(database="isp_comparison", **current_db)
cursor = db.cursor()

workbook = Excel("combined_database.xlsx")
sheet_names = workbook.get_sheet_names()

for sheet_name in sheet_names:
    workbook.set_sheet(sheet_name)
    data = workbook.get_rows_as_list()
    if data:
        columns = [get_column_name(key) for key in data[0].keys()]
        sql = f"INSERT INTO {sheet_name} ({', '.join(columns)}) VALUES ({', '.join(['%s' for _ in columns])})"
        rows = [tuple(row.values()) for row in data]
        print(f"Inserting data into {sheet_name} table")
        # Uncomment (and comment the last line) for debug
        # print(sql)
        # for row in rows:
        #     print(row)
        #     cursor.execute(sql, row)
        cursor.executemany(sql, rows)

db.commit()
