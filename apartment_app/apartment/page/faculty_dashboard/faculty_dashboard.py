import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def check_faculty():
    faculty = frappe.db.exists(
        "Faculty",
        {"email": frappe.session.user}
    )
    return faculty

@frappe.whitelist()
def get_faculty_details():
    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )
    return faculty


@frappe.whitelist()
def get_problems(start=0, page_length=10):
    start = int(start)
    page_length = int(page_length)

    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    assigned = [row.problem_id for row in faculty.task]
    data = []
    residents = frappe.get_all("Resident", pluck="name")

    for resident_name in residents:
        resident = frappe.get_doc("Resident", resident_name)
        for row in resident.problems:
            if row.status == "pending" and row.problem_id not in assigned:
                data.append({
                    "problem_id": row.problem_id,
                    "resisdents": resident.name,
                    "technicians": "-",
                    "status": row.status
                })


    total = len(data)
    data.reverse()
    paginated_data = data[start:start + page_length]

    return {
        "data": paginated_data,
        "total": total
    }


@frappe.whitelist()
def get_assigned_tasks(start=0, page_length=10):
    start = int(start)
    page_length = int(page_length)

    data = []
    technicians = frappe.get_all("Technician", pluck="name")

    for technician_name in technicians:
        technician = frappe.get_doc("Technician", technician_name)
        for row in technician.tasks:
            if row.status.lower() != "completed":
                data.append({
                    "problem_id": row.problem_id,
                    "resisdents": row.resident,
                    "technicians": technician.name,
                    "status": row.status,
                    "priority": row.priority,
                    "date": row.date,
                    "due_date":row.due_date
                })

    total = len(data)
    data.reverse()
    paginated_data = data[start:start + page_length]

    return {
        "data": paginated_data,
        "total": total
    }


@frappe.whitelist()
def get_problems_completed(start=0, page_length=10):
    start = int(start)
    page_length = int(page_length)

    data = []
    technicians = frappe.get_all("Technician", pluck="name")

    for technician_name in technicians:
        technician = frappe.get_doc("Technician", technician_name)
        for row in technician.tasks:
            if row.status.lower() == "completed":
                data.append({
                    "problem_id": row.problem_id,
                    "resisdents": row.resident,
                    "technicians": technician.name,
                    "status": row.status,
                    "priority": row.priority
                })

    total = len(data)
    data.reverse()
    paginated_data = data[start:start + page_length]

    return {
        "data": paginated_data,
        "total": total
    }


@frappe.whitelist()
def add_announcement(apartment_name, message, from_date, to_date):
    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    apartment = frappe.get_doc(
        "apartment_details",
        apartment_name
    )

    row = apartment.append("announcement", {})

    row.message = message
    row.from_date = from_date
    row.to_date = to_date

    apartment.save(ignore_permissions=True)

    return "Announcement Published Successfully"


@frappe.whitelist()
def get_apartments():
    return frappe.get_all(
        "apartment_details",
        fields=["name", "apartment_name"]
    )     


@frappe.whitelist()
def get_all_residents(start=0, page_length=10):
    start = int(start)
    page_length = int(page_length)

    residents = frappe.get_list(
        "Resident",
        fields=[
            "user_name",
            "moble_number",
            "apartment_name",
            "resident_number",
            "block",
            "resident_id"
        ],
        start=start,
        page_length=page_length
    )
    
    # residents.reverse()
    total = frappe.db.count("Resident")

    return {
        "data": residents,
        "total": total
    }


@frappe.whitelist()
def get_all_technician(start=0, page_length=10):
    start = int(start)
    page_length = int(page_length)

    technicians = frappe.get_list(
        "Technician",
        fields=[
            "name",
            "name1",
            "technician_id",
            "category",
            "phone",
            "email"
        ],
        start=start,
        page_length=page_length
    )
    # technicians.reverse()
    total = frappe.db.count("Technician")

    return {
        "data": technicians,
        "total": total
    }


@frappe.whitelist()
def get_problem_ids():
    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    assigned = [row.problem_id for row in faculty.task]
    data = []

    residents = frappe.get_all("Resident", pluck="name")

    for resident_name in residents:
        resident = frappe.get_doc("Resident", resident_name)
        for row in resident.problems:
            if row.status == "pending" and row.problem_id not in assigned:
                data.append({
                    "problem_id": row.problem_id,
                    "resident": resident.name,
                    "category": row.category
                })

    return data


@frappe.whitelist()
def assign_technician(problem_id, resident, technician, priority,due_date):
    technician_doc = frappe.get_doc("Technician", technician)

    row = technician_doc.append("tasks", {})

    row.problem_id = problem_id
    row.resident = resident
    row.date = frappe.utils.now_datetime()
    row.status = "pending"
    row.priority = priority
    row.due_date = due_date

    technician_doc.save(ignore_permissions=True)

    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    task = faculty.append("task", {})

    task.problem_id = problem_id
    task.resisdents = resident
    task.technicians = technician
    task.status = "Assign"

    faculty.save(ignore_permissions=True)

    return "Technician Assigned Successfully"
    