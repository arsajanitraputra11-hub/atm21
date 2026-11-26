/**
 * ============================================================
 * Kelas: ATM
 * Mesin utama yang mengelola sesi, autentikasi, dan transaksi.
 * Ini adalah "controller" utama yang mengikat semua model.
 * ============================================================
 */
class ATM {
  // Aturan transaksi simulasi
  static MULTIPLE_OF       = 50000;   // Kelipatan Rp 50.000
  static MAX_WITHDRAWAL    = 5000000; // Batas tarik per transaksi: Rp 5 juta
  static MAX_DEPOSIT       = 20000000;// Batas setor per transaksi: Rp 20 juta
  static MIN_BALANCE       = 50000;   // Saldo minimum tersisa: Rp 50.000
  static ATM_CASH_LIMIT    = 10000000;// Simulasi: uang tunai di mesin ATM

  /**
   * @param {Customer[]} customers - Semua data nasabah terdaftar
   */
  constructor(customers) {
    this._customers      = customers;   // Database nasabah
    this.activeCustomer  = null;        // Nasabah yang sedang login
    this.activeAccount   = null;        // Rekening aktif
    this.cashAvailable   = ATM.ATM_CASH_LIMIT;
    this._buildIndex();
  }

  /** Buat indeks nomor rekening → Customer untuk lookup O(1). */
  _buildIndex() {
    this._accountIndex = new Map();
    for (const customer of this._customers) {
      this._accountIndex.set(customer.account.accountNumber, customer);
    }
  }

  // ── Authentication ─────────────────────────────────────────

  /**
   * Coba login dengan nomor rekening + PIN.
   * @returns {{ success: boolean, message: string, customer?: Customer }}
   */
  login(accountNumber, pin) {
    const customer = this._accountIndex.get(accountNumber);

    if (!customer) {
      return { success: false, message: 'Nomor rekening tidak ditemukan.' };
    }

    const account = customer.account;

    if (account.isLocked) {
      return {
        success: false,
        message: 'Rekening terblokir karena 3x salah PIN. Gunakan tombol Reset Simulasi.',
        locked: true
      };
    }

    const pinOk = account.verifyPin(pin);

    if (!pinOk) {
      const left = account.remainingAttempts;
      if (account.isLocked) {
        return {
          success: false,
          message: 'PIN salah. Rekening terblokir.',
          locked: true
        };
      }
      return {
        success: false,
        message: `PIN salah. Sisa percobaan: ${left}`,
        remainingAttempts: left
      };
    }

    // Login berhasil — buka sesi
    this.activeCustomer = customer;
    this.activeAccount  = account;

    // Catat transaksi cek saldo otomatis saat masuk
    const tx = new Transaction(
      Transaction.TYPE_BALANCE, 0,
      account.balance, account.balance,
      Transaction.STATUS_SUCCESS, 'Login berhasil'
    );
    account.addTransaction(tx);

    return { success: true, message: `Selamat datang, ${customer.firstName}!`, customer };
  }

  /** Akhiri sesi aktif. */
  logout() {
    this.activeCustomer = null;
    this.activeAccount  = null;
  }

  // ── Validasi Nominal ───────────────────────────────────────

  /**
   * Pastikan nominal valid: > 0, kelipatan Rp 50.000.
   * @returns {{ valid: boolean, message: string }}
   */
  validateAmount(amount) {
    if (!Number.isInteger(amount) || isNaN(amount)) {
      return { valid: false, message: 'Nominal harus berupa angka bulat.' };
    }
    if (amount <= 0) {
      return { valid: false, message: 'Nominal harus lebih besar dari Rp 0.' };
    }
    if (amount % ATM.MULTIPLE_OF !== 0) {
      return {
        valid: false,
        message: `Nominal harus kelipatan ${Account.formatRupiah(ATM.MULTIPLE_OF)}.`
      };
    }
    return { valid: true, message: 'OK' };
  }

  // ── Transactions ───────────────────────────────────────────

  /**
   * Cek Saldo — tidak butuh nominal, hanya tampil saldo.
   * @returns {{ success: boolean, balance: number, formattedBalance: string }}
   */
  checkBalance() {
    this._requireSession();
    return {
      success: true,
      balance: this.activeAccount.balance,
      formattedBalance: this.activeAccount.formattedBalance,
      transactions: this.activeAccount.getRecentTransactions(5)
    };
  }

  /**
   * Setor Tunai.
   * @param {number} amount
   * @returns {{ success: boolean, message: string, transaction?: Transaction }}
   */
  deposit(amount) {
    this._requireSession();
    const acc = this.activeAccount;

    const validation = this.validateAmount(amount);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    if (amount > ATM.MAX_DEPOSIT) {
      return {
        success: false,
        message: `Batas setor per transaksi adalah ${Account.formatRupiah(ATM.MAX_DEPOSIT)}.`
      };
    }

    const before = acc.balance;
    acc.credit(amount);
    const after = acc.balance;

    const tx = new Transaction(
      Transaction.TYPE_DEPOSIT, amount, before, after,
      Transaction.STATUS_SUCCESS
    );
    acc.addTransaction(tx);

    return {
      success: true,
      message: 'Setoran berhasil diproses.',
      transaction: tx
    };
  }

  /**
   * Tarik Tunai.
   * @param {number} amount
   * @returns {{ success: boolean, message: string, transaction?: Transaction }}
   */
  withdraw(amount) {
    this._requireSession();
    const acc = this.activeAccount;

    const validation = this.validateAmount(amount);
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Cek batas maksimal per transaksi
    if (amount > ATM.MAX_WITHDRAWAL) {
      return {
        success: false,
        message: `Batas tarik per transaksi adalah ${Account.formatRupiah(ATM.MAX_WITHDRAWAL)}.`
      };
    }

    // Cek saldo minimum tersisa
    const afterBalance = acc.balance - amount;
    if (afterBalance < ATM.MIN_BALANCE) {
      return {
        success: false,
        message: `Saldo tidak mencukupi. Saldo minimum tersisa adalah ${Account.formatRupiah(ATM.MIN_BALANCE)}.`
      };
    }

    // Cek ketersediaan uang di mesin ATM (simulasi)
    if (amount > this.cashAvailable) {
      return {
        success: false,
        message: `Mesin ATM tidak memiliki cukup uang tunai. Tersedia: ${Account.formatRupiah(this.cashAvailable)}.`
      };
    }

    const before = acc.balance;
    acc.debit(amount);
    this.cashAvailable -= amount;
    const after = acc.balance;

    const tx = new Transaction(
      Transaction.TYPE_WITHDRAWAL, amount, before, after,
      Transaction.STATUS_SUCCESS
    );
    acc.addTransaction(tx);

    return {
      success: true,
      message: 'Penarikan berhasil diproses.',
      transaction: tx
    };
  }

  // ── Session Guard ──────────────────────────────────────────

  /** Lempar error jika tidak ada sesi aktif. */
  _requireSession() {
    if (!this.activeCustomer || !this.activeAccount) {
      throw new Error('Tidak ada sesi ATM aktif. Silakan login terlebih dahulu.');
    }
  }

  // ── Admin / Simulasi ───────────────────────────────────────

  /** Reset semua rekening yang terkunci (tombol reset simulasi). */
  resetAllLocks() {
    for (const customer of this._customers) {
      customer.account.resetLock();
    }
  }

  /** Info aturan transaksi (untuk ditampilkan di UI). */
  static get rules() {
    return {
      multipleOf:    ATM.MULTIPLE_OF,
      maxWithdrawal: ATM.MAX_WITHDRAWAL,
      maxDeposit:    ATM.MAX_DEPOSIT,
      minBalance:    ATM.MIN_BALANCE
    };
  }
}
