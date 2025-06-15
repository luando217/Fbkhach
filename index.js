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

// Webhook nhận dữ liệu từ AppSheet
app.post("/webhook", async (req, res) => {
  const { discord_id, content } = req.body;

  if (!discord_id || !content) {
    return res.status(400).send("Thiếu discord_id hoặc content.");
  }

  try {
    const user = await client.users.fetch(discord_id);
    await user.send(content);
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
