exports.handler = async (event) => {
  try {
    const { code, name, brand, model } = JSON.parse(event.body);

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Key os_v2_app_e3lj5cc65fbnniu7k5fu6bwru7gu6qz7hlfepm4tuubvyx2wevh4pqeokavucazh2rgibzzg7kycokqy5k3ghmmq7i34u7ixmhwi7vi"
      },
      body: JSON.stringify({
        app_id: "26d69e88-5ee9-42d6-a29f-574b4f06d1a7",
        included_segments: ["Total Subscriptions"],
        headings: { en: "درخواست جدید ثبت شد ✅" },
        contents: { en: "مشتری: " + name + " | دستگاه: " + brand + " " + model + " | کد: " + code },
        url: "https://ni-repairs.netlify.app/admin-7-2-4-5.html"
      })
    });

    const data = await res.json();
    console.log("OneSignal response:", JSON.stringify(data));
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.log("Error:", err.message);
    return { statusCode: 500, body: err.message };
  }
};
