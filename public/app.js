// app.js (module) — Final version
import "https://cdn.jsdelivr.net/npm/sweetalert2@11";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* ================ GANTI DENGAN FIREBASE CONFIGMU (cek di Console) ================ */
const firebaseConfig = {
  apiKey: "AIzaSyA-bpzo8DSO4mQ4EidayRjpfUTuKc2e2xI",
  authDomain: "sistem-login-aman-f2235.firebaseapp.com",
  projectId: "sistem-login-aman-f2235",
  storageBucket: "sistem-login-aman-f2235.firebasestorage.app",
  messagingSenderId: "777119519491",
  appId: "1:777119519491:web:7b3da4396cf863680e8f36"
};
/* ============================================================================ */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase initialized");

// ------------------ LOGIN / REGISTER (index.html) ------------------
if (typeof window !== 'undefined' && document.body) {
  const btnRegister = document.getElementById('btnRegister');
  const btnLogin = document.getElementById('btnLogin');
  const statusEl = document.getElementById('status');

  if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;

      if (!email || !password) {
        Swal.fire('Peringatan', 'Email dan password wajib diisi.', 'warning');
        return;
      }
      if (!validateEmail(email)) {
        Swal.fire('Format Email Salah', 'Masukkan email yang valid.', 'error');
        return;
      }
      if (password.length < 6) {
        Swal.fire('Password Terlalu Pendek', 'Minimal 6 karakter.', 'error');
        return;
      }

      try {
        const uc = await createUserWithEmailAndPassword(auth, email, password);
        const user = uc.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          created_at: serverTimestamp()
        });

        Swal.fire({ icon:'success', title:'Registrasi Berhasil 🎉', timer:1500, showConfirmButton:false })
          .then(() => {
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
          });
      } catch (err) {
        let msg = 'Terjadi kesalahan.';
        if (err.code === 'auth/email-already-in-use') msg = 'Email sudah digunakan.';
        Swal.fire('Gagal Registrasi', msg, 'error');
      }
    });
  }

  if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        Swal.fire('Peringatan', 'Email dan password wajib diisi.', 'warning');
        return;
      }
      try {
        await signInWithEmailAndPassword(auth, email, password);
        Swal.fire({ icon:'success', title:'Login Berhasil 🚀', timer:1200, showConfirmButton:false })
          .then(() => window.location.href = 'dashboard.html');
      } catch (err) {
        let msg = 'Gagal login.';
        if (err.code === 'auth/invalid-email') msg = 'Format email tidak valid.';
        else if (err.code === 'auth/user-not-found') msg = 'Email tidak terdaftar.';
        else if (err.code === 'auth/wrong-password') msg = 'Password salah.';
        Swal.fire('Login Gagal', msg, 'error');
      }
    });
  }

  onAuthStateChanged(auth, user => {
    if (statusEl) statusEl.innerText = user ? `Sudah login sebagai ${user.email}` : 'Belum login';
  });
}

// ------------------ DASHBOARD (export initDashboard) ------------------
export async function initDashboard() {
  // Protect: jika belum login, redirect ke index
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // kalau halaman dashboard diakses tanpa login maka redirect
      Swal.fire({ icon:'error', title:'Akses Ditolak', text:'Silakan login terlebih dahulu.', timer:1400, showConfirmButton:false })
        .then(() => window.location.href = 'index.html');
      return;
    }
    // DOM elements
    const welcome = document.getElementById('welcome');
    const btnAddTx = document.getElementById('btnAddTx');
    const txList = document.getElementById('txList');
    const btnLogout = document.getElementById('btnLogout');
    const debug = document.getElementById('debug');

    welcome.innerText = `Halo, ${user.email}`;
    await loadTransactions(user.uid, txList, v => { if (debug) debug.innerText = v; });

    // Add transaction handler
    if (btnAddTx) {
      btnAddTx.onclick = async () => {
        const type = document.getElementById('txType').value;
        const amountRaw = document.getElementById('txAmount').value;
        const note = document.getElementById('txNote').value || '';
        const amount = Number(amountRaw);

        if (!amount || amount <= 0) {
          Swal.fire('Input Salah', 'Masukkan jumlah yang valid (>0)', 'warning');
          return;
        }

        try {
          await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            type, amount, note, created_at: serverTimestamp()
          });
          Swal.fire('Berhasil', 'Transaksi tersimpan ✅', 'success');
          document.getElementById('txAmount').value = '';
          document.getElementById('txNote').value = '';
          await loadTransactions(user.uid, txList, v => { if (debug) debug.innerText = v; });
        } catch (err) {
          Swal.fire('Gagal', 'Gagal menyimpan transaksi', 'error');
          console.error(err);
        }
      };
    }

    // Logout handler
    if (btnLogout) {
      btnLogout.onclick = async () => {
        try {
          await signOut(auth);
          Swal.fire({ icon:'info', title:'Logout Berhasil', timer:1000, showConfirmButton:false })
            .then(() => window.location.href = 'index.html');
        } catch (err) {
          Swal.fire('Error', 'Gagal logout', 'error');
        }
      };
    }
  });
}
// ------------------ HELPER: load & render transactions ------------------
async function loadTransactions(uid, containerEl, setDebug) {
  containerEl.innerHTML = '<p>Memuat...</p>';
  try {
    const q = query(collection(db, 'users', uid, 'transactions'), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      containerEl.innerHTML = '<p>Tidak ada transaksi.</p>';
      return;
    }

    const rows = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      const id = docSnap.id;
      const when = d.created_at?.toDate ? d.created_at.toDate().toLocaleString() : '';
      rows.push({ id, type: d.type, amount: d.amount, note: d.note || '', created_at: when });
    });

    // render table
    containerEl.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'txTable';
    table.innerHTML = `
      <thead>
        <tr><th>Tanggal</th><th>Jenis</th><th>Jumlah</th><th>Catatan</th><th>Aksi</th></tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td>${r.created_at}</td>
            <td>${r.type}</td>
            <td>Rp ${r.amount.toLocaleString()}</td>
            <td>${escapeHtml(r.note)}</td>
            <td><button data-id="${r.id}" class="delBtn">Hapus</button></td>
          </tr>`).join('')}
      </tbody>`;
    containerEl.appendChild(table);

    // attach delete handlers
    containerEl.querySelectorAll('.delBtn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        const res = await Swal.fire({
          title: 'Yakin hapus?',
          text: 'Transaksi akan dihapus permanen.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ya, hapus',
          cancelButtonText: 'Batal'
        });
        if (res.isConfirmed) {
          try {
            await deleteDoc(doc(db, 'users', uid, 'transactions', id));
            Swal.fire('Terhapus', 'Transaksi berhasil dihapus', 'success');
            await loadTransactions(uid, containerEl, setDebug);
          } catch (err) {
            Swal.fire('Gagal', 'Gagal menghapus transaksi', 'error');
          }
        }
      });
    });

    setDebug(`Loaded ${rows.length} transaksi.`);
  } catch (err) {
    containerEl.innerHTML = 'Error memuat transaksi: ' + err.message;
    setDebug(err.message);
  }
} // ← ini yang hilang di kode kamu

// ------------------ UTIL ------------------
function escapeHtml(unsafe) {
  return String(unsafe)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}
function validateEmail(email) {
  return /^\S+@\S+\.\S+$/.test(email);
}

if (typeof window !== "undefined") {
  window.initDashboard = initDashboard;
}
