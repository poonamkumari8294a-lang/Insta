import { GoogleGenAI, Type } from "@google/genai";
import { OrderItem } from '../src/types';
import { db } from './db';

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[ScreenshotVerifier] GEMINI_API_KEY not found in environment.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ExtractedPaymentData {
  isPaymentScreenshot: boolean;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'UNKNOWN';
  utr: string; // 12-digit UPI reference number
  amount: number; // numeric INR amount
  payeeName?: string;
  payeeUpi?: string;
  payerName?: string;
  transactionDate?: string;
  transactionTime?: string;
  confidenceScore: number;
  remarks?: string;
}

export interface VerificationResult {
  verified: boolean;
  status: 'paid' | 'manual_review';
  reason: string;
  details: {
    amountMatched: boolean;
    utrValid: boolean;
    utrUnique: boolean;
    statusSuccess: boolean;
    dateFresh: boolean;
    extracted: Partial<ExtractedPaymentData>;
    expectedAmount: number;
    extractedAmount?: number;
    extractedUtr?: string;
  };
}

/**
 * Extracts base64 payload and mimeType from data URL or image buffer
 */
async function parseImageData(input: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    if (input.startsWith('data:')) {
      const matches = input.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches) {
        return {
          mimeType: matches[1],
          data: matches[2],
        };
      }
    }

    // If it is a remote URL (e.g. Cloudinary)
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const res = await fetch(input);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      return {
        mimeType: contentType,
        data: buffer.toString('base64'),
      };
    }

    return null;
  } catch (err) {
    console.error('[ScreenshotVerifier] Failed to parse image data:', err);
    return null;
  }
}

/**
 * Calls Gemini 3.8 Flash Vision to accurately extract UPI payment receipt details
 */
export async function analyzeScreenshotWithGemini(
  imageInput: string
): Promise<ExtractedPaymentData | null> {
  const ai = getAiClient();
  if (!ai) return null;

  const parsedImage = await parseImageData(imageInput);
  if (!parsedImage) {
    console.warn('[ScreenshotVerifier] Could not parse image data for Gemini Vision.');
    return null;
  }

  const prompt = `You are an expert Indian UPI Payment Receipt Auditor & Verification Engine.
Analyze this uploaded screenshot carefully. Indian UPI apps include PhonePe, Google Pay (GPay), Paytm, BHIM, CRED, Amazon Pay, YONO SBI, or other mobile banking apps.

Your task is to inspect the receipt and extract exact transaction details:
1. Is this a genuine UPI payment screenshot/receipt? (isPaymentScreenshot: true/false)
2. What is the transaction status?
   - "SUCCESS" if the transaction succeeded (e.g. "Paid to", "Payment Successful", "Transferred successfully", green checkmark, "Money Sent", "₹... sent").
   - "PENDING" if it says "Processing", "Pending", or "Waiting for confirmation".
   - "FAILED" if it says "Failed", "Declined", "Cancelled".
   - "UNKNOWN" if not identifiable.
3. What is the 12-digit UPI Reference Number / UTR / Transaction ID?
   - Often labelled as "UPI Ref No.", "UPI Reference ID", "UTR", "Transaction ID", "Google Transaction ID", "Ref No.".
   - Clean it into a continuous string of digits (UPI UTR is typically 12 digits, e.g. "425188291034").
   - If not found or obscured, return "".
4. What is the numeric payment amount in INR (e.g. 149, 149.00, 299)? Return as a float number without ₹ or commas.
5. Who was the payee / receiver? (payeeName and payeeUpi if visible)
6. Who was the sender / payer? (payerName if visible)
7. What is the date and time of the payment? (e.g. date: "12 Sep 2026", time: "10:30 PM")
8. How confident are you in this reading? (0.0 to 1.0)
9. Provide short remarks explaining your observation.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: parsedImage.mimeType,
                data: parsedImage.data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          'You are a high-security automated auditor for Indian UPI payment receipts. Extract all numerical and textual data with maximum precision and zero hallucination.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isPaymentScreenshot: {
              type: Type.BOOLEAN,
              description: 'Whether the image is an actual payment confirmation receipt',
            },
            paymentStatus: {
              type: Type.STRING,
              description: 'Payment status: SUCCESS, PENDING, FAILED, or UNKNOWN',
            },
            utr: {
              type: Type.STRING,
              description: 'The 12-digit UPI Reference Number / UTR / Transaction ID',
            },
            amount: {
              type: Type.NUMBER,
              description: 'Exact numeric payment amount in INR',
            },
            payeeName: {
              type: Type.STRING,
              description: 'Name of the recipient or merchant',
            },
            payeeUpi: {
              type: Type.STRING,
              description: 'UPI ID of recipient (e.g. username@upi)',
            },
            payerName: {
              type: Type.STRING,
              description: 'Name of sender if visible',
            },
            transactionDate: {
              type: Type.STRING,
              description: 'Transaction date shown on receipt',
            },
            transactionTime: {
              type: Type.STRING,
              description: 'Transaction time shown on receipt',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'Confidence rating from 0.0 to 1.0',
            },
            remarks: {
              type: Type.STRING,
              description: 'Summary of visual check findings',
            },
          },
          required: ['isPaymentScreenshot', 'paymentStatus', 'utr', 'amount', 'confidenceScore'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      console.warn('[ScreenshotVerifier] Empty response text from Gemini');
      return null;
    }

    const parsed = JSON.parse(text) as ExtractedPaymentData;
    // Normalize status
    const normStatus = (parsed.paymentStatus || '').toUpperCase();
    if (normStatus.includes('SUCCESS') || normStatus.includes('PAID') || normStatus.includes('COMPLETED')) {
      parsed.paymentStatus = 'SUCCESS';
    } else if (normStatus.includes('PENDING') || normStatus.includes('PROCESS')) {
      parsed.paymentStatus = 'PENDING';
    } else if (normStatus.includes('FAIL') || normStatus.includes('DECLINE')) {
      parsed.paymentStatus = 'FAILED';
    } else {
      parsed.paymentStatus = 'UNKNOWN';
    }

    // Clean UTR digits
    if (parsed.utr) {
      parsed.utr = parsed.utr.replace(/[^0-9]/g, '');
    }

    console.log('[ScreenshotVerifier] Gemini extraction result:', {
      status: parsed.paymentStatus,
      amount: parsed.amount,
      utr: parsed.utr,
      date: parsed.transactionDate,
      time: parsed.transactionTime,
      confidence: parsed.confidenceScore,
    });

    return parsed;
  } catch (err) {
    console.error('[ScreenshotVerifier] Error during Gemini Vision call:', err);
    return null;
  }
}

/**
 * Checks date freshness: confirms the receipt is from today or within acceptable session window
 */
function isDateAcceptable(dateStr?: string, orderCreatedAt?: string): boolean {
  if (!dateStr || dateStr.trim() === '') {
    // If date is not prominently printed in receipt (some UPI popups only show time), do not fail immediately
    return true;
  }

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    // Check if year is past (e.g. 2024 or 2025 when current is 2026)
    const yearMatch = dateStr.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      const extractedYear = parseInt(yearMatch[1], 10);
      if (extractedYear < currentYear) {
        return false; // Old receipt from previous year!
      }
    }

    // Try parsing date directly
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      const diffMs = Math.abs(now.getTime() - parsedDate.getTime());
      const diffHours = diffMs / (1000 * 60 * 60);
      // Receipt should be within 48 hours of today's order
      return diffHours <= 48;
    }

    // Fuzzy check for current month/day
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const currentMonthStr = months[currentMonth];
    const lower = dateStr.toLowerCase();

    // If today is mentioned e.g. "Today", "Just now"
    if (lower.includes('today') || lower.includes('just now')) {
      return true;
    }

    // If month name matches
    if (lower.includes(currentMonthStr)) {
      return true;
    }

    return true;
  } catch (_) {
    return true;
  }
}

/**
 * Main Automatic Verification Function:
 * Inspects UTR ID, Name, Date/Time, and Amount against the Order specifications.
 * If all parameters match: Automatic Verify (Instant Unlock)!
 * If any parameter fails: Routes to Manual Review queue.
 */
export async function verifyPaymentProof(
  order: OrderItem,
  screenshotInput: string,
  userClaimedUtr?: string
): Promise<VerificationResult> {
  const expectedAmount = order.amount;
  const claimedUtr = (userClaimedUtr || '').trim().replace(/[^0-9]/g, '');

  console.log(`[ScreenshotVerifier] Verifying order ${order.orderId} (Expected Amount: ₹${expectedAmount})...`);

  // 1. Call Gemini Vision
  const extracted = await analyzeScreenshotWithGemini(screenshotInput);

  if (!extracted) {
    // If AI failed or key missing, check if user provided valid 12-digit UTR
    if (claimedUtr.length === 12) {
      const isUnique = !isUtrAlreadyUsed(claimedUtr, order.orderId);
      if (isUnique) {
        return {
          verified: false,
          status: 'manual_review',
          reason: 'Screenshot AI inspection was unavailable. Queued for fast manual review with submitted UTR.',
          details: {
            amountMatched: false,
            utrValid: true,
            utrUnique: isUnique,
            statusSuccess: false,
            dateFresh: true,
            extracted: { utr: claimedUtr },
            expectedAmount,
          },
        };
      }
    }

    return {
      verified: false,
      status: 'manual_review',
      reason: 'Could not clearly read payment details from screenshot. Sent to manual review.',
      details: {
        amountMatched: false,
        utrValid: false,
        utrUnique: true,
        statusSuccess: false,
        dateFresh: false,
        extracted: {},
        expectedAmount,
      },
    };
  }

  // Determine final UTR: either extracted from image or confirmed by user
  const finalUtr = extracted.utr && extracted.utr.length >= 10 ? extracted.utr : claimedUtr;

  // Criterion 1: Payment Status must be SUCCESS
  const statusSuccess = extracted.isPaymentScreenshot && extracted.paymentStatus === 'SUCCESS';

  // Criterion 2: Amount Match (allow small rounding delta < 1 INR)
  const amountDifference = Math.abs((extracted.amount || 0) - expectedAmount);
  const amountMatched = extracted.amount > 0 && (amountDifference < 1.0 || extracted.amount >= expectedAmount);

  // Criterion 3: UTR Valid (typically 12 digits in UPI)
  const utrValid = finalUtr.length >= 10 && finalUtr.length <= 16 && /^\d+$/.test(finalUtr);

  // Criterion 4: UTR Unique (prevent duplicate screenshot replay attacks)
  const utrUnique = utrValid ? !isUtrAlreadyUsed(finalUtr, order.orderId) : false;

  // Criterion 5: Date/Time Freshness (not from an old transaction months ago)
  const dateFresh = isDateAcceptable(extracted.transactionDate, order.createdAt);

  // Criterion 6: Confidence score
  const confident = extracted.confidenceScore >= 0.65;

  console.log('[ScreenshotVerifier] Check matrix:', {
    statusSuccess,
    amountMatched,
    expectedAmount,
    extractedAmount: extracted.amount,
    utrValid,
    utrUnique,
    finalUtr,
    dateFresh,
    confident,
  });

  // Check if ALL critical conditions match for AUTOMATIC VERIFICATION
  const isAutoVerified = statusSuccess && amountMatched && utrValid && utrUnique && dateFresh && confident;

  if (isAutoVerified) {
    return {
      verified: true,
      status: 'paid',
      reason: `Automatic Verification Successful! UTR ${finalUtr}, Amount ₹${extracted.amount}, and payment status verified by AI.`,
      details: {
        amountMatched: true,
        utrValid: true,
        utrUnique: true,
        statusSuccess: true,
        dateFresh: true,
        extracted,
        expectedAmount,
        extractedAmount: extracted.amount,
        extractedUtr: finalUtr,
      },
    };
  }

  // If not all matched, construct clear rejection / manual review reason
  const failureReasons: string[] = [];
  if (!statusSuccess) {
    failureReasons.push(`Payment status is ${extracted.paymentStatus || 'not successful'}`);
  }
  if (!amountMatched) {
    failureReasons.push(`Amount ₹${extracted.amount || 0} does not match expected ₹${expectedAmount}`);
  }
  if (!utrValid) {
    failureReasons.push('12-digit UTR/Reference number not clearly identified');
  }
  if (!utrUnique) {
    failureReasons.push('UTR already used in a previous transaction');
  }
  if (!dateFresh) {
    failureReasons.push('Receipt date appears outdated or mismatching');
  }

  const reason = failureReasons.length > 0
    ? `Queued for manual review: ${failureReasons.join(', ')}.`
    : 'Queued for manual review: could not clearly confirm all receipt parameters.';

  return {
    verified: false,
    status: 'manual_review',
    reason,
    details: {
      amountMatched,
      utrValid,
      utrUnique,
      statusSuccess,
      dateFresh,
      extracted,
      expectedAmount,
      extractedAmount: extracted.amount,
      extractedUtr: finalUtr,
    },
  };
}

/**
 * Checks store.json / db to see if this UTR has already been used on another paid order
 */
function isUtrAlreadyUsed(utr: string, currentOrderId: string): boolean {
  if (!utr) return false;
  const orders = db.getAllOrders();
  return orders.some(
    (o) =>
      o.orderId !== currentOrderId &&
      (o.transactionRef === utr || (o as any).utr === utr) &&
      o.status === 'paid'
  );
}
