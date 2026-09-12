import fs from 'fs';
import path from 'path';

export interface HandlerEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  body?: string | null;
  isBase64Encoded?: boolean;
}

export interface HandlerResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export type Handler = (
  event: HandlerEvent,
  context?: any
) => Promise<HandlerResponse>;

// Load config from firebase-applet-config.json
let PROJECT_ID = 'ec5dcb41-6d19-4d80-a694-fdd49f58bdeb';
let DATABASE_ID = 'ai-studio-ec5dcb41-6d19-4d80-a694-fdd49f58bdeb';
let API_KEY = '';

try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (cfg.projectId) PROJECT_ID = cfg.projectId;
    if (cfg.firestoreDatabaseId) DATABASE_ID = cfg.firestoreDatabaseId;
    if (cfg.apiKey) API_KEY = cfg.apiKey;
  }
} catch (_) {}

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents`;

function firestoreFetch(docPath: string, options: RequestInit = {}): Promise<Response> {
  const separator = docPath.includes('?') ? '&' : '?';
  const keyParam = API_KEY ? `${separator}key=${API_KEY}` : '';
  const url = `${FIRESTORE_BASE}${docPath}${keyParam}`;
  return fetch(url, options);
}

// Helper: Convert Firestore REST fields to JavaScript Object
function fromFirestore(fields: Record<string, any>): Record<string, any> {
  const res: Record<string, any> = {};
  if (!fields) return res;
  for (const [k, v] of Object.entries(fields)) {
    if (v.stringValue !== undefined) res[k] = v.stringValue;
    else if (v.integerValue !== undefined) res[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) res[k] = Number(v.doubleValue);
    else if (v.booleanValue !== undefined) res[k] = v.booleanValue;
    else if (v.timestampValue !== undefined) res[k] = v.timestampValue;
    else if (v.arrayValue !== undefined) {
      res[k] = (v.arrayValue.values || []).map((val: any) => {
        if (val.stringValue !== undefined) return val.stringValue;
        if (val.integerValue !== undefined) return Number(val.integerValue);
        if (val.booleanValue !== undefined) return val.booleanValue;
        return val;
      });
    } else if (v.mapValue !== undefined) {
      res[k] = fromFirestore(v.mapValue.fields);
    } else if (v.nullValue !== undefined) {
      res[k] = null;
    }
  }
  return res;
}

// Helper: Convert JavaScript Object to Firestore REST fields
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (v === null) {
      fields[k] = { nullValue: null };
    } else if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) {
        fields[k] = { integerValue: v.toString() };
      } else {
        fields[k] = { doubleValue: v };
      }
    } else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map((item) => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { integerValue: item.toString() };
            if (typeof item === 'boolean') return { booleanValue: item };
            return { stringValue: String(item) };
          }),
        },
      };
    } else if (typeof v === 'object') {
      fields[k] = { mapValue: { fields: toFirestoreFields(v) } };
    }
  }
  return fields;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Normalize path (handle /api/... or /.netlify/functions/api/...)
  let pathname = event.path || '';
  if (pathname.startsWith('/.netlify/functions/api')) {
    pathname = pathname.replace('/.netlify/functions/api', '/api');
  }

  try {
    // 1. Health Check
    if (pathname === '/api/health' || pathname === '/api') {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ status: 'ok', time: new Date().toISOString(), platform: 'netlify-functions' }),
      };
    }

    // 2. Site Settings: GET /api/site/settings
    if (pathname === '/api/site/settings' && event.httpMethod === 'GET') {
      const resp = await firestoreFetch('/settings/site_config');
      if (resp.ok) {
        const data = await resp.json();
        const settings = fromFirestore(data.fields);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(settings),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          creatorName: 'Ruma Kumari',
          tagline: 'VIP Exclusive Photos & 4K Ultra Videos',
          bio: 'Welcome to my official VIP collection! 💖 Direct instant access.',
          postsCount: 73,
        }),
      };
    }

    // 3. Site Settings Update: POST /api/admin/settings
    if (pathname === '/api/admin/settings' && (event.httpMethod === 'POST' || event.httpMethod === 'PUT')) {
      const body = JSON.parse(event.body || '{}');
      const fields = toFirestoreFields(body);
      await firestoreFetch('/settings/site_config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, settings: body }),
      };
    }

    // 4. Content List: GET /api/content
    if (pathname === '/api/content' && event.httpMethod === 'GET') {
      // Fetch up to 250 items from Firestore
      const resp = await firestoreFetch('/content?pageSize=250');
      if (resp.ok) {
        const data = await resp.json();
        const documents = data.documents || [];
        const items = documents.map((doc: any) => {
          const id = doc.name.split('/').pop();
          const parsed = fromFirestore(doc.fields);
          return { ...parsed, id: parsed.id || id };
        });

        // Filter unpublished unless admin
        const visibleItems = items.filter((i: any) => i.published !== false);

        // Sort reverse chronological
        visibleItems.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(visibleItems),
        };
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify([]),
      };
    }

    // 5. Admin Create Content: POST /api/admin/content
    if (pathname === '/api/admin/content' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const id = body.id || `rk-${Date.now()}`;
      const item = { ...body, id, createdAt: body.createdAt || new Date().toISOString() };
      const fields = toFirestoreFields(item);

      await firestoreFetch(`/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify(item),
      };
    }

    // 6. Admin Delete Content: POST /api/admin/content/:id/delete or DELETE /api/admin/content/:id
    const deleteMatch = pathname.match(/^\/api\/admin\/content\/([^/]+)(\/delete)?$/);
    if (deleteMatch && (event.httpMethod === 'DELETE' || pathname.endsWith('/delete'))) {
      const contentId = decodeURIComponent(deleteMatch[1]);
      
      // Delete document from Firestore
      await firestoreFetch(`/content/${contentId}`, {
        method: 'DELETE',
      });

      // Record in deletedContent collection
      const delFields = toFirestoreFields({ id: contentId, deletedAt: new Date().toISOString() });
      await firestoreFetch(`/deletedContent/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: delFields }),
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, contentId, firestoreDeleted: true }),
      };
    }

    // 7. Admin Update Content: PUT or POST /api/admin/content/:id
    const updateMatch = pathname.match(/^\/api\/admin\/content\/([^/]+)$/);
    if (updateMatch && (event.httpMethod === 'PUT' || event.httpMethod === 'POST')) {
      const contentId = decodeURIComponent(updateMatch[1]);
      const body = JSON.parse(event.body || '{}');
      const item = { ...body, id: contentId };
      const fields = toFirestoreFields(item);

      await firestoreFetch(`/content/${contentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(item),
      };
    }

    // 8. Deleted IDs List: GET /api/content/deleted-ids
    if (pathname === '/api/content/deleted-ids' && event.httpMethod === 'GET') {
      const resp = await firestoreFetch('/deletedContent?pageSize=250');
      const deletedIds: string[] = [];
      if (resp.ok) {
        const data = await resp.json();
        const documents = data.documents || [];
        documents.forEach((doc: any) => {
          const id = doc.name.split('/').pop();
          if (id) deletedIds.push(id);
        });
      }
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(deletedIds),
      };
    }

    // 9. Payment Proof Submission: POST /api/payment/proof
    if (pathname === '/api/payment/proof' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const orderId = body.orderId || `ord-${Date.now()}`;
      const fields = toFirestoreFields({ ...body, orderId, timestamp: new Date().toISOString() });
      await firestoreFetch(`/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, orderId }),
      };
    }

    // Fallback: 404
    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Endpoint not found', path: pathname }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: error?.message || 'Internal Server Error' }),
    };
  }
};
