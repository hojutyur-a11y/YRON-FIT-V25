const { chromium } = require('playwright'); const path = require('path');
const file = path.resolve(process.argv[2]); const label = process.argv[3] || 'suite';
const THR = +(process.env.THROTTLE || 1), SEED = +(process.env.SEED || 0);
const SAMPLER = () => {
  window.__frames = []; window.__rec = false; window.__commits = 0;
  const vis = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false; const r = el.getBoundingClientRect(); return r.height > 20 && r.bottom > 0 && r.top < innerHeight; };
  const tick = () => { if (window.__rec) { const hs = [...document.querySelectorAll('header.vx')].filter(vis);
      window.__frames.push({ n: hs.length, ready: hs.every(h => [...h.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0)) }); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  new MutationObserver(() => window.__commits++).observe(document.getElementById('appMain'), { childList: true });
};
const state = () => document.fn || 0;
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page); if (THR > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: THR });
  const errors = []; page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });
  await page.addInitScript(() => { try { if (!localStorage.getItem('vyronSmart')) localStorage.setItem('vyronSmart', JSON.stringify({ ob: 'done' })); } catch (e) {} });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + file); await page.evaluate(SAMPLER); await page.waitForTimeout(5500);
  if (SEED) {
    await page.evaluate(async N => { const db = await new Promise((res, rej) => { const r = indexedDB.open('vyron-fit-db', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
      await new Promise((res, rej) => { const tx = db.transaction(['workouts'], 'readwrite'); const ws = tx.objectStore('workouts');
        for (let i = 0; i < N; i++) ws.put({ id: 'seed' + i, date: new Date(Date.now() - i * 51840000).toISOString().slice(0, 10), name: 'حصة ' + i, duration: 50, calories: 350, exercises: Array.from({ length: 8 }, (_, k) => ({ name: 'تمرين ' + k, sets: [{ reps: 10, weight: 20 }] })) });
        tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); db.close(); }, SEED);
    await page.reload(); await page.evaluate(SAMPLER); await page.waitForTimeout(6500);
  }
  // snapshot user data
  const dataSnap = () => page.evaluate(async () => { const db = await new Promise(r => { const q = indexedDB.open('vyron-fit-db', 1); q.onsuccess = () => r(q.result); });
    const counts = {}; for (const s of db.objectStoreNames) counts[s] = await new Promise(r => { const q = db.transaction(s).objectStore(s).count(); q.onsuccess = () => r(q.result); }); db.close();
    const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k).length; } return { counts, ls }; });
  const dataBefore = await dataSnap();

  const pt = (sel) => page.evaluate(s => { const els = [...document.querySelectorAll(s)].filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && e.closest('header.vx,nav,#appMain') && !(e.closest('header.vx') && getComputedStyle(e.closest('header.vx')).display === 'none'); }); const e = els[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
  const SEL = { settings: 'header.vx .vx-g', bell: 'header.vx .vx-n', profileH: 'header.vx .vx-av', workout: '.bottom-nav button[data-page=workout]', progress: '.bottom-nav button[data-page=progress]', records: '.bottom-nav button[data-page=records]', account: '.bottom-nav button[data-page=profile]', home: '.bottom-nav button[data-page=home]' };
  const tap = async k => { const p = await pt(SEL[k] || k); if (!p) throw new Error('no target ' + k); await page.mouse.click(p.x, p.y); };
  const where = () => page.evaluate(() => ({ nav: (document.querySelector('.bottom-nav button.active') || {}).dataset?.page || '-', hc: [...document.querySelectorAll('header.vx .hc-on')].map(b => b.classList.contains('vx-g') ? 'settings' : b.classList.contains('vx-n') ? 'bell' : 'profile').join(',') || '-', isHome: document.body.classList.contains('is-home'), isSettings: document.body.classList.contains('is-settings'), headers: [...document.querySelectorAll('header.vx')].filter(h => getComputedStyle(h).display !== 'none').length, h1: ((document.querySelector('#appMain h1,#appMain h2,#appMain .page-title') || {}).textContent || '').trim().slice(0, 28) }));
  const rec = async (fn, settle = 1300) => { await page.evaluate(() => { window.__frames = []; window.__commits = 0; window.__rec = true; }); await fn(); await page.waitForTimeout(settle);
    const r = await page.evaluate(() => { window.__rec = false; return { frames: window.__frames, commits: window.__commits }; }); return { bad: r.frames.filter(f => f.n !== 1 || !f.ready).length, frames: r.frames.length, commits: r.commits }; };
  const results = []; const check = (name, ok, extra = '') => { results.push({ name, ok }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  — ' + extra : '')); };

  // T1: repeated taps on each header button (6 taps, 40ms apart), from home
  for (const [k, expHc, expNav] of [['settings', 'settings', null], ['bell', 'bell', null], ['profileH', 'profile', 'profile']]) {
    await tap('home'); await page.waitForTimeout(700);
    const r = await rec(async () => { for (let i = 0; i < 6; i++) { await tap(k); await page.waitForTimeout(40); } });
    const w = await where(); check(`T1 repeated taps header:${k}`, r.bad === 0 && w.hc === expHc && w.headers === 1 && r.commits <= 2, `badFrames=${r.bad}/${r.frames} commits=${r.commits} hc=${w.hc} headers=${w.headers}`);
  }
  // T2: repeated taps on each bottom button
  for (const [k, nav] of [['workout', 'workout'], ['progress', 'progress'], ['records', 'records'], ['account', 'profile'], ['home', 'home']]) {
    const r = await rec(async () => { for (let i = 0; i < 6; i++) { await tap(k); await page.waitForTimeout(40); } });
    const w = await where(); check(`T2 repeated taps nav:${k}`, r.bad === 0 && w.nav === nav && w.headers === 1 && r.commits <= 2, `badFrames=${r.bad}/${r.frames} commits=${r.commits} nav=${w.nav} headers=${w.headers}`);
  }
  // T3: sequence workout → records → progress → account
  { let allOk = true, info = []; for (const [k, nav] of [['workout', 'workout'], ['records', 'records'], ['progress', 'progress'], ['account', 'profile']]) { const r = await rec(() => tap(k), 900); const w = await where(); const ok = r.bad === 0 && w.nav === nav && w.headers === 1; allOk = allOk && ok; info.push(`${k}:${ok ? 'ok' : 'BAD(' + r.bad + ',' + w.nav + ')'}`); } check('T3 sequence workout→records→progress→account', allOk, info.join(' ')); }
  // T4/T5: sub-page → sub-page, then back
  { await tap('account'); await page.waitForTimeout(900);
    const sub = await page.evaluate(() => { const b = document.querySelector('#appMain [data-page^="profile-"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { page: b.dataset.page, x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    if (!sub) check('T4 sub-page navigation', false, 'no profile sub-page link found');
    else { const r = await rec(async () => { await page.evaluate(() => window.scrollTo(0, 0)); const s2 = await page.evaluate(() => { const b = document.querySelector('#appMain [data-page^="profile-"]'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); await page.mouse.click(s2.x, s2.y); }, 1000);
      const inSub = await page.evaluate(() => !!document.querySelector('.pf-sub,.pf-back')); check('T4 profile → sub-page', r.bad === 0 && inSub, `badFrames=${r.bad}/${r.frames} subpageShown=${inSub}`);
      const back = await rec(async () => { const p = await page.evaluate(() => { const b = document.querySelector('.pf-back'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); await page.mouse.click(p.x, p.y); }, 1000);
      const w = await where(); const backOk = await page.evaluate(() => !document.querySelector('.pf-sub')); check('T5 back from sub-page', back.bad === 0 && backOk && w.nav === 'profile', `badFrames=${back.bad}/${back.frames} nav=${w.nav}`);
      // sub → header → sub
      const sub2 = await page.evaluate(() => { const b = document.querySelector('#appMain [data-page^="profile-"]'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); await page.mouse.click(sub2.x, sub2.y); await page.waitForTimeout(700); await page.evaluate(() => window.scrollTo(0, 0));
      const r3 = await rec(() => tap('settings'), 1000); const w3 = await where(); check('T4b sub-page → settings (header)', r3.bad === 0 && w3.hc === 'settings' && w3.isSettings, `badFrames=${r3.bad}/${r3.frames} hc=${w3.hc}`); }
  }
  // T6: rapid taps across different buttons (last tap must win, no stale content)
  { await tap('home'); await page.waitForTimeout(900);
    const r = await rec(async () => { for (const k of ['settings', 'bell', 'profileH', 'workout', 'records', 'progress']) { await tap(k).catch(() => {}); await page.waitForTimeout(35); } }, 1600);
    const w = await where(); check('T6 rapid taps on different buttons → last wins', r.bad === 0 && w.nav === 'progress' && w.headers === 1 && w.hc === '-', `badFrames=${r.bad}/${r.frames} nav=${w.nav} hc=${w.hc} headers=${w.headers}`); }
  // T6b: stress from home with rapid cross taps where header is the embedded one
  { await tap('home'); await page.waitForTimeout(900);
    const r = await rec(async () => { for (const k of ['bell', 'settings', 'progress', 'home', 'bell']) { await tap(k).catch(() => {}); await page.waitForTimeout(25); } }, 1600);
    const w = await where(); check('T6b rapid cross taps ending on bell', r.bad === 0 && w.hc === 'bell' && w.headers === 1, `badFrames=${r.bad}/${r.frames} hc=${w.hc}`); }
  // T7: reload / reopen
  { const dataMid = await dataSnap(); await page.reload(); await page.evaluate(SAMPLER); await page.waitForTimeout(THR > 1 || SEED ? 7000 : 5500);
    const w = await where(); const dataAfter = await dataSnap();
    check('T7 reload → home with a single header', w.isHome && w.headers === 1 && w.nav === 'home', JSON.stringify(w));
    check('T10 user data preserved across navigation + reload', JSON.stringify(dataBefore.counts) === JSON.stringify(dataAfter.counts) && Object.keys(dataBefore.ls).every(k => k in dataAfter.ls), `IDB ${JSON.stringify(dataAfter.counts)}`); }
  // T8: after reload, one more pass through every header + nav target
  { let bad = 0, n = 0; for (const k of ['settings', 'home', 'bell', 'home', 'profileH', 'workout', 'home', 'records', 'progress', 'account']) { const r = await rec(() => tap(k), 800); bad += r.bad; n += r.frames; } check('T8 header present & complete during every transition', bad === 0, `badFrames=${bad}/${n}`); }
  check('T9 no console / runtime errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  const fails = results.filter(r => !r.ok).length; console.log(`\n${label}: ${results.length - fails}/${results.length} passed`);
  await browser.close(); process.exit(fails ? 1 : 0);
})();
