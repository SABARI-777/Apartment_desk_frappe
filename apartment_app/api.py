# import frappe

# def redirect_after_login(login_manager):
#     user = frappe.session.user
#     roles = frappe.get_roles(user)

#     frappe.errprint(f"Logged in User: {user}")
#     frappe.errprint(f"Roles: {roles}")

#     if "User" in roles:
#         frappe.errprint("User role found")
#         frappe.local.response["home_page"] = "/app/resident_dashboard"