// /app/api/verify-phone/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';
import { z } from 'zod';

const requestSchema = z.object({
  phoneNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

export async function POST(request: Request) {
  console.log("--- API Route Invoked ---");

  // 1. Check for required environment variables
  const PARTNER_ID = process.env.SMILE_ID_PARTNER_ID;
  const AUTH_TOKEN = process.env.SMILE_ID_AUTH_TOKEN;

  if (!PARTNER_ID || !AUTH_TOKEN) {
    console.error("CRITICAL: Missing Smile ID environment variables.");
    return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
  }

  // 2. Validate incoming request
  let body;
  try {
    body = await request.json();
    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      console.error("Invalid request body:", validation.error.flatten());
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.flatten() }, { status: 400 });
    }
  } catch (error) {
    console.error("Invalid JSON in request:", error);
    return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
  }
  
  const { phoneNumber, firstName, lastName } = body;
  console.log("Received data from frontend:", { phoneNumber, firstName, lastName });

  // 3. Generate the dynamic signature and timestamp
  // We are logging everything to debug the 2205 error
  const timestamp = new Date().toISOString();
  const signatureString = `${timestamp}${PARTNER_ID}sid_request`;
  const signature = crypto
    .createHmac('sha266', Buffer.from(AUTH_TOKEN, 'base64'))
    .update(signatureString, 'utf8')
    .digest('base64');
    
  // --- START DEBUG LOGS ---
  console.log("Timestamp used for signature:", timestamp);
  console.log("String used to generate signature:", signatureString);
  console.log("Generated Signature:", signature);
  // --- END DEBUG LOGS ---

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
      job_id: `job-${crypto.randomUUID()}`,
      user_id: `user-${crypto.randomUUID()}`
    },
    // The timestamp is NOT required in the body for this v2 endpoint,
    // only in the header. This is a common point of confusion.
  };

  const headers = {
    'Content-Type': 'application/json',
    'smileid-partner-id': PARTNER_ID,
    'smileid-request-signature': signature,
    'smileid-timestamp': timestamp,
    'smileid-source-sdk': 'rest_api',
    'smileid-source-sdk-version': '1.0.0',
  };

  // --- START DEBUG LOGS ---
  console.log("Making POST request to URL:", smileIDApiUrl);
  console.log("Request Headers Sent:", JSON.stringify(headers, null, 2));
  console.log("Request Body Sent:", JSON.stringify(smileIDRequestBody, null, 2));
  // --- END DEBUG LOGS ---

  // 5. Make the secure API call
  try {
    const response = await axios.post(smileIDApiUrl, smileIDRequestBody, { headers });
    console.log("Smile ID Response (Success):", response.data);
    return NextResponse.json({ success: true, ...response.data });
  } catch (error: any) {
    console.error('Smile ID Response (Error):', error.response?.data || error.message);
    return NextResponse.json({
      success: false,
      message: 'Failed to verify phone number.',
      details: error.response?.data,
    }, { status: error.response?.status || 500 });
  }
}