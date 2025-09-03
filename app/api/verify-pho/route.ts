// /app/api/verify-phone/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { z } from 'zod';

// Validate incoming request body
const requestSchema = z.object({
  phoneNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export async function POST(request: Request) {
  // --- 1. Load environment variables ---
  const PARTNER_ID = process.env.SMILE_ID_PARTNER_ID;
  const API_KEY = process.env.SMILE_ID_AUTH_TOKEN; // API key from SmileID portal (Sandbox or Prod)

  if (!PARTNER_ID || !API_KEY) {
    return NextResponse.json(
      { success: false, message: 'Missing Smile ID credentials' },
      { status: 500 }
    );
  }

  // --- 2. Parse & validate request body ---
  let body;
  try {
    body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request body', errors: validation.error.flatten() },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const { phoneNumber, firstName, lastName } = body;

  // --- 3. Generate timestamp & signature ---
  const timestamp = new Date().toISOString();
  const signatureString = `${timestamp}${PARTNER_ID}sid_request`;

  // IMPORTANT: Smile ID API key is base64 encoded. If your key is already raw, remove Buffer.from(..., 'base64').
  const signature = crypto
    .createHmac('sha256', Buffer.from(API_KEY, 'base64'))
    .update(signatureString, 'utf8')
    .digest('base64');

  // --- 4. Prepare Smile ID request ---
  const smileIDApiUrl = 'https://testapi.smileidentity.com/v2/verify-phone-number';

  const smileIDRequestBody = {
    callback_url: "https://yourapp.com/callback", // required, even in sync calls
    country: "NG",
    phone_number: phoneNumber,
    match_fields: {
      first_name: firstName,
      last_name: lastName,
    },
    partner_params: {
      job_id: `job-${crypto.randomUUID()}`,
      user_id: `user-${crypto.randomUUID()}`,
    },
  };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'smileid-partner-id': PARTNER_ID,
    'smileid-request-signature': signature,
    'smileid-timestamp': timestamp,
    'smileid-source-sdk': 'rest_api',
    'smileid-source-sdk-version': '1.0.0',
  };

  // --- 5. Call Smile ID API ---
  try {
    const response = await axios.post(smileIDApiUrl, smileIDRequestBody, { headers });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error("Smile ID API Error:", error.response?.data || error.message);

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify phone number',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
