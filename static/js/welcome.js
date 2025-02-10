document.addEventListener("DOMContentLoaded", function () {
    // LIFF 初始化
    liff.init({ liffId: "2006862539-vlpOa657" })
        .then(() => {
            console.log("LIFF 初始化成功");
        })
        .catch(err => console.error("LIFF 初始化失敗:", err));

    document.getElementById("logout-btn").addEventListener("click", function () {
        if (confirm("確定要離開歡迎頁面嗎？")) {
            liff.closeWindow(); // 關閉 LIFF 視窗
        }
    });
});