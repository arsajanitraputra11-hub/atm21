/**
 * ============================================================
 * Kelas: Account (Rekening)
 * Bertanggung jawab menyimpan data rekening bank satu nasabah.
 * Menyediakan metode kredit/debit saldo dan histori transaksi.
 * ============================================================
 */
class Account {
  /**
   * @param {string} accountNumber  - Nomor rekening unik
   * @param {string} pin            - PIN rekening (simulasi, plain string)
   * @param {number} initialBalance - Saldo awal
   * @param {string} accountType    - Jenis rekening: 'Tabungan' | 'Giro'
   */
  constructor(accountNumber, pin, initialBalance, accountType = 'Tabungan') {
    this.accountNumber  = accountNumber;
    this._pin           = pin;              // Private by convention
    this.balance        = initialBalance;
    this.accountType    = accountType;
    this.transactions   = [];               // Array of Transaction
    this.isLocked       = false;
    this.failedAttempts = 0;
    this.MAX_ATTEMPTS   = 3;
  }

  // ── PIN Validation ─────────────────────────────────────────

  /** Verifikasi PIN. Menambah percobaan gagal jika salah. */
  verifyPin(inputPin) {
    if (this.isLocked) return false;
    if (inputPin === this._pin) {
      this.failedAttempts = 0;  // Reset jika berhasil
      return true;
    }
    this.failedAttempts++;
    if (this.failedAttempts >= this.MAX_ATTEMPTS) {
      this.isLocked = true;
    }
    return false;
  }

  /** Reset status kunci (untuk keperluan simulasi/testing). */
  resetLock() {
    this.isLocked       = false;
    this.failedAttempts = 0;
  }

  /** Sisa percobaan login. */
  get remainingAttempts() {
    return Math.max(0, this.MAX_ATTEMPTS - this.failedAttempts);
  }

  // ── Balance Operations ─────────────────────────────────────

  /**
   * Menambah saldo (setoran/kredit).
   * @param {number} amount
   * @returns {boolean}
   */
  credit(amount) {
    if (amount <= 0) return false;
    this.balance += amount;
    return true;
  }

  /**
   * Mengurangi saldo (penarikan/debit).
   * @param {number} amount
   * @returns {boolean}
   */
  debit(amount) {
    if (amount <= 0 || amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }

  // ── Transaction History ────────────────────────────────────

  /** Simpan objek Transaction ke histori rekening. */
  addTransaction(transaction) {
    this.transactions.unshift(transaction); // terbaru di depan
  }

  /** Ambil N transaksi terakhir. */
  getRecentTransactions(n = 5) {
    return this.transactions.slice(0, n);
  }

  // ── Utilities ─────────────────────────────────────────────

  /** Format saldo sebagai string Rupiah. */
  get formattedBalance() {
    return Account.formatRupiah(this.balance);
  }

  static formatRupiah(amount) {
    return 'Rp ' + Number(amount).toLocaleString('id-ID');
  }

  /** Nomor rekening yang disamarkan sebagian. */
  get maskedAccountNumber() {
    const n = this.accountNumber;
    return n.slice(0, 3) + '•••••' + n.slice(-3);
  }
}
