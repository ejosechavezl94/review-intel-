import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace everything between <style> and </style>
import re

new_style = """<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
:root {
  --bg: #f8fafc;
  --bg2: #ffffff;
  --bg3: #f1f5f9;
  --border: #e2e8f0;
  --border2: #cbd5e1;
  --text: #0f172a;
  --text2: #475569;
  --text3: #94a3b8;
  --accent: #4f46e5;
  --accent2: #7c3aed;
  --green: #059669; --green-d: #d1fae5; --green-b: #a7f3d0;
  --red: #dc2626; --red-d: #fee2e2; --red-b: #fecaca;
  --amber: #d97706; --amber-d: #fef3c7; --amber-b: #fde68a;
  --blue: #2563eb; --blue-d: #dbeafe; --blue-b: #bfdbfe;
  --purple: #7c3aed; --purple-d: #ede9fe; --purple-b: #ddd6fe;
  --r: 16px; --rs: 10px; --font-mono: 'Geist Mono', monospace;
  --font-display: 'Outfit', sans-serif;
}

body { background: var(--bg); color: var(--text); font-family: 'Geist', system-ui, sans-serif; font-size: 14px; line-height: 1.7; min-height: 100vh; margin: 0; }

.aurora-bg { display: none; } /* Disabled for light mode */

/* Dashboard Layout */
.dashboard-layout { display: flex; height: 100vh; overflow: hidden; }
.sidebar { width: 260px; background: #ffffff; border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 24px; flex-shrink: 0; z-index: 10; }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
.top-nav { height: 72px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; background: #ffffff; flex-shrink: 0; z-index: 5; }
.dashboard-content { flex: 1; overflow-y: auto; padding: 32px 40px; }

/* Sidebar Elements */
.brand { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; }
.logo-container { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
.logo-text { font-family: var(--font-display); font-weight: 800; color: #fff; font-size: 20px; letter-spacing: 1px; }
.brand-text h1 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.2px; line-height: 1.2; }
.brand-text p { font-size: 11px; color: var(--text3); margin-top: 2px; }

.nav-menu { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--rs); color: var(--text2); text-decoration: none; font-size: 14px; font-weight: 500; transition: all .2s; cursor: pointer; }
.nav-item:hover { background: var(--bg3); color: var(--text); }
.nav-item.active { background: rgba(79, 70, 229, 0.08); color: var(--accent); font-weight: 600; }
.nav-item.active::before { content: ''; position: absolute; left: 16px; width: 4px; height: 20px; background: var(--accent); border-radius: 4px; }

.user-profile { display: flex; align-items: center; gap: 12px; margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border); cursor: pointer; }
.avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--bg3); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 600; font-size: 14px; color: var(--text); }
.avatar-accent { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: white; border: none; }
.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text); }
.user-email { font-size: 11px; color: var(--text3); }

/* Top Nav Elements */
.search-bar { background: var(--bg3); border: 1px solid transparent; border-radius: 24px; padding: 10px 20px; width: 340px; display: flex; align-items: center; font-size: 13px; color: var(--text2); transition: all 0.2s; }
.search-bar:focus-within { border-color: var(--accent); background: #ffffff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
.top-actions { display: flex; align-items: center; gap: 20px; }
.status { font-family: var(--font-mono); font-size: 12px; font-weight: 500; color: var(--green); display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: #ffffff; border-radius: 20px; border: 1px solid var(--border); }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: blink 2s ease infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.4} }

/* CARD */
.card { background: #ffffff; border: 1px solid var(--border); border-radius: var(--r); padding: 32px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); transition: box-shadow 0.2s; }
.card:hover { box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06); }
.card-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
.card-sub { font-size: 14px; color: var(--text2); margin-bottom: 28px; line-height: 1.6; max-width: 600px; }
.flabel { display: block; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text2); margin-bottom: 8px; font-weight: 500; }

input[type=text], select, textarea { width: 100%; background: #ffffff; border: 1px solid var(--border2); border-radius: var(--rs); color: var(--text); font-family: 'Geist', sans-serif; font-size: 14px; padding: 12px 16px; outline: none; transition: all .2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
input[type=text]:focus, select:focus, textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
input::placeholder, textarea::placeholder { color: var(--text3); }
select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2364748b' d='M5 6L0 0h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }

/* Layout Grids */
.input-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }

.asin-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.asin-row { display: flex; gap: 8px; align-items: center; }
.asin-info { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); padding: 12px 16px; margin-top: 8px; display: none; }
.asin-info.on { display: block; animation: fadeIn 0.3s; }
.asin-info-title { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 10px; line-height: 1.4; }
.asin-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { font-size: 11px; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border2); color: var(--text2); background: #ffffff; font-weight: 500; }
.pill.g { background: var(--green-d); color: var(--green); border-color: var(--green-b); }
.pill.o { background: var(--amber-d); color: var(--amber); border-color: var(--amber-b); }
.pill.r { background: var(--red-d); color: var(--red); border-color: var(--red-b); }
.pill.b { background: var(--blue-d); color: var(--blue); border-color: var(--blue-b); }

.btn { padding: 12px 20px; border-radius: var(--rs); font-family: 'Geist', sans-serif; font-weight: 600; font-size: 13px; cursor: pointer; transition: all .2s ease; border: 1px solid var(--border2); background: #ffffff; color: var(--text2); white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
.btn:hover { color: var(--text); border-color: var(--text3); background: var(--bg3); }
.btn-accent { background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; color: #fff; font-size: 15px; font-weight: 600; padding: 14px 24px; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); display: inline-flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
.btn-accent:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4); }
.btn-accent:active { transform: translateY(0); }
.btn-accent:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-load { background: var(--blue-d); border-color: transparent; color: var(--blue); font-size: 13px; padding: 12px 18px; box-shadow: none; }
.btn-load:hover { background: var(--blue-b); color: #1d4ed8; border-color: transparent; }
.btn-add { border-style: dashed; width: 100%; justify-content: center; display: flex; align-items: center; gap: 8px; font-size: 13px; background: transparent; color: var(--text2); }
.btn-add:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

.loader { display: none; text-align: center; padding: 60px 24px; background: #ffffff; border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 24px; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05); }
.loader.on { display: block; animation: fadeIn 0.4s; }
.spinner { width: 44px; height: 44px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 24px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loader-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
.loader-sub { font-size: 14px; color: var(--text2); margin-bottom: 24px; }
.prog-list { display: inline-flex; flex-direction: column; gap: 8px; text-align: left; background: var(--bg3); padding: 20px 28px; border-radius: var(--rs); border: 1px solid var(--border); }
.prog-item { font-family: var(--font-mono); font-size: 12px; color: var(--text3); transition: color .2s; display: flex; align-items: center; gap: 10px; }
.prog-item::before { content: '>'; color: var(--text3); font-weight: bold; }
.prog-item.on { color: var(--accent); font-weight: 600; }
.prog-item.on::before { color: var(--accent); }
.prog-item.ok { color: var(--green); }
.prog-item.ok::before { content: '✓'; color: var(--green); }

.err { display: none; background: var(--red-d); border: 1px solid var(--red-b); border-radius: var(--rs); padding: 14px 18px; color: var(--red); font-size: 14px; margin-top: 16px; line-height: 1.6; }
.err.on { display: block; animation: fadeIn 0.3s; }

#results { display: none; margin-top: 16px; animation: fadeIn 0.5s; }
.res-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
.res-title { font-family: var(--font-display); font-size: 32px; font-weight: 800; letter-spacing: -0.5px; color: var(--text); }
.res-meta { font-family: var(--font-mono); font-size: 13px; color: var(--text2); margin-top: 6px; display: flex; align-items: center; gap: 8px; }
.summary-box { background: #ffffff; border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: var(--rs); padding: 28px; margin-bottom: 32px; font-size: 15px; line-height: 1.8; box-shadow: 0 4px 20px rgba(0,0,0,0.03); color: var(--text2); }

.scores-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-bottom: 32px; }
.score-card { background: #ffffff; border: 1px solid var(--border); border-radius: var(--r); padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); transition: transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; }
.score-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); }
.score-asin { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin-bottom: 12px; display: inline-block; background: var(--accent-light); padding: 4px 10px; border-radius: 6px; font-weight: 600; }
.score-title-text { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 16px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.score-lbl { font-size: 12px; color: var(--text2); width: 64px; flex-shrink: 0; font-weight: 500; }
.score-bar { flex: 1; height: 6px; background: var(--bg3); border-radius: 3px; overflow: hidden; }
.score-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1); background: linear-gradient(90deg, var(--accent), var(--accent2)); }
.score-num { font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--text); width: 28px; text-align: right; }
.score-weakness { margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--border); font-size: 13px; color: var(--red); display: flex; gap: 8px; }
.score-strength { font-size: 13px; color: var(--green); margin-top: 8px; display: flex; gap: 8px; }

.tabs { display: flex; gap: 8px; background: #ffffff; border: 1px solid var(--border); border-radius: var(--r); padding: 8px; margin-bottom: 28px; flex-wrap: wrap; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
.tab { flex: 1; min-width: 90px; padding: 12px 16px; border: none; background: transparent; color: var(--text2); font-family: var(--font-display); font-size: 14px; font-weight: 600; cursor: pointer; border-radius: 10px; transition: all .2s ease; text-align: center; }
.tab:hover { color: var(--text); background: var(--bg3); }
.tab.on { background: var(--accent-light); color: var(--accent); box-shadow: none; }
.tc { display: none; }
.tc.on { display: block; animation: fadeIn 0.4s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* ANALYSIS PANELS */
.comp-panel { background: #ffffff; border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 24px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
.comp-panel-hdr { background: var(--bg3); border-bottom: 1px solid var(--border); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.comp-panel-body { padding: 28px; }
.section-label { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text3); margin-bottom: 12px; display: block; font-weight: 600; }
.section-text { font-size: 15px; color: var(--text); line-height: 1.7; margin-bottom: 24px; }

.compliance-ok { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; background: var(--green-d); border: 1px solid var(--green-b); border-radius: var(--rs); font-size: 14px; color: var(--green); margin-bottom: 12px; }
.compliance-warn { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; background: var(--red-d); border: 1px solid var(--red-b); border-radius: var(--rs); font-size: 14px; color: var(--red); margin-bottom: 12px; }
.compliance-verify { display: flex; align-items: flex-start; gap: 12px; padding: 16px 20px; background: var(--amber-d); border: 1px solid var(--amber-b); border-radius: var(--rs); font-size: 14px; color: var(--amber); margin-bottom: 12px; }
.compliance-icon { flex-shrink: 0; font-size: 18px; margin-top: 2px; }
.verify-tag { font-family: var(--font-mono); font-size: 10px; padding: 4px 8px; border-radius: 4px; background: #ffffff; color: var(--amber); border: 1px solid var(--amber-b); margin-left: 8px; text-transform: uppercase; vertical-align: middle; font-weight: 600; }

/* IMAGES TAB */
.img-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
.img-thumb { aspect-ratio: 1; border-radius: var(--rs); overflow: hidden; border: 1px solid var(--border); background: var(--bg3); position: relative; }
.img-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.img-thumb:hover img { transform: scale(1.05); }
.img-checklist { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
.img-check { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--rs); font-size: 14px; }
.img-check.ok { background: var(--green-d); color: var(--green); border: 1px solid var(--green-b); }
.img-check.fail { background: var(--red-d); color: var(--red); border: 1px solid var(--red-b); }
.img-check.warn { background: var(--amber-d); color: var(--amber); border: 1px solid var(--amber-b); }
.img-missing { background: var(--bg3); border: 1px dashed var(--border2); border-radius: var(--rs); padding: 16px 20px; margin-bottom: 8px; font-size: 14px; color: var(--text2); }
.img-missing::before { content: '+ '; color: var(--accent); font-weight: 700; }
.img-rec { background: #ffffff; border: 1px solid var(--border); border-radius: var(--rs); padding: 20px 24px; margin-bottom: 12px; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.img-rec:hover { transform: translateX(4px); border-color: var(--border2); }
.img-rec-pos { font-family: var(--font-mono); font-size: 12px; color: var(--accent); margin-bottom: 8px; font-weight: 600; }
.img-rec-desc { font-size: 15px; color: var(--text); margin-bottom: 8px; line-height: 1.6; }
.img-rec-pri { font-size: 13px; font-weight: 600; }
.img-rec-pri.critica { color: var(--red); }
.img-rec-pri.importante { color: var(--amber); }
.img-rec-pri.recomendada { color: var(--green); }

/* REVIEWS */
.sentiment-bar-wrap { background: #ffffff; border: 1px solid var(--border); border-radius: var(--r); padding: 24px; margin-bottom: 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
.sentiment-bar { display: flex; height: 12px; border-radius: 6px; overflow: hidden; margin: 16px 0; }
.sentiment-legend { display: flex; gap: 24px; font-size: 13px; color: var(--text2); flex-wrap: wrap; }
.sentiment-legend-item { display: flex; align-items: center; gap: 8px; font-weight: 500; }
.sentiment-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.verdict-box { background: var(--blue-d); border: 1px solid var(--blue-b); border-radius: var(--rs); padding: 20px 24px; font-size: 15px; color: var(--text); line-height: 1.7; margin-top: 20px; }
.review-section { margin-bottom: 40px; }
.review-section-hdr { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.review-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; background: var(--bg3); border: 1px solid var(--border); }
.review-section-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text); }
.review-section-pct { font-family: var(--font-mono); font-size: 14px; font-weight: 600; color: var(--text2); margin-left: auto; background: var(--bg3); padding: 6px 12px; border-radius: 20px; }
.theme-card { background: #ffffff; border: 1px solid var(--border); border-radius: var(--rs); padding: 20px 24px; margin-bottom: 12px; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.theme-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.04); }
.theme-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.theme-name { font-size: 16px; font-weight: 600; color: var(--text); }
.freq-tag { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
.freq-alta { background: var(--red-d); color: var(--red); border: 1px solid var(--red-b); }
.freq-media { background: var(--amber-d); color: var(--amber); border: 1px solid var(--amber-b); }
.freq-baja { background: var(--blue-d); color: var(--blue); border: 1px solid var(--blue-b); }
.theme-desc { font-size: 14px; color: var(--text2); line-height: 1.6; margin-bottom: 12px; }
.theme-opp { font-size: 13px; color: var(--green); font-weight: 600; }
.phrases-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
.phrase-tag { font-family: var(--font-mono); font-size: 12px; padding: 6px 12px; border-radius: 8px; background: var(--bg3); border: 1px solid var(--border); color: var(--text2); font-style: italic; }

/* GAPS */
.gap-card { background: #ffffff; border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: var(--rs); padding: 24px; margin-bottom: 16px; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
.gap-card:hover { transform: translateX(6px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.gap-title { font-size: 16px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
.gap-evidence { font-size: 14px; color: var(--text2); margin-bottom: 12px; line-height: 1.6; }
.gap-opp { font-size: 14px; color: var(--green); font-weight: 600; display: inline-block; background: var(--green-d); padding: 6px 12px; border-radius: 6px; }

/* MY LISTING */
.listing-section { background: #ffffff; border: 1px solid var(--accent-light); border-radius: var(--r); padding: 36px; margin-bottom: 24px; box-shadow: 0 8px 32px rgba(79, 70, 229, 0.05); }
.listing-section-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
.title-box { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--text); padding: 24px 28px; background: var(--bg3); border: 1px solid var(--border); border-radius: var(--rs); margin-bottom: 20px; line-height: 1.5; }
.keywords { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
.kw { font-family: var(--font-mono); font-size: 13px; padding: 6px 14px; border-radius: 8px; background: var(--accent-light); color: var(--accent); font-weight: 600; }
.reasoning { font-size: 14px; color: var(--text2); font-style: italic; border-left: 3px solid var(--border2); padding-left: 16px; margin-top: 16px; }
.bullet-card { display: flex; gap: 20px; padding: 24px; background: #ffffff; border: 1px solid var(--border); border-radius: var(--rs); margin-bottom: 16px; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.bullet-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.bullet-n { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--accent); opacity: .4; flex-shrink: 0; line-height: 1; margin-top: 2px; }
.bullet-text { font-size: 15px; color: var(--text); line-height: 1.7; margin-bottom: 12px; }
.bullet-reason { font-size: 13px; color: var(--green); font-weight: 600; display: inline-block; background: var(--green-d); padding: 6px 14px; border-radius: 8px; }

/* ACTIONS */
.action-card { display: flex; gap: 20px; background: #ffffff; border: 1px solid var(--border); border-left: 5px solid var(--green); border-radius: var(--rs); padding: 24px 28px; margin-bottom: 16px; transition: transform 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
.action-card:hover { transform: translateX(6px); box-shadow: 0 8px 20px rgba(0,0,0,0.05); }
.action-n { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text3); opacity: .4; line-height: 1; flex-shrink: 0; }
.action-pri { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
.action-pri.Alta { color: var(--red); background: var(--red-d); }
.action-pri.Media { color: var(--amber); background: var(--amber-d); }
.action-txt { font-size: 15px; color: var(--text); line-height: 1.6; margin-bottom: 10px; font-weight: 500; }
.action-imp { font-size: 14px; color: var(--green); font-weight: 500; }

@media (max-width: 900px) {
  .dashboard-layout { flex-direction: column; overflow: auto; height: auto; }
  .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid var(--border); padding: 20px; flex-direction: row; align-items: center; justify-content: space-between; }
  .nav-menu { display: none; }
  .brand { margin-bottom: 0; }
  .user-profile { margin-top: 0; padding-top: 0; border-top: none; }
  .dashboard-content { padding: 20px; }
  .input-grid { grid-template-columns: 1fr; }
}
</style>"""

new_content = re.sub(r'<style>.*?</style>', new_style, content, flags=re.DOTALL)

# Update Logo in HTML to match new design
new_logo_html = '''<div class="logo-container">
        <span class="logo-text">LI</span>
      </div>'''
new_content = re.sub(r'<div class="logo">LI</div>', new_logo_html, new_content)

# Optional: Add small icon emojis to tabs to match the "clean" look
new_content = new_content.replace('Pro Max Dashboard', 'Inteligencia de Mercado')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
