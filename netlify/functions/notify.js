exports.handler = async (event) => {
  try {
    const { code, name, brand, model } = JSON.parse(event.body);

    const res = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic os_v2_app_e3lj5cc65fbnniu7k5fu6bwru6oomkywulweqwuj45sdqdlrx52xgd5ejbbxazcrbbruenys5v6ubm7yj7dzbelcw7qtzcsxmyqcepy"
      },
      body: JSON.stringify({
        app_id: "26d69e88-5ee9-42d6-a29f-574b4f06d1a7",
        included_segments: ["Total Subscriptions"],
        headings: { en: "درخواست جدید ثبت شد ✅" },
        contents: { en: `مشتری: ${name} | دستگاه: ${brand} ${model} | کد: ${code}` },
        url: "https://ni-repairs.netlify.app/admin-7-2-4.html"
      })
    });

    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
