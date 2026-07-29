# Copyright (c) 2026, sabari and contributors
# For license information, please see license.txt

# import frappe
from frappe import _


import frappe

def execute(filters=None):
    columns = [
        {"label": "Problem ID", "fieldname": "PROBLEM_ID", "fieldtype": "Data", "width": 120},
        {"label": "Problem Description", "fieldname": "problem", "fieldtype": "Data", "width": 250},
        {"label": "Priority", "fieldname": "priority", "fieldtype": "Data", "width": 100},
        {"label": "Initial Status", "fieldname": "initial_status", "fieldtype": "Data", "width": 120},
        {"label": "Complaint Date", "fieldname": "complaint_date", "fieldtype": "Date", "width": 110},
        {"label": "Problem Category", "fieldname": "problem_category", "fieldtype": "Data", "width": 150},
        {"label": "Faculty ID", "fieldname": "faculty_id", "fieldtype": "Data", "width": 120},
        {"label": "Faculty Email", "fieldname": "faculty_email", "fieldtype": "Data", "width": 180},
        {"label": "Technician Name", "fieldname": "technician_name", "fieldtype": "Data", "width": 150},
        {"label": "Technician Email", "fieldname": "technician_email", "fieldtype": "Data", "width": 180},
        {"label": "Technician Category", "fieldname": "technician_category", "fieldtype": "Data", "width": 150},
        {"label": "Current Status", "fieldname": "current_status", "fieldtype": "Data", "width": 120},
        {"label": "LastUpdate Date", "fieldname": "completed_date", "fieldtype": "Data", "width": 120},
        {"label": "Resident Name", "fieldname": "resident_name", "fieldtype": "Data", "width": 150},
        {"label": "Resident Email", "fieldname": "resident_email", "fieldtype": "Data", "width": 180},
        {"label": "Apartment Name", "fieldname": "Apartment_Name", "fieldtype": "Data", "width": 150},
        {"label": "Block", "fieldname": "BLOCK", "fieldtype": "Data", "width": 100},
    ]

    data = frappe.db.sql("""
    SELECT
        p.problem_id AS PROBLEM_ID,
        p.problem AS problem,
        tt.priority AS priority,
        'Pending' AS initial_status,
        DATE(p.date_time) AS complaint_date,
        p.category AS problem_category,
        f.faculty_id,
        f.email AS faculty_email,
        tech.name AS technician_name,
        tech.email AS technician_email,
        tech.category AS technician_category,
        tt.status AS current_status,
        CASE
            WHEN DATE(p.completed_date) IS NOT NULL
            THEN DATE(p.completed_date)
            ELSE 'NOT-COMPLETED'
        END AS completed_date,
        r.user_name AS resident_name,
        r.email AS resident_email,
        r.apartment_name AS Apartment_Name,
        r.block AS BLOCK

    FROM `tabTASK-ASSIGN` t

    JOIN `tabFaculty` f
        ON t.parent = f.name

    JOIN `tabproblems` p
        ON p.problem_id = t.problem_id

    JOIN `tabTech-tasks` tt
        ON tt.problem_id = t.problem_id

    JOIN `tabTechnician` tech
        ON tt.parent = tech.name

    JOIN `tabResident` r
        ON r.name = p.parent

       WHERE
            (
                (%(from_date)s IS NULL OR %(from_date)s = '')
                OR DATE(p.date_time) >= %(from_date)s
            )
        AND
            (
                (%(to_date)s IS NULL OR %(to_date)s = '')
                OR DATE(p.date_time) <= %(to_date)s
            )

        AND (%(block)s IS NULL
            OR %(block)s = ''
            OR r.block = %(block)s)

        AND (%(status)s IS NULL
            OR %(status)s = ''
            OR tt.status = %(status)s)

        AND (%(problem_category)s IS NULL
            OR %(problem_category)s = ''
            OR p.category = %(problem_category)s)

        AND (%(priority)s IS NULL
            OR %(priority)s = ''
            OR tt.priority = %(priority)s)

    """, {
        "from_date": filters.get("from_date"),
        "to_date": filters.get("to_date"),
        "block": filters.get("block"),
        "status": filters.get("status"),
        "problem_category": filters.get("problem_category"),
        "priority": filters.get("priority"),
    }, as_dict=True)



    return columns, data

def execute_snapshot_report(filters: dict | None = None):
	"""Return columns and data for the report.

	This is the main entry point for snapshot report. When 'Synced
	Report' is enabled in report, framework will call this method
	every time the report is refreshed or a filter is updated. It
	accepts the same filters as normal execute. But a utility method -
	get_latest_sync, is also imported.

	"""
	from frappe.database.duckdb.database import get_latest_sync

	columns = get_columns()
	data = get_data()

	return columns, data

def get_columns() -> list[dict]:
	"""Return columns for the report.

	One field definition per column, just like a DocType field definition.
	"""
	return [
		{
			"label": _("Column 1"),
			"fieldname": "column_1",
			"fieldtype": "Data",
		},
		{
			"label": _("Column 2"),
			"fieldname": "column_2",
			"fieldtype": "Int",
		},
	]


def get_data() -> list[list]:
	"""Return data for the report.

	The report data is a list of rows, with each row being a list of cell values.
	"""
	return [
		["Row 1", 1],
		["Row 2", 2],
	]
