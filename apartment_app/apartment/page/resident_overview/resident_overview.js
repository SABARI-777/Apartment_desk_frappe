frappe.pages['resident_overview'].on_page_load = function (wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Resident Overview",
        single_column: true
    });

    $(page.body).html(`
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .overview-container {
        padding: 24px;
        background: #f8f9fa;
        min-height: 100vh;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

     .metric-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
        margin-bottom: 28px;
    }

    .metric-card {
        background: #fff;
        border-radius: 12px;
        padding: 20px 22px;
        box-shadow: 0 4px 20px 0 rgba(0,0,0,.05);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: transform .2s, box-shadow .2s;
    }
    .metric-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px 0 rgba(0,0,0,.08);
    }

    .metric-info h6 {
        margin: 0 0 6px 0;
        font-size: 12.5px;
        font-weight: 500;
        color: #7b809a;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    }
    .metric-info h3 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        color: #344767;
        letter-spacing: -0.3px;
    }
    .metric-info .change {
        font-size: 13px;
        margin-top: 6px;
        font-weight: 500;
    }
    .change.positive { color: #4caf50; }
    .change.negative { color: #f44336; }

    .metric-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 22px;
    }
    .icon-blue   { background: linear-gradient(195deg, #49a3f1, #1A73E8); }
    .icon-green  { background: linear-gradient(195deg, #66BB6A, #43A047); }
    .icon-orange { background: linear-gradient(195deg, #FFA726, #FB8C00); }
    .icon-red    { background: linear-gradient(195deg, #EF5350, #E53935); }

     .content-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
    }
    @media (max-width: 900px) {
        .content-row { grid-template-columns: 1fr; }
    }

    .card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px 0 rgba(0,0,0,.05);
        overflow: hidden;
    }
    .card-header {
        padding: 18px 22px 12px;
        border-bottom: 1px solid #f0f2f5;
    }
    .card-header h5 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #344767;
        letter-spacing: -0.2px;
    }
    .card-header small {
        color: #7b809a;
        font-size: 13px;
        font-weight: 400;
    }
    .card-body {
        padding: 18px 22px 22px;
    }

     .category-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .category-list li {
        padding: 10px 0;
        border-bottom: 1px solid #f0f2f5;
        font-size: 14.5px;
        font-weight: 500;
        color: #344767;
        display: flex;
        align-items: center;
    }
    .category-list li:last-child { border-bottom: none; }
    .category-list li::before {
        content: "";
        width: 8px;
        height: 8px;
        background: #1A73E8;
        border-radius: 50%;
        margin-right: 12px;
        flex-shrink: 0;
    }

     .announce-card {
        border: 1px solid #e9ecef;
        border-radius: 10px;
        margin-bottom: 16px;
        overflow: hidden;
    }
    .announce-card:last-child { margin-bottom: 0; }
    .announce-header {
        background: #f8f9fa;
        padding: 12px 16px;
        font-weight: 600;
        font-size: 14px;
        color: #344767;
        border-bottom: 1px solid #e9ecef;
    }
    .announce-body {
        padding: 14px 16px;
    }
    .announce-item {
        margin-bottom: 12px;
    }
    .announce-item:last-child { margin-bottom: 0; }
    .announce-item p {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 500;
        color: #344767;
    }
    .announce-item small {
        color: #7b809a;
        font-size: 12.5px;
        font-weight: 400;
    }

    .page-title {
        font-size: 22px;
        font-weight: 700;
        color: #344767;
        margin-bottom: 6px;
        letter-spacing: -0.4px;
    }
    .page-subtitle {
        color: #7b809a;
        font-size: 14px;
        font-weight: 400;
        margin-bottom: 24px;
    }
</style>

<div class="overview-container">
    <div class="page-title">Resident Overview</div>
    <div class="page-subtitle"> </div>

     <div class="metric-row">
        <div class="metric-card">
            <div class="metric-info">
                <h6>Total Residents</h6>
                <h3 id="count1">…</h3>
            </div>
            <div class="metric-icon icon-blue">
                <i class="fa fa-users"></i>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-info">
                <h6>Total Technicians</h6>
                <h3 id="count2">…</h3>
            </div>
            <div class="metric-icon icon-green">
                <i class="fa fa-wrench"></i>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-info">
                <h6>Total Faculties</h6>
                <h3 id="count3">…</h3>
            </div>
            <div class="metric-icon icon-orange">
                <i class="fa fa-graduation-cap"></i>
            </div>
        </div>

        <div class="metric-card">
            <div class="metric-info">
                <h6>Service Providing</h6>
                <h3 id="total_count">0</h3>
            </div>
            <div class="metric-icon icon-red">
                <i class="fa fa-cogs"></i>
            </div>
        </div>
    </div>

     <div class="content-row">
        <!-- Service Categories -->
        <div class="card">
            <div class="card-header">
                <h5>Service Categories</h5>
                 
            </div>
            <div class="card-body">
                <ul id="category_list" class="category-list"></ul>
            </div>
        </div>

        <!-- Announcements -->
        <div class="card">
            <div class="card-header">
                <h5>Apartment Announcements</h5>
               
            </div>
            <div class="card-body" id="announce2">
                <!-- filled by JS -->
            </div>
        </div>
    </div>
</div>
`);

     frappe.call({
        method: "apartment_app.apartment.doctype.resident.resident.get_residents_count",
        callback: function (r) {
            $("#count1").text(r.message);
        }
    });

     frappe.call({
        method: "apartment_app.apartment.doctype.technician.technician.get_Technician_count",
        callback: function (r) {
            $("#count2").text(r.message);
        }
    });

     frappe.call({
        method: "apartment_app.apartment.doctype.faculty.faculty.get_faculty_count",
        callback: function (r) {
            $("#count3").text(r.message);
        }
    });

     frappe.call({
        method: "apartment_app.apartment.doctype.technician.technician.totalservice",
        callback: function (r) {

            $("#total_count").text(r.message.total_count);

            let html = "";

            r.message.categories.forEach(function (category) {
                html += `
                    <div class="category-item">
                        ${category}
                    </div>
                `;
            });

            $("#category_list").html(html);

        }
    });

	frappe.call({
    method: "apartment_app.apartment.doctype.announcement.announcement.get_announcement_details",
    callback: function(r) {

        let html = "";

        Object.entries(r.message).forEach(([apartment, announcements]) => {

            html += `
                <div class="card mb-3">
                    <div class="card-header">
                        <strong>${apartment} APARTMENT</strong>
                    </div>
                    <div class="card-body">
					<h5>announcements</h5>
                        ${announcements.map(item => `
                            <div class="mb-2">
                                <p>${item.message}</p>
                                <small class="text-muted">${item.from_date} - ${item.to_date} </small>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;

        });

        $("#announce2").html(html);
    }
});
};