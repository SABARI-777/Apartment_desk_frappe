import frappe
from frappe.model.document import Document

class Resident(Document):
    def before_insert(self):
        if "@gmail.com" not in self.email:
            frappe.throw("in Valid email plaese enter email with @gmail.com") 

    def after_insert(self):
        frappe.sendmail(
            recipients=[self.email],
            subject="Welcome to Our Apartment Desk",
            message=f"""
                <h3>Welcome, {self.user_name}!</h3>

                <p>Your User account has been created successfully.</p>

                <p>We wish you all the best in your Life.</p>

                <br>
                <h3>ONCE AGAIN WELCOME OUR RESIDENT !!!!! S</h3>
                <p>Regards,<br>
                APARTMENT Administration</p>
            """,
            now=True
        )
        frappe.msgprint("email send successfully")

@frappe.whitelist(allow_guest=True)
def get_residents_count():
    return frappe.db.count("Resident")