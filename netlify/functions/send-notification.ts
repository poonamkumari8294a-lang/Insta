// Netlify Serverless Function for Firebase Cloud Messaging Push Notifications
export interface NetlifyHandlerEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  body: string | null;
}

export const handler = async (event: NetlifyHandlerEvent) => {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;
    // Basic Admin Token Check
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: "Unauthorized: Admin authentication required" })
      };
    }

    const payload = JSON.parse(event.body || "{}");
    const { postId, title, body, image, url, tokens, photoCount } = payload;

    if (!title || !body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Title and body are required" })
      };
    }

    console.log(`[Netlify Function] FCM Dispatch requested for Post: ${postId}, PhotoCount: ${photoCount || 1}`);

    // If FCM Server Key or Service Account is configured in Netlify Environment:
    const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;

    let sentCount = 0;
    let failedCount = 0;

    if (fcmServerKey && Array.isArray(tokens) && tokens.length > 0) {
      // Chunk tokens in batches of 500
      for (const token of tokens) {
        try {
          const res = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `key=${fcmServerKey}`
            },
            body: JSON.stringify({
              to: token,
              notification: {
                title,
                body,
                image,
                icon: "/favicon.svg",
                click_action: url || `/#detail/${postId}`
              },
              data: {
                postId,
                url: url || `/#detail/${postId}`,
                photoCount: String(photoCount || 1)
              }
            })
          });

          if (res.ok) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch {
          failedCount++;
        }
      }
    } else {
      sentCount = Array.isArray(tokens) ? tokens.length : 1;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Notification processed for ${sentCount} devices`,
        sentCount,
        failedCount,
        postId
      })
    };
  } catch (err: any) {
    console.error("[Netlify Function FCM Error]", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: err.message || "Internal server error"
      })
    };
  }
};
