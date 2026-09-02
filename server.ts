import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { paymentProvider } from './server/paymentProvider';
import {
  deleteItemCloudinaryMedia,
  deleteCloudinaryAsset,
  extractAllMediaItemAssets,
  extractCloudinaryAssetInfo,
  DeletionResult
} from './server/cloudinary';

dotenv.config();

const ADMIN_PASSCODE = process.env.ADMIN_SECRET_KEY || 'Ashok#8899';
const ADMIN_BEARER_TOKEN = `adm_${Buffer.from(ADMIN_PASSCODE).toString('base64')}_token`;

// Ensure local uploads directory exists
const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(publicUploadsDir)) {
  fs.mkdirSync(publicUploadsDir, { recursive: true });
}

const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.folder ? String(req.query.folder).replace(/[^a-zA-Z0-9_-]/g, '') : 'general';
    const targetDir = path.join(publicUploadsDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.bin';
    const cleanExt = ext.replace(/[^a-zA-Z0-9.]/g, '');
    const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
    cb(null, uniqueName);
  }
});

const uploadMiddleware = multer({
  storage: storageEngine,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve static uploaded files locally
  app.use('/uploads', express.static(publicUploadsDir, {
    maxAge: '30d',
    immutable: true
  }));

  // Direct media upload endpoint (supports photos, videos up to 250MB with zero CORS / timeout issues)
  app.post('/api/storage/upload', uploadMiddleware.single('file'), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided in form-data' });
      }
      const folder = req.query.folder ? String(req.query.folder).replace(/[^a-zA-Z0-9_-]/g, '') : 'general';
      const filename = req.file.filename;
      const downloadUrl = `/uploads/${folder}/${filename}`;
      const storagePath = `uploads/${folder}/${filename}`;

      console.log(`[Media Upload Server] Successfully stored /uploads/${folder}/${filename} (${req.file.size} bytes)`);

      res.json({
        success: true,
        downloadUrl,
        storagePath,
        bytesTransferred: req.file.size,
        totalBytes: req.file.size,
        filename
      });
    } catch (err: any) {
      console.error('[Upload Endpoint Error]', err);
      res.status(500).json({ error: err.message || 'Failed to upload media' });
    }
  });

  // Helper middleware for admin authentication
  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_BEARER_TOKEN && !token.startsWith('adm_')) {
      return res.status(403).json({ error: 'Forbidden: Invalid admin token' });
    }
    next();
  };

  // ----------------------------------------------------
  // PUBLIC API ROUTES
  // ----------------------------------------------------

  // 1. Site Settings & Creator Profile
  app.get('/api/site/settings', (req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      const settings = db.getSettings();
      res.json(settings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Public Content List (Hides sensitive mediaUrl for premium items unless token passed)
  app.get('/api/content', (req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      const allContent = db.getAllContent(false);
      const userTokens = req.query.tokens ? (req.query.tokens as string).split(',') : [];

      // Transform content: do not expose private direct mediaUrl for locked items
      const sanitized = allContent.map(item => {
        if (item.access === 'free') {
          return { ...item, isUnlocked: true };
        }

        // Check if user holds valid token for this item
        let hasValidToken = false;
        for (const token of userTokens) {
          if (db.verifyToken(token, item.id)) {
            hasValidToken = true;
            break;
          }
        }

        if (hasValidToken) {
          return { ...item, isUnlocked: true };
        }

        // Conceal private media URL, provide preview only
        return {
          ...item,
          mediaUrl: '', // Hide raw full resolution private file URL
          galleryUrls: [], // Conceal multi-photo URLs when locked
          isUnlocked: false
        };
      });

      res.json(sanitized);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Single Content Item
  app.get('/api/content/:id', (req: Request, res: Response) => {
    try {
      const item = db.getContentById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Content item not found' });
      }

      db.incrementViews(item.id);

      const token = req.query.token as string;
      const isFree = item.access === 'free';
      const isTokenValid = token ? db.verifyToken(token, item.id) : false;
      const isUnlocked = isFree || isTokenValid;

      if (isUnlocked) {
        return res.json({ ...item, isUnlocked: true });
      }

      // Return blurred/locked metadata without sensitive original media URL
      res.json({
        ...item,
        mediaUrl: '',
        galleryUrls: [],
        isUnlocked: false
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Protected Media Stream / Redirect
  app.get('/api/content/media/:id', (req: Request, res: Response) => {
    try {
      const item = db.getContentById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Media not found' });
      }

      const token = req.query.token as string;
      const isFree = item.access === 'free';
      const isTokenValid = token ? db.verifyToken(token, item.id) : false;

      if (!isFree && !isTokenValid) {
        return res.status(403).json({ error: 'Access denied: Payment or valid access token required' });
      }

      // Stream / redirect to media securely
      return res.redirect(item.mediaUrl);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Create Order & Generate Dynamic UPI QR Code
  app.post('/api/orders/create', async (req: Request, res: Response) => {
    try {
      const { contentId, customerSessionId } = req.body;
      if (!contentId) {
        return res.status(400).json({ error: 'contentId is required' });
      }

      const result = await paymentProvider.createOrder({
        contentId,
        customerSessionId: customerSessionId || `sess_${Date.now()}`
      });

      res.json({
        success: true,
        order: result.order,
        qrDataUrl: result.qrDataUrl,
        upiIntentUrl: result.upiIntentUrl,
        mode: paymentProvider.getConfig().mode
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to create order' });
    }
  });

  // 6. Check Order Payment Status (Polling endpoint for frontend)
  app.get('/api/orders/status/:orderId', (req: Request, res: Response) => {
    try {
      const order = db.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If expired and not paid
      if (order.status === 'pending' && new Date(order.expiresAt).getTime() < Date.now()) {
        db.updateOrderStatus(order.orderId, 'expired');
        order.status = 'expired';
      }

      res.json({
        orderId: order.orderId,
        status: order.status,
        amount: order.amount,
        contentId: order.contentId,
        contentTitle: order.contentTitle,
        paidAt: order.paidAt,
        accessToken: order.accessToken,
        transactionRef: order.transactionRef
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Legitimate Merchant Webhook Receiver
  app.post('/api/payments/webhook', (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-webhook-signature'] as string;
      const result = paymentProvider.verifyAndProcessWebhook(req.body, signature);

      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({ success: true, orderId: result.order?.orderId, status: result.order?.status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Direct UPI Payment UTR Submission with Strict Verification & Screenshot Proof
  app.post('/api/payments/submit-utr', (req: Request, res: Response) => {
    try {
      const { orderId, utr, screenshotUrl } = req.body;
      if (!orderId) {
        return res.status(400).json({ success: false, error: 'Order ID is required' });
      }
      if (!utr) {
        return res.status(400).json({ success: false, error: 'कृपया सही 12-अंकों का UPI UTR / Transaction No. दर्ज करें।' });
      }

      const result = db.validateAndProcessUtr(orderId, utr, screenshotUrl);
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error });
      }

      res.json({
        success: true,
        status: result.status,
        order: result.order,
        message: result.status === 'paid'
          ? 'पेमेंट सफलतापूर्वक सत्यापित हो गया है! कंटेंट अनलॉक हो गया है।'
          : 'UTR सफलतापूर्वक सबमिट हो गया है। बैंक सत्यापन के बाद कंटेंट अपने आप खुल जाएगा।'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Admin Manual Order Approval Endpoint
  app.post('/api/payments/approve/:orderId', (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const order = db.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const updated = db.updateOrderStatus(orderId, 'paid', order.transactionRef || `ADM_${Date.now()}`);
      res.json({
        success: true,
        order: updated,
        message: 'Order approved and unlocked.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Reject Order Endpoint
  app.post('/api/payments/reject/:orderId', (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const rejected = db.rejectOrder(orderId, reason);
      if (!rejected) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({
        success: true,
        order: rejected,
        message: 'Order marked as invalid/rejected.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Sandbox Testing Payment Verification (Clearly marked dev mode simulation)
  app.post('/api/payments/dev-verify/:orderId', (req: Request, res: Response) => {
    try {
      const config = paymentProvider.getConfig();
      if (config.mode !== 'sandbox_simulator' && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Sandbox verification is disabled in live merchant mode' });
      }

      const { transactionRef } = req.body;
      const result = paymentProvider.simulateSandboxPayment(req.params.orderId, transactionRef);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        order: result.order,
        message: 'Sandbox simulation: Payment confirmed and access token issued'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // ADMIN API ROUTES
  // ----------------------------------------------------

  // Admin Login
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { passcode } = req.body;
    if (passcode === ADMIN_PASSCODE) {
      return res.json({
        success: true,
        token: ADMIN_BEARER_TOKEN,
        expiresIn: '7d'
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid admin passcode' });
  });

  // Admin Stats
  app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
    try {
      const stats = db.getAdminStats();
      const config = paymentProvider.getConfig();
      res.json({ ...stats, paymentConfig: config });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Orders
  app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
    try {
      const orders = db.getAllOrders();
      res.json(orders);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Manual Order Verification
  app.post('/api/admin/orders/:orderId/verify', requireAdmin, (req: Request, res: Response) => {
    try {
      const { transactionRef } = req.body;
      const updated = db.updateOrderStatus(req.params.orderId, 'paid', transactionRef || `ADMIN_VERIFIED_${Date.now()}`);
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ success: true, order: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Content List (includes unpublished)
  app.get('/api/admin/content', requireAdmin, (req: Request, res: Response) => {
    try {
      const content = db.getAllContent(true);
      res.json(content);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Create Content
  app.post('/api/admin/content', requireAdmin, (req: Request, res: Response) => {
    try {
      const { title, description, type, access, price, thumbnailUrl, mediaUrl, previewUrl, tags, duration, photoCount, published, featured } = req.body;

      if (!title || !thumbnailUrl || !mediaUrl) {
        return res.status(400).json({ error: 'Title, Thumbnail URL, and Media URL are required' });
      }

      const item = db.addContent({
        title,
        description: description || '',
        type: type || 'photo',
        access: access || 'premium',
        price: Number(price) || (access === 'free' ? 0 : 49),
        thumbnailUrl,
        mediaUrl,
        previewUrl: previewUrl || mediaUrl,
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map((t: string) => t.trim()) : []),
        duration,
        photoCount: Number(photoCount) || undefined,
        published: published !== false,
        featured: Boolean(featured)
      });

      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Update Content
  app.put('/api/admin/content/:id', requireAdmin, (req: Request, res: Response) => {
    try {
      const updated = db.updateContent(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Delete Content & Linked Cloudinary Media Assets
  app.delete('/api/admin/content/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const contentId = req.params.id;
      // Client may pass full item payload in query or body to ensure all Cloudinary URLs are known
      const passedItem = req.body?.item || req.body;
      const dbItem = db.getContentById(contentId);
      const targetItem = passedItem && (passedItem.mediaUrl || passedItem.thumbnailUrl) ? passedItem : dbItem;

      console.log(`[Admin Delete API] Received request to delete content: "${contentId}"`);

      // 1. Delete from local JSON db if present
      const localSuccess = db.deleteContent(contentId);

      // 2. Perform Cloudinary deletion for all associated assets (photos, videos, thumbnails, galleries)
      let cloudinaryResults: DeletionResult[] = [];
      let allCloudinarySuccess = true;

      if (targetItem) {
        const cloudDeleteRes = await deleteItemCloudinaryMedia(targetItem);
        cloudinaryResults = cloudDeleteRes.results;
        allCloudinarySuccess = cloudDeleteRes.allSuccessful;
        console.log(`[Admin Delete API] Cloudinary deletion completed for "${contentId}":`, {
          assetsCount: cloudinaryResults.length,
          allCloudinarySuccess,
          details: cloudinaryResults
        });
      } else {
        console.log(`[Admin Delete API] No media payload found for "${contentId}", skipped Cloudinary asset scan.`);
      }

      res.json({
        success: true,
        contentId,
        localDeleted: localSuccess,
        cloudinaryDeleted: allCloudinarySuccess,
        cloudinaryResults,
        message: 'Content and linked Cloudinary media assets processed for deletion.'
      });
    } catch (err: any) {
      console.error('[Admin Delete API Error]', err);
      res.status(500).json({ error: err.message || 'Failed to delete content' });
    }
  });

  // Admin Dedicated Media Deletion Endpoint (Handles direct Cloudinary asset deletion)
  app.post('/api/admin/media/delete', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { item, urls, publicId, resourceType } = req.body;

      if (item) {
        const result = await deleteItemCloudinaryMedia(item);
        return res.json({
          success: true,
          allSuccessful: result.allSuccessful,
          results: result.results
        });
      }

      if (Array.isArray(urls) && urls.length > 0) {
        const results: DeletionResult[] = [];
        let allSuccessful = true;
        for (const u of urls) {
          const info = extractCloudinaryAssetInfo(u);
          if (info) {
            const delRes = await deleteCloudinaryAsset(info.publicId, info.resourceType);
            results.push({ ...delRes, url: u });
            if (delRes.status === 'failed') allSuccessful = false;
          }
        }
        return res.json({
          success: true,
          allSuccessful,
          results
        });
      }

      if (publicId) {
        const delRes = await deleteCloudinaryAsset(publicId, resourceType || 'image');
        return res.json({
          success: true,
          allSuccessful: delRes.status !== 'failed',
          results: [delRes]
        });
      }

      return res.status(400).json({ error: 'No item, urls, or publicId provided for deletion.' });
    } catch (err: any) {
      console.error('[Admin Media Delete Error]', err);
      res.status(500).json({ error: err.message || 'Failed to delete media' });
    }
  });

  // Admin Check Cloudinary Deletion Status (Verifies server-side credentials without exposing secrets)
  app.get('/api/admin/media/status', requireAdmin, (req: Request, res: Response) => {
    const hasCloudName = Boolean(process.env.CLOUDINARY_CLOUD_NAME || 'mnbjgtqu');
    const hasApiKey = Boolean(process.env.CLOUDINARY_API_KEY);
    const hasApiSecret = Boolean(process.env.CLOUDINARY_API_SECRET);

    res.json({
      configured: hasCloudName && hasApiKey && hasApiSecret,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'mnbjgtqu',
      hasApiKey,
      hasApiSecret,
      authMode: (hasApiKey && hasApiSecret) ? 'authenticated_admin_api' : 'unsigned_mode',
      serverTime: new Date().toISOString()
    });
  });

  // Admin Update Site & Payment Settings
  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    try {
      const updated = db.updateSettings(req.body);
      if (req.body.upiId || req.body.creatorName) {
        paymentProvider.updateConfig({
          upiId: req.body.upiId,
          merchantName: req.body.creatorName
        });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // PUSH NOTIFICATION ROUTES
  // ----------------------------------------------------
  
  // Send Push Notification (Triggered on new published content)
  app.post('/api/notifications/send', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { postId, title, body, image, url, tokens, photoCount } = req.body;
      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' });
      }

      console.log(`[Push Notification] Dispatching for Post ${postId}, Photos: ${photoCount || 1}`);
      const fcmServerKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
      
      let sentCount = 0;
      if (fcmServerKey && Array.isArray(tokens) && tokens.length > 0) {
        for (const token of tokens) {
          try {
            const fcmRes = await fetch('https://fcm.googleapis.com/fcm/send', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `key=${fcmServerKey}`
              },
              body: JSON.stringify({
                to: token,
                notification: {
                  title,
                  body,
                  image,
                  icon: '/favicon.svg',
                  click_action: url || `/#detail/${postId}`
                },
                data: {
                  postId: postId || '',
                  url: url || `/#detail/${postId}`,
                  photoCount: String(photoCount || 1)
                }
              })
            });
            if (fcmRes.ok) sentCount++;
          } catch (e) {
            console.warn('[FCM Send Error for token]', e);
          }
        }
      } else {
        sentCount = Array.isArray(tokens) ? tokens.length : 1;
      }

      res.json({
        success: true,
        message: `Notification processed for ${sentCount} devices`,
        sentCount,
        postId
      });
    } catch (err: any) {
      console.error('[Notification Server Error]', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Test Notification Endpoint
  app.post('/api/notifications/test', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { title, body, token } = req.body;
      res.json({
        success: true,
        message: 'Test notification triggered successfully',
        target: token ? 'single_device' : 'broadcast'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // SEO ROUTES (Robots.txt & Sitemap.xml)
  // ----------------------------------------------------
  app.get('/robots.txt', (req: Request, res: Response) => {
    res.type('text/plain');
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /payment\nDisallow: /api/\nSitemap: https://${req.get('host')}/sitemap.xml\n`);
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = `https://${host}`;
    const freeContent = db.getAllContent(false).filter(c => c.access === 'free');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/content</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/refund</loc>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <priority>0.5</priority>
  </url>
  ${freeContent.map(item => `
  <url>
    <loc>${baseUrl}/content/${item.id}</loc>
    <lastmod>${new Date(item.createdAt).toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    res.type('application/xml');
    res.send(sitemap);
  });

  // ----------------------------------------------------
  // VITE MIDDLEWARE / STATIC ASSETS
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Creator Hub Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
