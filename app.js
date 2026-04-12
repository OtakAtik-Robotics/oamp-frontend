const BASE_URL = "http://localhost:8080/api/v1";

// LAPISAN KEAMANAN 3: Sanitasi Output (Mencegah XSS - Cross Site Scripting)
// fungsi ini akan merubah tanda < > menjadi simbol aman saat ditampilkan di web.
function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Fungsi untuk pindah antar menu
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(el => el.classList.add('d-none'));
    document.getElementById('section-' + sectionId).classList.remove('d-none');
    document.getElementById('alert-box').classList.add('d-none');

    if(sectionId === 'ranking') loadLeaderboard();
    if(sectionId === 'monitor') checkHealth();
}

function showAlert(message, type) {
    const alertBox = document.getElementById('alert-box');
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message; // textContent aman dari XSS dibandingkan innerHTML
    alertBox.classList.remove('d-none');
    setTimeout(() => alertBox.classList.add('d-none'), 5000);
}

// INPUT DATA (POST /participants)
document.getElementById('form-register').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    // LAPISAN KEAMANAN 4: Mencegah Spam Klik / Double Submit
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Memproses...';

    const data = {
        // Menggunakan trim() untuk membuang spasi kosong di awal/akhir yang tidak sengaja terketik
        uid: document.getElementById('uid').value.trim(),
        name: document.getElementById('name').value.trim(),
        age: parseInt(document.getElementById('age').value),
        grade: document.getElementById('grade').value.trim(),
        gender: document.getElementById('gender').value,
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value)
    };

    try {
        const response = await fetch(`${BASE_URL}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            showAlert('Peserta berhasil didaftarkan!', 'success');
            document.getElementById('form-register').reset();
        } else {
            showAlert('Gagal: ' + escapeHTML(result.message), 'danger');
        }
    } catch (error) {
        showAlert('Error koneksi ke server. Pastikan server Go berjalan.', 'danger');
    } finally {
        // Mengembalikan tombol seperti semula
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Daftarkan Peserta';
    }
});

// LEADERBOARD (GET /leaderboard)
async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '<tr><td colspan="5">Memuat data...</td></tr>';

    try {
        const response = await fetch(`${BASE_URL}/leaderboard`);
        const result = await response.json();

        if (response.ok && result.status === 'success') {
            tbody.innerHTML = ''; 
            
            if(result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5">Belum ada data sesi permainan.</td></tr>';
                return;
            }

            result.data.forEach(item => {
                const tr = document.createElement('tr');
                // Menggunakan escapeHTML pada input string dari database
                tr.innerHTML = `
                    <td><span class="badge bg-primary">${item.rank}</span></td>
                    <td class="fw-bold">${escapeHTML(item.name)}</td>
                    <td>${escapeHTML(item.grade)}</td>
                    <td>${item.visuo_spatial_fit}</td>
                    <td>${item.total_time}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-danger">Gagal memuat data dari server.</td></tr>';
    }
}

// CEK SERVER HEALTH (GET /health)
async function checkHealth() {
    const statusEl = document.getElementById('server-status');
    statusEl.textContent = 'Mengecek...';
    statusEl.className = 'badge bg-warning text-dark';

    try {
        const response = await fetch(`http://localhost:8080/health`);
        if (response.ok) {
            statusEl.textContent = 'Server & Database Aktif';
            statusEl.className = 'badge bg-success';
        } else {
            statusEl.textContent = 'Database Error';
            statusEl.className = 'badge bg-danger';
        }
    } catch (error) {
        statusEl.textContent = 'Server Mati / Tidak Terhubung';
        statusEl.className = 'badge bg-danger';
    }
}