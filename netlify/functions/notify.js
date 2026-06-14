exports.handler = async (event) => {
  try {
    const { code, name, brand, model } = JSON.parse(event.body);
    const apiKey = process.env.ONESIGNAL_API_KEY;

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Key " + apiKey
      },
      body: JSON.stringify({
        app_id: "26d69e88-5ee9-42d6-a29f-574b4f06d1a7",
        included_segments: ["Total Subscriptions"],
        headings: { en: "درخواست جدید ثبت شد ✅" },
        contents: { en: "مشتری: " + name + " | دستگاه: " + brand + " " + model + " | کد: " + code },
        url: "https://ni-repairs.netlify.app/admin-7-2-4-6.html"
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
