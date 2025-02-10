document.addEventListener("DOMContentLoaded", function () {

    // 設定日期只能從次日起
    let dateInput = document.getElementById("date");
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // 從次日開始可選
    let offset = tomorrow.getTimezoneOffset() * 60000; // 調整時區偏移量
    let localISODate = new Date(tomorrow.getTime() - offset).toISOString().split("T")[0];
    dateInput.min = localISODate; // 設定 min 屬性

    // 載入場地資料
    fetch("/get-allcourts")
        .then(response => response.json())
        .then(data => {
            let venueSelect = document.getElementById("venue");
            venueSelect.innerHTML = "<option value='' selected disabled>請選擇場地</option>";
            data.forEach(court => {
                let option = document.createElement("option");
                option.value = court.id;
                option.textContent = court.name;
                if (court.availability !== 1) {
                    option.disabled = true;
                }
                venueSelect.appendChild(option);
            });
        })
        .catch(error => console.error("場地載入失敗:", error));
});

// 查詢場地預約狀況
function fetchReservations() {
    let date = document.getElementById("date").value;
    let venue = document.getElementById("venue").value;
    let statusTableBody = document.getElementById("statusTableBody");
    let reservationStatus = document.getElementById("reservationStatus");
    let timeCourt = document.getElementById("timeCourt")

    if (!date || !venue) {
        alert("請選擇日期和場地");
        return;
    }

    fetch(`/get-reserved-times?date=${date}&venue=${venue}`)
        .then(response => response.json())
        .then(data => {
            statusTableBody.innerHTML = "";
            timeCourt.innerHTML = date + ' - ' + venue + "號球場";
            const timeslots = [
                "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
                "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
                "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
                "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
            ];

            timeslots.forEach(slot => {
                let row = document.createElement("tr");
                let timeCell = document.createElement("td");
                let statusCell = document.createElement("td");

                timeCell.textContent = slot;

                if (data.reserved_slots.includes(slot)) {
                    statusCell.textContent = "已預約";
                    statusCell.style.color = "red";
                    statusCell.classList.add("reserved");
                } else {
                    statusCell.textContent = "可預約";
                    statusCell.style.color = "green";
                    statusCell.classList.add("available");
                }

                row.appendChild(timeCell);
                row.appendChild(statusCell);
                statusTableBody.appendChild(row);
            });

            reservationStatus.classList.remove("d-none");
        })
        .catch(error => console.error("無法獲取預約狀況:", error));
}
