<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/config/app.php';

$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    $db = Database::getConnection();
    $stmt = $db->prepare("SELECT * FROM admins WHERE username = :username AND is_active = 1 LIMIT 1");
    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch();

    if ($admin && password_verify($password, $admin['password_hash'])) {
        $_SESSION['admin_user'] = [
            'id' => $admin['id'],
            'username' => $admin['username'],
            'role' => $admin['role']
        ];
        header('Location: /admin/orders.php');
        exit;
    } else {
        $error = 'Invalid username or password';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - UPI Gateway</title>
  <link rel="stylesheet" href="/public/assets/style.css">
</head>
<body>
  <div class="checkout-container" style="max-width: 380px;">
    <div class="checkout-header">
      <div class="section-label orange">SECURITY ACCESS</div>
      <h1>Admin Portal</h1>
      <p>Sign in to manage UPI orders and manual reviews.</p>
    </div>

    <div class="checkout-body">
      <?php if ($error): ?>
        <div style="background-color: rgba(225,29,72,0.2); border: 1px solid #e11d48; color: #fecdd3; padding: 10px 14px; border-radius: 12px; font-size: 12px; margin-bottom: 14px;">
          ⚠ <?php echo htmlspecialchars($error); ?>
        </div>
      <?php endif; ?>

      <form method="POST">
        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 12px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Username</label>
          <input type="text" name="username" value="admin" required style="width: 100%; padding: 12px 14px; background: #080d1a; border: 1px solid var(--border-subtle); border-radius: 12px; color: white; font-size: 13px;">
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 12px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Password</label>
          <input type="password" name="password" placeholder="••••••••" required style="width: 100%; padding: 12px 14px; background: #080d1a; border: 1px solid var(--border-subtle); border-radius: 12px; color: white; font-size: 13px;">
        </div>

        <button type="submit" class="btn-orange-action" style="margin-top: 0;">
          Sign In to Dashboard →
        </button>
      </form>

      <div class="warning-disclaimer">
        Default credentials: <code>admin</code> / <code>Admin@123456</code>
      </div>
    </div>
  </div>
</body>
</html>
