/**
 * Dark Premium UPI Checkout Client Engine
 * Handles order creation, app deep linking, screenshot upload, live status polling
 */

class UpiCheckout {
  constructor(options = {}) {
    this.orderId = options.orderId || null;
    this.pollInterval = null;
    this.timerInterval = null;
    this.secondsLeft = options.secondsLeft || (29 * 60 + 29); // 29:29
    this.init();
  }

  init() {
    this.initTimer();
    this.initFilePicker();
    this.initPolling();
  }

  initTimer() {
    const timerEl = document.getElementById('countdown-timer');
    if (!timerEl) return;

    this.timerInterval = setInterval(() => {
      if (this.secondsLeft <= 0) {
        clearInterval(this.timerInterval);
        timerEl.textContent = '00:00';
        return;
      }
      this.secondsLeft--;
      const m = Math.floor(this.secondsLeft / 60);
      const s = this.secondsLeft % 60;
      timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  initFilePicker() {
    const fileInput = document.getElementById('screenshot-file');
    const filenameLabel = document.getElementById('chosen-filename');
    const previewImg = document.getElementById('preview-thumb');

    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (filenameLabel) filenameLabel.textContent = file.name;
        if (previewImg) {
          const reader = new FileReader();
          reader.onload = (re) => {
            previewImg.src = re.target.result;
            previewImg.style.display = 'block';
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }

  initPolling() {
    if (!this.orderId) {
      const urlParams = new URLSearchParams(window.location.search);
      this.orderId = urlParams.get('order') || urlParams.get('order_id');
    }

    if (!this.orderId) return;

    // Poll every 2.5 seconds
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/status.php?order=${encodeURIComponent(this.orderId)}`);
        const data = await res.json();
        if (data.success && data.status === 'paid') {
          clearInterval(this.pollInterval);
          window.location.href = `/public/success.php?order=${encodeURIComponent(this.orderId)}`;
        }
      } catch (err) {
        console.warn('Status poll error:', err);
      }
    }, 2500);
  }

  copyOrderId() {
    if (!this.orderId) return;
    navigator.clipboard.writeText(this.orderId).then(() => {
      const copyBtn = document.getElementById('btn-copy-order');
      if (copyBtn) {
        copyBtn.textContent = '✓ Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.upiCheckoutApp = new UpiCheckout();
});
