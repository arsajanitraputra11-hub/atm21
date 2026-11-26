/**
 * ============================================================
 * Kelas: Customer (Nasabah)
 * Menyimpan data pribadi nasabah dan referensi ke rekeningnya.
 * ============================================================
 */
class Customer {
  /**
   * @param {string}  id       - ID nasabah unik
   * @param {string}  name     - Nama lengkap
   * @param {string}  email    - Alamat email
   * @param {string}  phone    - Nomor telepon
   * @param {Account} account  - Objek rekening milik nasabah
   */
  constructor(id, name, email, phone, account) {
    this.id      = id;
    this.name    = name;
    this.email   = email;
    this.phone   = phone;
    this.account = account;   // relasi 1:1 untuk simulasi ini
  }

  /** Sapaan singkat: nama depan saja. */
  get firstName() {
    return this.name.split(' ')[0];
  }

  /** Inisial untuk avatar. */
  get initials() {
    return this.name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
