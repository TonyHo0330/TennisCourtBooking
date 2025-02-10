document.addEventListener("DOMContentLoaded", function () {
    let dateInput = document.getElementById("date");

    // 預設為今日
    let today = new Date();
    let offset = today.getTimezoneOffset() * 60000; // 調整時區偏移量
    let localISODate = new Date(today.getTime() - offset).toISOString().split("T")[0];
    dateInput.value = localISODate;

    dateInput.addEventListener("change", fetchBookingData);

    fetchCourtList().then(fetchBookingData);
});

// 取得場地清單
async function fetchCourtList() {
    try {
        let response = await fetch("/get-allcourts");
        let courts = await response.json();

        let courtHeaderRow = document.querySelector("thead tr"); // 找到標題列

        courts.forEach(court => {
            let th = document.createElement("th");
            th.textContent = court.name;
            courtHeaderRow.appendChild(th);
        });

    } catch (error) {
        console.error("場地資料載入失敗:", error);
    }
}


// 取得預約狀況
async function fetchBookingData() {
    let hint = document.getElementById("hint");
    let selectedDate = document.getElementById("date").value;
    hint.innerHTML = selectedDate + " " + "場地預約"

    try {
        let response = await fetch(`/get-allBooking?date=${selectedDate}`);
        let bookingData = await response.json();

        let tableBody = document.getElementById("booking-status");
        tableBody.innerHTML = ""; // 清空表格內容

        const timeslots = [
            "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
            "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
            "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
            "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
        ];

        timeslots.forEach(timeslot => {
            let row = document.createElement("tr");
            let timeCell = document.createElement("td");
            timeCell.textContent = timeslot;
            row.appendChild(timeCell);
            bookingData.forEach(court => {
                let cell = document.createElement("td");
                let bookedIndex = court.bookings.indexOf(timeslot);
                if (bookedIndex !== -1) {
                    // 該時段已被預約，顯示對應的使用者名稱
                    cell.textContent = court.user[bookedIndex];
                    cell.style.color = "black";
                    cell.style.fontWeight = "bold";
                } else {
                    // 該時段未被預約
                    cell.textContent = "";
                }
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("預約資料載入失敗:", error);
    }
}
