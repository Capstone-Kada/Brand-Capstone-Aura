"""
skintone_undertone.py
=======================
Modul inti untuk ekstraksi ROI kulit, klasifikasi skintone (kecerahan kulit)
dan undertone (warm/cool/neutral) dengan mitigasi pencahayaan buruk.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Tuple

import numpy as np

from .color_utils import (
    bgr_to_hsv_single_color,
    bgr_to_lab_single_color,
    extract_square_patch,
    get_robust_mean_color_bgr,
    remove_shadow_and_highlight_pixels,
)
from .landmark_constants import (
    ROI_CHEEK_LEFT,
    ROI_CHEEK_RIGHT,
    ROI_FOREHEAD_CENTER,
)

# Offset vertikal (piksel) untuk menggeser ROI dahi ke atas, menjauhi poni/rambut.
# WAJIB dikalibrasi ulang jika resolusi citra input berbeda dari standar 800px.
FOREHEAD_Y_OFFSET_PX = -12


@dataclass
class SkinRoiSample:
    roi_name: str
    center_px: Tuple[int, int]
    mean_bgr: Tuple[float, float, float]
    lab: Tuple[float, float, float]
    hsv: Tuple[float, float, float]
    valid_pixel_ratio: float  # proporsi piksel yang lolos filter shadow/highlight


def _sample_single_roi(
    image_bgr_original: np.ndarray,
    center_x: int,
    center_y: int,
    roi_name: str,
    patch_half_size: int = 8,
) -> SkinRoiSample:
    """
    Fungsi tunggal bertanggung jawab untuk 1 ROI: ambil patch -> filter
    shadow/highlight -> agregasi median -> konversi ruang warna.
    """
    patch = extract_square_patch(image_bgr_original, center_x, center_y, patch_half_size)
    total_pixel_count = patch.shape[0] * patch.shape[1] if patch.size > 0 else 0

    valid_pixels = remove_shadow_and_highlight_pixels(patch)
    valid_pixel_ratio = (
        len(valid_pixels) / total_pixel_count if total_pixel_count > 0 else 0.0
    )

    mean_bgr = get_robust_mean_color_bgr(valid_pixels)
    lab = bgr_to_lab_single_color(mean_bgr)
    hsv = bgr_to_hsv_single_color(mean_bgr)

    return SkinRoiSample(
        roi_name=roi_name,
        center_px=(center_x, center_y),
        mean_bgr=mean_bgr,
        lab=lab,
        hsv=hsv,
        valid_pixel_ratio=round(valid_pixel_ratio, 3),
    )


def sample_skin_roi(
    image_bgr_original: np.ndarray, landmarks_px: List[Tuple[int, int, float]]
) -> List[SkinRoiSample]:
    """
    Mengambil sampel warna dari 3 titik ROI kulit: dahi, pipi kanan, pipi kiri.

    Mengapa 3 titik (bukan hanya 1)?
    -> Agregasi multi-titik mengurangi risiko kesalahan akibat 1 titik yang
       kebetulan berada di area anomali (jerawat, bayangan asimetris karena
       sudut wajah miring, tahi lalat, dsb). Rata-rata dari 3 area independen
       jauh lebih representatif terhadap warna kulit keseluruhan wajah.

    CATATAN RISIKO (wajib diketahui Developer):
    ROI dahi (ROI_FOREHEAD_CENTER) berisiko mengambil piksel poni/rambut pada
    subjek dengan gaya rambut menutupi dahi. Mitigasi saat ini hanya berupa
    offset vertikal tetap (FOREHEAD_Y_OFFSET_PX). Untuk akurasi lebih tinggi,
    pertimbangkan menambahkan pengecekan variansi warna patch -> jika variansi
    sangat tinggi (indikasi campuran kulit+rambut), turunkan bobot ROI ini
    pada tahap agregasi akhir.
    """
    x_forehead, y_forehead, _ = landmarks_px[ROI_FOREHEAD_CENTER]
    x_cheek_r, y_cheek_r, _ = landmarks_px[ROI_CHEEK_RIGHT]
    x_cheek_l, y_cheek_l, _ = landmarks_px[ROI_CHEEK_LEFT]

    samples = [
        _sample_single_roi(
            image_bgr_original,
            x_forehead,
            y_forehead + FOREHEAD_Y_OFFSET_PX,
            roi_name="dahi",
        ),
        _sample_single_roi(image_bgr_original, x_cheek_r, y_cheek_r, roi_name="pipi_kanan"),
        _sample_single_roi(image_bgr_original, x_cheek_l, y_cheek_l, roi_name="pipi_kiri"),
    ]
    return samples


def aggregate_lab_from_samples(samples: List[SkinRoiSample]) -> Tuple[float, float, float]:
    """
    Menggabungkan nilai LAB dari beberapa ROI menjadi satu representasi akhir,
    dengan pembobotan berdasarkan valid_pixel_ratio (ROI yang lebih "bersih"
    dari shadow/highlight mendapat bobot lebih besar).
    """
    total_weight = sum(max(s.valid_pixel_ratio, 0.05) for s in samples)  # hindari bobot 0 total
    l_weighted = sum(s.lab[0] * max(s.valid_pixel_ratio, 0.05) for s in samples) / total_weight
    a_weighted = sum(s.lab[1] * max(s.valid_pixel_ratio, 0.05) for s in samples) / total_weight
    b_weighted = sum(s.lab[2] * max(s.valid_pixel_ratio, 0.05) for s in samples) / total_weight
    return (l_weighted, a_weighted, b_weighted)


def classify_skintone(lightness_l: float) -> Dict[str, object]:
    """
    Klasifikasi tingkat kecerahan kulit (skintone) berdasarkan channel L* CIELAB.

    RIWAYAT KALIBRASI (v3 -- kuintil data foto nyata):
    v2 (threshold di-anchor ke celah 10 swatch resmi Monk Skin Tone Scale)
    memperbaiki bug struktural (kategori "Light" lama benar-benar mustahil
    dicapai), TAPI menciptakan masalah baru yang baru ketahuan setelah diuji
    ke foto sungguhan: L* dari 435 foto asli (dataset dsmlr/faceshape)
    semuanya jatuh di rentang 40.1-82.6 -- SELURUHNYA di dalam 1 kategori
    "Medium" hasil v2 (98.6% foto, 429/435). Root cause: swatch resmi MST
    mencakup rentang teoritis PENUH (14.5-94.1, representasi keberagaman
    global), sedangkan foto di satu dataset spesifik jauh lebih sempit --
    kalibrasi murni dari celah swatch teoritis tanpa cek distribusi data
    nyata menghasilkan kategori yang secara praktis tidak berguna.

    THRESHOLD v3 INI: kuintil (P20/P40/P60/P80) dari distribusi L* 435 foto
    nyata di atas -- membagi 5 kategori jadi PROPORSIONAL terhadap sebaran
    yang benar-benar ditemui pipeline (87 foto per kategori, merata).

    BATAS METODOLOGI YANG WAJIB DIKETAHUI:
    Dataset kalibrasi (dsmlr/faceshape) didominasi foto wanita, mayoritas
    1 etnis, di bawah gaya pencahayaan/kamera yang relatif seragam (foto
    editorial/majalah). Threshold P20-P80 di atas MEREFLEKSIKAN KESEMPITAN
    ITU -- kalau basis pengguna Anda sungguhan jauh lebih beragam (etnis,
    pencahayaan kamera HP vs studio, dll), distribusi L* yang mereka hasilkan
    kemungkinan besar akan BERBEDA dari 435 foto ini, dan kategori bisa
    kembali timpang. WAJIB dipantau ulang (mis. log distribusi L* dari
    scan user sungguhan setelah production, cek apakah masih merata) dan
    dikalibrasi ulang berkala -- ini bukan angka final permanen.
    """
    if lightness_l >= 74.41:
        category = "Very Light"
    elif lightness_l >= 70.17:
        category = "Light"
    elif lightness_l >= 65.29:
        category = "Medium"
    elif lightness_l >= 59.38:
        category = "Tan"
    else:
        category = "Deep"

    return {
        "category": category,
        "lightness_l_value": round(lightness_l, 2),
        "confidence_note": "Threshold v3: kuintil dari 435 foto nyata (P20/P40/P60/P80), setelah v2 (berbasis swatch teoritis) terbukti membuat 98.6% foto jatuh ke 1 kategori. WAJIB dipantau ulang di data produksi.",
    }


def classify_undertone(a_value: float, b_value: float) -> Dict[str, object]:
    """
    Klasifikasi undertone (warm/cool/neutral) berdasarkan posisi pada sumbu
    a* (hijau <-> merah) dan b* (biru <-> kuning) di ruang CIELAB.

    LOGIKA MATEMATIS:
    - undertone_index = b_value - a_value
      -> Nilai b* tinggi (dominan kuning) relatif terhadap a* mengindikasikan
         undertone WARM (kuning/golden/peach).
      -> Nilai a* tinggi (dominan merah/pink) relatif terhadap b* mengindikasikan
         undertone COOL (pink/merah muda/kebiruan).
    - Threshold pemisah NEUTRAL: |undertone_index| < 5.0 (kalibrasi awal)
      -> Rentang sempit di sekitar 0 dianggap tidak condong ke salah satu
         sisi secara signifikan -> diklasifikasikan Neutral.

    PARAMETER THRESHOLD WAJIB DIKALIBRASI:
    Angka ambang 5.0 adalah estimasi awal berbasis pemahaman teori warna,
    BUKAN hasil validasi statistik pada dataset nyata. Developer harus
    menguji pada sampel wajah dengan undertone yang sudah diverifikasi
    manual oleh pakar kecantikan/colorist untuk menentukan angka final.
    """
    undertone_index = b_value - a_value
    NEUTRAL_THRESHOLD = 5.0

    if undertone_index > NEUTRAL_THRESHOLD:
        undertone = "Warm"
    elif undertone_index < -NEUTRAL_THRESHOLD:
        undertone = "Cool"
    else:
        undertone = "Neutral"

    return {
        "undertone": undertone,
        "undertone_index": round(undertone_index, 2),
        "a_star": round(a_value, 2),
        "b_star": round(b_value, 2),
        "confidence_note": "Threshold ±5.0 pada sumbu a*/b*, wajib kalibrasi ulang.",
    }


def validate_human_skin_pigment(
    samples: List[SkinRoiSample], l_val: float, a_val: float, b_val: float
) -> None:
    """
    Human Skin Range Validator:
    Memastikan warna yang diekstraksi dari wajah berada dalam batas biologis
    kulit manusia (semua ras/etnis global), dan menolak warna anomali seperti
    alien abu-abu/hijau/biru/ungu, zombie, topeng karet, patung batu, atau CGI.
    """
    # 1. Cek pigmen CIELAB:
    # Kulit manusia alami (dari Very Light sampai Deep) selalu mengandung hemoglobin (a* > 0)
    # dan melanin/karotenoid (b* > 0).
    # Alien abu-abu/pucat fiksi atau avatar berkulit dingin memiliki a* <= 1.0 atau b* <= 1.0.
    if a_val < 1.2 or b_val < 1.2:
        raise ValueError(
            "Warna kulit tidak memiliki pigmen biologis manusia alami (terdeteksi warna abu-abu/kebiruan anomali/alien)."
        )

    # 2. Cek rata-rata warna HSV & BGR pada seluruh ROI yang valid:
    valid_samples = [s for s in samples if s.valid_pixel_ratio > 0]
    if not valid_samples:
        raise ValueError("Tidak ada area kulit yang cukup terang atau bebas bayangan untuk dianalisis.")

    avg_h = sum(s.hsv[0] for s in valid_samples) / len(valid_samples)
    avg_s = sum(s.hsv[1] for s in valid_samples) / len(valid_samples)
    avg_bgr = [
        sum(s.mean_bgr[i] for s in valid_samples) / len(valid_samples) for i in range(3)
    ]
    b_mean, g_mean, r_mean = avg_bgr

    # 3. Cek rasio channel BGR: Pada kulit manusia alami, channel Merah selalu dominan (R >= G dan R >= B).
    # Jika Blue atau Green lebih tinggi secara signifikan dari Red -> Alien/Filter warna ekstrem.
    if r_mean < g_mean * 0.92 or r_mean < b_mean * 0.92:
        raise ValueError(
            "Spektrum warna kulit tidak wajar (terdeteksi dominansi warna hijau/biru/alien)."
        )

    # 4. Cek rentang Hue di HSV (skala OpenCV 0-179):
    # Spektrum kulit manusia normal: Hue 0 - 28 (merah-oranye-kuning) atau 168 - 179 (ujung merah).
    # Rentang 30 - 165 adalah spektrum hijau, cyan, biru murni, ungu, magenta.
    if (30 <= avg_h <= 165) and avg_s > 25:
        raise ValueError(
            "Warna kulit berada di luar rentang spektrum manusia (terdeteksi warna hijau/biru/ungu fiksi)."
        )


def analyze_skin(
    image_bgr_original: np.ndarray, landmarks_px: List[Tuple[int, int, float]]
) -> Dict[str, object]:
    """Fungsi orkestrasi tingkat tinggi: sampling ROI -> agregasi -> validasi biologis -> klasifikasi."""
    samples = sample_skin_roi(image_bgr_original, landmarks_px)
    l_val, a_val, b_val = aggregate_lab_from_samples(samples)

    # HUMAN SKIN RANGE VALIDATOR
    validate_human_skin_pigment(samples, l_val, a_val, b_val)

    skintone_result = classify_skintone(l_val)
    undertone_result = classify_undertone(a_val, b_val)

    return {
        "skintone": skintone_result,
        "undertone": undertone_result,
        "roi_debug": [
            {
                "roi_name": s.roi_name,
                "center_px": s.center_px,
                "lab": tuple(round(v, 2) for v in s.lab),
                "valid_pixel_ratio": s.valid_pixel_ratio,
            }
            for s in samples
        ],
    }