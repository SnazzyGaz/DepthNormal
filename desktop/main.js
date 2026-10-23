// Relief Forge desktop: the web app (app/index.html, copied from the repo root at build time) in its own window,
// plus native save dialogs and the native ONNX Runtime (see preload.js).
'use strict';
const { app, BrowserWindow, protocol, net, ipcMain, dialog, shell, session, Menu, crashReporter } = require('electron');
const path = require('path'), fs = require('fs'), crypto = require('crypto');
const { pathToFileURL } = require('url');

const SITE = 'https://snazzygaz.github.io/DepthNormal/', REPO = 'https://github.com/SnazzyGaz/DepthNormal';
// the app is served from app://relief-forge/ (a stable, secure origin: browser storage, the model cache and workers all work)
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }]);
// WebGPU is off by default in Chromium on Linux (it needs Vulkan there). If that gives a black or glitchy window on some
// driver, start the app with --no-vulkan (or set RELIEF_FORGE_NO_VULKAN=1).
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-unsafe-webgpu');
  if (!process.argv.includes('--no-vulkan') && !process.env.RELIEF_FORGE_NO_VULKAN) app.commandLine.appendSwitch('enable-features', 'Vulkan');
}
// software WebGL when there is no usable GPU (virtual machines, remote desktops), so the 3D view still works, slowly.
// Only this app's own pages run here, so the usual reason to keep it off doesn't apply.
app.commandLine.appendSwitch('enable-unsafe-swiftshader');

// ---------- startup log: %APPDATA%\Relief Forge\main.log (Linux: ~/.config/Relief Forge/main.log) ----------
let logFile = null;
function log(...a) { try { if (!logFile) { logFile = path.join(app.getPath('userData'), 'main.log'); fs.mkdirSync(path.dirname(logFile), { recursive: true }); if (fs.existsSync(logFile) && fs.statSync(logFile).size > 2e6) fs.unlinkSync(logFile); }
  fs.appendFileSync(logFile, new Date().toISOString() + ' ' + a.map(x => x instanceof Error ? x.stack : typeof x === 'string' ? x : JSON.stringify(x)).join(' ') + '\n'); } catch {} }
process.on('uncaughtException', e => { log('uncaught', e); try { dialog.showErrorBox('Relief Forge error', String(e && e.stack || e)); } catch {} });
process.on('unhandledRejection', e => log('unhandled rejection', e));
log('start', app.getVersion(), process.platform, process.arch, 'electron', process.versions.electron, process.argv.slice(1).join(' '));

// native crashes leave a dump in <data folder>\Crashpad\reports (nothing is sent anywhere)
try { crashReporter.start({ uploadToServer: false, compress: true }); log('crash dumps:', app.getPath('crashDumps')); } catch (e) { log('crash reporter failed', e); }
if (!app.requestSingleInstanceLock()) { log('another copy is already running: handing over to it'); app.quit(); }
else log('single-instance lock ok');
app.on('will-finish-launching', () => log('finishing launch'));
app.on('gpu-info-update', () => log('gpu info updated'));
app.on('quit', (e, code) => log('quit, code', code));

// ---------- small settings file: window size, last folder per kind of file ----------
const prefsFile = () => path.join(app.getPath('userData'), 'prefs.json');
let prefs = { lastDir: {}, bounds: null };
function loadPrefs() { try { prefs = { ...prefs, ...JSON.parse(fs.readFileSync(prefsFile(), 'utf8')) }; } catch {} }
function savePrefs() { try { fs.writeFileSync(prefsFile(), JSON.stringify(prefs, null, 1)); } catch {} }

// ---------- offline copies of the scripts and fonts the app loads from CDNs ----------
// Network first (so updates arrive), the saved copy when offline. The AI models themselves are cached by the app.
const CDN = new Set(['cdn.jsdelivr.net', 'unpkg.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com']);
const cdnDir = () => path.join(app.getPath('userData'), 'cdn-cache');
async function cdnFetch(req) {
  const key = crypto.createHash('sha1').update(req.url).digest('hex'), file = path.join(cdnDir(), key), meta = file + '.json';
  try {
    const r = await net.fetch(req, { bypassCustomProtocolHandlers: true });
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer()), headers = {};
      r.headers.forEach((v, k) => { if (!/^(content-encoding|content-length|transfer-encoding)$/i.test(k)) headers[k] = v; });
      try { fs.mkdirSync(cdnDir(), { recursive: true }); fs.writeFileSync(file, buf); fs.writeFileSync(meta, JSON.stringify({ url: req.url, headers })); } catch {}
      return new Response(buf, { status: 200, headers });
    }
    if (!fs.existsSync(file)) return r;
  } catch (e) { if (process.env.RF_DEBUG) console.error('cdn fetch failed', req.url, e); if (!fs.existsSync(file)) return new Response('offline: ' + req.url, { status: 504 }); }
  const m = JSON.parse(fs.readFileSync(meta, 'utf8'));
  return new Response(fs.readFileSync(file), { status: 200, headers: { ...m.headers, 'access-control-allow-origin': '*' } });
}

function createWindow() {
  const b = prefs.bounds || { width: 1440, height: 900 };
  const win = new BrowserWindow({
    ...b, minWidth: 1000, minHeight: 640, show: true, backgroundColor: '#141517', title: 'Relief Forge', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false, nodeIntegration: false, spellcheck: false },
  });
  if (prefs.maximized) win.maximize();
  const wc = win.webContents;
  wc.on('did-finish-load', () => log('page loaded'));
  wc.on('did-fail-load', (e, code, desc, url) => log('page failed to load', code, desc, url));
  wc.on('preload-error', (e, p, err) => log('preload error', err));
  wc.on('render-process-gone', (e, d) => { log('page process gone', d);
    const r = dialog.showMessageBoxSync(win, { type: 'error', title: 'Relief Forge', message: 'The page stopped (' + d.reason + ').', detail: 'Your last session can be restored after a reload (Setup → Restore last session).\nIf this keeps happening at start, try starting it with --no-native.\nLog: ' + logFile, buttons: ['Reload', 'Quit'] });
    if (r === 0) win.reload(); else app.quit(); });
  wc.on('console-message', (e, level, msg) => { if (level >= 3) log('page error:', String(msg).slice(0, 500)); });
  const keep = () => { if (!win.isMaximized() && !win.isMinimized()) prefs.bounds = win.getBounds(); prefs.maximized = win.isMaximized(); };
  win.on('resize', keep); win.on('move', keep); win.on('close', () => { keep(); savePrefs(); });
  // links to the web open in the normal browser; the app itself never navigates away
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/i.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('app://')) { e.preventDefault(); if (/^https?:/i.test(url)) shell.openExternal(url); } });
  win.loadURL('app://relief-forge/index.html');
  return win;
}

app.whenReady().then(() => {
  log('ready'); loadPrefs();
  const root = path.join(__dirname, 'app');
  protocol.handle('app', req => {
    const p = decodeURIComponent(new URL(req.url).pathname), file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) return new Response('not found', { status: 404 });
    return net.fetch(pathToFileURL(file).toString());
  });
  session.defaultSession.protocol.handle('https', req => {
    const u = new URL(req.url);
    if (req.method === 'GET' && CDN.has(u.hostname)) return cdnFetch(req);
    return net.fetch(req, { bypassCustomProtocolHandlers: true });
  });

  const FILTERS = { png: [{ name: 'PNG image', extensions: ['png'] }], stl: [{ name: 'STL 3D model', extensions: ['stl'] }], zip: [{ name: 'ZIP archive', extensions: ['zip'] }],
    relief: [{ name: 'Relief Forge project', extensions: ['relief'] }], json: [{ name: 'JSON file', extensions: ['json'] }] };
  ipcMain.handle('rf-choose-save', async (e, name, kind) => {
    const dir = prefs.lastDir[kind] && fs.existsSync(prefs.lastDir[kind]) ? prefs.lastDir[kind] : app.getPath('documents');
    const r = await dialog.showSaveDialog(BrowserWindow.fromWebContents(e.sender), { defaultPath: path.join(dir, String(name).replace(/[\\/:*?"<>|]+/g, '-')), filters: FILTERS[kind] || [] });
    if (r.canceled || !r.filePath) return null;
    prefs.lastDir[kind] = path.dirname(r.filePath); savePrefs(); return r.filePath;
  });
  ipcMain.on('rf-info', e => { e.returnValue = { version: app.getVersion(), platform: process.platform, modelDir: path.join(app.getPath('userData'), 'models'), noNative: process.argv.includes('--no-native') }; });
  ipcMain.on('rf-log', (e, ...a) => log('page:', ...a));

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: 'File', submenu: [{ role: 'quit' }] },
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
    { label: 'Help', submenu: [{ label: 'Web version', click: () => shell.openExternal(SITE) }, { label: 'Releases and source', click: () => shell.openExternal(REPO + '/releases') },
      { label: 'User guide (PDF)', click: () => shell.openExternal(REPO + '/blob/main/docs/Relief-Forge-Basics.pdf') }] },
  ]));
  const win = createWindow();
  app.on('second-instance', () => { if (win.isMinimized()) win.restore(); win.focus(); });
});
app.on('window-all-closed', () => app.quit());
app.on('child-process-gone', (e, d) => log('child process gone', d));
