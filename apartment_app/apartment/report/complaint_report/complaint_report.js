frappe.query_reports["Complaint Report"] = {
    filters: [
        {
            fieldname: "from_date",
            label: "From Date",
            fieldtype: "Date"
        },
        {
            fieldname: "to_date",
            label: "To Date",
            fieldtype: "Date"
        },
        {
            fieldname: "block",
            label: "Block",
            fieldtype: "Select",
            options: "\nA\nB\nC\nD\nE"
        },
        {
            fieldname: "status",
            label: "Current Status",
            fieldtype: "Select",
            options: "\nPending\nInprogress\nCompleted"
        },
        {
            fieldname: "problem_category",
            label: "Problem Category",
            fieldtype: "Select",
            options: "\nPlumbing\nElectrical\nTech\nGas\nCleaning Services"
        },
        {
            fieldname: "priority",
            label: "Priority",
            fieldtype: "Select",
            options: "\nLow\nMedium\nHigh"
        },
        {
        fieldname: "late_count",
        label: "Late Work",
        fieldtype: "Select",
        options: "\n0\n1"
            }
    ]
};