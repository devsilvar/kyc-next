// app/api/verify-phone/route.ts
import { NextResponse } from "next/server";
import smileIdentityCore from "smile-identity-core";

const { Signature } = smileIdentityCore;

export async function POST(req: Request) {
  try {
    const { phone_number, country, first_name, last_name } = await req.json();

    const PARTNER_ID = process.env.SMILE_ID_PARTNER_ID!;
    const API_KEY = process.env.SMILE_ID_AUTH_TOKEN!;

    // ✅ Use ONLY SDK-generated signature
    const sig = new Signature(PARTNER_ID, API_KEY);
    const { signature, timestamp } = sig.generate_signature();

    const payload = {
      callback_url: "https://yourapp.com/callback",
      country: country || "NG",
      phone_number,
      match_fields: {
        first_name,
        last_name,
      },
    };

    const response = await fetch(
      "https://testapi.smileidentity.com/v2/verify-phone-number",
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

    const data = await response.json();
    return NextResponse.json(data);
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
