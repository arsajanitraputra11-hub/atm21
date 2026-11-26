/**
 * ============================================================
 * dummyData.js — Data Fiktif untuk Simulasi ATM
 * PERINGATAN: Semua data di bawah ini adalah data rekaan/fiktif
 * dan tidak mewakili rekening bank nyata manapun.
 * ============================================================
 */

/** Buat dan kembalikan instance ATM yang sudah terisi data dummy. */
function createDummyATM() {

  // ── Data Nasabah Dummy ──────────────────────────────────────
  // Format: Account(nomorRekening, PIN, saldoAwal, jenisRekening)
  //         Customer(id, namaLengkap, email, telepon, account)

  const customers = [

    new Customer(
      'CST-001',
      'Budi Santoso',
      'budi.santoso@simmail.id',
      '081234567890',
      new Account('1234567890', '1234', 2_500_000, 'Tabungan')
    ),

    new Customer(
      'CST-002',
      'Siti Rahayu',
      'siti.rahayu@simmail.id',
      '082345678901',
      new Account('0987654321', '5678', 8_750_000, 'Tabungan')
    ),

    new Customer(
      'CST-003',
      'Ahmad Fauzi',
      'ahmad.fauzi@simmail.id',
      '083456789012',
      new Account('1122334455', '9999', 15_000_000, 'Giro')
    ),

    new Customer(
      'CST-004',
      'Dewi Lestari',
      'dewi.lestari@simmail.id',
      '084567890123',
      new Account('5544332211', '0000', 500_000, 'Tabungan')
    ),

  ];

  // Kembalikan instance mesin ATM beserta seluruh nasabah
  return new ATM(customers);
}

/**
 * Daftar hint kredensial yang ditampilkan di halaman login
 * untuk memudahkan pengujian simulasi.
 */
const DUMMY_CREDENTIALS_HINT = [
  { account: '1234567890', pin: '1234', name: 'Budi Santoso' },
  { account: '0987654321', pin: '5678', name: 'Siti Rahayu' },
  { account: '1122334455', pin: '9999', name: 'Ahmad Fauzi' },
  { account: '5544332211', pin: '0000', name: 'Dewi Lestari' },
];
