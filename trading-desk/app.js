/* Farhang Trading Desk — 6-agent AI trading desk (PWA, no build step)
 * Data: Binance public market data (crypto + PAXG as gold proxy), Frankfurter/ECB (forex daily).
 * AI: Claude Messages API, called directly from the browser with the user's own key (stored only on device).
 */
'use strict';

/* ───────────────────────── settings ───────────────────────── */
const DEFAULTS = {
  name: 'فرهنگ',
  apiKey: '',
  model: 'claude-opus-5-5',
  effort: 'medium',
  webSearch: true,
  capital: 1000,          // USD
  peakEquity: 1000,
  riskPct: 2,
  minRR: 2,
  maxDD: 15,
  maxLeverage: 5,
  minConfidence: 60,
  feePct: 0.1,
  allowShort: true,
  style: 'swing',          // swing | day
  timeframe: '4h',
  watchlist: 'BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT, PAXGUSDT, EURUSD, GBPUSD, USDJPY, AUDUSD, USDCHF',
};
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let S = Object.assign({}, DEFAULTS, LS.get('ftd.settings', {}));
const saveSettings = () => LS.set('ftd.settings', S);
const watch = () => S.watchlist.split(/[\s,،]+/).map(s => s.trim().toUpperCase()).filter(Boolean);

/* ───────────────────────── helpers ───────────────────────── */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const faNum = (n, d = 2) => (n == null || !isFinite(n)) ? '—' : Number(n).toLocaleString('fa-IR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const px = n => { if (n == null || !isFinite(n)) return '—'; const a = Math.abs(n); const d = a >= 1000 ? 2 : a >= 10 ? 3 : a >= 1 ? 4 : 6; return `<bdi class="n">${Number(n).toLocaleString('en-US', { maximumFractionDigits: d })}</bdi>`; };
const pct = (n, d = 1) => (n == null || !isFinite(n)) ? '—' : `${n >= 0 ? '+' : ''}${faNum(n, d)}٪`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toast._t); toast._t = setTimeout(() => t.style.display = 'none', ms); }

const I = {
  home: '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  up: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  down: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  ok: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  bars: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  spark: Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${12 + 3 * Math.cos(a)}" y1="${12 + 3 * Math.sin(a)}" x2="${12 + 9.5 * Math.cos(a)}" y2="${12 + 9.5 * Math.sin(a)}"/>`; }).join(''),
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;
const burst = (size = 120) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" stroke-width="2.6" stroke-linecap="round">${I.spark}</svg>`;

/* tiny markdown → HTML (escaped first) */
function md(text) {
  const lines = esc(text).split('\n'); let out = '', inList = false;
  for (let l of lines) {
    l = l.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (/^\s*[-*•]\s+/.test(l)) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${l.replace(/^\s*[-*•]\s+/, '')}</li>`; continue; }
    if (inList) { out += '</ul>'; inList = false; }
    if (/^#{1,6}\s/.test(l)) out += `<h4>${l.replace(/^#+\s/, '')}</h4>`;
    else if (l.trim()) out += `<p>${l}</p>`;
  }
  return out + (inList ? '</ul>' : '');
}

/* ───────────────────────── market data ───────────────────────── */
const FX = new Set(['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD', 'EURGBP', 'EURJPY', 'GBPJPY', 'EURCHF']);
const isFx = s => FX.has(s) || (/^[A-Z]{6}$/.test(s) && !s.endsWith('USDT') && !s.endsWith('USDC'));
const assetClass = s => isFx(s) ? 'forex' : (s.startsWith('PAXG') || s.startsWith('XAUT')) ? 'gold' : 'crypto';
const CLASS_FA = { crypto: 'کریپتو', gold: 'طلا', forex: 'فارکس' };
const displayName = s => s === 'PAXGUSDT' ? 'طلا (PAXG ≈ XAU/USD)' : s;
const cache = new Map();

async function fetchJSON(url, timeout = 12000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), timeout);
  try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return await r.json(); }
  finally { clearTimeout(t); }
}

async function getCandles(symbol, tf = S.timeframe, limit = 500) {
  const key = `${symbol}|${tf}|${limit}`; const hit = cache.get(key);
  if (hit && Date.now() - hit.t < 120000) return hit.d;
  let d;
  if (isFx(symbol)) d = await fxDaily(symbol, limit);
  else d = await cryptoKlines(symbol, tf, limit);
  cache.set(key, { t: Date.now(), d });
  return d;
}

async function cryptoKlines(symbol, tf, limit) {
  const hosts = ['https://data-api.binance.vision', 'https://api.binance.com', 'https://api1.binance.com'];
  let lastErr;
  for (const h of hosts) {
    try {
      const raw = await fetchJSON(`${h}/api/v3/klines?symbol=${symbol}&interval=${tf}&limit=${limit}`);
      return { tf, daily: false, bars: raw.map(k => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] })) };
    } catch (e) { lastErr = e; }
  }
  // fallback: CryptoCompare (hour/day only)
  try {
    const base = symbol.replace(/USDT$|USDC$|USD$/, ''); const isDay = tf === '1d';
    const agg = { '1h': 1, '4h': 4, '1d': 1 }[tf] || 1;
    const j = await fetchJSON(`https://min-api.cryptocompare.com/data/v2/histo${isDay ? 'day' : 'hour'}?fsym=${base}&tsym=USD&limit=${Math.min(limit, 2000)}&aggregate=${agg}`);
    const arr = j?.Data?.Data; if (!arr?.length) throw new Error('empty');
    return { tf, daily: false, bars: arr.map(k => ({ t: k.time * 1000, o: k.open, h: k.high, l: k.low, c: k.close, v: k.volumefrom })) };
  } catch (e) { lastErr = e; }
  throw new Error(`داده ${symbol} دریافت نشد (${lastErr?.message || 'شبکه'}) — اگر از ایران وصلی، احتمالاً VPN لازم است.`);
}

async function fxDaily(symbol, limit) {
  const base = symbol.slice(0, 3), quote = symbol.slice(3, 6);
  const days = Math.ceil(limit * 1.5); const start = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  let j, lastErr;
  for (const h of ['https://api.frankfurter.dev/v1', 'https://api.frankfurter.app']) {
    try { j = await fetchJSON(`${h}/${start}..?base=${base}&symbols=${quote}`); break; } catch (e) { lastErr = e; }
  }
  if (!j) throw new Error(`داده ${symbol} دریافت نشد (${lastErr?.message})`);
  const bars = Object.entries(j.rates).map(([d, r]) => { const c = r[quote]; return { t: Date.parse(d), o: c, h: c, l: c, c, v: 0 }; });
  for (let i = 1; i < bars.length; i++) { const b = bars[i]; b.o = bars[i - 1].c; b.h = Math.max(b.o, b.c); b.l = Math.min(b.o, b.c); }
  return { tf: '1d', daily: true, bars: bars.slice(-limit) };
}

/* ───────────────────────── indicators ───────────────────────── */
function ema(vals, n) { const k = 2 / (n + 1); const out = []; let e; vals.forEach((v, i) => { e = i === 0 ? v : v * k + e * (1 - k); out.push(i < n - 1 ? null : e); }); return out; }
function rsi(closes, n = 14) {
  const out = Array(closes.length).fill(null); let g = 0, l = 0;
  for (let i = 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1], up = Math.max(d, 0), dn = Math.max(-d, 0);
    if (i <= n) { g += up; l += dn; if (i === n) { g /= n; l /= n; out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); } }
    else { g = (g * (n - 1) + up) / n; l = (l * (n - 1) + dn) / n; out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l); }
  }
  return out;
}
function atr(bars, n = 14) {
  const out = Array(bars.length).fill(null); let a = 0;
  for (let i = 1; i < bars.length; i++) {
    const b = bars[i], p = bars[i - 1].c; const tr = Math.max(b.h - b.l, Math.abs(b.h - p), Math.abs(b.l - p));
    if (i <= n) { a += tr; if (i === n) { a /= n; out[i] = a; } } else { a = (a * (n - 1) + tr) / n; out[i] = a; }
  }
  return out;
}
const sma = (vals, n) => vals.map((_, i) => i < n - 1 ? null : vals.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n);

/* ───────────────────────── Agent 1: market scanner (local) ───────────────────────── */
function analyze(symbol, data) {
  const B = data.bars; const C = B.map(b => b.c); const n = B.length - 1;
  const e20 = ema(C, 20), e50 = ema(C, 50), e200 = ema(C, 200), r = rsi(C), a = atr(B), vAvg = sma(B.map(b => b.v), 20);
  const last = B[n], prevHigh = Math.max(...B.slice(n - 21, n).map(b => b.h)), prevLow = Math.min(...B.slice(n - 21, n).map(b => b.l));
  const hasVol = B.some(b => b.v > 0);
  const volRatio = hasVol && vAvg[n - 1] ? last.v / vAvg[n - 1] : null;
  const chg = (C[n] / C[Math.max(0, n - 6)] - 1) * 100;
  const trendUp = e20[n] > e50[n] && C[n] > e20[n];
  const trendDn = e20[n] < e50[n] && C[n] < e20[n];
  const breakoutUp = C[n] > prevHigh, breakoutDn = C[n] < prevLow;
  const volSpike = volRatio != null && volRatio >= 1.8;
  const obv = hasVol ? B.slice(-20).reduce((s, b, i, arr) => s + (i && b.c > arr[i - 1].c ? b.v : i && b.c < arr[i - 1].c ? -b.v : 0), 0) : null;
  const flowIn = obv != null && obv > 0 && C[n] > C[n - 20];
  const flowOut = obv != null && obv < 0 && C[n] < C[n - 20];
  const bullScore = [trendUp, breakoutUp, volSpike && last.c > last.o, flowIn, r[n] > 50 && r[n] < 70].filter(Boolean).length;
  const bearScore = [trendDn, breakoutDn, volSpike && last.c < last.o, obv != null && obv < 0 && C[n] < C[n - 20], r[n] < 50 && r[n] > 30].filter(Boolean).length;
  const bias = bullScore >= 3 && bullScore > bearScore ? 'long' : bearScore >= 3 && bearScore > bullScore ? 'short' : 'neutral';
  return {
    symbol, cls: assetClass(symbol), tf: data.tf, daily: data.daily, price: C[n], chg, rsi: r[n], atr: a[n], atrPct: a[n] / C[n] * 100,
    ema20: e20[n], ema50: e50[n], ema200: e200[n], prevHigh, prevLow, volRatio, hasVol,
    checks: { trendUp, trendDn, breakoutUp, breakoutDn, volSpike, flowIn, flowOut }, lastUp: last.c >= last.o,
    bullScore, bearScore, bias, setup: bias !== 'neutral',
    recent: B.slice(-30).map(b => [+b.o.toPrecision(6), +b.h.toPrecision(6), +b.l.toPrecision(6), +b.c.toPrecision(6)]),
  };
}

/* ───────────────────────── Agent 6: backtester (local) ───────────────────────── */
function backtest(bars, p) {
  const C = bars.map(b => b.c), ef = ema(C, p.fast), es = ema(C, p.slow), r = rsi(C), a = atr(bars);
  const risk = S.riskPct / 100, fee = S.feePct / 100;
  let eq = 1, peak = 1, maxDD = 0, pos = null; const trades = [], curve = [1];
  for (let i = Math.max(p.slow, 15) + 1; i < bars.length; i++) {
    const b = bars[i];
    if (pos) {
      let exit = null;
      if (pos.dir === 1) { if (b.l <= pos.sl) exit = pos.sl; else if (b.h >= pos.tp) exit = pos.tp; }
      else { if (b.h >= pos.sl) exit = pos.sl; else if (b.l <= pos.tp) exit = pos.tp; }
      const crossBack = pos.dir === 1 ? ef[i] < es[i] : ef[i] > es[i];
      if (exit == null && crossBack) exit = b.c;
      if (exit != null) {
        const pnl = pos.units * (exit - pos.entry) * pos.dir - fee * pos.units * (pos.entry + exit);
        const r0 = pnl / (pos.eq0 * risk);
        eq += pnl; trades.push({ r: r0, win: pnl > 0, t: b.t }); pos = null;
        peak = Math.max(peak, eq); maxDD = Math.max(maxDD, (peak - eq) / peak);
      }
    }
    if (!pos && ef[i - 1] != null && es[i - 1] != null && a[i]) {
      const upX = ef[i - 1] <= es[i - 1] && ef[i] > es[i] && r[i] < p.rsiMax;
      const dnX = p.short && ef[i - 1] >= es[i - 1] && ef[i] < es[i] && r[i] > 100 - p.rsiMax;
      if (upX || dnX) {
        const dir = upX ? 1 : -1, stopD = a[i] * p.k, entry = b.c;
        if (stopD > 0) pos = { dir, entry, sl: entry - dir * stopD, tp: entry + dir * stopD * p.rr, units: eq * risk / stopD, eq0: eq };
      }
    }
    curve.push(eq);
  }
  const wins = trades.filter(t => t.win).length;
  const gp = trades.filter(t => t.r > 0).reduce((s, t) => s + t.r, 0), gl = -trades.filter(t => t.r < 0).reduce((s, t) => s + t.r, 0);
  return { params: p, trades: trades.length, winRate: trades.length ? wins / trades.length * 100 : 0, ret: (eq - 1) * 100, maxDD: maxDD * 100, pf: gl ? gp / gl : (gp ? Infinity : 0), avgR: trades.length ? trades.reduce((s, t) => s + t.r, 0) / trades.length : 0, curve, from: bars[0].t, to: bars[bars.length - 1].t };
}
const defaultParams = () => ({ fast: 12, slow: 26, rsiMax: 70, k: 2, rr: S.minRR, short: S.allowShort });
function optimize(bars) {
  const res = [];
  for (const fast of [9, 12, 20]) for (const slow of [26, 50, 100]) if (slow > fast)
    for (const k of [1.5, 2, 2.5]) for (const rr of [1.5, 2, 3])
      res.push(backtest(bars, { fast, slow, rsiMax: 70, k, rr, short: S.allowShort }));
  return res.filter(r => r.trades >= 8).sort((a, b) => (b.ret / Math.max(b.maxDD, 3)) - (a.ret / Math.max(a.maxDD, 3))).slice(0, 5);
}

/* ───────────────────────── Agent 5: risk manager (local, deterministic) ───────────────────────── */
function riskCheck(plan, snap) {
  const out = { checks: [], approved: false, size: null };
  if (!plan || plan.decision === 'no_trade') { out.checks.push({ ok: null, t: 'Claude معامله‌ای پیشنهاد نکرد — صبر هم یک موقعیت است.' }); return out; }
  const dir = plan.decision === 'long' ? 1 : -1;
  const { entry, stop, target } = plan; const stopD = Math.abs(entry - stop);
  const add = (ok, t, crit = true) => out.checks.push({ ok, t, crit });
  const geom = dir === 1 ? (stop < entry && entry < target) : (stop > entry && entry > target);
  add(geom, 'ساختار معامله منطقی است (حد ضرر و هدف در جهت درست)');
  if (dir === -1) add(S.allowShort, 'معامله فروش (شورت) در تنظیمات مجاز است');
  const rr = stopD ? Math.abs(target - entry) / stopD : 0;
  add(rr >= S.minRR, `نسبت ریسک به ریوارد ${faNum(rr, 2)} (حداقل ${faNum(S.minRR)})`);
  const riskAmt = S.capital * S.riskPct / 100; const units = stopD ? riskAmt / stopD : 0; const notional = units * entry; const lev = notional / S.capital;
  add(lev <= S.maxLeverage, `حجم پوزیشن نسبت به کل سرمایه: اهرم ${faNum(lev, 2)}x (سقف ${faNum(S.maxLeverage)}x)`);
  const atrMul = snap.atr ? stopD / snap.atr : 0;
  add(atrMul >= 0.5 && atrMul <= 5, `فاصله حد ضرر ${faNum(atrMul, 1)} برابر ATR (بازه مجاز ۰٫۵ تا ۵)`, false);
  const dd = S.peakEquity > 0 ? Math.max(0, (S.peakEquity - S.capital) / S.peakEquity * 100) : 0;
  add(dd < S.maxDD, `افت فعلی سرمایه ${faNum(dd, 1)}٪ (حداکثر مجاز ${faNum(S.maxDD)}٪)`);
  add((plan.confidence ?? 0) >= S.minConfidence, `اطمینان تحلیل ${faNum(plan.confidence ?? 0, 0)}٪ (حداقل ${faNum(S.minConfidence)}٪)`);
  const dist = snap.atr ? Math.abs(entry - snap.price) / snap.atr : 0;
  add(dist <= 3, `نقطه ورود ${faNum(dist, 1)} ATR با قیمت فعلی فاصله دارد`, false);
  out.size = { riskAmt, units, notional, lev, rr };
  out.approved = out.checks.filter(c => c.crit !== false).every(c => c.ok);
  return out;
}

/* ───────────────────────── Claude API ───────────────────────── */
const cleanKey = k => String(k || '').replace(/[^\x21-\x7e]/g, '');
const FALLBACK_MODELS = new Set(['claude-opus-5-5', 'claude-sonnet-5-5']);
async function claude({ system, prompt, webSearch = false, maxTokens = 8000 }) {
  if (!S.apiKey) throw new Error('کلید API در تنظیمات وارد نشده است.');
  const headers = {
    'content-type': 'application/json', 'x-api-key': cleanKey(S.apiKey),
    'anthropic-version': '2026-10-21', 'anthropic-dangerous-direct-browser-access': 'true',
  };
  const body = { model: S.model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }], output_config: { effort: S.effort } };
  if (FALLBACK_MODELS.has(S.model)) { headers['anthropic-beta'] = 'server-side-fallback-2026-07-01'; body.fallbacks = 'default'; }
  if (webSearch) body.tools = [{ type: 'web_search_20260209', name: 'web_search', max_uses: 5 }];
  for (let turn = 0; turn < 4; turn++) {
    let res;
    try { res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers, body: JSON.stringify(body) }); }
    catch { throw new Error('اتصال به Claude برقرار نشد (شبکه/VPN را بررسی کن).'); }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const m = data?.error?.message || `HTTP ${res.status}`;
      if (res.status === 401) { const k = cleanKey(S.apiKey); throw new Error(!k.startsWith('sk-ant-') ? 'کلید باید با sk-ant- شروع شود. احتمالاً کلید از سایت Anthropic نیست یا ناقص کپی شده.' : `کلید API رد شد (${k.length} کاراکتر، آخرش …${k.slice(-4)}). کلید را دوباره کامل کپی کن یا در platform.claude.com یک کلید جدید بساز. پیام سرور: ${m}`); }
      if (res.status === 429) throw new Error('محدودیت نرخ درخواست — کمی صبر کن و دوباره امتحان کن.');
      if (res.status === 403) throw new Error('دسترسی رد شد (احتمالاً محدودیت منطقه‌ای؛ VPN لازم است): ' + m);
      throw new Error(m);
    }
    if (data.stop_reason === 'pause_turn') { body.messages = [...body.messages, { role: 'assistant', content: data.content }]; continue; }
    if (data.stop_reason === 'refusal') throw new Error('Claude به این درخواست پاسخ نداد (refusal).');
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    if (!text) throw new Error('پاسخ خالی از Claude' + (data.stop_reason === 'max_tokens' ? ' (سقف توکن)' : ''));
    return text;
  }
  throw new Error('جستجوی وب بیش از حد طول کشید.');
}

const profileText = () => `پروفایل معامله‌گر: سرمایه ${S.capital} دلار، ریسک هر معامله ${S.riskPct}٪، حداقل R:R برابر ${S.minRR}، حداکثر افت مجاز ${S.maxDD}٪، سقف اهرم ${S.maxLeverage}x، سبک ${S.style === 'swing' ? 'سوئینگ (چندروزه)' : 'روزانه'}، شورت ${S.allowShort ? 'مجاز' : 'غیرمجاز'}.`;
const snapText = s => JSON.stringify({
  symbol: s.symbol, asset: s.cls, timeframe: s.tf, price: s.price, change_last6bars_pct: +s.chg.toFixed(2), rsi14: +s.rsi?.toFixed(1),
  atr14: s.atr, atr_pct: +s.atrPct.toFixed(2), ema20: s.ema20, ema50: s.ema50, ema200: s.ema200, high20: s.prevHigh, low20: s.prevLow,
  volume_vs_avg: s.volRatio && +s.volRatio.toFixed(2), scanner_bias: s.bias, bull_score: s.bullScore, bear_score: s.bearScore,
  last30_ohlc: s.recent, note: s.cls === 'gold' ? 'PAXG is a gold-backed token used as XAU/USD proxy' : s.daily ? 'daily closes only (ECB reference rates), no volume' : undefined,
});
const btText = b => b ? `بک‌تست استراتژی تقاطع EMA(${b.params.fast}/${b.params.slow}) با حد ضرر ${b.params.k}×ATR و R:R=${b.params.rr} روی همین نماد: ${b.trades} معامله، نرخ برد ${b.winRate.toFixed(0)}٪، بازده کل ${b.ret.toFixed(1)}٪، بیشترین افت ${b.maxDD.toFixed(1)}٪، profit factor ${isFinite(b.pf) ? b.pf.toFixed(2) : '∞'}.` : 'بک‌تست در دسترس نیست.';

const COMMON = 'به فارسی روان و خلاصه بنویس. از عدد و سطح قیمت مشخص استفاده کن. هیچ‌وقت سود را تضمین نکن. خروجی را با تیترهای کوتاه (##) و بولت‌پوینت بنویس.';
const AGENTS = {
  fundamental: (s) => ({
    webSearch: S.webSearch,
    system: `تو «تحلیلگر بنیادی» در یک میز معاملات حرفه‌ای هستی. ${COMMON}`,
    prompt: `نماد: ${displayName(s.symbol)} (${CLASS_FA[s.cls]}). تاریخ امروز: ${new Date().toISOString().slice(0, 10)}.
${S.webSearch ? 'با جستجوی وب، مهم‌ترین اخبار و داده‌های ۷ روز اخیر را پیدا کن.' : 'جستجوی وب خاموش است؛ بر اساس دانش خودت و داده‌های تکنیکال تحلیل کن و صریح بگو اخبار لحظه‌ای بررسی نشده.'}
تمرکز: ${s.cls === 'crypto' ? 'اخبار پروژه، جریان ETF و نهادی، آنچین، مقررات، بازار کلی کریپتو، فدرال رزرو و شاخص دلار' : s.cls === 'gold' ? 'نرخ بهره واقعی آمریکا، شاخص دلار، خرید بانک‌های مرکزی، ریسک ژئوپلیتیک، تقویم اقتصادی' : 'اختلاف نرخ بهره، سیاست بانک‌های مرکزی، تقویم اقتصادی هفته، داده‌های تورم و اشتغال'}.
داده تکنیکال فعلی: ${snapText(s)}
خروجی دقیقاً با این بخش‌ها:
## گزارش تحقیق
(۴ تا ۶ بولت از مهم‌ترین یافته‌ها، هر کدام با منبع/تاریخ اگر داری)
## تز معاملاتی
جهت: خرید/فروش/خنثی — ورود: … — هدف: … — حد ضرر: …
(حداکثر ۲۵۰ کلمه)`,
  }),
  bull: (s, f, bt) => ({
    system: `تو «تحلیلگر خوش‌بین» هستی؛ وظیفه‌ات ساختن قوی‌ترین استدلالِ مبتنی بر شواهد برای خرید است. اگر استدلال خرید ضعیف است، صادقانه بگو. ${COMMON}`,
    prompt: `${snapText(s)}\n\nگزارش تحلیلگر بنیادی:\n${f}\n\n${btText(bt)}\n\nبا این بخش‌ها: ## دلایل رشد ## پتانسیل سود (هدف‌های قیمتی) ## محرک‌های مثبت ## قدرت استدلال من (عدد ۱ تا ۱۰). حداکثر ۲۰۰ کلمه.`,
  }),
  bear: (s, f, bt) => ({
    system: `تو «تحلیلگر بدبین» هستی؛ وظیفه‌ات پیدا کردن همه ریسک‌ها و قوی‌ترین استدلال برای فروش/عدم ورود است. اگر استدلال نزولی ضعیف است، صادقانه بگو. ${COMMON}`,
    prompt: `${snapText(s)}\n\nگزارش تحلیلگر بنیادی:\n${f}\n\n${btText(bt)}\n\nبا این بخش‌ها: ## ریسک‌های نزولی ## نشانه‌های ضعف بازار ## نقطه ابطال تحلیل صعودی ## قدرت استدلال من (عدد ۱ تا ۱۰). حداکثر ۲۰۰ کلمه.`,
  }),
  cio: (s, f, bull, bear, bt) => ({
    maxTokens: 6000,
    system: `تو «Claude، مغز مشترک» میز معاملات هستی. حرف هر دو طرف را می‌شنوی و جمع‌بندی می‌کنی. منضبط و محافظه‌کاری؛ اگر شواهد کافی نیست no_trade بده. فقط و فقط یک شیء JSON معتبر برگردان، بدون هیچ متن اضافه یا \`\`\`.`,
    prompt: `${profileText()}
داده: ${snapText(s)}
${btText(bt)}
--- تحلیلگر بنیادی ---
${f}
--- خوش‌بین ---
${bull}
--- بدبین ---
${bear}
---
قیمت فعلی ${s.price} و ATR ${s.atr} است؛ سطوح را واقع‌بینانه و نزدیک به قیمت فعلی بده.
فرمت JSON:
{"decision":"long"|"short"|"no_trade","entry":عدد,"stop":عدد,"target":عدد,"confidence":0-100,"horizon":"متن کوتاه","summary":"جمع‌بندی ۲-۳ جمله‌ای فارسی","for":["دلیل موافق",...],"against":["دلیل مخالف",...],"invalidation":"شرط ابطال به فارسی"}`,
  }),
};
function parseJSON(t) {
  t = t.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/(\d)٫(\d)/g, '$1.$2');
  const f = t.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/); const m = f ? f[1] : (t.match(/\{[\s\S]*\}/) || [])[0];
  if (!m) throw new Error('بلوک JSON پیدا نشد'); let j; try { j = JSON.parse(m); } catch { throw new Error('JSON قابل خواندن نبود'); }
  if (!['long', 'short', 'no_trade'].includes(j.decision)) throw new Error('فیلد decision نامعتبر است'); ['entry', 'stop', 'target', 'confidence'].forEach(k => j[k] = j[k] == null ? null : Number(j[k])); return j; }

/* ───────────────────────── background waves ───────────────────────── */
function drawWaves() {
  const svg = $('#bgwaves'); const w = 800, h = 1600; svg.setAttribute('viewBox', `0 0 ${w} ${h}`); svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  let paths = ''; const cx = 520, cy = 700;
  for (let k = 1; k <= 34; k++) {
    const R = k * 34; let d = '';
    for (let i = 0; i <= 72; i++) {
      const a = i / 72 * Math.PI * 2; const wob = 1 + 0.12 * Math.sin(a * 3 + k * 0.4) + 0.06 * Math.sin(a * 7 - k * 0.25);
      const x = cx + Math.cos(a) * R * wob * 1.1, y = cy + Math.sin(a) * R * wob * 1.35; d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    paths += `<path d="${d}Z"/>`;
  }
  svg.innerHTML = `<g fill="none" stroke="#cfcac0" stroke-width="1">${paths}</g>`;
}

/* ───────────────────────── charts ───────────────────────── */
function candleSVG(bars, w = 320, h = 150) {
  const B = bars.slice(-40); const hi = Math.max(...B.map(b => b.h)), lo = Math.min(...B.map(b => b.l)); const sx = w / B.length, y = v => 8 + (hi - v) / (hi - lo || 1) * (h - 16);
  return `<svg class="chart" viewBox="0 0 ${w} ${h}">${B.map((b, i) => { const x = i * sx + sx / 2, up = b.c >= b.o, col = up ? 'var(--green)' : 'var(--red)'; const top = y(Math.max(b.o, b.c)), bh = Math.max(1.5, Math.abs(y(b.o) - y(b.c)));
    return `<line x1="${x}" x2="${x}" y1="${y(b.h)}" y2="${y(b.l)}" stroke="${col}" stroke-width="1.2"/><rect x="${x - sx * .3}" y="${top}" width="${sx * .6}" height="${bh}" fill="${col}" rx="1"/>`; }).join('')}</svg>`;
}
function lineSVG(vals, w = 320, h = 120, col = 'var(--green)') {
  if (vals.length < 2) return ''; const step = Math.max(1, Math.floor(vals.length / 200)); const V = vals.filter((_, i) => i % step === 0);
  const hi = Math.max(...V), lo = Math.min(...V); const pts = V.map((v, i) => `${(i / (V.length - 1) * w).toFixed(1)},${(6 + (hi - v) / (hi - lo || 1) * (h - 12)).toFixed(1)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round"/><line x1="0" x2="${w}" y1="${h - 1}" y2="${h - 1}" stroke="var(--line)"/></svg>`;
}

/* ───────────────────────── pages ───────────────────────── */
const AG = [
  ['search', 'اسکنر بازار', 'چند بازار را هم‌زمان اسکن می‌کند: روند، شکست سقف/کف، جهش حجم و ورود پول. (محلی، رایگان)'],
  ['file', 'تحلیلگر بنیادی', 'اخبار و داده‌های اقتصادی را می‌خواند و تز معاملاتی می‌سازد. (Claude + جستجوی وب)'],
  ['up', 'تحلیلگر خوش‌بین', 'قوی‌ترین استدلال برای خرید: دلایل رشد، پتانسیل سود، محرک‌ها. (Claude)'],
  ['down', 'تحلیلگر بدبین', 'ریسک‌های نزولی، ضعف بازار و نقطه ابطال. (Claude)'],
  ['shield', 'مدیر ریسک', 'حجم پوزیشن، R:R، اهرم و افت سرمایه را با قوانین تو چک می‌کند و معامله پرریسک را بلاک می‌کند. (محلی، قطعی)'],
  ['clock', 'بک‌تستر', 'استراتژی را روی داده‌های گذشته تست و بهینه می‌کند. (محلی، رایگان)'],
];

function renderStatus() {
  const p = $('#statusPill'); const on = !!S.apiKey; p.className = 'pill ok'; p.textContent = on ? '6 AGENTS · API' : '6 AGENTS · LOCAL';
}

async function renderHome() {
  const el = $('#p-home');
  el.innerHTML = `
  <h1>سلام ${esc(S.name)}،<br>دیگه لازم نیست <span class="o">تنها</span> ترید کنی.</h1>
  <h2>تو <span class="chipbox"><bdi class="latin">۶ تا Agent</bdi></span> داری.</h2>
  <p class="lead">اسکن، تحلیل، مدیریت ریسک و بک‌تست رو اونا انجام می‌دن.<br><b>تصمیم آخر همیشه با خودته.</b></p>
  <div class="grid2" style="margin-top:28px">
    <div class="card" style="text-align:center;padding-top:26px"><span class="label latin">CLAUDE</span>${burst(84)}<div class="latin small muted" dir="ltr" style="margin-top:10px;letter-spacing:.14em">6 AGENTS → ${S.apiKey ? 'API' : 'LOCAL + PRO'}</div></div>
    <div class="card" style="padding-top:22px"><span class="label">میز معاملات</span><div class="spread small"><b id="hSym">BTCUSDT</b><span class="up" id="hChg">● اسکن زنده</span></div><div id="hChart" style="margin-top:6px"><div class="empty">در حال دریافت…</div></div></div>
  </div>
  <h3 style="margin-top:22px">۶ ایجنت هوش مصنوعی. <span class="o">یه اتاق معاملات کامل.</span></h3>
  <div class="grid3" style="margin-top:16px">${AG.map((a, i) => `<div class="card mini" data-ag="${i}"><span class="num">0${i + 1}</span>${ic(a[0])}<div class="t">${a[1]}</div></div>`).join('')}</div>
  <div class="card green" style="margin-top:22px"><h3>${ic('play', 'ic-o')} چطور ازش استفاده کنم؟ (فقط ۳ قدم)</h3>
    <div class="row"><b class="o latin">1</b><div class="grow">دکمه <b>شروع تحلیل</b> رو بزن و یه نماد انتخاب کن (مثلاً BTCUSDT)</div></div>
    <div class="row"><b class="o latin">2</b><div class="grow">دکمه نارنجی <b>اجرای کامل میز معاملات</b> رو بزن و چند ثانیه صبر کن</div></div>
    <div class="row"><b class="o latin">3</b><div class="grow">صفحه خودش می‌ره پایین روی <b>مدیر ریسک</b>: <span class="up">سبز = معامله مجازه</span>، <span class="down">قرمز = وارد نشو</span></div></div>
    <button class="btn o" id="goDesk">${ic('play')} شروع تحلیل</button></div>
  <button class="btn ghost" id="goScan">${ic('search')} اسکن واچ‌لیست</button>
  <div id="scanOut"></div>`;
  el.querySelectorAll('[data-ag]').forEach(c => c.onclick = () => toast(AG[c.dataset.ag][2], 4200));
  $('#goScan').onclick = runScan; $('#goDesk').onclick = () => go('agents');
  const sym = watch()[0] || 'BTCUSDT';
  try {
    const d = await getCandles(sym); const s = analyze(sym, d);
    $('#hSym').textContent = displayName(sym); $('#hChart').innerHTML = candleSVG(d.bars);
    $('#hChg').className = s.chg >= 0 ? 'up' : 'down'; $('#hChg').innerHTML = `${s.chg >= 0 ? '▲' : '▼'} ${pct(s.chg)}`;
  } catch (e) { $('#hChart').innerHTML = `<div class="empty small">${esc(e.message)}</div>`; }
}

async function runScan() {
  const out = $('#scanOut'); const syms = watch(); const btn = $('#goScan'); btn.disabled = true;
  out.innerHTML = `<div class="card"><h3>${ic('search', 'ic-o')} اسکن بازار <span class="muted small">${CLASS_FA.crypto} · ${CLASS_FA.gold} · ${CLASS_FA.forex}</span></h3><div id="scanRows"></div></div>`;
  const rows = $('#scanRows'); const results = [];
  for (let i = 0; i < syms.length; i += 3) {
    await Promise.all(syms.slice(i, i + 3).map(async sym => {
      try { results.push(analyze(sym, await getCandles(sym))); } catch (e) { results.push({ symbol: sym, err: e.message }); }
    }));
    rows.innerHTML = `<div class="small muted">${faNum(results.length, 0)} از ${faNum(syms.length, 0)}…</div>`;
  }
  results.sort((a, b) => (b.err ? -1 : Math.max(b.bullScore, b.bearScore)) - (a.err ? -1 : Math.max(a.bullScore, a.bearScore)));
  const found = results.filter(r => r.setup);
  rows.innerHTML = results.map(r => r.err ? `<div class="row">${ic('warn', 'ic-warn')}<div class="grow"><b>${esc(r.symbol)}</b><div class="small muted">${esc(r.err)}</div></div></div>` : `
    <div class="row" data-sym="${r.symbol}" style="cursor:pointer">
      ${ic(r.bias === 'long' ? 'up' : r.bias === 'short' ? 'down' : 'bars', r.bias === 'long' ? 'ic-ok' : r.bias === 'short' ? 'ic-bad' : 'muted')}
      <div class="grow"><b>${esc(displayName(r.symbol))}</b> <span class="small muted">${CLASS_FA[r.cls]}</span>
        <div class="small muted">${[r.checks.trendUp && 'روند صعودی', r.checks.trendDn && 'روند نزولی', r.checks.breakoutUp && 'شکست مقاومت', r.checks.breakoutDn && 'شکست حمایت', r.checks.volSpike && 'جهش حجم', r.checks.flowIn && 'ورود پول'].filter(Boolean).join(' · ') || 'بدون سیگنال خاص'} · RSI ${faNum(r.rsi, 0)}</div></div>
      <div style="text-align:left">${px(r.price)}<div class="small ${r.chg >= 0 ? 'up' : 'down'}">${pct(r.chg)}</div></div>
    </div>`).join('') +
    `<div class="verdict ${found.length ? 'ok' : 'wait'}">${ic(found.length ? 'ok' : 'clock')} ${found.length ? `${faNum(found.length, 0)} ستاپ معاملاتی پیدا شد — روی هر نماد بزن تا ایجنت‌ها بررسی کنن` : 'فعلاً ستاپ قوی پیدا نشد — روی هر نماد بزن برای بررسی دستی'}</div>`;
  rows.querySelectorAll('[data-sym]').forEach(r => r.onclick = () => { go('agents'); $('#agSym').value = r.dataset.sym; });
  btn.disabled = false;
}

/* agents page */
function renderAgents() {
  const el = $('#p-agents');
  el.innerHTML = `
  <span class="tag">میز معاملات · ۶ ایجنت</span>
  <h2>معامله رو <span class="o">قبل از تو</span> پیدا می‌کنه،<br>ریز به ریز بررسی می‌کنه.</h2>
  <div class="card">
    <label class="f">نماد</label>
    <div style="display:flex;gap:8px"><select id="agSym">${watch().map(s => `<option value="${s}">${esc(displayName(s))}</option>`).join('')}</select></div>
    <div class="seg" id="agTf" style="margin-top:10px">${['1h', '4h', '1d'].map(t => `<button data-tf="${t}" class="${t === S.timeframe ? 'on' : ''}">${t}</button>`).join('')}</div>
    <button class="btn o" id="runDesk">${ic('play')} اجرای کامل میز معاملات</button>
    <p class="small muted" style="margin-top:8px">${S.apiKey ? `حالت API: هر اجرا حدود ۴ درخواست به Claude (${esc(S.model)}).` : 'حالت آفلاین: همه ایجنت‌ها روی گوشی اجرا می‌شوند. آخرش می‌تونی با دکمه «کپی برای Claude» تحلیل عمیق (با اخبار) رو از اپ Claude خودت بگیری.'}</p>
  </div>
  <div id="deskOut"></div>`;
  let tf = S.timeframe;
  el.querySelectorAll('#agTf button').forEach(b => b.onclick = () => { tf = b.dataset.tf; el.querySelectorAll('#agTf button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#runDesk').onclick = () => runDesk($('#agSym').value, tf);
}

function stepCard(id, n, title, icon) {
  return `<div class="card" id="st-${id}"><div class="step"><div class="dot" id="dot-${id}">${n}</div><h3 style="margin:0;flex:1">${ic(icon, 'ic-o')} ${title}</h3></div><div class="body" id="body-${id}"><div class="small muted" style="margin-top:8px">در صف…</div></div></div>`;
}
const setStep = (id, state, html) => { const d = $('#dot-' + id); if (d) { d.className = 'dot ' + state; if (state === 'done') d.textContent = '✓'; if (state === 'err') d.textContent = '!'; } if (html != null) $('#body-' + id).innerHTML = html; };

/* ───────── offline analysts (rule-based, run on the phone) ───────── */
const pt = n => { if (n == null || !isFinite(n)) return '—'; const a = Math.abs(n); return Number(n).toLocaleString('en-US', { maximumFractionDigits: a >= 1000 ? 2 : a >= 10 ? 3 : a >= 1 ? 4 : 6 }); };
function evidence(s, bt) {
  const bull = [], bear = [], btGood = bt && bt.trades >= 5 && bt.ret > 0 && bt.pf > 1.2, btBad = bt && bt.trades >= 5 && (bt.ret < 0 || bt.pf < 0.9);
  const ext = s.atr ? (s.price - s.ema20) / s.atr : 0;
  if (s.checks.trendUp) bull.push([2, 'روند صعودی: EMA20 بالای EMA50 و قیمت بالای EMA20']);
  if (s.checks.trendDn) bear.push([2, 'روند نزولی: EMA20 زیر EMA50 و قیمت زیر EMA20']);
  if (s.ema200) (s.price > s.ema200 ? bull : bear).push([1, `قیمت ${s.price > s.ema200 ? 'بالای' : 'زیر'} میانگین ۲۰۰ (روند بلندمدت ${s.price > s.ema200 ? 'صعودی' : 'نزولی'})`]);
  if (s.checks.breakoutUp) bull.push([1, `شکست سقف ۲۰ کندل اخیر (${pt(s.prevHigh)})`]);
  if (s.checks.breakoutDn) bear.push([1, `شکست کف ۲۰ کندل اخیر (${pt(s.prevLow)})`]);
  if (s.checks.volSpike) (s.lastUp ? bull : bear).push([1, `جهش حجم ${faNum(s.volRatio, 1)} برابر میانگین روی کندل ${s.lastUp ? 'سبز' : 'قرمز'}`]);
  if (s.checks.flowIn) bull.push([1, 'ورود پول: OBV بیست کندل اخیر مثبت']);
  if (s.checks.flowOut) bear.push([1, 'خروج پول: OBV بیست کندل اخیر منفی']);
  if (s.rsi >= 50 && s.rsi < 68) bull.push([1, `مومنتوم مثبت (RSI ${faNum(s.rsi, 0)})`]);
  if (s.rsi > 32 && s.rsi < 50) bear.push([1, `مومنتوم ضعیف (RSI ${faNum(s.rsi, 0)})`]);
  if (s.rsi >= 72) bear.push([1, `اشباع خرید (RSI ${faNum(s.rsi, 0)}) — احتمال اصلاح`]);
  if (s.rsi <= 28) bull.push([1, `اشباع فروش (RSI ${faNum(s.rsi, 0)}) — احتمال برگشت`]);
  if (ext > 2.5) bear.push([1, `قیمت ${faNum(ext, 1)} ATR از EMA20 فاصله گرفته (کشیدگی زیاد)`]);
  if (ext < -2.5) bull.push([1, `قیمت ${faNum(-ext, 1)} ATR زیر EMA20 (کشیدگی نزولی، احتمال برگشت)`]);
  if (btGood) bull.push([1, `بک‌تست مثبت: بازده ${faNum(bt.ret, 1)}٪، PF ${faNum(bt.pf, 2)}`]);
  if (btBad) bear.push([1, `بک‌تست ضعیف: بازده ${faNum(bt.ret, 1)}٪، افت ${faNum(bt.maxDD, 1)}٪`]);
  if (s.atrPct > 5) bear.push([0, `نوسان بالا (ATR ${faNum(s.atrPct, 1)}٪ قیمت) — حجم کمتر بگیر`]);
  const sum = a => a.reduce((x, y) => x + y[0], 0);
  return { bull, bear, bs: sum(bull), rs: sum(bear) };
}
const strength = (a, b) => Math.max(1, Math.min(10, Math.round(2 + a * 1.4 - b * 0.4)));
function localFund(s) {
  const list = {
    crypto: ['اخبار مهم پروژه، هک یا مشکل صرافی‌ها', 'جریان ورود/خروج ETF بیت‌کوین و اتریوم', 'جلسه فدرال رزرو و داده تورم آمریکا (CPI)', 'دامیننس بیت‌کوین و حال کلی بازار'],
    gold: ['بازده اوراق ۱۰ ساله و نرخ بهره واقعی آمریکا', 'شاخص دلار (DXY)', 'تنش‌های ژئوپلیتیک', 'خرید طلای بانک‌های مرکزی'],
    forex: ['تصمیم نرخ بهره بانک مرکزی هر دو ارز', 'تقویم اقتصادی این هفته (NFP، CPI، GDP)', 'سخنرانی رؤسای بانک‌های مرکزی', 'اختلاف بازده اوراق دو کشور'],
  }[s.cls];
  return `## حالت آفلاین
اخبار لحظه‌ای خوانده نشد. برای تحلیل اخبار از دکمه «کپی برای Claude» پایین صفحه استفاده کن.
## خلاصه وضعیت
- روند بلندمدت: ${s.ema200 ? (s.price > s.ema200 ? 'صعودی (بالای EMA200)' : 'نزولی (زیر EMA200)') : 'داده کافی نیست'}
- نوسان روزانه/کندلی: ${faNum(s.atrPct, 2)}٪ ${s.atrPct > 4 ? '(بالا)' : s.atrPct < 1 ? '(کم)' : '(معمولی)'}
- محدوده اخیر: ${pt(s.prevLow)} تا ${pt(s.prevHigh)}
## قبل از ورود، خودت چک کن
${list.map(x => '- ' + x).join('\n')}`;
}
function localBull(s, ev) {
  const t1 = Math.max(s.prevHigh, s.price + 2 * s.atr), t2 = s.price + 3.5 * s.atr;
  return `## دلایل رشد\n${ev.bull.length ? ev.bull.map(x => '- ' + x[1]).join('\n') : '- شاهد قابل‌توجهی برای رشد پیدا نشد'}
## پتانسیل سود\n- هدف اول: ${pt(t1)} (${pct((t1 / s.price - 1) * 100)})\n- هدف دوم: ${pt(t2)} (${pct((t2 / s.price - 1) * 100)})
## قدرت استدلال من\n${faNum(strength(ev.bs, ev.rs), 0)} از ۱۰`;
}
function localBear(s, ev) {
  const inv = Math.min(s.ema50 || s.prevLow, s.prevLow);
  return `## ریسک‌های نزولی\n${ev.bear.length ? ev.bear.map(x => '- ' + x[1]).join('\n') : '- ریسک نزولی خاصی در داده‌ها دیده نشد'}
## نقطه ابطال تحلیل صعودی\n- بسته شدن زیر ${pt(inv)}
## قدرت استدلال من\n${faNum(strength(ev.rs, ev.bs), 0)} از ۱۰`;
}
function localPlan(s, bt, ev) {
  const net = ev.bs - ev.rs, rr = Math.max(S.minRR, 2) + 0.05, k = 1.5;
  let decision = net >= 2 ? 'long' : net <= -2 && S.allowShort ? 'short' : 'no_trade';
  const dir = decision === 'long' ? 1 : -1;
  let conf = Math.min(85, 45 + Math.abs(net) * 7);
  if (bt && bt.trades >= 5) conf += (bt.ret > 0 && bt.pf > 1.2) ? 5 : bt.ret < 0 ? -10 : 0;
  const plan = { decision, confidence: Math.round(conf), horizon: S.style === 'swing' ? 'چند روز' : 'درون‌روزی', mode: 'local',
    for: (decision === 'short' ? ev.bear : ev.bull).map(x => x[1]).slice(0, 4), against: (decision === 'short' ? ev.bull : ev.bear).map(x => x[1]).slice(0, 4) };
  if (decision === 'no_trade') {
    plan.summary = `امتیاز خوش‌بین ${ev.bs} در برابر بدبین ${ev.rs} — اختلاف کافی برای ورود نیست${net <= -2 && !S.allowShort ? ' (سیگنال فروش هست ولی شورت در تنظیمات غیرفعال است)' : ''}. صبر کن تا ستاپ واضح‌تر شود.`;
    plan.for = ev.bull.map(x => x[1]).slice(0, 3); plan.against = ev.bear.map(x => x[1]).slice(0, 3);
    return plan;
  }
  plan.entry = s.price; plan.stop = s.price - dir * k * s.atr; plan.target = s.price + dir * k * s.atr * rr;
  plan.summary = `امتیاز ${decision === 'long' ? 'خوش‌بین' : 'بدبین'} ${Math.max(ev.bs, ev.rs)} در برابر ${Math.min(ev.bs, ev.rs)}. حد ضرر ${k} برابر ATR و هدف با R:R ${faNum(rr, 2)}. این جمع‌بندی فقط تکنیکال است؛ برای بررسی اخبار از «کپی برای Claude» استفاده کن.`;
  plan.invalidation = decision === 'long' ? `بسته شدن زیر ${pt(plan.stop)}` : `بسته شدن بالای ${pt(plan.stop)}`;
  return plan;
}

/* ───────── copy-to-Claude (uses the user's own Claude.ai / Pro chat) ───────── */
function claudeChatPrompt(run) {
  const s = run.snap;
  return `تو یک میز معاملات حرفه‌ای با چهار نقش هستی و به فارسی روان جواب می‌دی. سود رو هیچ‌وقت تضمین نکن.
اول با جستجوی وب مهم‌ترین اخبار ۷ روز اخیر مربوط به ${displayName(s.symbol)} (${CLASS_FA[s.cls]}) رو پیدا کن. تاریخ امروز: ${new Date().toISOString().slice(0, 10)}.

${profileText()}
داده تکنیکال (تایم‌فریم ${s.tf}): ${snapText(s)}
${btText(run.bt)}
${run.plan ? `نظر تحلیل آفلاین اپ: ${run.plan.decision} با اطمینان ${run.plan.confidence}٪.` : ''}

این چهار بخش رو کوتاه بنویس:
## ۱. تحلیلگر بنیادی — مهم‌ترین اخبار و داده‌ها (با تاریخ و منبع)
## ۲. تحلیلگر خوش‌بین — دلایل رشد، هدف‌های قیمتی، قدرت استدلال از ۱۰
## ۳. تحلیلگر بدبین — ریسک‌ها، نقطه ابطال، قدرت استدلال از ۱۰
## ۴. جمع‌بندی — تصمیم نهایی با در نظر گرفتن پروفایل ریسک من. اگه شواهد کافی نیست، no_trade بده.

قیمت فعلی ${s.price} و ATR برابر ${s.atr} است؛ سطوح رو واقع‌بینانه و نزدیک قیمت فعلی بده.
در آخرِ جواب، دقیقاً یک بلوک کد json با این فرمت بنویس (اعداد با ارقام انگلیسی):
\`\`\`json
{"decision":"long|short|no_trade","entry":0,"stop":0,"target":0,"confidence":0,"horizon":"","summary":"","for":[""],"against":[""],"invalidation":""}
\`\`\``;
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch {}
  const ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.focus(); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch {} ta.remove(); return ok;
}
function copyCard(run) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="card dash" id="copyC"><span class="num" style="right:12px">PRO</span>
    <h3 style="margin-top:6px">${ic('spark', 'ic-o')} تحلیل عمیق با Claude <span class="small muted">(با اشتراک خودت)</span></h3>
    <p class="small muted" style="line-height:1.9">۱. «کپی متن» رو بزن ← ۲. توی اپ Claude بچسبون و بفرست ← ۳. کل جواب Claude رو کپی کن و اینجا بچسبون.</p>
    <div class="grid2"><button class="btn o sm" id="cpBtn" style="width:100%">کپی متن برای Claude</button><a class="btn ghost sm" style="width:100%;text-decoration:none" href="https://claude.ai/new" target="_blank" rel="noopener">باز کردن Claude</a></div>
    <label class="f">جواب Claude رو اینجا بچسبون</label><textarea id="cpIn" rows="5" placeholder="کل جواب Claude (همراه با بلوک json آخرش)"></textarea>
    <button class="btn" id="cpGo">${ic('shield')} بررسی با مدیر ریسک</button><div id="cpOut"></div></div>`;
  $('#deskOut').appendChild(wrap);
  $('#cpBtn').onclick = async () => toast(await copyText(claudeChatPrompt(run)) ? '✓ کپی شد — حالا توی Claude بچسبون' : 'کپی نشد؛ دوباره امتحان کن', 3500);
  $('#cpGo').onclick = () => {
    const t = $('#cpIn').value.trim(); if (!t) return toast('اول جواب Claude رو بچسبون');
    try {
      const plan = parseJSON(t); plan.mode = 'claude'; const rk = riskCheck(plan, run.snap);
      $('#cpOut').innerHTML = planHTML(plan) + `<h3 style="margin-top:14px">${ic('shield', 'ic-o')} مدیر ریسک</h3>` + riskHTML(rk);
      updateRun(run.id, { plan, risk: rk, mode: 'claude', claudeText: t.slice(0, 8000), localPlan: run.plan });
      toast('نتیجه Claude در ژورنال ذخیره شد');
    } catch (e) { $('#cpOut').innerHTML = `<div class="verdict bad">${ic('warn')} ${esc(e.message)} — مطمئن شو بلوک json آخر جواب هم کپی شده.</div>`; }
  };
}

async function runDesk(sym, tf) {
  const out = $('#deskOut'); const btn = $('#runDesk'); btn.disabled = true;
  const useAPI = !!S.apiKey;
  out.innerHTML = stepCard('scan', 1, 'اسکنر بازار', 'search') + stepCard('bt', 2, 'بک‌تستر', 'clock') + stepCard('fund', 3, 'تحلیلگر بنیادی' + (useAPI ? '' : ' · آفلاین'), 'file') +
    `<div id="debateWrap"></div>` + stepCard('cio', 5, useAPI ? 'Claude · مغز مشترک' : 'جمع‌بندی · آفلاین', 'spark') + stepCard('risk', 6, 'مدیر ریسک', 'shield');
  const run = { id: Date.now(), sym, tf, at: new Date().toISOString(), mode: useAPI ? 'api' : 'local' };
  try {
    // 1 scanner
    setStep('scan', 'run', '<div class="small muted" style="margin-top:8px">دریافت داده و محاسبه اندیکاتورها…</div>');
    const data = await getCandles(sym, tf); const s = analyze(sym, data); run.snap = s;
    const ck = (ok, t) => `<div class="row">${ic(ok ? 'ok' : 'ban', ok ? 'ic-ok' : 'muted')}<div class="grow">${t}</div></div>`;
    setStep('scan', 'done', `${candleSVG(data.bars)}
      <div class="kv"><span>قیمت</span><span>${px(s.price)} <span class="${s.chg >= 0 ? 'up' : 'down'} small">${pct(s.chg)}</span></span></div>
      ${ck(s.checks.flowIn, 'ورود پول (OBV مثبت + رشد قیمت)')}${ck(s.checks.volSpike, 'جهش ناگهانی حجم معاملات' + (s.volRatio ? ` (${faNum(s.volRatio, 1)}x)` : s.hasVol ? '' : ' — داده حجم ندارد'))}
      ${ck(s.checks.breakoutUp || s.checks.breakoutDn, s.checks.breakoutDn ? 'شکست حمایت مهم' : 'شکست مقاومت مهم')}${ck(s.checks.trendUp || s.checks.trendDn, s.checks.trendDn ? 'روند نزولی (EMA20 < EMA50)' : 'روند صعودی (EMA20 > EMA50)')}
      <div class="kv"><span>RSI / ATR</span><span><bdi class="n">${faNum(s.rsi, 0)}</bdi> / ${px(s.atr)} (${faNum(s.atrPct, 2)}٪)</span></div>
      <div class="verdict ${s.setup ? 'ok' : 'wait'}">${ic(s.setup ? 'ok' : 'clock')} ${s.setup ? `ستاپ ${s.bias === 'long' ? 'خرید' : 'فروش'} پیدا شد` : 'ستاپ قوی نیست — ادامه برای نظر ایجنت‌ها'}</div>
      ${data.daily && isFx(sym) ? '<p class="small muted" style="margin-top:6px">فارکس: فقط داده روزانه (نرخ مرجع ECB) در دسترس است.</p>' : ''}`);

    // 2 backtest
    setStep('bt', 'run');
    const bt = backtest(data.bars, defaultParams()); run.bt = bt;
    setStep('bt', 'done', btHTML(bt));

    const debate = () => { $('#debateWrap').innerHTML = `<h3 style="margin:18px 0 6px">سر هر معامله <span class="o">با هم بحث می‌کنن.</span></h3>
      <div class="debate"><div class="card topgreen" id="bullC"><h3 class="up">${ic('up')} خوش‌بین</h3><div class="small muted">در حال فکر…</div></div><div class="vs">VS</div><div class="card topred" id="bearC"><h3 class="down">${ic('down')} بدبین</h3><div class="small muted">در حال فکر…</div></div></div>`; };
    const showDebate = () => { $('#bullC').innerHTML = `<h3 class="up">${ic('up')} خوش‌بین</h3><div class="md">${md(run.bull)}</div>`; $('#bearC').innerHTML = `<h3 class="down">${ic('down')} بدبین</h3><div class="md">${md(run.bear)}</div>`; };

    if (useAPI) {
      setStep('fund', 'run', `<div class="small muted" style="margin-top:8px">${S.webSearch ? 'در حال خواندن اخبار و جستجوی وب…' : 'در حال تحلیل…'}</div>`);
      run.fund = await claude(AGENTS.fundamental(s));
      setStep('fund', 'done', `<div class="md">${md(run.fund)}</div>`);
      debate();
      [run.bull, run.bear] = await Promise.all([claude(AGENTS.bull(s, run.fund, bt)), claude(AGENTS.bear(s, run.fund, bt))]);
      showDebate();
      setStep('cio', 'run', '<div class="small muted" style="margin-top:8px">Claude حرف هر دو طرف رو می‌شنوه و جمع‌بندی می‌کنه…</div>');
      run.plan = parseJSON(await claude(AGENTS.cio(s, run.fund, run.bull, run.bear, bt)));
    } else {
      const ev = evidence(s, bt);
      run.fund = localFund(s); setStep('fund', 'done', `<div class="md">${md(run.fund)}</div>`);
      debate(); run.bull = localBull(s, ev); run.bear = localBear(s, ev); showDebate();
      run.plan = localPlan(s, bt, ev);
    }
    setStep('cio', 'done', planHTML(run.plan));

    // 6 risk
    run.risk = riskCheck(run.plan, s);
    setStep('risk', 'done', riskHTML(run.risk));
    $('#st-risk').scrollIntoView({ behavior: 'smooth', block: 'center' });
    saveRun(run); toast('نتیجه در ژورنال ذخیره شد');
  } catch (e) {
    const cur = ['scan', 'bt', 'fund', 'cio', 'risk'].find(id => $('#dot-' + id)?.classList.contains('run')) || ['fund', 'cio', 'risk'].find(id => !$('#dot-' + id)?.classList.contains('done'));
    if (cur) setStep(cur, 'err', `<div class="verdict bad">${ic('warn')} ${esc(e.message)}</div>`);
    else toast(e.message, 5000);
    if (run.snap) saveRun(run);
  } finally {
    btn.disabled = false;
    if (run.snap && run.bt) copyCard(run);
  }
}

function btHTML(b) {
  return `${lineSVG(b.curve)}
  <div class="grid3" style="margin-top:10px">
    <div class="stat"><small>نرخ برد</small><b>${faNum(b.winRate, 0)}٪</b></div>
    <div class="stat"><small>بازده کل</small><b class="${b.ret >= 0 ? 'up' : 'down'}">${pct(b.ret)}</b></div>
    <div class="stat"><small>بدترین افت</small><b class="down">${faNum(b.maxDD, 1)}٪</b></div>
  </div>
  <p class="small muted" style="margin-top:8px">EMA ${faNum(b.params.fast, 0)}/${faNum(b.params.slow, 0)} · حد ضرر ${faNum(b.params.k)}×ATR · R:R ${faNum(b.params.rr)} · ${faNum(b.trades, 0)} معامله · PF ${isFinite(b.pf) ? faNum(b.pf, 2) : '∞'} · ریسک ${faNum(S.riskPct)}٪ با کارمزد ${faNum(S.feePct)}٪</p>`;
}
function planHTML(p) {
  const dirTxt = { long: '▲ خرید (صعودی)', short: '▼ فروش (نزولی)', no_trade: '— بدون معامله' }[p.decision] || p.decision;
  return `<div class="card ${p.decision === 'long' ? 'green' : p.decision === 'short' ? 'red' : ''}" style="margin:12px 0 0">
    <h3>تز معاملاتی نهایی</h3><b class="${p.decision === 'long' ? 'up' : p.decision === 'short' ? 'down' : 'muted'}">${dirTxt}</b>
    ${p.decision !== 'no_trade' ? `<div class="kv"><span>ورود:</span><span>${px(p.entry)}</span></div><div class="kv"><span>هدف:</span><span>${px(p.target)}</span></div><div class="kv"><span>حد ضرر:</span><span>${px(p.stop)}</span></div>` : ''}
    <div class="kv"><span>اطمینان:</span><span>${faNum(p.confidence, 0)}٪</span></div>${p.horizon ? `<div class="kv"><span>افق:</span><span>${esc(p.horizon)}</span></div>` : ''}
  </div>
  <div class="md"><p>${esc(p.summary)}</p>
  ${p.for?.length ? `<h4 class="up">موافق</h4><ul>${p.for.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  ${p.against?.length ? `<h4 class="down">مخالف</h4><ul>${p.against.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
  ${p.invalidation ? `<p><b>نقطه ابطال:</b> ${esc(p.invalidation)}</p>` : ''}</div>`;
}
function riskHTML(r) {
  return `<div style="margin-top:8px">${r.checks.map(c => `<div class="row">${c.ok == null ? ic('clock', 'muted') : ic(c.ok ? 'ok' : c.crit === false ? 'warn' : 'ban', c.ok ? 'ic-ok' : c.crit === false ? 'ic-warn' : 'ic-bad')}<div class="grow">${c.t}</div></div>`).join('')}</div>
  ${r.size ? `<div class="grid3" style="margin-top:10px"><div class="stat"><small>ریسک دلاری</small><b>$${faNum(r.size.riskAmt)}</b></div><div class="stat"><small>حجم (واحد)</small><b>${faNum(r.size.units, 4)}</b></div><div class="stat"><small>ارزش پوزیشن</small><b>$${faNum(r.size.notional, 0)}</b></div></div>` : ''}
  <div class="verdict ${r.approved ? 'ok' : r.size ? 'bad' : 'wait'}">${ic(r.approved ? 'ok' : r.size ? 'ban' : 'clock')} ${r.approved ? 'تأیید شد — تصمیم نهایی با خودته' : r.size ? 'رد شد — معامله متوقف شد' : 'معامله‌ای برای بررسی نیست'}</div>`;
}

/* backtest page */
function renderBacktest() {
  const el = $('#p-backtest'); const p = defaultParams();
  el.innerHTML = `
  <span class="tag">ایجنت ۶ · بک‌تستر</span>
  <h2>استراتژی رو <span class="o">برات بک‌تست</span> می‌کنه.</h2>
  <div class="card">
    <label class="f">نماد</label><select id="btSym">${watch().map(s => `<option value="${s}">${esc(displayName(s))}</option>`).join('')}</select>
    <div class="grid2">
      <div><label class="f">تایم‌فریم</label><select id="btTf">${['1h', '4h', '1d'].map(t => `<option ${t === S.timeframe ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      <div><label class="f">تعداد کندل</label><select id="btN"><option>500</option><option selected>1000</option></select></div>
      <div><label class="f">EMA سریع</label><input id="btF" type="number" value="${p.fast}"></div>
      <div><label class="f">EMA کند</label><input id="btS" type="number" value="${p.slow}"></div>
      <div><label class="f">حد ضرر (×ATR)</label><input id="btK" type="number" step="0.1" value="${p.k}"></div>
      <div><label class="f">R:R</label><input id="btR" type="number" step="0.1" value="${p.rr}"></div>
    </div>
    <div class="grid2"><button class="btn" id="btRun">${ic('play')} اجرای بک‌تست</button><button class="btn ghost" id="btOpt">${ic('sun')} بهینه‌سازی</button></div>
  </div>
  <div id="btOut"></div>
  <div class="card dash disclaimer">${ic('warn')}<div>بک‌تست خوب یعنی استراتژی منطقیه، نه تضمین سود. بهینه‌سازی زیاد = خطر overfitting. تصمیم آخر همیشه با خودته.</div></div>
  <div class="grid3"><div class="card dash feat">${ic('clock')}روی داده‌های گذشته تست می‌کنه</div><div class="card dash feat">${ic('bars')}عملکرد واقعی رو نشون می‌ده</div><div class="card dash feat">${ic('sun')}استراتژی رو بهینه می‌کنه</div></div>`;
  const load = async () => { const sym = $('#btSym').value; const d = await getCandles(sym, $('#btTf').value, +$('#btN').value); if (d.bars.length < 120) throw new Error('داده کافی نیست'); return { sym, d }; };
  $('#btRun').onclick = async () => {
    const o = $('#btOut'); o.innerHTML = '<div class="card empty">در حال بک‌تست…</div>';
    try {
      const { sym, d } = await load(); const b = backtest(d.bars, { fast: +$('#btF').value, slow: +$('#btS').value, rsiMax: 70, k: +$('#btK').value, rr: +$('#btR').value, short: S.allowShort });
      o.innerHTML = `<div class="card"><div class="spread"><h3>نتیجه بک‌تست · ${esc(displayName(sym))}</h3><span class="small muted">${new Date(b.from).toLocaleDateString('fa-IR')} تا ${new Date(b.to).toLocaleDateString('fa-IR')}</span></div>${btHTML(b)}</div>`;
    } catch (e) { o.innerHTML = `<div class="card"><div class="verdict bad">${esc(e.message)}</div></div>`; }
  };
  $('#btOpt').onclick = async () => {
    const o = $('#btOut'); o.innerHTML = '<div class="card empty">در حال تست ۶۰+ ترکیب پارامتر…</div>'; await sleep(30);
    try {
      const { sym, d } = await load(); const top = optimize(d.bars);
      if (!top.length) throw new Error('هیچ ترکیبی حداقل ۸ معامله نداشت — داده بیشتر یا تایم‌فریم کوچک‌تر امتحان کن.');
      o.innerHTML = `<div class="card"><h3>بهترین پارامترها · ${esc(displayName(sym))}</h3><p class="small muted">مرتب‌شده بر اساس بازده به افت</p>${top.map((b, i) => `
        <div class="row" data-i="${i}" style="cursor:pointer"><b class="o latin">#${i + 1}</b><div class="grow small">EMA ${b.params.fast}/${b.params.slow} · SL ${b.params.k}×ATR · R:R ${b.params.rr}<div class="muted">${faNum(b.trades, 0)} معامله · برد ${faNum(b.winRate, 0)}٪ · افت ${faNum(b.maxDD, 1)}٪</div></div><b class="${b.ret >= 0 ? 'up' : 'down'}">${pct(b.ret)}</b></div>`).join('')}
        <p class="small muted" style="margin-top:8px">روی هر ردیف بزن تا پارامترها در فرم بالا قرار بگیرند.</p></div>`;
      o.querySelectorAll('[data-i]').forEach(r => r.onclick = () => { const p = top[r.dataset.i].params; $('#btF').value = p.fast; $('#btS').value = p.slow; $('#btK').value = p.k; $('#btR').value = p.rr; $('#btRun').click(); });
    } catch (e) { o.innerHTML = `<div class="card"><div class="verdict bad">${esc(e.message)}</div></div>`; }
  };
}

/* journal */
const runs = () => LS.get('ftd.journal', []);
function updateRun(id, patch) { const j = runs(); const i = j.findIndex(r => r.id === id); if (i < 0) return; Object.assign(j[i], patch); LS.set('ftd.journal', j); }
function saveRun(r) { const j = runs(); const slim = { ...r, snap: r.snap && { ...r.snap, recent: undefined }, bt: r.bt && { ...r.bt, curve: undefined } }; j.unshift(slim); LS.set('ftd.journal', j.slice(0, 60)); }
function renderJournal() {
  const el = $('#p-journal'); const j = runs();
  el.innerHTML = `<span class="tag">ژورنال معاملات</span><h2>هر تحلیل، <span class="o">ثبت می‌شه.</span></h2>
  ${j.length ? j.map((r, i) => {
    const p = r.plan; const ok = r.risk?.approved;
    return `<details class="card"><summary><div class="spread"><div><b>${esc(displayName(r.sym))}</b> <span class="small muted">${esc(r.tf)} · ${{ api: 'API', local: 'آفلاین', claude: 'Claude' }[r.mode] || ''} · ${new Date(r.at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
      <span class="small ${p?.decision === 'long' ? 'up' : p?.decision === 'short' ? 'down' : 'muted'}">${p ? ({ long: '▲ خرید', short: '▼ فروش', no_trade: 'بدون معامله' }[p.decision]) : 'ناقص'} ${r.risk ? (ok ? '· ✓' : '· ✕') : ''}</span></div></summary>
      ${p ? planHTML(p) : ''}${r.risk ? riskHTML(r.risk) : ''}
      ${r.fund ? `<details style="margin-top:10px"><summary class="small o">گزارش بنیادی</summary><div class="md">${md(r.fund)}</div></details>` : ''}
      ${r.claudeText ? `<details><summary class="small o">جواب Claude</summary><div class="md">${md(r.claudeText)}</div></details>` : ''}
      ${r.bull ? `<details><summary class="small up">خوش‌بین</summary><div class="md">${md(r.bull)}</div></details>` : ''}
      ${r.bear ? `<details><summary class="small down">بدبین</summary><div class="md">${md(r.bear)}</div></details>` : ''}
      <div class="seg" style="margin-top:12px">${['برد', 'باخت', 'وارد نشدم'].map(o => `<button data-res="${i}|${o}" class="${r.result === o ? 'on' : ''}">${o}</button>`).join('')}<button data-del="${i}">${ic('trash').replace('<svg', '<svg width="14" height="14"')}</button></div>
    </details>`;
  }).join('') : '<div class="card empty">هنوز تحلیلی ثبت نشده. از تب «ایجنت‌ها» میز معاملات رو اجرا کن.</div>'}
  ${j.length ? (() => { const done = j.filter(r => r.result === 'برد' || r.result === 'باخت'); const w = done.filter(r => r.result === 'برد').length; return `<div class="card"><h3>آمار شخصی</h3><div class="grid3"><div class="stat"><small>تحلیل‌ها</small><b>${faNum(j.length, 0)}</b></div><div class="stat"><small>معامله ثبت‌شده</small><b>${faNum(done.length, 0)}</b></div><div class="stat"><small>نرخ برد واقعی</small><b>${done.length ? faNum(w / done.length * 100, 0) + '٪' : '—'}</b></div></div></div>`; })() : ''}`;
  el.querySelectorAll('[data-res]').forEach(b => b.onclick = e => { e.preventDefault(); const [i, o] = b.dataset.res.split('|'); const j2 = runs(); j2[i].result = o; LS.set('ftd.journal', j2); renderJournal(); });
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = e => { e.preventDefault(); if (!confirm('حذف شود؟')) return; const j2 = runs(); j2.splice(+b.dataset.del, 1); LS.set('ftd.journal', j2); renderJournal(); });
}

/* settings */
function renderSettings() {
  const el = $('#p-settings');
  const num = (k, label, hint = '', step = 'any') => `<label class="f">${label} ${hint ? `<small>${hint}</small>` : ''}</label><input type="number" step="${step}" data-k="${k}" value="${S[k]}">`;
  const sw = (k, label) => `<div class="switch"><span>${label}</span><input type="checkbox" data-k="${k}" ${S[k] ? 'checked' : ''}></div>`;
  el.innerHTML = `
  <span class="tag">تنظیمات شخصی</span><h2>قوانین <span class="o">خودت</span>.</h2>
  <div class="card"><h3>${ic('spark', 'ic-o')} اتصال به Claude</h3>
    <p class="small muted" style="line-height:1.9">کلید API اختیاری است. بدون کلید، ایجنت‌ها آفلاین کار می‌کنند و با دکمه «کپی برای Claude» از اشتراک Pro خودت استفاده می‌کنی. کلید را از platform.claude.com بگیر (جدا از اشتراک Pro).</p>
    <label class="f">کلید API <small>اختیاری · فقط روی همین گوشی ذخیره می‌شود</small></label>
    <input class="ltr" type="password" data-k="apiKey" value="${esc(S.apiKey)}" placeholder="sk-ant-..." autocomplete="off">
    <label class="f">مدل</label><select data-k="model">
      <option value="claude-opus-5-5">Claude Opus 5.5 — دقیق‌ترین (پیش‌فرض)</option>
      <option value="claude-sonnet-5-5">Claude Sonnet 5.5 — سریع‌تر و ارزان‌تر</option>
      <option value="claude-haiku-5-5">Claude Haiku 5.5 — خیلی ارزان</option></select>
    <label class="f">عمق فکر کردن</label><select data-k="effort"><option value="low">کم (سریع)</option><option value="medium">متوسط</option><option value="high">زیاد (دقیق‌تر، کندتر)</option></select>
    ${sw('webSearch', 'جستجوی وب برای اخبار (تحلیلگر بنیادی)')}
    <button class="btn ghost sm" id="testKey" style="margin-top:6px">تست اتصال</button>
  </div>
  <div class="card"><h3>${ic('shield', 'ic-o')} مدیریت ریسک</h3>
    <label class="f">اسم</label><input data-k="name" value="${esc(S.name)}">
    <div class="grid2">${num('capital', 'سرمایه فعلی ($)')}${num('peakEquity', 'سقف سرمایه ($)', 'برای محاسبه افت')}
    ${num('riskPct', 'ریسک هر معامله ٪')}${num('minRR', 'حداقل R:R')}${num('maxDD', 'حداکثر افت مجاز ٪')}${num('maxLeverage', 'سقف اهرم (x)')}
    ${num('minConfidence', 'حداقل اطمینان ٪')}${num('feePct', 'کارمزد هر طرف ٪')}</div>
    ${sw('allowShort', 'معامله فروش (شورت) مجاز است')}
    <label class="f">سبک معامله</label><select data-k="style"><option value="swing">سوئینگ (چندروزه)</option><option value="day">روزانه</option></select>
    <label class="f">تایم‌فریم پیش‌فرض</label><select data-k="timeframe"><option>1h</option><option>4h</option><option>1d</option></select>
  </div>
  <div class="card"><h3>${ic('search', 'ic-o')} واچ‌لیست</h3>
    <p class="small muted">کریپتو با پسوند USDT (مثل BTCUSDT)، طلا = PAXGUSDT، فارکس شش‌حرفی (مثل EURUSD).</p>
    <textarea class="ltr" rows="3" data-k="watchlist">${esc(S.watchlist)}</textarea>
  </div>
  <div class="grid2"><button class="btn ghost" id="exp">خروجی تنظیمات</button><button class="btn ghost" id="imp">ورود تنظیمات</button></div>
  <div class="card dash disclaimer" style="margin-top:16px">${ic('warn')}<div>این ابزار کمک تحلیلی است، نه توصیه مالی یا سیگنال تضمینی. کلید API فقط در حافظه همین مرورگر ذخیره می‌شود؛ روی گوشی مشترک استفاده نکن.</div></div>`;
  el.querySelectorAll('select[data-k]').forEach(s => s.value = S[s.dataset.k]);
  el.querySelectorAll('[data-k]').forEach(inp => inp.onchange = () => {
    const k = inp.dataset.k; S[k] = inp.type === 'checkbox' ? inp.checked : inp.type === 'number' ? Number(inp.value) : k === 'apiKey' ? cleanKey(inp.value) : inp.value.trim();
    saveSettings(); renderStatus(); toast('ذخیره شد'); if (k === 'watchlist') cache.clear();
  });
  $('#testKey').onclick = async () => { toast('در حال تست…'); try { const t = await claude({ system: 'Reply in Persian, one short sentence.', prompt: 'سلام! فقط بگو آماده‌ای.', maxTokens: 2000 }); toast('✓ ' + t, 4000); } catch (e) { toast('✕ ' + e.message, 5000); } };
  $('#exp').onclick = async () => { const { apiKey, ...rest } = S; const t = JSON.stringify(rest, null, 1); try { await navigator.clipboard.writeText(t); toast('تنظیمات (بدون کلید API) کپی شد'); } catch { prompt('کپی کن:', t); } };
  $('#imp').onclick = () => { const t = prompt('JSON تنظیمات را اینجا بچسبان:'); if (!t) return; try { const j = JSON.parse(t); delete j.apiKey; S = Object.assign({}, S, j); saveSettings(); renderSettings(); renderStatus(); toast('وارد شد'); } catch { toast('JSON نامعتبر'); } };
}

/* ───────────────────────── nav / boot ───────────────────────── */
const RENDER = { home: renderHome, agents: renderAgents, backtest: renderBacktest, journal: renderJournal, settings: renderSettings };
let current = 'home';
function go(p) {
  if (p !== current || p === 'journal') { RENDER[p](); }
  current = p;
  document.querySelectorAll('.page').forEach(x => x.classList.toggle('on', x.id === 'p-' + p));
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.p === p));
  window.scrollTo({ top: 0 });
}
document.querySelectorAll('[data-i]').forEach(s => s.outerHTML = ic(s.dataset.i));
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => go(b.dataset.p));
drawWaves(); renderStatus(); renderHome();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
