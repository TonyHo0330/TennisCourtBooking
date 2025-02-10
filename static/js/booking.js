document.addEventListener("DOMContentLoaded", function () {
    // LIFF 初始化
    liff.init({ liffId: "2006862539-bd2MYJO0" })
        .then(() => {
            console.log("LIFF 初始化成功");
        })
        .catch(err => console.error("LIFF 初始化失敗:", err));

    // 設定日期只能從次日起
    let dateInput = document.getElementById("date");
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // 從次日開始可選
    let offset = tomorrow.getTimezoneOffset() * 60000; // 調整時區偏移量
    let localISODate = new Date(tomorrow.getTime() - offset).toISOString().split("T")[0];
    dateInput.min = localISODate; // 設定 min 屬性

    let venueSelect = document.getElementById("venue");
    let timeslotSelect = document.getElementById("timeslots");
    let totalPriceDiv = document.getElementById("totalPrice");

    // 載入場地資料
    fetch("/get-allcourts")
        .then(response => response.json())
        .then(data => {
            venueSelect.innerHTML = "<option value='' selected disabled>請選擇場地</option>"; // 清空預設選項
            data.forEach(court => {
                let option = document.createElement("option");
                option.value = court.id;
                option.textContent = court.name;
                if (court.availability !== 1) {
                    option.disabled = true;
                }
                venueSelect.appendChild(option);
            });

            if (venueSelect.options.length === 0) {
                let option = document.createElement("option");
                option.value = "";
                option.textContent = "無可用場地";
                venueSelect.appendChild(option);
            }
        })
        .catch(error => console.error("場地載入失敗:", error));

    // 時段價格對照表
    function calculateTotalPrice() {
        let selectedOptions = Array.from(timeslotSelect.selectedOptions);
        let total = 0;

        selectedOptions.forEach(option => {
            let timeSlot = option.value;
            let hour = parseInt(timeSlot.split(":")[0]); // 取得起始時間的時數

            if (hour >= 6 && hour < 18) {
                total += 300; // 早上到下午收費 300
            } else {
                total += 600; // 晚上收費 600
            }
        });

        // 更新顯示金額
        totalPriceDiv.textContent = "總金額：" + total + " 元";
    }

    // 當選擇日期或場地時，載入可選時段
    function fetchAvailableTimes() {
        const selectedDate = dateInput.value;
        const selectedVenue = venueSelect.value;

        if (!selectedDate || !selectedVenue) {
            timeslotSelect.innerHTML = "<option value='' selected disabled>請先選擇日期與場地</option>";
            return;
        }

        fetch(`/get-reserved-times?date=${selectedDate}&venue=${selectedVenue}`)
            .then(response => response.json())
            .then(data => {
                const reservedSlots = data.reserved_slots || [];
                const allTimeSlots = [
                    "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
                    "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00",
                    "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00",
                    "18:00 - 19:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"
                ];

                timeslotSelect.innerHTML = ""; // 清空時段選單

                allTimeSlots.forEach(slot => {
                    let option = document.createElement("option");
                    option.value = slot;
                    option.textContent = slot;

                    if (reservedSlots.includes(slot)) {
                        option.disabled = true;  // 禁用已預約時段
                    }

                    timeslotSelect.appendChild(option);
                });
                calculateTotalPrice();
            })
            .catch(error => console.error("時段載入失敗:", error));
    }

    dateInput.addEventListener("change", fetchAvailableTimes);
    venueSelect.addEventListener("change", fetchAvailableTimes);

    // 限制最多選 4 個時段
    timeslotSelect.addEventListener("change", function () {
        let selectedOptions = Array.from(this.selectedOptions);
        if (selectedOptions.length > 4) {
            alert("最多只能選擇 4 個時段！");
            selectedOptions[selectedOptions.length - 1].selected = false;
        }
        calculateTotalPrice();
    });
});

// 提交預約資料
// function submitBooking() {
//     let phonePattern = /^09\d{8}$/;
//     let name = document.getElementById("name").value;
//     let phone = document.getElementById("phone").value;
//     let date = document.getElementById("date").value;
//     let venue = document.getElementById("venue").value;
//     let price = document.getElementById("totalPrice").textContent.match(/\d+/)[0];
//     let selectedTimes = Array.from(document.getElementById("timeslots").selectedOptions).map(option => option.value);

//     if (!name) {
//         alert("請填入姓名！");
//         return;
//     }
//     if (name.length > 50) {
//         alert("名字最多輸入五十個字元！");
//         return;
//     }
//     if (!phone) {
//         alert("請輸入電話！");
//         return;
//     }
//     if (phone.length !== 10) {
//         alert("電話請輸入 10 碼！");
//         return;
//     }
//     if (!phonePattern.test(phone)) {
//         alert("請輸入正確的 10 碼臺灣電話號碼（以 09 開頭）！");
//         return;
//     }
//     if (!date) {
//         alert("請選擇日期！");
//         return;
//     }
//     if (!venue) {
//         alert("請選擇場地！");
//         return;
//     }
//     if (selectedTimes.length === 0) {
//         alert("請選擇至少 1 個時段！");
//         return;
//     }

//     let bookingData = {
//         name: name,
//         phone: phone,
//         date: date,
//         venue: venue,
//         price: price,
//         timeSlots: selectedTimes
//     };
//     console.log(bookingData)

//     fetch("/submit-booking", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(bookingData)
//     })
//         .then(response => response.json())
//         .then(data => {
//             alert(data.message); // 顯示回傳訊息
//             liff.closeWindow(); // 關閉視窗
//         })
//         .catch(error => {
//             console.error("預約失敗:", error);
//         });
// }

// 送出預約並發起付款
function submitBooking() {
    let name = document.getElementById("name").value;
    let phone = document.getElementById("phone").value;
    let date = document.getElementById("date").value;
    let venue = document.getElementById("venue").value;
    let price = document.getElementById("totalPrice").textContent.match(/\d+/)[0];
    let selectedTimes = Array.from(document.getElementById("timeslots").selectedOptions).map(option => option.value);

    if (!name || !phone || !date || !venue || selectedTimes.length === 0) {
        alert("請完整填寫預約資訊！");
        return;
    }

    let bookingData = { name, phone, date, venue, price, timeSlots: selectedTimes };

    // 發起 LINE Pay 付款請求
    fetch("/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl; // 跳轉到 LINE Pay 付款頁面
            } else {
                alert(`付款請求失敗！${data.returnMessage || "未知錯誤"}`);
            }
        })
        .catch(error => {
            console.error("付款錯誤:", error);
            alert("付款過程發生錯誤，請稍後再試！");
        });
}