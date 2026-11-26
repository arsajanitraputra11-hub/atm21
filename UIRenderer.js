/**
 * ============================================================
 * Kelas: UIRenderer
 * Bertanggung jawab membangun dan menampilkan HTML ke layar ATM.
 * Murni presentasi — tidak ada logik bisnis di sini.
 * ============================================================
 */
class UIRenderer {
  /**
   * @param {string} screenId - ID elemen container layar di HTML
   */
  constructor(screenId) {
    this.$screen = document.getElementById(screenId);
  }

  /** Render konten HTML ke layar. */
  _render(html) {
    this.$screen.innerHTML = html;
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR LOGIN
  // ══════════════════════════════════════════════════════════

  renderLogin(errorMsg = '', remainingAttempts = 3) {
    const hintRows = DUMMY_CREDENTIALS_HINT.map(c =>
      `<li>Rek: <span>${c.account}</span> | PIN: <span>${c.pin}</span> (${c.name})</li>`
    ).join('');

    const alertHtml = errorMsg
      ? `<div class="alert alert-error">${errorMsg}</div>`
      : '';

    const attemptHtml = (remainingAttempts < 3 && remainingAttempts > 0)
      ? `<div class="attempt-info">⚠️ Sisa percobaan: <strong>${remainingAttempts}</strong> kali</div>`
      : '';

    this._render(`
      <div class="screen-title">
        <h2>🏧 Selamat Datang</h2>
        <p>Masukkan nomor rekening dan PIN Anda</p>
      </div>

      ${alertHtml}
      ${attemptHtml}

      <div class="form-group">
        <label for="inp-account">Nomor Rekening</label>
        <input id="inp-account" type="text" inputmode="numeric"
               placeholder="Contoh: 1234567890" maxlength="20"
               autocomplete="off" />
      </div>

      <div class="form-group">
        <label for="inp-pin">PIN</label>
        <input id="inp-pin" type="password" inputmode="numeric"
               placeholder="••••" maxlength="6"
               autocomplete="off" />
      </div>

      <button class="btn btn-primary" id="btn-login">Masuk</button>

      <div class="hint-box">
        <p>🧪 Akun Demo (data fiktif)</p>
        <ul>${hintRows}</ul>
      </div>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR TERBLOKIR
  // ══════════════════════════════════════════════════════════

  renderBlocked(accountNumber) {
    this._render(`
      <div class="blocked-box">
        <div class="block-icon">🔒</div>
        <h3>Rekening Terblokir</h3>
        <p>
          Rekening <strong>${accountNumber || 'ini'}</strong> telah diblokir sementara
          karena 3 kali percobaan PIN yang salah.<br><br>
          Ini adalah fitur keamanan simulasi. Klik tombol di bawah untuk mereset status.
        </p>
      </div>

      <button class="btn btn-warning" id="btn-reset-sim">🔄 Reset Simulasi (Buka Semua Blokir)</button>

      <div class="alert alert-info text-center" style="font-size:0.75rem">
        ℹ️ Tombol reset hanya tersedia di aplikasi simulasi edukasi ini.
      </div>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR MENU UTAMA
  // ══════════════════════════════════════════════════════════

  renderMainMenu(customer, account) {
    this._render(`
      <div class="welcome-bar">
        <div class="user-info">
          <h3>Halo,</h3>
          <strong>${customer.name}</strong>
          <div class="acc-number">${account.maskedAccountNumber} · ${account.accountType}</div>
        </div>
        <div class="balance-mini">
          <span>Saldo</span>
          <strong>${account.formattedBalance}</strong>
        </div>
      </div>

      <div class="menu-grid">
        <div class="menu-card" id="menu-saldo">
          <div class="card-icon">💰</div>
          <div class="card-label">Cek Saldo</div>
        </div>

        <div class="menu-card" id="menu-setor">
          <div class="card-icon">📥</div>
          <div class="card-label">Setor Tunai</div>
        </div>

        <div class="menu-card" id="menu-tarik">
          <div class="card-icon">📤</div>
          <div class="card-label">Tarik Tunai</div>
        </div>

        <div class="menu-card card-exit" id="menu-keluar">
          <div class="card-icon">🚪</div>
          <div class="card-label">Keluar</div>
        </div>
      </div>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR CEK SALDO
  // ══════════════════════════════════════════════════════════

  renderCheckBalance(account) {
    const txItems = account.transactions.length
      ? account.getRecentTransactions(5).map(tx => `
          <div class="tx-item">
            <div class="tx-desc">
              <strong>${tx.type}</strong>
              ${tx.formattedTime}
            </div>
            <div class="tx-amount ${tx.isDebit ? 'debit' : tx.isCredit ? 'credit' : ''}">
              ${tx.isDebit ? '−' : tx.isCredit ? '+' : ''}
              ${tx.amount > 0 ? tx.formattedAmount : '—'}
            </div>
          </div>
        `).join('')
      : `<div class="tx-empty">Belum ada riwayat transaksi.</div>`;

    this._render(`
      <div class="screen-back-bar">
        <button class="btn-back" id="btn-back">← Kembali</button>
        <h3>💰 Cek Saldo</h3>
      </div>

      <div class="saldo-card">
        <div class="saldo-label">Saldo Tersedia</div>
        <div class="saldo-amount">${account.formattedBalance}</div>
        <div class="saldo-acc">${account.maskedAccountNumber} · ${account.accountType}</div>
      </div>

      <div class="last-tx-title">📋 5 Transaksi Terakhir</div>
      <div class="tx-list">${txItems}</div>

      <button class="btn btn-secondary" id="btn-back-2">Kembali ke Menu</button>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR SETOR TUNAI
  // ══════════════════════════════════════════════════════════

  renderDeposit(account, errorMsg = '') {
    const rules = ATM.rules;
    const alertHtml = errorMsg
      ? `<div class="alert alert-error">${errorMsg}</div>` : '';

    this._render(`
      <div class="screen-back-bar">
        <button class="btn-back" id="btn-back">← Kembali</button>
        <h3>📥 Setor Tunai</h3>
      </div>

      <div class="balance-display">
        <span>Saldo Saat Ini</span>
        <strong>${account.formattedBalance}</strong>
      </div>

      ${alertHtml}

      <div class="form-group">
        <label for="inp-amount">Nominal Setoran</label>
        <input id="inp-amount" type="number" inputmode="numeric"
               placeholder="Kelipatan Rp 50.000"
               min="50000" step="50000" />
      </div>

      <div class="quick-amounts">
        <p>Nominal Cepat</p>
        <div class="quick-btns">
          <button class="btn-quick" data-amount="50000">50rb</button>
          <button class="btn-quick" data-amount="100000">100rb</button>
          <button class="btn-quick" data-amount="200000">200rb</button>
          <button class="btn-quick" data-amount="500000">500rb</button>
          <button class="btn-quick" data-amount="1000000">1jt</button>
          <button class="btn-quick" data-amount="2000000">2jt</button>
        </div>
      </div>

      <div class="alert alert-info" style="font-size:0.72rem">
        Kelipatan ${Account.formatRupiah(rules.multipleOf)} · Maks. ${Account.formatRupiah(rules.maxDeposit)} per transaksi
      </div>

      <button class="btn btn-success" id="btn-confirm">Setor Sekarang</button>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR TARIK TUNAI
  // ══════════════════════════════════════════════════════════

  renderWithdraw(account, errorMsg = '') {
    const rules = ATM.rules;
    const alertHtml = errorMsg
      ? `<div class="alert alert-error">${errorMsg}</div>` : '';

    this._render(`
      <div class="screen-back-bar">
        <button class="btn-back" id="btn-back">← Kembali</button>
        <h3>📤 Tarik Tunai</h3>
      </div>

      <div class="balance-display">
        <span>Saldo Saat Ini</span>
        <strong>${account.formattedBalance}</strong>
      </div>

      ${alertHtml}

      <div class="form-group">
        <label for="inp-amount">Nominal Penarikan</label>
        <input id="inp-amount" type="number" inputmode="numeric"
               placeholder="Kelipatan Rp 50.000"
               min="50000" step="50000" />
      </div>

      <div class="quick-amounts">
        <p>Nominal Cepat</p>
        <div class="quick-btns">
          <button class="btn-quick" data-amount="50000">50rb</button>
          <button class="btn-quick" data-amount="100000">100rb</button>
          <button class="btn-quick" data-amount="200000">200rb</button>
          <button class="btn-quick" data-amount="500000">500rb</button>
          <button class="btn-quick" data-amount="1000000">1jt</button>
          <button class="btn-quick" data-amount="2000000">2jt</button>
        </div>
      </div>

      <div class="alert alert-info" style="font-size:0.72rem">
        Kelipatan ${Account.formatRupiah(rules.multipleOf)} · Maks. tarik ${Account.formatRupiah(rules.maxWithdrawal)} · Saldo min. tersisa ${Account.formatRupiah(rules.minBalance)}
      </div>

      <button class="btn btn-primary" id="btn-confirm">Tarik Sekarang</button>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR HASIL TRANSAKSI
  // ══════════════════════════════════════════════════════════

  renderTransactionResult(success, transaction, message) {
    const isSuccess = success && transaction;

    const resultCard = isSuccess ? `
      <div class="result-card success">
        <div class="result-icon">✅</div>
        <h3>Transaksi Berhasil</h3>
        <p>${message}</p>
      </div>

      <div class="result-details">
        <div class="detail-row">
          <span>Jenis Transaksi</span>
          <span>${transaction.type}</span>
        </div>
        <div class="detail-row">
          <span>Referensi</span>
          <span>${transaction.id}</span>
        </div>
        <div class="divider"></div>
        <div class="detail-row">
          <span>Nominal</span>
          <span class="${transaction.isDebit ? 'highlight-red' : 'highlight-green'}">
            ${transaction.isDebit ? '−' : '+'}${transaction.formattedAmount}
          </span>
        </div>
        <div class="detail-row">
          <span>Saldo Sebelum</span>
          <span>${Account.formatRupiah(transaction.balanceBefore)}</span>
        </div>
        <div class="detail-row">
          <span>Saldo Setelah</span>
          <span class="highlight-green">${transaction.formattedBalanceAfter}</span>
        </div>
        <div class="divider"></div>
        <div class="detail-row">
          <span>Waktu</span>
          <span>${transaction.formattedTime}</span>
        </div>
        <div class="detail-row">
          <span>Status</span>
          <span class="highlight-green">${transaction.status}</span>
        </div>
      </div>
    ` : `
      <div class="result-card error">
        <div class="result-icon">❌</div>
        <h3>Transaksi Gagal</h3>
        <p>${message}</p>
      </div>
    `;

    this._render(`
      ${resultCard}
      <button class="btn btn-secondary" id="btn-back-menu">Kembali ke Menu</button>
    `);
  }

  // ══════════════════════════════════════════════════════════
  // LAYAR KELUAR / BYE
  // ══════════════════════════════════════════════════════════

  renderGoodbye(customerName) {
    this._render(`
      <div class="result-card success" style="margin-top:20px">
        <div class="result-icon">👋</div>
        <h3 style="color:#e2e8f0">Terima Kasih, ${customerName}!</h3>
        <p>Sesi Anda telah berakhir. Semoga harimu menyenangkan.</p>
      </div>

      <div class="alert alert-info text-center" style="font-size:0.75rem">
        🔒 Kartu Anda telah dikeluarkan (simulasi).
      </div>

      <button class="btn btn-primary" id="btn-new-session">Mulai Sesi Baru</button>
    `);
  }
}
