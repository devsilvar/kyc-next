// /app/api/verify-phone/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { z } from 'zod';

// Zod schema for validating the incoming request body
const requestSchema = z.object({
  phoneNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

// --- Main API Handler ---
export async function POST(request: Request) {
  // 1. Check for required environment variables
  const PARTNER_ID = process.env.SMILE_ID_PARTNER_ID;
  const AUTH_TOKEN = process.env.SMILE_ID_AUTH_TOKEN;

  if (!PARTNER_ID || !AUTH_TOKEN) {
    console.error("Missing Smile ID environment variables");
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  // 2. Validate the incoming request body
  let body;
  try {
    body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.flatten() }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { phoneNumber, firstName, lastName } = body;

  // 3. Generate the dynamic signature and timestamp
  const timestamp = new Date().toISOString();
  const signatureString = `${timestamp}${PARTNER_ID}sid_request`;
  const signature = crypto
    .createHmac('sha256', Buffer.from(AUTH_TOKEN, 'base64'))
    .update(signatureString, 'utf8')
    .digest('base64');

  // 4. Prepare the request to the Smile ID API
  const smileIDApiUrl = 'https://testapi.smileidentity.com/v2/verify-phone-number';
  const smileIDRequestBody = {
    country: "NG",
    phone_number: phoneNumber,
    match_fields: {
      first_name: firstName,
      last_name: lastName,
    },
    partner_params: {
      job_id: `job-${crypto.randomUUID()}`, // Use crypto for better uniqueness
      user_id: `user-${crypto.randomUUID()}`
    },
  };

  const headers = {
    'Content-Type': 'application/json',
    'smileid-partner-id': PARTNER_ID,
    'smileid-request-signature': signature,
    'smileid-timestamp': timestamp,
    'smileid-source-sdk': 'rest_api',
    'smileid-source-sdk-version': '1.0.0',
  };

  // 5. Make the secure API call and handle the response
  try {
    const response = await axios.post(smileIDApiUrl, smileIDRequestBody, { headers });
    // IMPORTANT: Check the Smile ID result before returning success
    if (response.data?.verified) {
        return NextResponse.json({ success: true, ...response.data });
    } else {
        return NextResponse.json({ success: false, message: response.data?.resultText || "Verification failed" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error from Smile ID API:', error.response?.data || error.message);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify phone number. Please try again.',
      details: error.response?.data,
    }, { status: error.response?.status || 500 });
  }
}