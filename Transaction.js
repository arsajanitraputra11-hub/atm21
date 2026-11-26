/**
 * ============================================================
 * Kelas: Transaction (Transaksi)
 * Merepresentasikan satu catatan transaksi ATM.
 * Bersifat immutable setelah dibuat (snapshot).
 * ============================================================
 */
class Transaction {
  static TYPE_DEPOSIT    = 'Setor Tunai';
  static TYPE_WITHDRAWAL = 'Tarik Tunai';
  static TYPE_BALANCE    = 'Cek Saldo';

  static STATUS_SUCCESS = 'Berhasil';
  static STATUS_FAILED  = 'Gagal';

  /**
   * @param {string} type          - Jenis transaksi (gunakan konstanta TYPE_*)
   * @param {number} amount        - Nominal transaksi (0 untuk cek saldo)
   * @param {number} balanceBefore - Saldo sebelum transaksi
   * @param {number} balanceAfter  - Saldo setelah transaksi
   * @param {string} status        - 'Berhasil' | 'Gagal'
   * @param {string} [note]        - Keterangan tambahan
   */
  constructor(type, amount, balanceBefore, balanceAfter, status, note = '') {
    this.id            = Transaction._generateId();
    this.type          = type;
    this.amount        = amount;
    this.balanceBefore = balanceBefore;
    this.balanceAfter  = balanceAfter;
    this.status        = status;
    this.note          = note;
    this.timestamp     = new Date();
  }

  /** ID transaksi referensi (REF-xxxxxxxx). */
  static _generateId() {
    return 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /** Waktu terformat: DD/MM/YYYY HH:MM:SS */
  get formattedTime() {
    const d = this.timestamp;
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  /** true jika transaksi mengurangi saldo. */
  get isDebit() {
    return this.type === Transaction.TYPE_WITHDRAWAL;
  }

  /** true jika transaksi menambah saldo. */
  get isCredit() {
    return this.type === Transaction.TYPE_DEPOSIT;
  }

  /** Nominal terformat Rupiah. */
  get formattedAmount() {
    return Account.formatRupiah(this.amount);
  }

  /** Saldo akhir terformat. */
  get formattedBalanceAfter() {
    return Account.formatRupiah(this.balanceAfter);
  }
}
