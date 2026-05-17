# 🎬 Elifx - Desktop Movie & TV Show Application

Elifx, Electron.js kullanılarak geliştirilmiş, modern arayüze ve yüksek performansa sahip bir masaüstü sinema/dizi izleme platformudur. TMDB API altyapısını kullanarak güncel film ve dizi verilerini çeker, kullanıcıya "Netflix" standartlarında akıcı bir deneyim sunar.

![Elifx App Preview](https://via.placeholder.com/1000x500?text=Buraya+Uygulamanin+Ekran+Goruntusunu+Ekle)

## ✨ Öne Çıkan Özellikler

* **🛡️ Demir Kubbe Ağ Filtresi (Ad-Blocker):** Uygulama içine entegre edilmiş, Electron `webRequest` API'sini kullanan nükleer seviye reklam engelleyici. Ağ trafiğindeki zararlı ve pop-up isteklerini sayfa yüklenmeden imha eder.
* **📺 Akıllı Oynatıcı & Sunucu Seçimi:** CORS kısıtlamalarını ve iframe sandbox engellerini aşan özel mimari. Çalışmayan videolar için anlık alternatif sunucu geçişi.
* **🔄 Kaldığın Yerden Devam Et:** İzleme geçmişini hafızada tutarak ana sayfada "Son İzlenenler" şeridi oluşturur.
* **📑 Dinamik Sezon/Bölüm Seçici:** Diziler için TMDB API üzerinden gerçek zamanlı sezon ve bölüm sayısı çeker. Resimli ve detaylı Netflix tarzı açılır menü.
* **🔎 Gelişmiş Arama:** Kullanıcı yazarken anlık olarak tetiklenen, afiş destekli otomatik tamamlama (autocomplete) arama motoru.
* **❤️ Favoriler Sistemi:** Beğenilen içerikleri LocalStorage mimarisiyle yerel olarak saklama.

## 🛠️ Kullanılan Teknolojiler

* **Masaüstü Motoru:** Electron.js, Node.js
* **Arayüz (UI):** HTML5, CSS3, JavaScript (Vanilla JS)
* **Veri Kaynağı:** TMDB (The Movie Database) REST API
* **Paketleme:** Electron Packager & Inno Setup

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda derlemek ve çalıştırmak için aşağıdaki adımları izleyin:

### Geliştirici Ortamı İçin
1. Repoyu bilgisayarınıza klonlayın:
   ```bash
   git clone [https://github.com/KULLANICI_ADIN/elifx-desktop.git](https://github.com/KULLANICI_ADIN/elifx-desktop.git)

   Bu proje açık kaynaklı bir medya oynatıcı arayüzüdür. Kendi bünyesinde hiçbir video dosyası barındırmaz, dış sunucuları (embed) kullanır. Geliştirilen "Demir Kubbe" mimarisi, dış kaynaklı iframe'lerden gelebilecek izinsiz yönlendirmeleri (will-navigate), kamera/mikrofon izinlerini ve pop-up'ları (setWindowOpenHandler) engellemek üzerine tasarlanmıştır.
