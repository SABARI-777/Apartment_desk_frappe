import frappe
from frappe.utils import nowdate, getdate, date_diff

def hello_scheduler():

    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Scheduler",
        message="Hello from Scheduler"
    )

def check_pending():

    total = 0
    data = []

    residents = frappe.get_all("Resident", pluck="name")

    for resident_name in residents:
        resident = frappe.get_doc("Resident", resident_name)

        for row in resident.problems:
            if row.status == "pending":
                days = date_diff(nowdate(), getdate(row.date_time))

                if days > 2:    
                    total += 1
                    data.append(f"{row.problem_id} ({days} days)")

    if total == 0:
        return

    problem_list = "<br>".join(data)

    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Pending Complaints Older Than 2 Days",
        message=f"""
        <h3>Pending Complaints Report</h3>

        <p>The following complaints have been pending for more than <b>2 days</b>.</p>

        <b>Total Pending Complaints:</b> {total}

        <br><br>

        <b>Problem IDs:</b>

        <br><br>

        {problem_list}
        """
    )

def send_daily_faculty_report():

    data = frappe.db.sql("""
        SELECT
            p.problem_id AS problem_id,
            r.user_name AS resident_name,
            p.category AS problem_category,
            tt.priority,
            tech.name AS technician_name,
            tt.status AS current_status,
            r.apartment_name AS apartment_name,
            tt.late_count

        FROM `tabTASK-ASSIGN` t

        JOIN `tabFaculty` f
            ON t.parent = f.name

        JOIN `tabproblems` p
            ON p.problem_id = t.problem_id

        JOIN `tabTech-tasks` tt
            ON tt.problem_id = t.problem_id

        JOIN `tabTechnician` tech
            ON tech.name = tt.parent

        JOIN `tabResident` r
            ON r.name = p.parent
    """, as_dict=True)

    if not data:
        return

    html = """
    <h2>Daily Apartment Management Report</h2>

    <table border="1" cellspacing="0" cellpadding="6">
        <tr>
            <th>Problem ID</th>
            <th>Resident</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Technician</th>
            <th>Status</th>
            <th>Apartment</th>
            <th>Late Count</th>
        </tr>
    """

    for row in data:
        html += f"""
        <tr>
            <td>{row.problem_id}</td>
            <td>{row.resident_name}</td>
            <td>{row.problem_category}</td>
            <td>{row.priority}</td>
            <td>{row.technician_name}</td>
            <td>{row.current_status}</td>
            <td>{row.apartment_name}</td>
            <td>{row.late_count}</td>
        </tr>
        """

    html += "</table>"

    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Daily Apartment Management Report",
        message=html,
        now = True
    )