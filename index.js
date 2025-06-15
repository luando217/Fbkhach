require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const app = express();
app.use(bodyParser.json());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

// Uptime check
app.get("/", (req, res) => {
  res.send("✅ Bot server is running!");
});

// Webhook nhận Feedback từ AppSheet
app.post("/webhook", async (req, res) => {
  const data = req.body;
  console.log("📥 Webhook received:", data);

  const userId = data.discord_id;
  const jobName = data["Job Name"] || data.job_name || "Không rõ Job";
  const clientName = data.Client || data.client || "Không rõ khách";
  const fbText = data.FBkhach || data.fb || "";

  if (!userId || !fbText) {
    return res.status(400).send("Thiếu discord_id hoặc FBkhach.");
  }

  const messageText =
    `📝 **Feedback khách hàng mới**:\n` +
    `📌 Job: **${jobName}**\n` +
    `👥 Khách: **${clientName}**\n` +
    `>>> ${fbText}`;

  try {
    const user = await client.users.fetch(userId);
    await user.send(messageText);
    console.log(`✅ Đã gửi feedback tới user ${user.tag}`);
    res.status(200).send("Đã gửi feedback thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi gửi DM:", error);
    res.status(500).send("Không thể gửi DM: " + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
