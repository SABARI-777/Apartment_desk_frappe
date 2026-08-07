import frappe
from frappe.utils import nowdate, getdate, date_diff


def hello_scheduler():
    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Scheduler Test",
        message="Hello from Scheduler",
        now=True
    )


def check_pending():
    total = 0
    problem_items = []

    residents = frappe.get_all("Resident", pluck="name")

    for resident_name in residents:
        resident = frappe.get_doc("Resident", resident_name)

        for row in resident.problems:
            if row.status == "pending":
                days = date_diff(nowdate(), getdate(row.date_time))

                if days > 2:
                    total += 1

                    problem_items.append(
                        f"<li><b>{row.problem_id}</b> - Pending for {days} days</li>"
                    )

    if total == 0:
        return

    html = f"""
            <!DOCTYPE html>
            <html>
            <head>
            <style>

            body {{
                font-family: Arial, Helvetica, sans-serif;
                background: #f4f4f4;
                padding: 20px;
            }}

            .container {{
                max-width: 700px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,.1);
            }}

            .header {{
                background: #0d6efd;
                color: white;
                padding: 15px;
                font-size: 22px;
                font-weight: bold;
                border-radius: 5px;
            }}

            .summary {{
                margin-top: 20px;
                padding: 12px;
                background: #eef5ff;
                border-left: 5px solid #0d6efd;
            }}

            ul {{
                margin-top: 15px;
            }}

            li {{
                margin-bottom: 8px;
            }}

            .footer {{
                margin-top: 25px;
                font-size: 12px;
                color: #777;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            }}

            </style>
            </head>

            <body>

            <div class="container">

            <div class="header">
            Pending Complaints Report
            </div>

            <p>
            The following complaints have been pending for
            <strong>more than 2 days.</strong>
            </p>

            <div class="summary">
            <b>Total Pending Complaints:</b> {total}
            </div>

            <h3>Problem Details</h3>

            <ul>
            {''.join(problem_items)}
            </ul>

            <div class="footer">
            This is an automatically generated email from the Apartment Management System.
            </div>

            </div>

            </body>
            </html>
            """

    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Pending Complaints Older Than 2 Days",
        message=html,
        now=True
    )


def send_daily_faculty_report():

    data = frappe.db.sql("""
        SELECT
            p.problem_id,
            p.problem,
            tt.priority,
            tt.due_date,
            DATE(p.date_time) AS complaint_date,
            p.category AS problem_category,
            f.faculty_id,
            f.email AS faculty_email,
            tech.name AS technician_name,
            tech.email AS technician_email,
            tech.category AS technician_category,
            tt.status AS current_status,
            CASE
                WHEN p.completed_date IS NOT NULL
                THEN DATE(p.completed_date)
                ELSE 'NOT COMPLETED'
            END AS completed_date,
            tt.late_count,
            p.total_time,
            r.user_name AS resident_name,
            r.email AS resident_email,
            r.apartment_name,
            r.block

        FROM `tabTASK-ASSIGN` t

        INNER JOIN `tabFaculty` f
            ON t.parent = f.name

        INNER JOIN `tabproblems` p
            ON p.problem_id = t.problem_id

        INNER JOIN `tabTech-tasks` tt
            ON tt.problem_id = t.problem_id

        INNER JOIN `tabTechnician` tech
            ON tech.name = tt.parent

        INNER JOIN `tabResident` r
            ON r.name = p.parent

        ORDER BY p.date_time DESC
    """, as_dict=True)

    if not data:
        return

    html = """
    <html>
    <head>
    <style>

        body{
            font-family:Arial,Helvetica,sans-serif;
            background:#f4f6f9;
            padding:20px;
        }

        .container{
            background:#fff;
            padding:20px;
            border-radius:8px;
        }

        h2{
            text-align:center;
            color:#1f4e78;
        }

        table{
            width:100%;
            border-collapse:collapse;
            font-size:13px;
        }

        th{
            background:#1f4e78;
            color:white;
            padding:10px;
            border:1px solid #ddd;
        }

        td{
            padding:8px;
            border:1px solid #ddd;
        }

        tr:nth-child(even){
            background:#f8f9fa;
        }

    </style>
    </head>

    <body>

    <div class="container">

    <h2>Daily Apartment Management Report</h2>

    <table>

    <thead>

    <tr>
        <th>Problem ID</th>
        <th>Problem</th>
        <th>Resident</th>
        <th>Apartment</th>
        <th>Block</th>
        <th>Category</th>
        <th>Priority</th>
        <th>Due Date</th>
        <th>Technician</th>
        <th>Status</th>
        <th>Completed</th>
        <th>Late Count</th>
        <th>Total Time</th>
    </tr>

    </thead>

    <tbody>
    """

    for row in data:

        html += f"""
        <tr>

            <td>{row.problem_id or ""}</td>
            <td>{row.problem or ""}</td>
            <td>{row.resident_name or ""}</td>
            <td>{row.apartment_name or ""}</td>
            <td>{row.block or ""}</td>
            <td>{row.problem_category or ""}</td>
            <td>{row.priority or ""}</td>
            <td>{row.due_date or ""}</td>
            <td>{row.technician_name or ""}</td>
            <td>{row.current_status or ""}</td>
            <td>{row.completed_date or ""}</td>
            <td>{row.late_count or 0}</td>
            <td>{row.total_time or ""}</td>

        </tr>
    """

    html += f"""
            </tbody>

            </table>

            <br>

            <b>Total Complaints : {len(data)}</b>

            <br><br>

            This is an automatically generated report from the Apartment Management System.

            </div>

            </body>
            </html>
            """

    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Daily Apartment Management Report",
        message=html,
        now=True
    )


def overdue_check():

    data = frappe.db.sql("""
            SELECT
                p.parent AS resident,
                p.problem_id,
                tt.parent AS technician,
                tt.status,
                tt.priority,
                tt.due_date,
                DATE(p.date_time) AS complaint_date,
                p.completed_date

            FROM `tabproblems` p

            INNER JOIN `tabTech-tasks` tt
                ON p.problem_id = tt.problem_id

            WHERE p.over_due = 'Yes'

            ORDER BY tt.due_date ASC
        """, as_dict=True)

    if not data:
        return

    html = """
    <!DOCTYPE html>
    <html>

    <head>

    <style>

    body{
        font-family:Arial,Helvetica,sans-serif;
        background:#f4f6f9;
        padding:20px;
    }

    .container{
        background:#ffffff;
        padding:20px;
        border-radius:8px;
    }

    h2{
        text-align:center;
        color:#dc3545;
    }

    table{
        width:100%;
        border-collapse:collapse;
        font-size:13px;
    }

    th{
        background:#dc3545;
        color:white;
        padding:10px;
        border:1px solid #ddd;
    }

    td{
        padding:8px;
        border:1px solid #ddd;
    }

    tr:nth-child(even){
        background:#f8f9fa;
    }

    .footer{
        margin-top:20px;
        font-size:12px;
        color:#666;
    }

    </style>

    </head>

    <body>

    <div class="container">

    <h2>Overdue Complaints Report</h2>

    <table>

    <thead>

    <tr>

    <th>Resident</th>
    <th>Problem ID</th>
    <th>Technician</th>
    <th>Status</th>
    <th>Priority</th>
    <th>Due Date</th>
    <th>Complaint Date</th>
    <th>Completed Date</th>

    </tr>

    </thead>

    <tbody>
    """

    for row in data:
        html += f"""
        <tr>

        <td>{row.resident or ""}</td>
        <td>{row.problem_id or ""}</td>
        <td>{row.technician or ""}</td>
        <td>{row.status or ""}</td>
        <td>{row.priority or ""}</td>
        <td>{row.due_date or ""}</td>
        <td>{row.complaint_date or ""}</td>
        <td>{row.completed_date or "Not Completed"}</td>

        </tr>
        """

    html += f"""
        </tbody>

        </table>

        <br>

        <b>Total Overdue Complaints : {len(data)}</b>

        <div class="footer">

        This is an automatically generated report from the Apartment Management System.

        </div>

        </div>

        </body>

        </html>
        """

    frappe.sendmail(
        recipients=["sabari7091095@gmail.com"],
        subject="Overdue Complaints Report",
        message=html,
        now=True
    )
