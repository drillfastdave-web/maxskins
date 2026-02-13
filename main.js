// MaxSkins — canonical main.js
// Filename must remain stable: /assets/js/main.js
// Purpose: lightweight UX helpers + active nav highlighting + (staging) contact form confirmation
(function () {
  const path = (location.pathname || "/").toLowerCase();

  // Determine the "section" from the first path segment
  // "/" -> home, "/features" -> features, "/app/player/" -> app
  const seg = path.split("/").filter(Boolean)[0] || "home";
  const section = seg; // home|features|rules|pricing|contact|app

  // Active link highlighting (supports both nav styles used across pages)
  const allLinks = Array.from(document.querySelectorAll("nav a[href]"));
  allLinks.forEach((a) => {
    const hrefRaw = (a.getAttribute("href") || "").toLowerCase();

    // Only handle site-internal links (/, /features, /app, etc.)
    if (!hrefRaw.startsWith("/")) return;

    const hrefSeg = hrefRaw.split("/").filter(Boolean)[0] || "home";
    const isActive =
      (section === "home" && hrefSeg === "home") ||
      (section !== "home" && hrefSeg === section);

    // Support both class conventions without forcing markup changes
    if (a.classList.contains("nav__link")) {
      a.classList.toggle("is-active", isActive);
    }
    if (a.classList.contains("pill")) {
      a.classList.toggle("active", isActive);
    }

    if (isActive) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  // Soft scroll for internal anchors
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", id);
  });

  // Contact form (staging): no network call, just local confirmation
  const form = document.querySelector('form[data-contact]');
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn ? btn.textContent : "";
      if (btn) {
        btn.textContent = "Sent (staging)";
        btn.disabled = true;
      }
      const note = document.querySelector('[data-contact-note]');
      if (note) {
        note.textContent =
          "Staging mode: message captured locally only. Wire to email/API when approved.";
      }
      setTimeout(() => {
        if (btn) {
          btn.textContent = original || "Send";
          btn.disabled = false;
        }
      }, 2200);
    });
  }
})();

// === Nav active-state (canonical) ===
(function () {
  try {
    var path = (location.pathname || "/").toLowerCase();
    if (!path.endsWith("/")) path += "/";
    var links = document.querySelectorAll(".nav .nav-link");
    links.forEach(function (a) {
      a.classList.remove("active");
      var href = (a.getAttribute("href") || "/").toLowerCase();
      if (href.length > 1 && !href.endsWith("/")) href += "/";
      if (href === "/" && path === "/") {
        a.classList.add("active");
        return;
      }
      if (href !== "/" && path.startsWith(href)) a.classList.add("active");
    });
  } catch (e) {}
})();

// ============================================================
// MaxSkins — Player Screen Module (Production)
// Boots only on pages containing [data-ms-player="1"]
// ============================================================
(function(){
  const root = document.querySelector('[data-ms-player="1"]');
  if (!root) return;

  // -------- Utilities --------
  const $ = (sel, el=document) => el.querySelector(sel);
  const nowISO = () => new Date().toISOString();

  // -------- HUD elements --------
  const holeNumEl = $('#holeNum');
  const holeParEl = $('#holePar');
  const playerNameEl = $('#playerName');

  // Score stepper
  const minus = $('#scoreMinus');
  const plus  = $('#scorePlus');
  const valEl = $('#scoreVal');

  // Pills
  const pillFairway = $('#pillFairway');
  const pillSand    = $('#pillSand');
  const pillGreen   = $('#pillGreen');
  const pillPutts   = $('#pillPutts');

  const pillPenalty   = $('#pillPenalty');
  const pillNotes     = $('#pillNotes');
  const pillFairwayAI = $('#pillFairwayAI');
  const pillGreenAI   = $('#pillGreenAI');

  const honorsPill = $('#honorsPill');
  const submitBtn  = $('#finalizeBtn');

  // -------- State (Phase 1 local) --------
  // In production this will be fed by round state / websocket. For now localStorage keeps it stable.
  const STATE_KEY = 'ms_player_state_v1';
  const SUBMIT_KEY = 'ms_submissions_v1';

  function loadState(){
    try{
      return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {};
    }catch(e){ return {}; }
  }
  function saveState(s){
    try{ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }catch(e){}
  }

  const state = Object.assign({
    hole: Number(holeNumEl?.textContent || 1),
    par:  Number(holeParEl?.textContent || 4),
    playerName: (playerNameEl?.textContent || 'Player').trim(),
    score: null, // set to par on boot
    fairway:false,
    sand:false,
    green:false,
    putts:0,
    penalty:0,
    submitted:false,
    lastSubmitAt:null
  }, loadState());

  // Default score to PAR on new-hole load (HARD LOCK)
  if (typeof state.score !== 'number' || isNaN(state.score)) state.score = state.par;

  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

  function renderScore(){
    if (valEl) valEl.textContent = String(clamp(state.score, 0, 99));
  }

  function setToggle(btn, on){
    if (!btn) return;
    btn.classList.toggle('active', !!on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  // -------- Toggle pills (non-exclusive HARD LOCK) --------
  function wireToggle(btn, key){
    if (!btn) return;
    btn.addEventListener('click', () => {
      state[key] = !state[key];
      setToggle(btn, state[key]);
      saveState(state);
    });
    setToggle(btn, state[key]);
  }
  wireToggle(pillFairway, 'fairway');
  wireToggle(pillSand, 'sand');
  wireToggle(pillGreen, 'green');

  // -------- Putts pill (HARD LOCK from session vault: 0-9 with hold reset; colors by ranges) --------
  (function(){
    const flag = $('#puttFlag');
    const num  = $('#puttNum');
    if (!pillPutts || !flag || !num) return;

    function setFlagClass(cls){
      flag.classList.remove('white','gold','green','red');
      flag.classList.add(cls);
    }

    function renderPutts(){
      const p = clamp(state.putts|0, 0, 9);
      state.putts = p;

      if (p === 0){
        setFlagClass('white'); num.textContent = '';
        pillPutts.classList.remove('active');
      } else if (p === 1){
        setFlagClass('gold'); num.textContent = '1';
        pillPutts.classList.add('active');
      } else if (p === 2){
        setFlagClass('green'); num.textContent = '2';
        pillPutts.classList.add('active');
      } else {
        setFlagClass('red'); num.textContent = String(p);
        pillPutts.classList.add('active');
      }
      saveState(state);
    }

    function inc(){ state.putts = ((state.putts|0) + 1) % 10; renderPutts(); }
    function reset(){ state.putts = 0; renderPutts(); }

    let holdTimer = null;
    let held = false;

    pillPutts.addEventListener('pointerdown', () => {
      held = false;
      holdTimer = setTimeout(() => { held = true; reset(); }, 1000);
    });
    const clearHold = () => { if (holdTimer){ clearTimeout(holdTimer); holdTimer = null; } };
    pillPutts.addEventListener('pointerup', () => { clearHold(); if (!held) inc(); });
    pillPutts.addEventListener('pointercancel', clearHold);
    pillPutts.addEventListener('pointerleave', clearHold);

    pillPutts.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); inc(); }
      if (e.key === 'Backspace' || e.key === 'Escape'){ e.preventDefault(); reset(); }
    });

    renderPutts();
  })();

  // -------- Penalty (Phase 1 minimal): tap increments counter, DOES NOT change score (HARD LOCK) --------
  function wirePenalty(){
    if (!pillPenalty) return;
    pillPenalty.addEventListener('click', () => {
      state.penalty = clamp((state.penalty|0) + 1, 0, 99);
      pillPenalty.classList.add('active');
      // Minimal UI: show count in label
      const bar = pillPenalty.querySelector('.labelBar');
      if (bar) bar.textContent = state.penalty > 0 ? `Penalty (+${state.penalty})` : 'Penalty';
      saveState(state);
    });
    // render
    const bar = pillPenalty?.querySelector('.labelBar');
    if (bar) bar.textContent = state.penalty > 0 ? `Penalty (+${state.penalty})` : 'Penalty';
    if (state.penalty > 0) pillPenalty.classList.add('active');
  }
  wirePenalty();

  // -------- Notes / AI placeholders (production-safe): no alert() --------
  function wireNoAlert(btn, msg){
    if (!btn) return;
    btn.addEventListener('click', () => {
      console.log('[MaxSkins]', msg);
      // future: open bottom drawer / modal
    });
  }
  wireNoAlert(pillNotes, 'Notes drawer (TODO Phase 1C)');
  wireNoAlert(pillFairwayAI, 'Fairway AI advisory (TODO)');
  wireNoAlert(pillGreenAI, 'Green AI advisory (TODO)');

  // -------- Score stepper (0-99) --------
  function setScore(n){
    state.score = clamp(n, 0, 99);
    renderScore();
    saveState(state);
  }
  if (minus) minus.addEventListener('click', () => setScore((state.score|0) - 1));
  if (plus)  plus.addEventListener('click',  () => setScore((state.score|0) + 1));
  renderScore();

  // -------- Honors pill (demo only) --------
  if (honorsPill){
    honorsPill.addEventListener('click', () => honorsPill.classList.toggle('active'));
  }

  // -------- Submit Score flow (HARD LOCK): Submit -> Confirm (2s window) -> Sent --------
  function playPutterTick(){
    // TODO: load audio assets; for now safe console marker.
    // HARD LOCK: no stepper/toggle sounds. Only post-success submit tick.
    console.log('[MaxSkins] PLAYER_SUBMIT_CONFIRMED (putter tick)');
  }

  function buildPacket(){
    return {
      playerName: state.playerName,
      hole: state.hole,
      par: state.par,
      score: state.score,
      fairway: !!state.fairway,
      sand: !!state.sand,
      green: !!state.green,
      putts: state.putts|0,
      penalty: state.penalty|0,
      submittedAt: nowISO()
    };
  }

  function pushSubmission(packet){
    try{
      const arr = JSON.parse(localStorage.getItem(SUBMIT_KEY) || '[]');
      arr.push(packet);
      localStorage.setItem(SUBMIT_KEY, JSON.stringify(arr));
      return true;
    }catch(e){
      return false;
    }
  }

  (function(){
    if (!submitBtn) return;
    let armed = false;
    let timer = null;

    function disarm(){
      armed = false;
      submitBtn.classList.remove('confirm');
      submitBtn.textContent = 'Submit Score';
      if (timer){ clearTimeout(timer); timer = null; }
    }

    // Initialize label
    submitBtn.textContent = 'Submit Score';

    submitBtn.addEventListener('click', () => {
      if (!armed){
        armed = true;
        submitBtn.classList.add('confirm');
        submitBtn.textContent = 'Confirm';
        timer = setTimeout(disarm, 2000); // HARD LOCK: 2s window
        return;
      }

      // second tap within window = send
      disarm();

      const packet = buildPacket();
      const ok = pushSubmission(packet);
      if (ok){
        state.submitted = true;
        state.lastSubmitAt = packet.submittedAt;
        saveState(state);
        playPutterTick();
        // Production-safe confirmation (no blocking alert)
        submitBtn.textContent = 'Sent';
        setTimeout(() => { submitBtn.textContent = 'Submit Score'; }, 1100);
      } else {
        // Failure case (HARD LOCK): no sound; allow retry
        submitBtn.textContent = 'Not sent';
        setTimeout(() => { submitBtn.textContent = 'Submit Score'; }, 1400);
      }
    });
  })();

  // Ensure hole/par reflect state (for future wiring)
  if (holeNumEl) holeNumEl.textContent = String(state.hole);
  if (holeParEl) holeParEl.textContent = String(state.par);

  // Persist initial
  saveState(state);
})();
