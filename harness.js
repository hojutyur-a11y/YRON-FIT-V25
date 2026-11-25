// Frame-by-frame header sampler. Usage: node harness.js <html> <label>
const { chromium } = require('playwright');
const path = require('path');
const file = path.resolve(process.argv[2]);
const label = process.argv[3] || 'run';

const SAMPLER = () => {
  window.__frames = [];
  window.__rec = false;
  const vis = el => {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = el.getBoundingClientRect(); return r.height > 20 && r.bottom > 0 && r.top < innerHeight;
  };
  const tick = () => {
    if (window.__rec) {
      const hs = [...document.querySelectorAll('header.vx')].filter(vis);
      window.__frames.push({
        t: Math.round(performance.now()),
        n: hs.length,
        ready: hs.every(h => [...h.querySelectorAll('img')].every(i => i.complete && i.naturalWidth > 0)),
        tops: hs.map(h => Math.round(h.getBoundingClientRect().top)),
        where: hs.map(h => h.id === 'vxTop' ? 'global' : 'inMain'),
        home: document.body.classList.contains('is-home'),
        page: (document.getElementById('appMain').firstElementChild || {}).className || '(empty)',
        mainLen: document.getElementById('appMain').children.length
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const THR = +(process.env.THROTTLE||1); if (THR>1) await cdp.send('Emulation.setCPUThrottlingRate',{rate:THR});
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_FAILED|net::/.test(m.text())) errors.push('CONSOLE: ' + m.text()); });
  await page.addInitScript(()=>{try{if(!localStorage.getItem('vyronSmart'))localStorage.setItem('vyronSmart',JSON.stringify({ob:'done'}))}catch(e){}});
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto('file://' + file);
  await page.evaluate(SAMPLER);
  await page.waitForTimeout(5500); // splash + first render

  if (process.env.SEED) {
    await page.evaluate(async (N) => {
      const db = await new Promise((res, rej) => { const r = indexedDB.open('vyron-fit-db', 1); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
      await new Promise((res, rej) => {
        const tx = db.transaction(['workouts','measurements'], 'readwrite'); const ws = tx.objectStore('workouts'), ms = tx.objectStore('measurements');
        for (let i = 0; i < N; i++) {
          const d = new Date(Date.now() - i * 86400000 * 0.6).toISOString().slice(0, 10);
          ws.put({ id: 'seed' + i, date: d, name: 'حصة ' + i, duration: 45 + (i % 20), calories: 300 + (i % 150),
            exercises: Array.from({ length: 8 }, (_, k) => ({ name: 'تمرين ' + k, muscle: 'الصدر', sets: Array.from({ length: 4 }, (_, j) => ({ reps: 10, weight: 20 + j * 5 })) })) });
          if (i % 5 === 0) ms.put({ id: 'm' + i, date: d, weight: 80 - (i % 10) * .2, waist: 85 });
        }
        tx.oncomplete = res; tx.onerror = () => rej(tx.error);
      });
      db.close();
    }, +process.env.SEED);
    await page.reload();
    await page.evaluate(SAMPLER);
    await page.waitForTimeout(6500);
  }

  async function clickSel(desc, finder, arg) {
    const pt = await page.evaluate(finder, arg);
    if (!pt) return { desc, skipped: true };
    const before = await page.evaluate(() => document.getElementById('appMain').innerHTML.length + '|' + document.body.className);
    await page.evaluate(() => { window.__frames = []; window.__rec = true; });
    await page.mouse.click(pt.x, pt.y);
    await page.waitForTimeout(1400);
    const frames = await page.evaluate(() => { window.__rec = false; return window.__frames; });
    const after = await page.evaluate(() => document.getElementById('appMain').innerHTML.length + '|' + document.body.className);
    const bad = frames.filter(f => f.n !== 1 || !f.ready);
    return { navigated: before !== after, desc, frames: frames.length, badFrames: bad.length, sample: bad.slice(0, 3), final: frames[frames.length - 1] };
  }
  const hdrBtn = (cls) => {
    const b = [...document.querySelectorAll('header.vx .' + cls)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && getComputedStyle(e.closest('header.vx')).display !== 'none'; });
    if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  };
  const navBtn = (p) => {
    const b = document.querySelector('.bottom-nav button[data-page="' + p + '"]'); if (!b) return null;
    const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  };
  const goHome = () => clickSel('(reset→home)', navBtn, 'home');

  const scenarios = [
    ['home→settings', 'vx-g'], ['home→bell', 'vx-n'], ['home→profile', 'vx-av'],
    ['home→workout', null, 'workout'], ['home→records', null, 'records'], ['home→progress', null, 'progress'], ['home→account', null, 'profile'],
  ];
  const results = [];
  for (const [d, cls, nav] of scenarios) {
    await goHome(); await page.waitForTimeout(600);
    results.push(await clickSel(d, cls ? hdrBtn : navBtn, cls || nav));
  }
  // from a non-home page to others
  await clickSel('(go workout)', navBtn, 'workout'); await page.waitForTimeout(800);
  for (const [d, cls, nav] of [['workout→settings','vx-g'],['workout→bell','vx-n'],['workout→profile','vx-av'],['workout→progress',null,'progress'],['progress→records',null,'records'],['records→account',null,'profile'],['account→workout',null,'workout'],['workout→home',null,'home']]) {
    results.push(await clickSel(d, cls ? hdrBtn : navBtn, cls || nav)); await page.waitForTimeout(500);
  }
  console.log('=== ' + label + ' ===');
  for (const r of results) console.log((r.skipped ? 'SKIP ' : (r.badFrames ? 'FLASH' : 'ok   ')) + (r.skipped||r.navigated?'':' [NO-NAV!]') + ' ' + r.desc + (r.skipped ? '' : `  frames=${r.frames} badFrames=${r.badFrames}` + (r.badFrames ? ' e.g. ' + JSON.stringify(r.sample[0]) : '')));
  console.log('errors:', errors.length ? errors : 'none');
  await browser.close();
})();
