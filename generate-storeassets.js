#!/usr/bin/env node
'use strict';

/**
 * generate-storeassets.js
 * Uses Puppeteer to render branded HTML pages and screenshot them as PNGs.
 * Run: node generate-storeassets.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'storeassets');
fs.mkdirSync(OUT, { recursive: true });

// ── Shared design tokens ──────────────────────────────────────────────────────
const ICON_URL = 'https://raw.githubusercontent.com/zozimustechnologies/vocabbuilder/main/icons/icon-300.png';

const CSS_VARS = `
  :root {
    --bg: #0d1117;
    --bg-card: #161b22;
    --bg-elevated: #1c2129;
    --border: #30363d;
    --text: #c9d1d9;
    --text-muted: #8b949e;
    --text-bright: #f0f6fc;
    --accent: #3d7ea6;
    --accent-light: #4a92bd;
    --accent-glow: rgba(61,126,166,0.18);
    --radius: 12px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }
`;

// ── HTML templates ────────────────────────────────────────────────────────────



function smallTileHtml() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${CSS_VARS}
    body { width:440px; height:280px; display:flex; flex-direction:column;
           align-items:center; justify-content:center; gap:12px;
           background: linear-gradient(135deg, #0d1117 0%, #1a2636 100%);
           border: 1px solid var(--border); }
    img  { width:72px; height:72px; border-radius:16px;
           box-shadow: 0 6px 24px rgba(61,126,166,0.4); }
    h1   { font-size:26px; font-weight:700; color:var(--text-bright); letter-spacing:-0.02em; }
    p    { font-size:13px; color:var(--text-muted); text-align:center; max-width:300px; }
    .pill { margin-top:4px; display:flex; gap:8px; flex-wrap:wrap; justify-content:center; }
    .tag  { background:var(--bg-card); border:1px solid var(--border); border-radius:20px;
            padding:3px 10px; font-size:11px; color:var(--accent-light); }
  </style></head>
  <body>
    <img src="${ICON_URL}" alt="logo">
    <h1>VocabBuilder</h1>
    <p>Spaced repetition vocabulary — right in your browser</p>
    <div class="pill">
      <span class="tag">GMAT</span><span class="tag">GRE</span>
      <span class="tag">LSAT</span><span class="tag">Daily Habit</span>
    </div>
  </body></html>`;
}

function largeTileHtml() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${CSS_VARS}
    body { width:1400px; height:560px; display:flex; align-items:center;
           background: linear-gradient(120deg, #0d1117 0%, #0f1e2e 50%, #0d1117 100%); overflow:hidden; }
    .glow { position:absolute; top:-100px; left:50%; transform:translateX(-50%);
            width:900px; height:500px;
            background:radial-gradient(ellipse, rgba(61,126,166,0.18) 0%, transparent 70%);
            pointer-events:none; }
    .left  { flex:1; padding:80px; display:flex; flex-direction:column; gap:20px; }
    .right { width:540px; padding:60px 80px 60px 0; display:flex; flex-direction:column;
             align-items:center; gap:24px; }
    img    { width:160px; height:160px; border-radius:36px;
             box-shadow:0 16px 64px rgba(61,126,166,0.5); }
    .badge { display:inline-block; background:var(--accent); color:#fff;
             font-size:11px; font-weight:700; letter-spacing:0.08em;
             padding:4px 12px; border-radius:20px; text-transform:uppercase; margin-bottom:4px; }
    h1     { font-size:52px; font-weight:800; color:var(--text-bright);
             letter-spacing:-0.03em; line-height:1.1; }
    p      { font-size:18px; color:var(--text-muted); max-width:480px; line-height:1.6; }
    .features { display:flex; flex-direction:column; gap:12px; }
    .feat  { display:flex; align-items:center; gap:12px; }
    .dot   { width:8px; height:8px; border-radius:50%; background:var(--accent); flex-shrink:0; }
    .feat-text { font-size:15px; color:var(--text); }
  </style></head>
  <body>
    <div class="glow"></div>
    <div class="left">
      <span class="badge">Free Browser Extension</span>
      <h1>VocabBuilder</h1>
      <p>Master vocabulary through spaced repetition — with daily reminders, progressive difficulty, and streak tracking.</p>
      <div class="features">
        <div class="feat"><div class="dot"></div><span class="feat-text">Spaced repetition intervals: 1 → 3 → 7 → 14 → 30 days</span></div>
        <div class="feat"><div class="dot"></div><span class="feat-text">4 difficulty levels: Simple, Medium, Complex, Competitive</span></div>
        <div class="feat"><div class="dot"></div><span class="feat-text">Badge system, streaks &amp; progress dashboard</span></div>
        <div class="feat"><div class="dot"></div><span class="feat-text">100% local — no accounts, no data collection</span></div>
      </div>
    </div>
    <div class="right">
      <img src="${ICON_URL}" alt="logo">
      <div style="text-align:center">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">PERFECT FOR</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;">
          ${['GMAT','GRE','LSAT','CAT','ESL','Daily Learning'].map(t =>
            `<span style="background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:4px 12px;font-size:12px;color:var(--accent-light);">${t}</span>`
          ).join('')}
        </div>
      </div>
    </div>
  </body></html>`;
}

function screenshotHtml(width, height) {
  const scale = width === 1280 ? 1 : 0.5;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${CSS_VARS}
    body { width:${width}px; height:${height}px; display:flex; gap:0; overflow:hidden;
           background:var(--bg); }

    /* ── Fake browser chrome ── */
    .browser { display:flex; flex-direction:column; flex:1; }
    .chrome  { background:#21262d; padding:10px 16px; display:flex; align-items:center; gap:10px;
                border-bottom:1px solid var(--border); flex-shrink:0; }
    .dots    { display:flex; gap:6px; }
    .dot-r   { width:12px; height:12px; border-radius:50%; background:#d4313b; }
    .dot-y   { width:12px; height:12px; border-radius:50%; background:#f0a030; }
    .dot-g   { width:12px; height:12px; border-radius:50%; background:#2ea043; }
    .omni    { flex:1; background:var(--bg-elevated); border:1px solid var(--border);
                border-radius:8px; padding:5px 12px; font-size:12px; color:var(--text-muted); }
    .page    { flex:1; background:#f6f8fa; display:flex; align-items:center; justify-content:center;
                position:relative; }
    .page-content { text-align:center; color:#333; font-size:${scale * 14}px; opacity:0.3; }

    /* ── Side panel ── */
    .panel { width:${scale * 380}px; background:var(--bg); border-left:1px solid var(--border);
              display:flex; flex-direction:column; flex-shrink:0; }
    .panel-header { background:var(--bg-card); padding:${scale * 12}px ${scale * 16}px;
                     border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }
    .brand { font-size:${scale * 14}px; font-weight:700; color:var(--text-bright); flex:1; }
    .streak { font-size:${scale * 12}px; color:#f0a030; }

    .nav { display:flex; background:var(--bg-card); border-bottom:1px solid var(--border); }
    .nav-btn { flex:1; padding:${scale * 8}px 4px; font-size:${scale * 10}px; color:var(--text-muted);
                border:none; background:none; cursor:pointer; text-align:center; }
    .nav-btn.active { color:var(--accent-light); border-bottom:2px solid var(--accent); }

    .panel-body { flex:1; padding:${scale * 16}px; display:flex; flex-direction:column; gap:${scale * 12}px; overflow:hidden; }

    .word-card { background:var(--bg-card); border:1px solid var(--border); border-radius:${scale * 10}px;
                  padding:${scale * 20}px; }
    .word-label { font-size:${scale * 10}px; text-transform:uppercase; letter-spacing:0.08em;
                   color:var(--text-muted); margin-bottom:${scale * 6}px; }
    .word       { font-size:${scale * 24}px; font-weight:700; color:var(--text-bright);
                   margin-bottom:${scale * 4}px; }
    .ipa        { font-size:${scale * 11}px; color:var(--accent-light); margin-bottom:${scale * 10}px; }
    .pos        { display:inline-block; background:var(--accent); color:#fff; font-size:${scale * 10}px;
                   padding:2px 8px; border-radius:10px; margin-bottom:${scale * 10}px; }
    .def        { font-size:${scale * 12}px; color:var(--text); line-height:1.5; }

    .actions { display:flex; gap:${scale * 8}px; }
    .btn-got  { flex:1; background:#2ea043; color:#fff; border:none; border-radius:8px;
                 padding:${scale * 10}px; font-size:${scale * 12}px; font-weight:600; cursor:pointer; }
    .btn-not  { flex:1; background:var(--bg-elevated); color:var(--text); border:1px solid var(--border);
                 border-radius:8px; padding:${scale * 10}px; font-size:${scale * 12}px; font-weight:600; cursor:pointer; }

    .stats-row { display:flex; gap:${scale * 8}px; }
    .stat-card { flex:1; background:var(--bg-card); border:1px solid var(--border);
                  border-radius:8px; padding:${scale * 10}px; text-align:center; }
    .stat-num  { font-size:${scale * 20}px; font-weight:700; color:var(--text-bright); }
    .stat-lbl  { font-size:${scale * 10}px; color:var(--text-muted); }
  </style></head>
  <body>
    <div class="browser">
      <div class="chrome">
        <div class="dots">
          <div class="dot-r"></div><div class="dot-y"></div><div class="dot-g"></div>
        </div>
        <div class="omni">https://en.wikipedia.org/wiki/Epistemology</div>
      </div>
      <div class="page">
        <div class="page-content">Wikipedia — Epistemology<br>Browse any page while VocabBuilder lives in your sidebar</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <img src="${ICON_URL}" style="width:${scale*22}px;height:${scale*22}px;border-radius:6px;">
        <span class="brand">Vocab Builder</span>
        <span class="streak">🔥 14</span>
      </div>
      <div class="nav">
        <div class="nav-btn active">Word</div>
        <div class="nav-btn">Got It</div>
        <div class="nav-btn">Revise</div>
        <div class="nav-btn">Badges</div>
        <div class="nav-btn">Stats</div>
      </div>
      <div class="panel-body">
        <div class="word-card">
          <div class="word-label">Word of the Day</div>
          <div class="word">Perspicacious</div>
          <div class="ipa">/ˌpɜːr.spɪˈkeɪ.ʃəs/</div>
          <div class="pos">adjective</div>
          <div class="def">Having a ready insight into things; shrewd. Able to notice and understand things quickly and clearly.</div>
        </div>
        <div class="actions">
          <button class="btn-got">✓ Got It</button>
          <button class="btn-not">↻ Not Yet</button>
        </div>
        <div class="stats-row">
          <div class="stat-card"><div class="stat-num">14</div><div class="stat-lbl">Day Streak</div></div>
          <div class="stat-card"><div class="stat-num">127</div><div class="stat-lbl">Learned</div></div>
          <div class="stat-card"><div class="stat-num">3/3</div><div class="stat-lbl">Today</div></div>
        </div>
      </div>
    </div>
  </body></html>`;
}

function screenshotBadgesHtml(width, height) {
  const scale = width === 1280 ? 1 : 0.5;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${CSS_VARS}
    body { width:${width}px; height:${height}px; display:flex; gap:0; overflow:hidden; background:var(--bg); }
    .browser { display:flex; flex-direction:column; flex:1; }
    .chrome  { background:#21262d; padding:10px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border); flex-shrink:0; }
    .dots    { display:flex; gap:6px; }
    .dot-r   { width:12px; height:12px; border-radius:50%; background:#d4313b; }
    .dot-y   { width:12px; height:12px; border-radius:50%; background:#f0a030; }
    .dot-g   { width:12px; height:12px; border-radius:50%; background:#2ea043; }
    .omni    { flex:1; background:var(--bg-elevated); border:1px solid var(--border); border-radius:8px; padding:5px 12px; font-size:12px; color:var(--text-muted); }
    .page    { flex:1; background:#f6f8fa; display:flex; align-items:center; justify-content:center; }
    .page-content { text-align:center; color:#333; font-size:${scale * 14}px; opacity:0.3; }
    .panel { width:${scale * 380}px; background:var(--bg); border-left:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
    .panel-header { background:var(--bg-card); padding:${scale * 12}px ${scale * 16}px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }
    .brand { font-size:${scale * 14}px; font-weight:700; color:var(--text-bright); flex:1; }
    .streak { font-size:${scale * 12}px; color:#f0a030; }
    .nav { display:flex; background:var(--bg-card); border-bottom:1px solid var(--border); }
    .nav-btn { flex:1; padding:${scale * 8}px 4px; font-size:${scale * 10}px; color:var(--text-muted); border:none; background:none; cursor:pointer; text-align:center; }
    .nav-btn.active { color:var(--accent-light); border-bottom:2px solid var(--accent); }
    .panel-body { flex:1; padding:${scale * 12}px; display:flex; flex-direction:column; gap:${scale * 10}px; overflow:hidden; }
    .section-title { font-size:${scale * 11}px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent-light); padding-bottom:${scale * 6}px; border-bottom:1px solid var(--border); margin-bottom:${scale * 2}px; }
    .view-title { font-size:${scale * 15}px; font-weight:700; color:var(--text-bright); margin-bottom:${scale * 4}px; }
    .badge-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:${scale * 6}px; }
    .badge-item { display:flex; flex-direction:column; align-items:center; padding:${scale * 8}px ${scale * 4}px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; text-align:center; }
    .badge-item.earned { border-color:#d29922; background:rgba(210,153,34,0.07); }
    .badge-item.locked { background:var(--bg-elevated); opacity:0.75; }
    .badge-icon { font-size:${scale * 22}px; margin-bottom:${scale * 3}px; }
    .badge-item.locked .badge-icon { filter:grayscale(80%) brightness(0.6); }
    .badge-name { font-size:${scale * 9}px; font-weight:700; color:var(--text); line-height:1.2; }
    .badge-prog { font-size:${scale * 8}px; color:var(--text-muted); margin-top:2px; }
    .badge-item.earned .badge-prog { color:#d29922; }
    .monthly-item { display:flex; align-items:center; gap:${scale * 8}px; padding:${scale * 8}px ${scale * 10}px; background:var(--bg-card); border:1px solid var(--border); border-radius:7px; }
    .monthly-item.earned { border-color:#d29922; background:rgba(210,153,34,0.07); }
    .mi-icon { font-size:${scale * 20}px; }
    .mi-info { flex:1; }
    .mi-name { font-size:${scale * 11}px; font-weight:700; color:var(--text-bright); }
    .mi-target { font-size:${scale * 9}px; color:var(--text-muted); }
    .mi-status { font-size:${scale * 10}px; font-weight:600; color:#d29922; }
  </style></head>
  <body>
    <div class="browser">
      <div class="chrome">
        <div class="dots"><div class="dot-r"></div><div class="dot-y"></div><div class="dot-g"></div></div>
        <div class="omni">https://en.wikipedia.org/wiki/Epistemology</div>
      </div>
      <div class="page">
        <div class="page-content">Wikipedia — Epistemology<br>Browse any page while VocabBuilder lives in your sidebar</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <img src="${ICON_URL}" style="width:${scale*22}px;height:${scale*22}px;border-radius:6px;">
        <span class="brand">Vocab Builder</span>
        <span class="streak">🔥 14</span>
      </div>
      <div class="nav">
        <div class="nav-btn">Word</div>
        <div class="nav-btn">Got It</div>
        <div class="nav-btn">Revise</div>
        <div class="nav-btn active">Badges</div>
        <div class="nav-btn">Stats</div>
      </div>
      <div class="panel-body">
        <div class="view-title">🏆 Badges &amp; Achievements</div>
        <div class="section-title">🔥 Daily Streak Badges</div>
        <div class="badge-grid">
          <div class="badge-item earned"><div class="badge-icon">⚡</div><div class="badge-name">Spark Starter</div><div class="badge-prog">✓ Earned</div></div>
          <div class="badge-item earned"><div class="badge-icon">🗡️</div><div class="badge-name">Week Warrior</div><div class="badge-prog">✓ Earned</div></div>
          <div class="badge-item locked"><div class="badge-icon">🛡️</div><div class="badge-name">Fortnight Force</div><div class="badge-prog">14/15 days</div></div>
          <div class="badge-item locked"><div class="badge-icon">🎯</div><div class="badge-name">Monthly Maestro</div><div class="badge-prog">14/30 days</div></div>
        </div>
        <div class="section-title">📚 Lifetime Words</div>
        <div class="badge-grid">
          <div class="badge-item earned"><div class="badge-icon">🎯</div><div class="badge-name">First Fifty</div><div class="badge-prog">✓ Earned</div></div>
          <div class="badge-item earned"><div class="badge-icon">🌱</div><div class="badge-name">Word Seedling</div><div class="badge-prog">✓ Earned</div></div>
          <div class="badge-item locked"><div class="badge-icon">🌿</div><div class="badge-name">Vocab Sprout</div><div class="badge-prog">127/200</div></div>
          <div class="badge-item locked"><div class="badge-icon">🧭</div><div class="badge-name">Lexicon Explorer</div><div class="badge-prog">127/300</div></div>
        </div>
        <div class="section-title">🗓️ Monthly Challenges</div>
        <div class="monthly-item earned"><div class="mi-icon">🌸</div><div class="mi-info"><div class="mi-name">March Wordsmith</div><div class="mi-target">March 2026 — 50 words</div></div><div class="mi-status">✓ Earned</div></div>
        <div class="monthly-item"><div class="mi-icon">🌧️</div><div class="mi-info"><div class="mi-name">April Articulator</div><div class="mi-target">April 2026 — 50 words</div></div><div class="mi-status" style="color:var(--text-muted)">42/50</div></div>
      </div>
    </div>
  </body></html>`;
}

function screenshotStatsHtml(width, height) {
  const scale = width === 1280 ? 1 : 0.5;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${CSS_VARS}
    body { width:${width}px; height:${height}px; display:flex; gap:0; overflow:hidden; background:var(--bg); }
    .browser { display:flex; flex-direction:column; flex:1; }
    .chrome  { background:#21262d; padding:10px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border); flex-shrink:0; }
    .dots    { display:flex; gap:6px; }
    .dot-r   { width:12px; height:12px; border-radius:50%; background:#d4313b; }
    .dot-y   { width:12px; height:12px; border-radius:50%; background:#f0a030; }
    .dot-g   { width:12px; height:12px; border-radius:50%; background:#2ea043; }
    .omni    { flex:1; background:var(--bg-elevated); border:1px solid var(--border); border-radius:8px; padding:5px 12px; font-size:12px; color:var(--text-muted); }
    .page    { flex:1; background:#f6f8fa; display:flex; align-items:center; justify-content:center; }
    .page-content { text-align:center; color:#333; font-size:${scale * 14}px; opacity:0.3; }
    .panel { width:${scale * 380}px; background:var(--bg); border-left:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
    .panel-header { background:var(--bg-card); padding:${scale * 12}px ${scale * 16}px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }
    .brand { font-size:${scale * 14}px; font-weight:700; color:var(--text-bright); flex:1; }
    .streak { font-size:${scale * 12}px; color:#f0a030; }
    .nav { display:flex; background:var(--bg-card); border-bottom:1px solid var(--border); }
    .nav-btn { flex:1; padding:${scale * 8}px 4px; font-size:${scale * 10}px; color:var(--text-muted); border:none; background:none; text-align:center; }
    .nav-btn.active { color:var(--accent-light); border-bottom:2px solid var(--accent); }
    .panel-body { flex:1; padding:${scale * 12}px; display:flex; flex-direction:column; gap:${scale * 10}px; overflow:hidden; }
    .view-title { font-size:${scale * 15}px; font-weight:700; color:var(--text-bright); }
    .big-retention { background:var(--bg-card); border:1px solid var(--border); border-radius:${scale * 8}px; padding:${scale * 12}px; text-align:center; }
    .big-pct { font-size:${scale * 32}px; font-weight:800; color:var(--accent-light); }
    .pct-label { font-size:${scale * 10}px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
    .stat-cards { display:grid; grid-template-columns:1fr 1fr; gap:${scale * 6}px; }
    .stat-card { background:var(--bg-card); border:1px solid var(--border); border-radius:8px; padding:${scale * 10}px; text-align:center; }
    .stat-num { font-size:${scale * 20}px; font-weight:800; color:var(--accent-light); }
    .stat-lbl { font-size:${scale * 9}px; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-muted); margin-top:2px; }
    .section-title { font-size:${scale * 10}px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--accent-light); margin-bottom:${scale * 6}px; }
    .ret-item { display:flex; align-items:center; gap:${scale * 8}px; margin-bottom:${scale * 8}px; }
    .ret-label { width:${scale * 72}px; font-size:${scale * 11}px; color:var(--text-muted); text-transform:capitalize; }
    .ret-bar { flex:1; height:${scale * 8}px; background:var(--bg-elevated); border-radius:4px; overflow:hidden; }
    .ret-fill { height:100%; border-radius:4px; }
    .ret-pct { width:${scale * 32}px; text-align:right; font-size:${scale * 11}px; font-weight:700; color:var(--text-muted); }
  </style></head>
  <body>
    <div class="browser">
      <div class="chrome">
        <div class="dots"><div class="dot-r"></div><div class="dot-y"></div><div class="dot-g"></div></div>
        <div class="omni">https://en.wikipedia.org/wiki/Epistemology</div>
      </div>
      <div class="page">
        <div class="page-content">Wikipedia — Epistemology<br>Browse any page while VocabBuilder lives in your sidebar</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <img src="${ICON_URL}" style="width:${scale*22}px;height:${scale*22}px;border-radius:6px;">
        <span class="brand">Vocab Builder</span>
        <span class="streak">🔥 14</span>
      </div>
      <div class="nav">
        <div class="nav-btn">Word</div>
        <div class="nav-btn">Got It</div>
        <div class="nav-btn">Revise</div>
        <div class="nav-btn">Badges</div>
        <div class="nav-btn active">Stats</div>
      </div>
      <div class="panel-body">
        <div class="view-title">📊 Your Progress</div>
        <div class="big-retention"><div class="big-pct">78%</div><div class="pct-label">Overall Retention</div></div>
        <div class="stat-cards">
          <div class="stat-card"><div class="stat-num">127</div><div class="stat-lbl">Remembered</div></div>
          <div class="stat-card"><div class="stat-num">36</div><div class="stat-lbl">To Revise</div></div>
          <div class="stat-card"><div class="stat-num">163</div><div class="stat-lbl">Total Shown</div></div>
          <div class="stat-card"><div class="stat-num">14</div><div class="stat-lbl">Best Streak</div></div>
        </div>
        <div class="section-title">Retention by Level</div>
        <div class="ret-item"><div class="ret-label">Simple</div><div class="ret-bar"><div class="ret-fill" style="width:92%;background:#3fb950;"></div></div><div class="ret-pct">92%</div></div>
        <div class="ret-item"><div class="ret-label">Medium</div><div class="ret-bar"><div class="ret-fill" style="width:81%;background:#58a6ff;"></div></div><div class="ret-pct">81%</div></div>
        <div class="ret-item"><div class="ret-label">Complex</div><div class="ret-bar"><div class="ret-fill" style="width:64%;background:#d29922;"></div></div><div class="ret-pct">64%</div></div>
        <div class="ret-item"><div class="ret-label">Competitive</div><div class="ret-bar"><div class="ret-fill" style="width:55%;background:#f85149;"></div></div><div class="ret-pct">55%</div></div>
      </div>
    </div>
  </body></html>`;
}

function screenshotSettingsHtml(width, height) {
  const scale = width === 1280 ? 1 : 0.5;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    ${CSS_VARS}
    body { width:${width}px; height:${height}px; display:flex; gap:0; overflow:hidden; background:var(--bg); }
    .browser { display:flex; flex-direction:column; flex:1; }
    .chrome  { background:#21262d; padding:10px 16px; display:flex; align-items:center; gap:10px; border-bottom:1px solid var(--border); flex-shrink:0; }
    .dots    { display:flex; gap:6px; }
    .dot-r   { width:12px; height:12px; border-radius:50%; background:#d4313b; }
    .dot-y   { width:12px; height:12px; border-radius:50%; background:#f0a030; }
    .dot-g   { width:12px; height:12px; border-radius:50%; background:#2ea043; }
    .omni    { flex:1; background:var(--bg-elevated); border:1px solid var(--border); border-radius:8px; padding:5px 12px; font-size:12px; color:var(--text-muted); }
    .page    { flex:1; background:#f6f8fa; display:flex; align-items:center; justify-content:center; }
    .page-content { text-align:center; color:#333; font-size:${scale * 14}px; opacity:0.3; }
    .panel { width:${scale * 380}px; background:var(--bg); border-left:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; }
    .panel-header { background:var(--bg-card); padding:${scale * 12}px ${scale * 16}px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }
    .brand { font-size:${scale * 14}px; font-weight:700; color:var(--text-bright); flex:1; }
    .streak { font-size:${scale * 12}px; color:#f0a030; }
    .nav { display:flex; background:var(--bg-card); border-bottom:1px solid var(--border); }
    .nav-btn { flex:1; padding:${scale * 8}px 4px; font-size:${scale * 10}px; color:var(--text-muted); border:none; background:none; text-align:center; }
    .nav-btn.active { color:var(--accent-light); border-bottom:2px solid var(--accent); }
    .panel-body { flex:1; padding:${scale * 12}px; display:flex; flex-direction:column; gap:${scale * 12}px; overflow:hidden; }
    .view-title { font-size:${scale * 15}px; font-weight:700; color:var(--text-bright); }
    .group-title { font-size:${scale * 10}px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--accent-light); margin-bottom:${scale * 6}px; }
    .level-option { display:flex; align-items:center; gap:${scale * 10}px; padding:${scale * 9}px ${scale * 12}px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; margin-bottom:${scale * 5}px; }
    .level-option.active { border-color:var(--accent); background:rgba(61,126,166,0.08); }
    .radio { width:${scale * 15}px; height:${scale * 15}px; border:2px solid var(--border); border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
    .level-option.active .radio { border-color:var(--accent); }
    .radio-dot { width:${scale * 7}px; height:${scale * 7}px; background:var(--accent); border-radius:50%; }
    .lv-title { font-size:${scale * 13}px; font-weight:700; color:var(--text-bright); }
    .lv-desc { font-size:${scale * 10}px; color:var(--text-muted); margin-top:1px; }
    .goal-row { display:flex; gap:${scale * 6}px; }
    .goal-btn { flex:1; padding:${scale * 10}px ${scale * 6}px; background:var(--bg-card); border:1px solid var(--border); border-radius:8px; text-align:center; }
    .goal-btn.active { border-color:var(--accent); background:rgba(61,126,166,0.08); }
    .goal-num { font-size:${scale * 20}px; font-weight:800; color:var(--accent-light); }
    .goal-lbl { font-size:${scale * 9}px; text-transform:uppercase; color:var(--text-muted); margin-top:2px; }
  </style></head>
  <body>
    <div class="browser">
      <div class="chrome">
        <div class="dots"><div class="dot-r"></div><div class="dot-y"></div><div class="dot-g"></div></div>
        <div class="omni">https://en.wikipedia.org/wiki/Epistemology</div>
      </div>
      <div class="page">
        <div class="page-content">Wikipedia — Epistemology<br>Browse any page while VocabBuilder lives in your sidebar</div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-header">
        <img src="${ICON_URL}" style="width:${scale*22}px;height:${scale*22}px;border-radius:6px;">
        <span class="brand">Vocab Builder</span>
        <span class="streak">🔥 14</span>
      </div>
      <div class="nav">
        <div class="nav-btn">Word</div>
        <div class="nav-btn">Got It</div>
        <div class="nav-btn">Revise</div>
        <div class="nav-btn">Badges</div>
        <div class="nav-btn">Stats</div>
      </div>
      <div class="panel-body">
        <div class="view-title">⚙️ Settings</div>
        <div>
          <div class="group-title">Word Level</div>
          <div class="level-option"><div class="radio"></div><div><div class="lv-title">Simple</div><div class="lv-desc">Everyday vocabulary, high frequency</div></div></div>
          <div class="level-option active"><div class="radio"><div class="radio-dot"></div></div><div><div class="lv-title">Medium</div><div class="lv-desc">Academic and professional usage</div></div></div>
          <div class="level-option"><div class="radio"></div><div><div class="lv-title">Complex</div><div class="lv-desc">Literary, low-frequency, nuanced</div></div></div>
          <div class="level-option"><div class="radio"></div><div><div class="lv-title">Competitive</div><div class="lv-desc">GMAT, GRE, LSAT exam-grade words</div></div></div>
        </div>
        <div>
          <div class="group-title">Daily Word Goal</div>
          <div class="goal-row">
            <div class="goal-btn"><div class="goal-num">1</div><div class="goal-lbl">word/day</div></div>
            <div class="goal-btn active"><div class="goal-num">3</div><div class="goal-lbl">words/day</div></div>
            <div class="goal-btn"><div class="goal-num">5</div><div class="goal-lbl">words/day</div></div>
            <div class="goal-btn"><div class="goal-num">10</div><div class="goal-lbl">words/day</div></div>
          </div>
        </div>
      </div>
    </div>
  </body></html>`;
}

// ── Runner ────────────────────────────────────────────────────────────────────
async function screenshot(browser, html, width, height, outFile) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.screenshot({ path: outFile, type: 'png', clip: { x: 0, y: 0, width, height } });
  await page.close();
  console.log(`✓  ${path.basename(outFile)}  (${width}×${height})`);
}

(async () => {
  console.log('Launching Puppeteer…');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  fs.copyFileSync(path.join(__dirname, 'icons', 'icon-1024.png'), path.join(OUT, 'extensionlogo.png'));
  console.log('✓  extensionlogo.png  (copy of icon-1024.png)');
  await screenshot(browser, smallTileHtml(),     440,  280,  path.join(OUT, 'smallpromotionaltile.png'));
  await screenshot(browser, screenshotHtml(1280, 800),         1280, 800, path.join(OUT, 'screenshot-1280x800.png'));
  await screenshot(browser, screenshotHtml(640,  400),          640,  400, path.join(OUT, 'screenshot-640x400.png'));
  await screenshot(browser, screenshotBadgesHtml(1280, 800),   1280, 800, path.join(OUT, 'screenshot-badges-1280x800.png'));
  await screenshot(browser, screenshotBadgesHtml(640,  400),    640,  400, path.join(OUT, 'screenshot-badges-640x400.png'));
  await screenshot(browser, screenshotStatsHtml(1280, 800),    1280, 800, path.join(OUT, 'screenshot-stats-1280x800.png'));
  await screenshot(browser, screenshotStatsHtml(640,  400),     640,  400, path.join(OUT, 'screenshot-stats-640x400.png'));
  await screenshot(browser, screenshotSettingsHtml(1280, 800), 1280, 800, path.join(OUT, 'screenshot-settings-1280x800.png'));
  await screenshot(browser, screenshotSettingsHtml(640,  400),  640,  400, path.join(OUT, 'screenshot-settings-640x400.png'));
  await screenshot(browser, largeTileHtml(),                   1400, 560,  path.join(OUT, 'largepromotionaltile.png'));

  await browser.close();
  console.log('\nAll store assets saved to storeassets/');
})();
