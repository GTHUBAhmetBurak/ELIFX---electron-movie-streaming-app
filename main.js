const { app, BrowserWindow, session } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Elifx - SınavLink.com',
    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      safeDialogs: true,
      webSecurity: true 
    }
  });

  win.loadFile('index.html');

  // 1. ANA PENCERE KİLİDİ (HIJACK KORUMASI)
  // Reklamların ana uygulamayı başka bir siteye yönlendirmesini kesin olarak engeller
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    if (!navigationUrl.startsWith('file://')) {
      console.log("🛑 Ana Sayfa Yönlendirmesi Engellendi:", navigationUrl);
      event.preventDefault();
    }
  });

  // 2. DEMİR KUBBE 3.0 - NÜKLEER AĞ FİLTRESİ
  const filter = { urls: ['<all_urls>'] };

  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    const url = details.url.toLowerCase();
    
    // Çok Daha Kapsamlı Yasaklı Listesi
    const blackList = [
      'popads', 'popcash', 'onclickalgo', 'onclicka', 'exdynsrv', 
      'terraclicks', 'wargaming', 'doubleclick', 'adsterra', 
      'adform', 'adroll', 'adnxs', 'smartadserver', 'bet365', 
      'casinomarketing', 'game-ads', 'popunder', 'vast', 'tracker',
      'chaturbate', 'stripchat', 'bongacams', 'redirect', 'syndication'
    ];

    // Sadece film sunucularının geçmesine izin veriyoruz
    const isEssential = url.includes('vidsrc') || 
                        url.includes('tmdb') || 
                        url.includes('multiembed') || 
                        url.includes('2embed');

    if (blackList.some(word => url.includes(word)) && !isEssential) {
      console.log("🚫 Ağ Trafiğinde İmha Edilen Reklam:", url);
      return callback({ cancel: true });
    }
    
    callback({ cancel: false });
  });

  // 3. İZİN YÖNETİMİ (Reklamların bildirim/kamera vb. istemesini önler)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['fullscreen']; // Sadece tam ekrana izin var
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      console.log("🔒 Engellenen İzin Talebi:", permission);
      callback(false);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // 4. KESİN POP-UP ÖLDÜRÜCÜ
  app.on('web-contents-created', (event, contents) => {
    // Tüm yeni pencere/sekme açılışlarını havada vurur
    contents.setWindowOpenHandler(({ url }) => {
      console.log("🛡️ Pop-up Vuruldu:", url);
      return { action: 'deny' }; 
    });

    // Eğer zorla bir pencere yaratmayı başarırlarsa açıldığı milisaniye geri kapatır
    contents.on('did-create-window', (window) => {
      window.close();
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});