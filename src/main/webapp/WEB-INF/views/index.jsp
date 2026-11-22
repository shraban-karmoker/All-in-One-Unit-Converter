<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
  String theme = (String) request.getAttribute("theme");
  int decimals = (Integer) request.getAttribute("decimals");
  String ctx = request.getContextPath();
%>
<!DOCTYPE html>
<html lang="en" data-theme="<%= theme %>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ConvertX – All-in-One Unit Converter</title>
  <link rel="stylesheet" href="<%= ctx %>/assets/css/style.css">
</head>
<body>
<div class="app">
  <aside class="sidebar">
    <div class="brand"><span class="logo">⇄</span><div><b>ConvertX</b><small>All-in-one converter</small></div></div>
    <h4>Categories</h4><nav id="nav"></nav>
    <h4>Recently used</h4><div id="recent" class="chips"></div>
  </aside>
  <div class="scrim" id="scrim"></div>
  <main>
    <header class="top">
      <button class="icon-btn menu" id="menuBtn" aria-label="Open menu">☰</button>
      <div class="search">
        <input id="search" type="search" placeholder="Search units or categories…" autocomplete="off" aria-label="Search">
        <ul id="results"></ul>
      </div>
      <button class="icon-btn" id="themeBtn" aria-label="Toggle theme"></button>
      <button class="icon-btn" id="settingsBtn" aria-label="Settings">⚙️</button>
    </header>

    <section class="card converter">
      <div class="card-head">
        <h1 id="title"></h1>
        <div class="actions"><button id="favBtn" class="ghost"></button><button id="clearBtn" class="ghost">Clear</button></div>
      </div>
      <div class="grid">
        <div class="field">
          <label for="input">From</label>
          <input id="input" class="big" inputmode="decimal" autocomplete="off" placeholder="Enter a value">
          <select id="fromUnit" aria-label="From unit"></select>
        </div>
        <button id="swapBtn" class="swap" aria-label="Swap units">⇄</button>
        <div class="field">
          <label for="output">To</label>
          <div class="out"><input id="output" class="big" readonly placeholder="Result"><button id="copyBtn" class="copy">Copy</button></div>
          <select id="toUnit" aria-label="To unit"></select>
        </div>
      </div>
      <p id="error" class="error" role="alert"></p>
      <div class="calc">
        <div><h3>Formula</h3><p id="formula">—</p></div>
        <div><h3>Calculation steps</h3><ol id="steps"></ol></div>
      </div>
    </section>

    <section class="card"><h2>Quick conversions</h2><div id="quick" class="quick-grid"></div></section>

    <section class="card">
      <div class="tabs">
        <button class="tab active" data-tab="h">History</button>
        <button class="tab" data-tab="f">Favorites</button>
        <span class="sp"></span>
        <button id="clearHistory" class="ghost">Clear history</button>
      </div>
      <ul id="historyList" class="list"></ul>
      <ul id="favList" class="list" hidden></ul>
      <p id="status" class="muted"></p>
    </section>
  </main>
</div>

<dialog id="settings">
  <h2>Settings</h2>
  <label for="decimals">Decimal precision: <b id="decVal"></b></label>
  <input type="range" id="decimals" min="0" max="10">
  <label for="themeSel">Theme</label>
  <select id="themeSel"><option value="light">Light</option><option value="dark">Dark</option></select>
  <div class="row">
    <button id="resetBtn" class="ghost">Reset defaults</button><span class="sp"></span>
    <button id="cancelBtn" class="ghost">Cancel</button><button id="saveBtn" class="primary">Save</button>
  </div>
</dialog>
<div id="toast" role="status"></div>

<script>window.CX = {ctx: "<%= ctx %>", theme: "<%= theme %>", decimals: <%= decimals %>};</script>
<script src="<%= ctx %>/assets/js/units.js"></script>
<script src="<%= ctx %>/assets/js/app.js"></script>
</body>
</html>
