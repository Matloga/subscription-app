import 'dotenv/config';
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendRandomEmails() {
  try {
    // 1️⃣ Get all subscribers
    const { data: subscribers, error } = await supabase
      .from("subscribers")
      .select("email");

    if (error) throw error;
    if (!subscribers.length) {
      console.log("⚠️ No subscribers found");
      return;
    }

    // 2️⃣ Create a random email message
    const subjects = ["Daily Update 🌞", "Special Offer 🎁", "Latest News 📰", "Hey there 👋"];
    const messages = [
      "Hope you’re having an amazing day!",
      "Check out our latest news and updates.",
      "We’ve got something new for you!",
      "Don’t miss this week’s highlights.",
    ];

    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // 3️⃣ Send email to each subscriber
    for (const sub of subscribers) {
      await transporter.sendMail({
        from: `"My Newsletter" <${process.env.SMTP_USER}>`,
        to: sub.email,
        subject,
        text: message,
      });
      console.log(`📨 Sent email to ${sub.email}`);
    }
  } catch (err) {
    console.error("❌ Error sending emails:", err.message);
  }
}

// 4️⃣ Run every 2 minutes
setInterval(sendRandomEmails, 2 * 60 * 1000);

// Run immediately on start
sendRandomEmails();
