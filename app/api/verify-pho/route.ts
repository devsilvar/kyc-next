// app/api/verify-phone/route.ts
import { NextResponse } from "next/server";
import smileIdentityCore from "smile-identity-core";

const { Signature } = smileIdentityCore;

type ReqBody = {
  phone_number: string;
  country?: string;           // e.g. "NG"
  first_name?: string;
  last_name?: string;
};

export async function POST(req: Request) {
  try {
    const {
      phone_number,
      country = "NG",
      first_name,
      last_name,
    } = (await req.json()) as ReqBody;

    if (!phone_number) {
      return NextResponse.json(
        { success: false, error: "phone_number is required" },
        { status: 400 }
      );
    }

    // Build match_fields as an OBJECT (required by the API)
    const match_fields: Record<string, string> = {};
    if (first_name) match_fields.first_name = first_name;
    if (last_name) match_fields.last_name = last_name;

    if (Object.keys(match_fields).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Provide at least one of: first_name, last_name, other_name, id_number in match_fields',
        },
        { status: 400 }
      );
    }

    const PARTNER_ID = process.env.SMILE_ID_PARTNER_ID!;
    const AUTH_TOKEN = process.env.SMILE_ID_AUTH_TOKEN!; // Base64 auth_token from Smile ID (not the UUID)

    const sig = new Signature(PARTNER_ID, AUTH_TOKEN);
    const { signature, timestamp } = sig.generate_signature();

    const payload = {
      country,
      phone_number,
      match_fields, // <-- object, not array
    };

    const resp = await fetch(
      "https://api.smileidentity.com/v2/verify-phone-number",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "smileid-partner-id": PARTNER_ID,
          "smileid-request-signature": signature,
          "smileid-timestamp": String(timestamp),
          "smileid-source-sdk": "rest_api",
          "smileid-source-sdk-version": "1.0.0",
        },
        body: JSON.stringify(payload),
      }
    );

    const raw = await resp.text();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      data = { success: false, error: "Non-JSON response from Smile ID", raw };
    }

    return NextResponse.json(data, { status: resp.status });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
