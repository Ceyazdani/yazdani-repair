exports.handler = async (event) => {
  try {
    const { code, name, brand, model } = JSON.parse(event.body);
    const apiKey = process.env.ONESIGNAL_API_KEY;
    
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey ? apiKey.length : 0);
    console.log("API Key prefix:", apiKey ? apiKey.substring(0, 20) : "none");

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Key " + apiKey
      },
      body: JSON.stringify({
        app_id: "46974e82-acd7-422b-966a-aa4bdc5e5f99",
        included_segments: ["Total Subscriptions"],
        headings: { en: "درخواست جدید ثبت شد ✅" },
        contents: { en: "مشتری: " + name + " | دستگاه: " + brand + " " + model + " | کد: " + code },
        url: "https://yazdani-repairs.netlify.app/admin-7-2-4-6.html"
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
