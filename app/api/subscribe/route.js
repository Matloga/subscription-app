import { supabase } from '../../../lib/supabaseClient';
import { sendEmail } from '../../../lib/sendEmail';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      console.error("❌ Missing email");
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400 });
    }

    console.log("📩 New subscription request:", email);

    // Check if email already exists
    const { data: existing, error: selectError } = await supabase
      .from('subscribers')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // ✅ better than single() if none exist

    if (selectError) {
      console.error("❌ Supabase select error:", selectError);
      return new Response(JSON.stringify({ error: selectError.message }), { status: 500 });
    }

    if (existing) {
      console.log("⚠️ Email already subscribed:", email);
      return new Response(JSON.stringify({ message: 'You are already subscribed!' }), { status: 200 });
    }

    // Insert new subscriber
    const { data, error: insertError } = await supabase
      .from('subscribers')
      .insert([{ email }])
      .select();

    if (insertError) {
      console.error("❌ Supabase insert error:", insertError);
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
    }

    // Try sending confirmation email
    try {
      console.log("📤 Sending email to:", email);
      await sendEmail(
        email,
        'Subscription Successful!',
        `Hi there!\n\nYou have successfully subscribed to our newsletter. 🎉`
      );
      console.log("✅ Email sent to:", email);
    } catch (mailErr) {
      console.error("❌ Email sending error:", mailErr);
      return new Response(JSON.stringify({ error: 'Subscription saved but failed to send email.' }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: 'Subscribed successfully and email sent!' }), { status: 200 });
  } catch (err) {
    console.error("💥 Unexpected server error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
