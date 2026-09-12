<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';

require_once dirname(__DIR__) . '/app/Middleware/AuthMiddleware.php';
require_once dirname(__DIR__) . '/app/Models/Order.php';

use App\Middleware\AuthMiddleware;
use App\Models\Order;

$admin = AuthMiddleware::requireAdmin();

$statusFilter = $_GET['status'] ?? 'all';
$orders = Order::getAll(100, $statusFilter);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin - Orders & Manual Review</title>
  <link rel="stylesheet" href="/public/assets/style.css">
  <style>
    body { display: block; padding: 24px; }
    .admin-container { max-width: 1100px; margin: 0 auto; }
    .table-card { background: #0b101b; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; padding: 20px; }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
    th { padding: 12px; border-bottom: 1px solid #1e293b; color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 11px; }
    td { padding: 14px 12px; border-bottom: 1px solid #141e33; color: white; }
    .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; display: inline-block; }
    .status-paid { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
    .status-manual { background: rgba(249, 115, 22, 0.2); color: #f97316; border: 1px solid #f97316; }
    .status-pending { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }
    .status-failed { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .action-btn { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-review { background: #ff5500; color: white; border: none; }
    .btn-approved { background: #10b981; color: white; border: none; }
  </style>
</head>
<body>
  <div class="admin-container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 900;">UPI Orders & Verification Audit</h1>
        <p style="font-size: 13px; color: #94a3b8;">Logged in as: <strong><?php echo htmlspecialchars($admin['username']); ?></strong></p>
      </div>
      <div style="display: flex; gap: 10px;">
        <a href="/admin/orders.php?status=all" class="action-btn" style="background:#1e293b; color:white;">All</a>
        <a href="/admin/orders.php?status=manual_review" class="action-btn" style="background:#f97316; color:white;">Manual Review Queue</a>
        <a href="/admin/orders.php?status=paid" class="action-btn" style="background:#10b981; color:white;">Paid</a>
      </div>
    </div>

    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Proof / UTR</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($orders)): ?>
            <tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 30px;">No orders found in this filter</td></tr>
          <?php else: ?>
            <?php foreach ($orders as $o): ?>
              <tr>
                <td><code style="font-weight: 700; color: #38bdf8;"><?php echo htmlspecialchars($o['order_id']); ?></code></td>
                <td><?php echo htmlspecialchars($o['customer_name'] ?: 'Guest'); ?></td>
                <td><strong>₹<?php echo number_format((float)$o['amount'], 2); ?></strong></td>
                <td>
                  <?php if ($o['status'] === 'paid'): ?>
                    <span class="status-badge status-paid">✓ PAID</span>
                  <?php elseif ($o['status'] === 'manual_review'): ?>
                    <span class="status-badge status-manual">⚠ MANUAL REVIEW</span>
                  <?php elseif ($o['status'] === 'failed'): ?>
                    <span class="status-badge status-failed">✗ FAILED</span>
                  <?php else: ?>
                    <span class="status-badge status-pending"><?php echo strtoupper($o['status']); ?></span>
                  <?php endif; ?>
                </td>
                <td>
                  <?php if (!empty($o['proof_path'])): ?>
                    <a href="<?php echo htmlspecialchars($o['proof_path']); ?>" target="_blank" style="color: #38bdf8; font-size: 12px; font-weight: 700;">
                      View Screenshot ↗
                    </a>
                  <?php elseif (!empty($o['utr_reference'])): ?>
                    <span style="font-family: monospace; font-size: 11px;"><?php echo htmlspecialchars($o['utr_reference']); ?></span>
                  <?php else: ?>
                    <span style="color: #64748b;">None</span>
                  <?php endif; ?>
                </td>
                <td style="color: #94a3b8; font-size: 12px;"><?php echo htmlspecialchars($o['created_at']); ?></td>
                <td>
                  <a href="/admin/review.php?order=<?php echo urlencode($o['order_id']); ?>" class="action-btn btn-review">
                    Inspect & Verify
                  </a>
                </td>
              </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
