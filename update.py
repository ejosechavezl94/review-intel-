import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find style start and script start
style_start = -1
script_start = -1

for i, line in enumerate(lines):
    if "<style>" in line:
        style_start = i
    if "<script>" in line:
        script_start = i
        break

if style_start != -1 and script_start != -1:
    new_html = """<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
:root {
  --bg: #09090b; --bg2: rgba(17, 17, 19, 0.6); --bg3: rgba(24, 24, 27, 0.6);
  --border: rgba(255,255,255,0.08); --border2: rgba(255,255,255,0.12);
  --text: #fafafa; --text2: #a1a1aa; --text3: #52525b;
  --accent: #f97316; --accent2: #ea580c;
  --green: #10b981; --green-d: rgba(16,185,129,0.1); --green-b: rgba(16,185,129,0.2);
  --red: #ef4444; --red-d: rgba(239,68,68,0.1); --red-b: rgba(239,68,68,0.2);
  --amber: #f59e0b; --amber-d: rgba(245,158,11,0.1); --amber-b: rgba(245,158,11,0.2);
  --blue: #3b82f6; --blue-d: rgba(59,130,246,0.1); --blue-b: rgba(59,130,246,0.2);
  --purple: #8b5cf6; --purple-d: rgba(139,92,246,0.1); --purple-b: rgba(139,92,246,0.2);
  --r: 16px; --rs: 10px; --font-mono: 'Geist Mono', monospace;
  --font-display: 'Outfit', sans-serif;
}

body { background: #07070f; color: var(--text); font-family: 'Geist', system-ui, sans-serif; font-size: 14px; line-height: 1.7; min-height: 100vh; position: relative; margin: 0; }

.aurora-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.aurora-layer { position: absolute; inset: -20%; background: radial-gradient(ellipse 75% 55% at 18% 28%, rgba(249,115,22,0.13) 0%, transparent 60%), radial-gradient(ellipse 55% 75% at 82% 72%, rgba(99,60,180,0.16) 0%, transparent 60%), radial-gradient(ellipse 45% 45% at 52% 48%, rgba(16,185,129,0.07) 0%, transparent 55%); animation: auroraShift 14s ease-in-out infinite alternate; filter: blur(50px); }
@keyframes auroraShift { 0%{transform:scale(1) translate(0%,0%)} 33%{transform:scale(1.06) translate(2%,-2%)} 66%{transform:scale(1.03) translate(-1%,3%)} 100%{transform:scale(1) translate(-2%,1%)} }
.aurora-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px); background-size: 64px 64px; }

/* Dashboard Layout */
.dashboard-layout { display: flex; height: 100vh; overflow: hidden; position: relative; z-index: 1; }
.sidebar { width: 260px; background: rgba(9, 9, 11, 0.4); backdrop-filter: blur(24px); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px; flex-shrink: 0; box-shadow: 4px 0 24px rgba(0,0,0,0.2); }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-nav { height: 72px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; background: rgba(9, 9, 11, 0.3); backdrop-filter: blur(12px); flex-shrink: 0; }
.dashboard-content { flex: 1; overflow-y: auto; padding: 32px 40px; }

/* Sidebar Elements */
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; }
.logo { width: 42px; height: 42px; background: var(--accent); border-radius: 11px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; color: #fff; font-size: 18px; box-shadow: 0 0 24px rgba(249,115,22,0.35); }
.brand-text h1 { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: -0.2px; line-height: 1.1; }
.brand-text p { font-size: 11px; color: var(--text2); margin-top: 2px; }

.nav-menu { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--rs); color: var(--text2); text-decoration: none; font-size: 14px; font-weight: 500; transition: all .2s; cursor: pointer; }
.nav-item:hover { background: rgba(255,255,255,0.03); color: var(--text); }
.nav-item.active { background: rgba(249,115,22,.1); color: var(--accent); border: 1px solid rgba(249,115,22,.2); box-shadow: inset 0 0 12px rgba(249,115,22,0.05); }

.user-profile { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--bg3); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 14px; color: var(--text2); }
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text); }
.user-email { font-size: 11px; color: var(--text3); }

/* Top Nav Elements */
.search-bar { background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; padding: 8px 16px; width: 300px; display: flex; align-items: center; font-size: 13px; color: var(--text2); }
.top-actions { display: flex; align-items: center; gap: 16px; }
.status { font-family: var(--font-mono); font-size: 11px; color: var(--green); display: flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--green-d); border-radius: 20px; border: 1px solid var(--green-b); }
.status-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: blink 2s ease infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* CARD */
.card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 32px; margin-bottom: 24px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
.card-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; margin-bottom: 8px; }
.card-sub { font-size: 14px; color: var(--text2); margin-bottom: 28px; line-height: 1.6; max-width: 600px; }
.flabel { display: block; font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--text2); margin-bottom: 8px; }

input[type=text], select { width: 100%; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); color: var(--text); font-family: 'Geist', sans-serif; font-size: 14px; padding: 12px 16px; outline: none; transition: all .2s ease; }
input[type=text]:focus, select:focus { border-color: var(--accent); box-shadow: 0 0 12px rgba(249,115,22,.3), inset 0 0 0 1px var(--accent); background: rgba(24, 24, 27, 0.8); }
input::placeholder { color: var(--text3); }
select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2352525b' d='M5 6L0 0h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
select option { background: var(--bg3); }

/* Layout Grids */
.input-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

.asin-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.asin-row { display: flex; gap: 8px; align-items: center; }
.asin-info { background: var(--bg3); border: 1px solid var(--green-b); border-radius: var(--rs); padding: 12px 16px; margin-top: 8px; display: none; }
.asin-info.on { display: block; animation: fadeIn 0.3s; }
.asin-info-title { font-size: 13px; font-weight: 500; color: var(--text); margin-bottom: 8px; line-height: 1.4; }
.asin-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill { font-size: 11px; padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border2); color: var(--text2); background: var(--bg); font-weight: 500; }
.pill.g { background: var(--green-d); color: var(--green); border-color: var(--green-b); }
.pill.o { background: var(--amber-d); color: var(--amber); border-color: var(--amber-b); }
.pill.r { background: var(--red-d); color: var(--red); border-color: var(--red-b); }
.pill.b { background: var(--blue-d); color: var(--blue); border-color: var(--blue-b); }

.btn { padding: 12px 20px; border-radius: var(--rs); font-family: 'Geist', sans-serif; font-weight: 500; font-size: 13px; cursor: pointer; transition: all .2s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid var(--border2); background: var(--bg3); color: var(--text2); white-space: nowrap; }
.btn:hover { color: var(--text); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
.btn-accent { position: relative; background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; color: #fff; font-size: 15px; font-weight: 600; padding: 14px 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(249,115,22,0.4); display: inline-flex; align-items: center; justify-content: center; }
.btn-accent::after { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-20deg); transition: 0.5s; }
.btn-accent:hover { background: linear-gradient(135deg, var(--accent2), #c2410c); transform: translateY(-2px); box-shadow: 0 6px 24px rgba(249,115,22,0.5); }
.btn-accent:hover::after { left: 150%; }
.btn-accent:disabled { opacity: .4; cursor: not-allowed; }
.btn-load { background: var(--blue-d); border-color: var(--blue-b); color: #60a5fa; font-size: 13px; padding: 12px 18px; }
.btn-load:hover { background: rgba(59,130,246,0.15); }
.btn-load:disabled { opacity: .4; cursor: not-allowed; }
.btn-add { border-style: dashed; width: 100%; justify-content: center; display: flex; align-items: center; gap: 8px; font-size: 13px; background: transparent; }
.btn-add:hover { border-color: var(--accent); color: var(--accent); background: rgba(249,115,22,0.05); }

.loader { display: none; text-align: center; padding: 60px 24px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 24px; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
.loader.on { display: block; animation: fadeIn 0.4s; }
.spinner { width: 44px; height: 44px; border: 3px solid rgba(255,255,255,.08); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; margin: 0 auto 24px; box-shadow: 0 0 20px rgba(249,115,22,0.2); }
@keyframes spin { to { transform: rotate(360deg); } }
.loader-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; margin-bottom: 8px; }
.loader-sub { font-size: 14px; color: var(--text2); margin-bottom: 24px; }
.prog-list { display: inline-flex; flex-direction: column; gap: 8px; text-align: left; background: var(--bg3); padding: 16px 24px; border-radius: var(--rs); border: 1px solid var(--border); }
.prog-item { font-family: var(--font-mono); font-size: 12px; color: var(--text3); transition: color .2s; display: flex; align-items: center; gap: 8px; }
.prog-item::before { content: '>'; color: var(--text3); }
.prog-item.on { color: var(--accent); }
.prog-item.on::before { color: var(--accent); }
.prog-item.ok { color: var(--green); }
.prog-item.ok::before { content: '✓'; color: var(--green); }

.err { display: none; background: var(--red-d); border: 1px solid var(--red-b); border-radius: var(--rs); padding: 14px 18px; color: var(--red); font-size: 14px; margin-top: 16px; line-height: 1.6; }
.err.on { display: block; animation: fadeIn 0.3s; }

#results { display: none; margin-top: 16px; animation: fadeIn 0.5s; }
.res-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.res-title { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
.res-meta { font-family: var(--font-mono); font-size: 12px; color: var(--text2); margin-top: 6px; }
.summary-box { background: rgba(249,115,22,.08); border: 1px solid rgba(249,115,22,.2); border-left: 4px solid var(--accent); border-radius: 0 var(--r) var(--r) 0; padding: 28px; margin-bottom: 32px; font-size: 15px; line-height: 1.8; box-shadow: 0 4px 24px rgba(249,115,22,0.05); backdrop-filter: blur(10px); }

.scores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
.score-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 24px; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform 0.2s, border-color 0.2s; display: flex; flex-direction: column; }
.score-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); }
.score-asin { font-family: var(--font-mono); font-size: 12px; color: var(--text2); margin-bottom: 8px; display: inline-block; background: var(--bg3); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border); }
.score-title-text { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 16px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.score-lbl { font-size: 12px; color: var(--text2); width: 60px; flex-shrink: 0; }
.score-bar { flex: 1; height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; border: 1px solid var(--border); }
.score-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); }
.score-num { font-family: var(--font-mono); font-size: 12px; font-weight: 600; color: var(--text); width: 24px; text-align: right; }
.score-weakness { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border); font-size: 13px; color: var(--red); display: flex; gap: 8px; }
.score-strength { font-size: 13px; color: var(--green); margin-top: 6px; display: flex; gap: 8px; }

.tabs { display: flex; gap: 8px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--rs); padding: 6px; margin-bottom: 28px; flex-wrap: wrap; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
.tab { flex: 1; min-width: 90px; padding: 12px 16px; border: none; background: transparent; color: var(--text2); font-family: var(--font-display); font-size: 14px; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all .2s ease; text-align: center; position: relative; }
.tab:hover { color: var(--text); background: rgba(255,255,255,0.03); }
.tab.on { background: var(--accent); color: #fff; border: 1px solid var(--accent2); box-shadow: 0 4px 12px rgba(249,115,22,0.3); }
.tc { display: none; }
.tc.on { display: block; animation: fadeIn 0.4s ease; }

/* ANALYSIS PANELS */
.comp-panel { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 20px; overflow: hidden; backdrop-filter: blur(16px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: border-color 0.2s; }
.comp-panel:hover { border-color: rgba(255,255,255,0.1); }
.comp-panel-hdr { background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.comp-panel-body { padding: 24px; }
.section-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text2); margin-bottom: 10px; display: block; }
.section-text { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: 20px; }

.compliance-ok { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: var(--green-d); border: 1px solid var(--green-b); border-radius: var(--rs); font-size: 14px; color: var(--green); margin-bottom: 10px; }
.compliance-warn { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: var(--red-d); border: 1px solid var(--red-b); border-radius: var(--rs); font-size: 14px; color: var(--text); margin-bottom: 10px; }
.compliance-verify { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: var(--amber-d); border: 1px solid var(--amber-b); border-radius: var(--rs); font-size: 14px; color: var(--text); margin-bottom: 10px; }
.compliance-icon { flex-shrink: 0; font-size: 16px; margin-top: 2px; }
.verify-tag { font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; border-radius: 4px; background: var(--amber-d); color: var(--amber); border: 1px solid var(--amber-b); margin-left: 8px; text-transform: uppercase; vertical-align: middle; }

/* IMAGES TAB */
.img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
.img-thumb { aspect-ratio: 1; border-radius: var(--rs); overflow: hidden; border: 1px solid var(--border); background: var(--bg3); position: relative; }
.img-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.img-thumb:hover img { transform: scale(1.05); }
.img-checklist { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.img-check { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: var(--rs); font-size: 13px; }
.img-check.ok { background: var(--green-d); color: var(--green); border: 1px solid var(--green-b); }
.img-check.fail { background: var(--red-d); color: var(--text); border: 1px solid var(--red-b); }
.img-check.warn { background: var(--amber-d); color: var(--text); border: 1px solid var(--amber-b); }
.img-missing { background: var(--bg3); border: 1px dashed var(--border2); border-radius: var(--rs); padding: 14px 16px; margin-bottom: 8px; font-size: 13px; color: var(--text2); }
.img-missing::before { content: '+ '; color: var(--accent); font-weight: 600; }
.img-rec { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); padding: 16px 20px; margin-bottom: 10px; transition: transform 0.2s; }
.img-rec:hover { transform: translateX(4px); border-color: rgba(255,255,255,0.15); }
.img-rec-pos { font-family: var(--font-mono); font-size: 11px; color: var(--accent); margin-bottom: 6px; }
.img-rec-desc { font-size: 14px; color: var(--text); margin-bottom: 6px; line-height: 1.6; }
.img-rec-pri { font-size: 12px; font-weight: 500; }
.img-rec-pri.critica { color: var(--red); }
.img-rec-pri.importante { color: var(--amber); }
.img-rec-pri.recomendada { color: var(--green); }

/* REVIEWS */
.sentiment-bar-wrap { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); padding: 20px; margin-bottom: 24px; }
.sentiment-bar { display: flex; height: 10px; border-radius: 5px; overflow: hidden; margin: 12px 0; }
.sentiment-legend { display: flex; gap: 20px; font-size: 12px; color: var(--text2); flex-wrap: wrap; }
.sentiment-legend-item { display: flex; align-items: center; gap: 6px; }
.sentiment-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.verdict-box { background: var(--bg2); border: 1px solid var(--border2); border-radius: var(--rs); padding: 16px 20px; font-size: 14px; color: var(--text); line-height: 1.7; margin-top: 16px; border-left: 3px solid var(--blue); }
.review-section { margin-bottom: 32px; }
.review-section-hdr { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.review-icon { width: 36px; height: 36px; border-radius: var(--rs); display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; background: var(--bg3); border: 1px solid var(--border); }
.review-section-title { font-family: var(--font-display); font-size: 18px; font-weight: 600; }
.review-section-pct { font-family: var(--font-mono); font-size: 13px; color: var(--text2); margin-left: auto; background: var(--bg3); padding: 4px 10px; border-radius: 20px; }
.theme-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); padding: 16px 20px; margin-bottom: 10px; transition: transform 0.2s; }
.theme-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.15); }
.theme-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.theme-name { font-size: 15px; font-weight: 600; }
.freq-tag { font-family: var(--font-mono); font-size: 11px; padding: 3px 8px; border-radius: 4px; }
.freq-alta { background: var(--red-d); color: var(--red); border: 1px solid var(--red-b); }
.freq-media { background: var(--amber-d); color: var(--amber); border: 1px solid var(--amber-b); }
.freq-baja { background: var(--blue-d); color: var(--blue); border: 1px solid var(--blue-b); }
.theme-desc { font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 8px; }
.theme-opp { font-size: 12px; color: var(--green); font-weight: 500; }
.phrases-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.phrase-tag { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 6px; background: var(--bg2); border: 1px solid var(--border2); color: var(--text2); font-style: italic; }

/* GAPS */
.gap-card { background: var(--bg3); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 0 var(--rs) var(--rs) 0; padding: 20px; margin-bottom: 12px; transition: transform 0.2s; }
.gap-card:hover { transform: translateX(4px); background: rgba(249,115,22,0.05); }
.gap-title { font-size: 15px; font-weight: 600; margin-bottom: 6px; color: var(--text); }
.gap-evidence { font-size: 13px; color: var(--text2); margin-bottom: 8px; line-height: 1.6; }
.gap-opp { font-size: 13px; color: var(--green); font-weight: 500; }

/* MY LISTING */
.listing-section { background: var(--bg2); border: 1px solid rgba(249,115,22,.3); border-radius: var(--r); padding: 32px; margin-bottom: 20px; backdrop-filter: blur(16px); box-shadow: 0 8px 32px rgba(249,115,22,0.08); }
.listing-section-title { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--accent); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
.listing-section-title::before { content: '✨'; }
.title-box { font-family: var(--font-display); font-size: 18px; font-weight: 500; color: var(--text); padding: 20px 24px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); margin-bottom: 16px; line-height: 1.5; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2); }
.keywords { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.kw { font-family: var(--font-mono); font-size: 12px; padding: 4px 12px; border-radius: 6px; background: rgba(249,115,22,.1); color: var(--accent); border: 1px solid rgba(249,115,22,.2); }
.reasoning { font-size: 13px; color: var(--text2); font-style: italic; border-left: 2px solid var(--border2); padding-left: 12px; margin-top: 12px; }
.bullet-card { display: flex; gap: 16px; padding: 20px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); margin-bottom: 12px; transition: transform 0.2s; }
.bullet-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.15); }
.bullet-n { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--accent); opacity: .3; flex-shrink: 0; line-height: 1; margin-top: 2px; }
.bullet-text { font-size: 14px; color: var(--text); line-height: 1.7; margin-bottom: 8px; }
.bullet-reason { font-size: 12px; color: var(--green); font-weight: 500; display: inline-block; background: var(--green-d); padding: 4px 10px; border-radius: 12px; }

/* ACTIONS */
.action-card { display: flex; gap: 16px; background: var(--bg3); border: 1px solid var(--border); border-left: 4px solid var(--green); border-radius: 0 var(--rs) var(--rs) 0; padding: 20px 24px; margin-bottom: 12px; transition: transform 0.2s; }
.action-card:hover { transform: translateX(4px); background: rgba(16,185,129,0.05); }
.action-n { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text2); opacity: .2; line-height: 1; flex-shrink: 0; }
.action-pri { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; display: inline-block; padding: 2px 8px; border-radius: 4px; background: var(--bg); border: 1px solid var(--border); }
.action-pri.Alta { color: var(--red); border-color: var(--red-b); }
.action-pri.Media { color: var(--amber); border-color: var(--amber-b); }
.action-txt { font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 8px; font-weight: 500; }
.action-imp { font-size: 13px; color: var(--green); }

@media (max-width: 900px) {
  .dashboard-layout { flex-direction: column; overflow: auto; height: auto; }
  .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 20px; flex-direction: row; align-items: center; justify-content: space-between; }
  .nav-menu { display: none; }
  .brand { margin-bottom: 0; }
  .user-profile { margin-top: 0; padding-top: 0; border-top: none; }
  .dashboard-content { padding: 20px; }
  .input-grid { grid-template-columns: 1fr; }
}
</style>
</head>
<body>

<div class="aurora-bg">
  <div class="aurora-layer"></div>
  <div class="aurora-grid"></div>
</div>

<div class="dashboard-layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">LI</div>
      <div class="brand-text">
        <h1>Listing Intel</h1>
        <p>Pro Max Dashboard</p>
      </div>
    </div>
    
    <nav class="nav-menu">
      <a class="nav-item active">
        <span style="font-size:18px">📊</span> Dashboard Principal
      </a>
      <a class="nav-item">
        <span style="font-size:18px">🔍</span> Market Analysis
      </a>
      <a class="nav-item">
        <span style="font-size:18px">📈</span> Keyword Tracker
      </a>
      <a class="nav-item">
        <span style="font-size:18px">📑</span> Reportes Guardados
      </a>
      <a class="nav-item">
        <span style="font-size:18px">⚙️</span> Configuración
      </a>
    </nav>
    
    <div class="user-profile">
      <div class="avatar">EC</div>
      <div class="user-info">
        <span class="user-name">Eduardo Chavez</span>
        <span class="user-email">eduardo@nextlevel.com</span>
      </div>
    </div>
  </aside>

  <!-- Main Content -->
  <main class="main-content">
    <header class="top-nav">
      <div class="search-bar">
        🔍 Buscar ASINs o reportes anteriores...
      </div>
      <div class="top-actions">
        <div class="status"><div class="status-dot"></div>API Conectada</div>
        <div class="avatar" style="cursor:pointer;background:var(--bg2)">🔔</div>
      </div>
    </header>

    <div class="dashboard-content">
      
      <div class="input-grid">
        <!-- Panel Izquierdo: Competidores -->
        <div class="card" id="input-card" style="margin-bottom:0">
          <div class="card-title">Análisis de Competencia en Tiempo Real</div>
          <div class="card-sub">Introduce los ASINs de tus competidores directos para extraer y comparar métricas usando IA avanzada.</div>

          <div style="margin-bottom:24px">
            <label class="flabel">Marketplace Objetivo</label>
            <select id="mk" style="max-width:240px">
              <option value="es">🇪🇸 Amazon España</option>
              <option value="de">🇩🇪 Amazon Alemania</option>
              <option value="uk">🇬🇧 Amazon UK</option>
              <option value="it">🇮🇹 Amazon Italia</option>
              <option value="fr">🇫🇷 Amazon Francia</option>
              <option value="us">🇺🇸 Amazon USA</option>
            </select>
          </div>

          <div class="asin-list" id="asin-list">
            <div id="asin-block-0">
              <label class="flabel">Competidor 1 — ASIN o Enlace</label>
              <div class="asin-row">
                <input type="text" id="asin-0" placeholder="ej: B08XY1234Z o https://amazon.es/dp/B08XY1234Z" style="flex:1">
                <button class="btn btn-load" id="load-0" onclick="loadAsin(0)" style="width:110px">Extraer ⚡️</button>
              </div>
              <div class="asin-info" id="info-0"></div>
            </div>
          </div>

          <button class="btn btn-add" id="add-btn" onclick="addRow()">+ Añadir competidor adicional (Máx 3)</button>
        </div>

        <!-- Panel Derecho: Tu Producto y Acciones -->
        <div style="display:flex; flex-direction:column; gap:24px">
          <div class="card" style="flex:1; margin-bottom:0">
            <div class="card-title">Contexto de tu Producto</div>
            <div class="card-sub">Ayuda a la IA a comparar tus fortalezas (Opcional).</div>
            
            <label class="flabel">Descripción, Materiales o Precio</label>
            <textarea id="my-product" placeholder="ej: Alcachofa de ducha premium con filtro ABS y 3 modos de chorro. Queremos vender a 24.99€..." style="width:100%; height:120px; background:var(--bg3); border:1px solid var(--border); border-radius:var(--rs); color:var(--text); font-family:'Geist', sans-serif; font-size:14px; padding:12px 16px; outline:none; resize:vertical; transition:all .2s; margin-bottom:16px;"></textarea>
            
            <div class="err" id="main-err"></div>
            <button class="btn btn-accent" id="analyze-btn" onclick="runAnalysis()" style="width:100%; margin-top:auto">Generar Informe Pro Max 🚀</button>
          </div>
        </div>
      </div>

      <div class="loader" id="loader" style="margin-top:24px">
        <div class="spinner"></div>
        <div class="loader-title" id="loader-title">Procesando Inteligencia Competitiva...</div>
        <div class="loader-sub">Nuestros modelos están cruzando los datos y evaluando puntos ciegos.</div>
        <div class="prog-list" id="prog-list" style="margin:0 auto; max-width:400px; width:100%"></div>
      </div>

      <div id="results">
        <div class="res-header">
          <div>
            <div class="res-title">Intelligence Report</div>
            <div class="res-meta" id="res-meta"></div>
          </div>
          <button class="btn btn-load" onclick="location.reload()">Nueva Consulta</button>
        </div>

        <div id="summary" class="summary-box"></div>
        <div class="scores-grid" id="scores"></div>

        <div class="tabs">
          <button class="tab on" onclick="st('tc-listings',this)">📋 Matriz Listings</button>
          <button class="tab" onclick="st('tc-photos',this)">📸 Análisis Visual</button>
          <button class="tab" onclick="st('tc-reviews',this)">💬 Sentiment Analysis</button>
          <button class="tab" onclick="st('tc-gaps',this)">🎯 Market Gaps</button>
          <button class="tab" onclick="st('tc-milisting',this)">✨ Draft IA</button>
          <button class="tab" onclick="st('tc-acciones',this)">⚡ Plan Acción</button>
        </div>

        <div class="tc on" id="tc-listings"></div>
        <div class="tc" id="tc-photos"></div>
        <div class="tc" id="tc-reviews"></div>
        <div class="tc" id="tc-gaps"></div>
        <div class="tc" id="tc-milisting"></div>
        <div class="tc" id="tc-acciones"></div>
      </div>

    </div>
  </main>
</div>
"""
    
    # Reassemble the file
    final_lines = lines[:style_start] + [new_html] + lines[script_start:]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.writelines(final_lines)
    print("Dashboard Update applied successfully.")
else:
    print("Could not find style or script tags.")
