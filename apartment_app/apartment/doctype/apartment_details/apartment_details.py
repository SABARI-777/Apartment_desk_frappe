# Copyright (c) 2026, sabari and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class apartment_details(Document):
	pass


# @frappe.whitelist()
# def get_announcement_details():
#     apart = frappe.get_single("apartment_details")

#     messages = []

#     for d in apart.announcement:
#         messages.append(d.message)

#     return {
#         "name": apart.apartment_name,
#         "message": messages
#     }