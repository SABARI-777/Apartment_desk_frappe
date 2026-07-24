# Copyright (c) 2026, sabari and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class announcement(Document):
	pass
@frappe.whitelist()
def get_announcement_details():
    apartments = frappe.get_all("apartment_details", pluck="name")

    data = {}

    for apartment in apartments:
        doc = frappe.get_doc("apartment_details", apartment)

        data[doc.apartment_name] = [
            {
                "message": announcement.message,
                "from_date": announcement.from_date,
				"to_date":announcement.to_date
            }
            for announcement in doc.announcement
        ]

    return data