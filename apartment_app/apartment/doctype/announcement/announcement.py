# Copyright (c) 2026, sabari and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class announcement(Document):
    def after_insert(self):
		frappe.msgprint("NEW ANOUNNCEMENT ADDED")
	pass


@frappe.whitelist(allow_guest=True)
def get_announcement_details():

    apartments = frappe.get_all("apartment_details", pluck="name")

    current_time = now_datetime()

    data = {}

    for apartment in apartments:

        doc = frappe.get_doc("apartment_details", apartment)

        announcements = []

        for announcement in doc.announcement:

            if announcement.to_date and announcement.to_date >= current_time:

                announcements.append({
                    "message": announcement.message,
                    "from_date": announcement.from_date,
                    "to_date": announcement.to_date
                })

        if announcements:
            data[doc.apartment_name] = announcements

    return data