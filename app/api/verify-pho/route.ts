// app/api/verify-phone/route.ts
import { NextResponse } from "next/server";
import smileIdentityCore from "smile-identity-core";

const { Signature } = smileIdentityCore;

export async function POST(req: Request) {
  try {
    const { phone_number, country, first_name, last_name } = await req.json();

    const PARTNER_ID = process.env.SMILE_ID_PARTNER_ID!;
    const API_KEY = process.env.SMILE_ID_AUTH_TOKEN!;

    // ✅ Force PRODUCTION environment
    const sig = new Signature(PARTNER_ID, API_KEY);
    const { signature, timestamp } = sig.generate_signature();

const payload = {
  country: country || "NG",
  phone_number: phone_number.startsWith("0")
    ? `234${phone_number.slice(1)}`
    : phone_number,
  partner_params: {
    job_id: `job-${Date.now()}`,
    user_id: `user-${Date.now()}`,
    job_type: 5, // phone verification
  },
  match_fields: [
    { first_name },
    { last_name }
  ]
};



    const response = await fetch(
      "https://api.smileidentity.com/v2/verify-phone-number",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "smileid-partner-id": PARTNER_ID,
          "smileid-timestamp": String(timestamp),
          "smileid-request-signature": signature,
        },
        body: JSON.stringify(payload),
      }
    );

    const raw = await response.text();
    console.log("SmileID raw response:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { error: "Invalid JSON from SmileID", raw };
    }

    return NextResponse.json(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
