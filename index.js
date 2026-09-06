require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>PEDRO AI BOT</title>
        <style>
          body { background:#0d1117; color:white; font-family:Arial; text-align:center; padding-top:80px; }
          h1 { color:#a970ff; }
        </style>
      </head>
      <body>
        <h1>🤖 PEDRO AI BOT</h1>
        <p>WhatsApp Bot is running 🚀</p>
      </body>
    </html>
  `);
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account" && body.entry?.length) {
      const value = body.entry[0].changes?.[0]?.value;

      if (value?.messages?.length) {
        const message = value.messages[0];
        const from = message.from;
        const text = message.type === "text"
          ? message.text.body.trim().toLowerCase()
          : "";

        console.log(`📩 Message from ${from}: ${text}`);

        if (["menu", "مساعدة", "القائمة"].includes(text)) {
          await sendMessage(from, getMenu());
        } else if (["1", "ai", "ذكاء اصطناعي"].includes(text)) {
          await sendMessage(from, "🧠 أرسل سؤالك الآن. نظام الذكاء الاصطناعي سيتم ربطه في المرحلة القادمة.");
        } else if (["2", "أدوات"].includes(text)) {
          await sendMessage(from, "🛠️ أدوات PEDRO:\n\n1️⃣ حساب العمر\n2️⃣ النسبة المئوية\n3️⃣ QR Code\n4️⃣ مولد كلمات مرور");
        } else if (["3", "نصوص"].includes(text)) {
          await sendMessage(from, "✍️ أرسل نوع النص الذي تريد إنشاءه.");
        } else if (["4", "ألعاب"].includes(text)) {
          await sendMessage(from, "🎮 الألعاب متوفرة قريباً 🚀");
        } else {
          await sendMessage(from, "👋 أهلاً بك في PEDRO AI BOT!\n\nأرسل *menu* لعرض القائمة.");
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

function getMenu() {
  return `╭━━━『 🤖 PEDRO AI BOT 』━━━╮
┃
┃ 👋 أهلاً بك!
┃
┃ 1️⃣ الذكاء الاصطناعي
┃ 2️⃣ أدوات مفيدة
┃ 3️⃣ إنشاء نصوص
┃ 4️⃣ الألعاب 🎮
┃
┃ اكتب رقم الخدمة.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`;
}

async function sendMessage(to, message) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.log("⚠️ WhatsApp API credentials are missing.");
    return;
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) console.error("WhatsApp API error:", data);
  else console.log("✅ Message sent");
}

app.listen(PORT, () => {
  console.log(`🚀 PEDRO AI BOT running on port ${PORT}`);
});
