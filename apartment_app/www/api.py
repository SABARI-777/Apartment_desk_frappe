import frappe
from frappe.utils import now_datetime

@frappe.whitelist(allow_guest=True)
def get_dashboard_data():
    data = {}

    counts = frappe.db.sql("""
        SELECT
            (SELECT COUNT(*) FROM `tabResident`) AS resident_count,
            (SELECT COUNT(*) FROM `tabTechnician`) AS technician_count,
            (SELECT COUNT(*) FROM `tabFaculty`) AS faculty_count
    """, as_dict=True)[0]

    data["resident_count"] = counts.resident_count
    data["technician_count"] = counts.technician_count
    data["faculty_count"] = counts.faculty_count



    meta = frappe.get_meta("Technician skill")
    services = meta.get_field("skill").options.strip().split("\n")

    counts = frappe.db.sql("""
        SELECT
            skill,
            COUNT(*) AS count
        FROM `tabTechnician skill`
        GROUP BY skill
    """, as_dict=True)

    count_map = {d.skill: d.count for d in counts}

    data["service_count"] = [
        {
            "service": service,
            "count": count_map.get(service, 0)
        }
        for service in services
    ]

    current_time = now_datetime()

    announcements = frappe.db.sql("""
        SELECT
            ad.apartment_name,
            ac.message,
            ac.from_date,
            ac.to_date
        FROM `tabannouncement` ac
        INNER JOIN `tabapartment_details` ad
            ON ac.parent = ad.name
        WHERE ac.to_date >= %s
        ORDER BY ad.apartment_name, ac.from_date DESC
    """, (current_time,), as_dict=True)

    announcement_data = {}

    for row in announcements:
        announcement_data.setdefault(row.apartment_name, []).append({
            "message": row.message,
            "from_date": row.from_date,
            "to_date": row.to_date
        })

    data["announcements"] = announcement_data

    

    return data