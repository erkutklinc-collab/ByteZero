# ByteFootprint - Ürün Stratejisi ve Yol Haritası

## 1. Teknik Mimari (Tech Stack)
- **Veritabanı & Kimlik Doğrulama:** Supabase (PostgreSQL)
- **Arka Plan (Backend):** Node.js + NestJS (API Entegrasyonları ve Cron Jobs)
- **Yönetici Paneli (Dashboard):** Next.js + TailwindCSS
- **Tarayıcı Eklentisi:** React + Vite

## 2. Ürün Yol Haritası (V1 Özellikleri)
- **Ana Hedef (Karanlık Veri Kaynağı):** E-posta verisi (Gmail / Outlook).
- **Kullanıcı Deneyimi:**
  - Uygulama otomatik silme yapmaz, kullanıcıya *rehberlik* eder (Örn: "6 aydır açılmayan abonelikler, X MB üzeri büyük boyutlu ekler").
  - Nihai kontrol ve silme eylemi kullanıcıdadır; sorumluluk ve farkındalık kullanıcıya aittir.
- **Oyunlaştırma (Gamification):**
  - Silme işlemi ve dijital temizlik yapıldıkça Puan kazanımı.
  - Puanlarla "Level/Seviye" atlama ve "Rozetler" (Badges) kazanma.
  - Departmanlar ve Ekipler arası yarışma/rekabet ortamı (Leaderboard).
- **Yönetici Paneli (Dashboard):**
  - Tam veri gizliliği: Yöneticiler silinen maillerin içeriğini veya özel verilerini **göremez**.
  - Sadece metrikler görünür: Toplanan puanlar, takım bazlı liderlik tabloları ve elde edilen CO2 (gram/kg) tasarrufu.
  - ESG ve Kapsam 3 raporları için dışa aktarılabilir (exportable) veriler.
