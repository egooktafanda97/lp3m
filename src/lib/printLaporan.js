"use client";

const LOGO_URL = "https://uniks.ac.id/images/logo-header.png";

/**
 * Membuka jendela print dengan kop surat + tabel + tanda tangan.
 * User bisa "Save as PDF" dari dialog print browser.
 */
export function printLaporan({ judul, rows, columns, jenis }) {
  const tanggalCetak = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tableHeaders = columns.map((c) => `<th>${c.title}</th>`).join("");
  const tableRows = rows
    .map(
      (row, i) =>
        `<tr>
          <td class="no">${i + 1}</td>
          ${columns
            .map((c) => {
              const val = c.render ? c.render(row[c.dataIndex], row) : (row[c.dataIndex] ?? "-");
              return `<td>${escapeHtml(String(val ?? "-"))}</td>`;
            })
            .join("")}
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(judul)}</title>
  <style>
    @page { size: A4; margin: 16mm 14mm; }
    * { box-sizing: border-box; }
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 11pt;
      color: #000;
      margin: 0;
      padding: 0;
    }
    .kop {
      border-bottom: 3px double #1a4d2e;
      padding-bottom: 10px;
      margin-bottom: 4px;
      text-align: center;
    }
    .kop-logo-img {
      display: block;
      max-width: 100%;
      max-height: 72px;
      width: auto;
      height: auto;
      margin: 0 auto 8px;
      object-fit: contain;
    }
    .kop-text h1 {
      margin: 0;
      font-size: 14pt;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #1a4d2e;
    }
    .kop-text h2 {
      margin: 3px 0 0;
      font-size: 12pt;
      text-transform: uppercase;
      color: #1a4d2e;
    }
    .kop-text p {
      margin: 4px 0 0;
      font-size: 9pt;
      line-height: 1.35;
    }
    .judul-laporan {
      text-align: center;
      margin: 18px 0 6px;
    }
    .judul-laporan h3 {
      margin: 0;
      font-size: 13pt;
      text-transform: uppercase;
      text-decoration: underline;
    }
    .meta {
      text-align: center;
      font-size: 10pt;
      margin-bottom: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px 6px;
      vertical-align: top;
    }
    th {
      background: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    td.no { text-align: center; width: 32px; }
    .ttd {
      margin-top: 40px;
      display: flex;
      justify-content: flex-end;
    }
    .ttd-box {
      width: 240px;
      text-align: center;
      font-size: 11pt;
    }
    .ttd-box .jabatan { margin-bottom: 70px; }
    .ttd-box .nama {
      font-weight: bold;
      text-decoration: underline;
      margin: 0;
    }
    .ttd-box .nip { margin: 2px 0 0; font-size: 10pt; }
    .footer-note {
      margin-top: 24px;
      font-size: 8pt;
      color: #444;
      border-top: 1px solid #ccc;
      padding-top: 6px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="kop">
    <img
      class="kop-logo-img"
      src="${LOGO_URL}"
      alt="Logo Universitas Islam Kuantan Singingi"
    />
    <div class="kop-text">
      <h1>Universitas Islam Kuantan Singingi</h1>
      <h2>Lembaga Pengembangan Pembelajaran dan Penjaminan Mutu (LP3M)</h2>
      <p>
        Jl. Gatot Subroto KM 7, Teluk Kuantan, Kabupaten Kuantan Singingi, Riau<br/>
        Email: lp3m@uniks.ac.id · Website: https://uniks.ac.id
      </p>
    </div>
  </div>

  <div class="judul-laporan">
    <h3>${escapeHtml(judul)}</h3>
  </div>
  <div class="meta">
    Dicetak pada: ${escapeHtml(tanggalCetak)} · Kode: ${escapeHtml(jenis.toUpperCase())}
  </div>

  <table>
    <thead>
      <tr>
        <th>No</th>
        ${tableHeaders}
      </tr>
    </thead>
    <tbody>
      ${tableRows || `<tr><td colspan="${columns.length + 1}" style="text-align:center">Tidak ada data</td></tr>`}
    </tbody>
  </table>

  <div class="ttd">
    <div class="ttd-box">
      <p>Teluk Kuantan, ${escapeHtml(
        new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )}</p>
      <p class="jabatan">&nbsp;</p>
      <p class="nama">________________________</p>
      <p class="nip">NIP. ........................</p>
    </div>
  </div>

  <div class="footer-note">
    Dokumen ini digenerate oleh Sistem Informasi Ujian ICT &amp; TOEFL —
    Universitas Islam Kuantan Singingi (LP3M UNIKS). Jumlah data: ${rows.length} baris.
  </div>

  <script>
    (function () {
      function doPrint() {
        setTimeout(function () { window.print(); }, 200);
      }
      var img = document.querySelector(".kop-logo-img");
      if (img && !img.complete) {
        img.onload = doPrint;
        img.onerror = doPrint;
        // fallback jika load lama
        setTimeout(doPrint, 2500);
      } else {
        doPrint();
      }
    })();
  </script>
</body>
</html>
`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) {
    alert("Popup diblokir. Izinkan popup untuk mencetak PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
