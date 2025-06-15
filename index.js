require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { Client, GatewayIntentBits, Partials } = require("discord.js");

const app = express();
app.use(bodyParser.json());

// Khởi tạo bot Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel], // Cho phép gửi DM
});

// Khi bot sẵn sàng
client.once("ready", () => {
  console.log(`🤖 Bot đã đăng nhập: ${client.user.tag}`);
});

// Đăng nhập bot với token từ .env
client.login(process.env.DISCORD_BOT_TOKEN);

// Route kiểm tra server sống
app.get("/", (req, res) => {
  res.send("✅ Bot server is running!");
});

// Route nhận webhook từ AppSheet
app.post("/webhook", async (req, res) => {
  const { discord_id, content } = req.body;

  console.log("📥 Webhook received body:", req.body);

  // Kiểm tra dữ liệu đầu vào
  if (!discord_id || !content) {
    return res.status(400).send("❌ Thiếu 'discord_id' hoặc 'content'.");
  }

  try {
    // Tìm user theo Discord ID và gửi tin nhắn
    const user = await client.users.fetch(discord_id);
    await user.send(content);

    console.log(`✅ Đã gửi tin nhắn đến user ${user.tag}`);
    res.status(200).send("✅ Tin nhắn đã được gửi thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi gửi tin nhắn Discord:", error);
    res.status(500).send("❌ Không thể gửi tin nhắn: " + error.message);
  }
});

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});
