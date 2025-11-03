// messages.js
// Resource pesan untuk dukungan multi-bahasa (saat ini: Bahasa Indonesia)
export default {
  // Pesan autentikasi
  invalidEmail: 'Format email tidak valid.',
  passwordTooShort: 'Password harus minimal 6 karakter.',
  registrationSuccess: 'Registrasi berhasil! Silakan login.',
  emailInUse: 'Email sudah terdaftar. Silakan login atau gunakan email lain.',
  weakPassword: 'Password terlalu lemah. Gunakan minimal 6 karakter.',
  userNotFound: 'Pengguna tidak ditemukan. Periksa email atau daftar terlebih dahulu.',
  wrongPassword: 'Password salah.',
  genericErrorPrefix: 'Terjadi kesalahan: ',
  genericError: 'Terjadi kesalahan. Coba lagi.',
  tooManyAttempts: 'Terlalu banyak percobaan. Silakan tunggu beberapa menit sebelum mencoba lagi.',
  logoutSuccess: 'Berhasil logout.',

  // Pesan transaksi
  amountRequired: 'Jumlah harus lebih dari 0',
  categoryRequired: 'Pilih kategori transaksi',
  transactionSuccess: 'Transaksi berhasil ditambahkan',
  transactionDeleted: 'Transaksi berhasil dihapus',
  deleteConfirm: 'Hapus transaksi ini?',
  loadError: 'Gagal memuat transaksi: ',
  addError: 'Gagal menambah transaksi: ',
  deleteError: 'Gagal menghapus transaksi: ',
  loginRequired: 'Anda harus login untuk mengelola transaksi',
  noTransactions: 'Belum ada transaksi.'
};
