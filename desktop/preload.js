// Bridge between the page and the desktop: native save dialogs and the native ONNX Runtime.
// The page sees window.rfNative; everything else stays out of reach (contextIsolation).
'use strict';
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');

const info = ipcRenderer.sendSync('rf-info');
let ort = null, ortErr = '';
// onnxruntime-node turns float16 data into a Float16Array when the JS engine has one (Electron's does), but its native
// binding can't read those yet ("not enough space ... got 0"). Without Float16Array here (this preload world only) it keeps
// plain Uint16Array, which works. The page itself is unaffected.
try { delete globalThis.Float16Array; } catch {}
if (info.noNative) ortErr = 'switched off with --no-native';
else try { ort = require('onnxruntime-node'); ipcRenderer.send('rf-log', 'native runtime loaded'); } catch (e) { ortErr = String(e && e.message || e); ipcRenderer.send('rf-log', 'native runtime failed to load: ' + ortErr); }
const GPU_EP = process.env.RF_TEST_GPU_EP ? [process.env.RF_TEST_GPU_EP, 'Test GPU'] : info.platform === 'win32' ? ['dml', 'DirectML'] : null;   // RF_TEST_GPU_EP: test hook only   // Linux: CUDA needs a matching CUDA/cuDNN install, so WebGPU is used there

// models are written to disk once (by a fingerprint of their bytes) and loaded from there: external-data models need real files
function fingerprint(u8) {
  const h = crypto.createHash('sha1'); h.update(String(u8.length)); const step = Math.max(1, Math.floor(u8.length / 16));
  for (let o = 0; o < u8.length; o += step) h.update(u8.subarray(o, Math.min(u8.length, o + 65536)));
  return h.digest('hex').slice(0, 20);
}
function writeIfMissing(file, u8) { try { if (fs.statSync(file).size === u8.length) return; } catch {} fs.writeFileSync(file + '.part', u8); fs.renameSync(file + '.part', file); }

const ARR = { float32: Float32Array, float16: Uint16Array, int64: BigInt64Array, int32: Int32Array, uint8: Uint8Array, int8: Int8Array, bool: Uint8Array, float64: Float64Array };
const sessions = new Map(); let nextId = 1;
async function create(model, externals, dev) {
  if (!ort) throw new Error('native runtime unavailable: ' + ortErr);
  if (dev === 'gpu' && !GPU_EP) throw new Error('no native GPU runtime on this system');
  const dir = path.join(info.modelDir, fingerprint(model)); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'model.onnx'); writeIfMissing(file, Buffer.from(model.buffer, model.byteOffset, model.byteLength));
  for (const e of externals || []) writeIfMissing(path.join(dir, path.basename(e.path)), Buffer.from(e.data.buffer, e.data.byteOffset, e.data.byteLength));
  // --dml-opt=disabled|basic|extended|all (default all): how much ONNX Runtime rewrites the graph before DirectML runs it
  const opts = dev === 'gpu' ? { executionProviders: [GPU_EP[0]], enableMemPattern: false, executionMode: 'sequential', graphOptimizationLevel: ['disabled', 'basic', 'extended', 'all'].includes(info.dmlOpt) ? info.dmlOpt : 'all' }
    : { executionProviders: ['cpu'], graphOptimizationLevel: 'all', intraOpNumThreads: Math.max(1, os.cpus().length) };
  ipcRenderer.send('rf-log', 'creating session', dev, opts.executionProviders[0], 'opt=' + opts.graphOptimizationLevel, (model.length / 1e6).toFixed(0) + ' MB');
  let s; try { s = await ort.InferenceSession.create(file, opts); } catch (e) { ipcRenderer.send('rf-log', 'session failed: ' + String(e && e.message || e)); throw e; }
  const id = nextId++; ipcRenderer.send('rf-log', 'session ready', dev);
  sessions.set(id, s);
  return { id, inputNames: s.inputNames.slice(), outputNames: s.outputNames.slice(), ep: dev === 'gpu' ? GPU_EP[1] : 'CPU' };
}
async function run(id, feeds) {
  const s = sessions.get(id); if (!s) throw new Error('session released');
  // typed arrays arriving from the page are copied into this world's own buffers (the native binding needs those)
  const f = {}; for (const k in feeds) { const t = feeds[k], C = ARR[t.type]; if (!C) throw new Error('unsupported input type ' + t.type);
    const d = new C(t.data.length); d.set(t.data); f[k] = new ort.Tensor(t.type, d, Array.from(t.dims)); }
  const r = await s.run(f), out = {};
  for (const k in r) out[k] = { type: r[k].type, dims: Array.from(r[k].dims), data: r[k].data };
  return out;
}
async function release(id) { const s = sessions.get(id); sessions.delete(id); if (s) await s.release(); }

const allowed = new Set();   // only paths the person picked in a save dialog can be written
contextBridge.exposeInMainWorld('rfNative', {
  platform: info.platform, version: info.version, frameless: !!info.frameless,
  log: (...a) => ipcRenderer.send('rf-log', ...a.map(x => String(x).slice(0, 1000))),
  chooseSave: async (name, kind) => { const p = await ipcRenderer.invoke('rf-choose-save', name, kind); if (p) allowed.add(p); return p; },
  writeFile: async (p, data) => { if (!allowed.has(p)) throw new Error('not a chosen save location'); allowed.delete(p); await fs.promises.writeFile(p, data); },
  ort: ort ? { gpu: GPU_EP ? GPU_EP[1] : null, create, run, release } : null,
});
