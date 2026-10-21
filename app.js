function fillConfig() {
  $$("[data-cfg]").forEach((el) => {
    const key = el.dataset.cfg;
    const val = CONFIG[key];
    if (val === undefined) return;
    if (el.tagName === "A" && key === "email") {
      el.href = "mailto:" + val;
      el.textContent = val;
      return;
    }
    if (el.tagName === "A") {
      el.href = val;
      return;
    }
    el.textContent = val;
  });
  document.title = `${CONFIG.name} — ${CONFIG.role}`;
}

function renderHero() {
  const h1 = $("#heroName");
  if (h1) h1.textContent = CONFIG.name;
  const card = $("#bioCard");
  if (!card) return;
  const b = CONFIG.bio || {};
  const name = CONFIG.bioName || CONFIG.name;
  card.classList.toggle("is-mono", b.accent === false);
  if (b.accentColor) card.style.setProperty("--bio-bg", b.accentColor);
  $("#bioTitle").textContent = b.title || "Who is " + name + "?";
  $("#bioText").textContent = b.text || "";
  const els = $$(".hero-in");
  let shown = false;
  const show = () => {
    if (shown) return;
    shown = true;
    els.forEach((el, i) => setTimeout(() => el.classList.add("in"), i * 110));
  };
  document.addEventListener("site:ready", show, { once: true });
  setTimeout(show, REDUCED ? 60 : 2800);
}

const mediaKind = (u) =>
  !u
    ? "none"
    : /youtu\.?be|youtube\.com|vimeo\.com/i.test(u)
      ? "embed"
      : "file";

const localClips = new Map();
function probeLocal(slug) {
  if (!slug) return Promise.resolve("");
  if (localClips.has(slug)) return localClips.get(slug);
  const cfg = (CONFIG.video && CONFIG.video.media) || {
    localDir: "videos",
    exts: ["mp4", "webm"],
  };
  const urls = cfg.exts.map((ext) => cfg.localDir + "/" + slug + "." + ext);
  const p = urls.reduce(
    (acc, url) =>
      acc.then(
        (found) =>
          found ||
          fetch(url, { method: "HEAD", cache: "no-store" })
            .then((r) => (r.ok ? url : ""))
            .catch(() => ""),
      ),
    Promise.resolve(""),
  );
  localClips.set(slug, p);
  return p;
}

function ytID(u) {
  const m = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  return m ? m[1] : "";
}

function embedURL(u) {
  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  if (yt) {
    const origin = location.protocol.startsWith("http")
      ? "&origin=" + encodeURIComponent(location.origin)
      : "";
    return (
      "https://www.youtube.com/embed/" +
      yt[1] +
      "?autoplay=1&rel=0&modestbranding=1&enablejsapi=1" +
      origin
    );
  }
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) return "https://player.vimeo.com/video/" + vm[1] + "?autoplay=1";
  return u;
}

function cardMedia(item) {
  const kind = mediaKind(item.video);
  const out = [];
  if (!item.poster && kind === "file") {
    out.push('<video class="tile-poster" muted playsinline preload="metadata" aria-hidden="true" src="' + item.video + '"></video>');
  }
  if (kind === "file" || item.slug) {
    out.push(
      '<video class="tile-vid" muted loop playsinline preload="auto" aria-hidden="true"' +
        ' data-src="' +
        (kind === "file" ? item.video : "") +
        '"' +
        ' data-slug="' +
        (item.slug || "") +
        '"' +
        (item.poster ? ' poster="' + item.poster + '"' : "") +
        "></video>",
    );
  }
  if (kind === "embed") {
    out.push(
      '<span class="tile-embed" data-embed="' + item.video + '"></span>',
    );
  }
  if (item.poster) {
    out.unshift(
      '<img class="tile-poster" src="' +
        item.poster +
        '" alt="" aria-hidden="true"' +
        ' loading="lazy" decoding="async">',
    );
  }
  return out.join("");
}

function tileViz(item) {
  switch (item.viz) {
    case "v-bars":
      return `<div class="v v-bars">${Array.from({ length: 13 }, (_, i) => `<i style="animation-delay:${(i * 0.07).toFixed(2)}s"></i>`).join("")}</div>`;
    case "v-ring":
      return `<div class="v v-ring"><i></i><i></i><i></i><b></b></div>`;
    case "v-scan":
      return `<div class="v v-scan"><i></i><b></b></div>`;
    case "v-wave":
      return `<div class="v v-wave"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><path d="M0 50 Q 25 0 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50"/><path d="M0 50 Q 25 100 50 50 T 100 50 T 150 50 T 200 50 T 250 50 T 300 50"/></svg></div>`;
    case "v-stack":
      return `<div class="v v-stack"><i></i><i></i><i></i><i></i></div>`;
    case "v-type":
      return `<div class="v v-type"><b>${item.word || "EDIT"}</b></div>`;
    case "v-globe":
      return `<div class="v v-globe"><svg viewBox="-50 -50 100 100">${[1, 2, 3, 4].map((n, i) => `<ellipse rx="45" ry="${9 * n}" class="${i === 1 ? "eq2" : ""}"/>`).join("")}${[1, 2, 3, 4].map((n) => `<ellipse ry="45" rx="${9 * n}"/>`).join("")}<circle r="45" class="eq2"/></svg></div>`;
    case "v-burst":
      return `<div class="v v-burst">${Array.from({ length: 22 }, (_, i) => `<i style="--r:${i * (360 / 22)}deg;animation-delay:${(i * 0.04).toFixed(2)}s"></i>`).join("")}</div>`;
    case "v-crt":
      return `<div class="v v-crt"><b>${item.word || "EDIT"}</b></div>`;
    case "v-marquee":
      return `<div class="v v-marquee"><div class="mrow">${Array.from({ length: 6 }, () => `<span>${item.word || "EDIT"}</span>`).join("")}</div><div class="mrow">${Array.from({ length: 6 }, () => `<span>${item.word || "EDIT"}</span>`).join("")}</div></div>`;
    default:
      return `<div class="v v-bars">${Array.from({ length: 9 }, () => `<i></i>`).join("")}</div>`;
  }
}

function renderWork() {
  const build = (host, list) => {
    $(host).innerHTML = list
      .map((it, i) => {
        const ytBtn = it.yt
          ? `<a class="tile-yt" href="${it.yt}" target="_blank" rel="noopener noreferrer" aria-label="Watch on YouTube: ${it.title}" data-cursor="link"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 7.685 0 12 0 12s0 4.315.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 16.315 24 12 24 12s0-4.315-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>`
          : "";
        return `
      <article class="card reveal" data-cursor="view" style="transition-delay:${(i % 4) * 70}ms">
        <button class="tile${it.poster ? " has-poster" : ""}" type="button" data-reel data-title="${it.title}"
          data-video="${it.video || ""}" data-poster="${it.poster || ""}" data-slug="${it.slug || ""}"
          aria-label="Play preview: ${it.title}">
          <span class="viz-wrap">${tileViz(it)}</span>
          ${cardMedia(it)}
          <span class="rec"><i></i>${it.video ? "video" : "preview"}</span>
          <span class="hud"><span>${it.tags.filter((t) => !/^\d+:\d{2}$/.test(t)).join(" · ")}</span></span>
          <span class="tinfo"><b>${it.title}</b><i>${it.client}</i></span>
          <span class="vig"></span>
          <span class="play"><b>Play preview <span aria-hidden="true">▸</span></b></span>
          ${ytBtn}
        </button>
      </article>`;
      })
      .join("");
  };
  build("#gridAds", AD_WORK);
  build("#gridArtist", ARTIST_WORK);
}

(() => {
  const YT =
    /^https?:\/\/(www\.)?(youtube(-nocookie)?\.com|player\.vimeo\.com)$/i;
  const handshake = (f) => {
    try {
      f.contentWindow.postMessage(
        JSON.stringify({
          event: "listening",
          id: "pc" + Math.random().toString(36).slice(2),
          channel: "widget",
        }),
        "*",
      );
    } catch (e) {}
  };
  window.__ytHandshake = handshake;
  window.addEventListener("message", (e) => {
    if (!YT.test(e.origin)) return;
    let d = e.data;
    if (typeof d === "string") {
      try {
        d = JSON.parse(d);
      } catch (_) {
        return;
      }
    }
    if (!d) return;
    const isErr =
      d.event === "onError" ||
      (d.event === "infoDelivery" && d.info && d.info.playerState === -1);
    if (!isErr) return;
    const frame = Array.from(document.querySelectorAll("iframe")).find(
      (f) => f.contentWindow === e.source,
    );
    if (frame)
      frame.dispatchEvent(new CustomEvent("yt:error", { bubbles: true }));
  });
})();

function cardVideos() {
  const opts = CONFIG.video || {};
  const cards = $$(".card");
  if (!cards.length || REDUCED) return;

  const load = (v) => {
    if (v.dataset.src && !v.getAttribute("src"))
      v.setAttribute("src", v.dataset.src);
  };

  const embedSrc = (url) => {
    const id = ytID(url);
    if (id)
      return (
        "https://www.youtube-nocookie.com/embed/" +
        id +
        "?autoplay=1&mute=1&loop=1&playlist=" +
        id +
        "&enablejsapi=1" +
        "&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&disablekb=1"
      );
    return (
      embedURL(url) +
      (embedURL(url).includes("?") ? "&" : "?") +
      "autoplay=1&muted=1&loop=1&background=1"
    );
  };

  let reachCache = null;
  const canReachPlayers = () => {
    if (reachCache) return reachCache;
    reachCache = fetch("https://www.youtube.com/generate_204", {
      mode: "no-cors",
      cache: "no-store",
    })
      .then(() => true)
      .catch(() => false);
    return reachCache;
  };

  const mountEmbed = (card, box) => {
    if (box.dataset.mounted === "1") return;
    box.dataset.mounted = "pending";
    const url = box.dataset.embed || "";
    canReachPlayers().then((ok) => {
      if (!ok || !box.isConnected || box.dataset.mounted !== "pending") {
        box.dataset.mounted = "";
        return;
      }
      box.innerHTML = `<iframe src="${embedSrc(url)}" title="${(card.querySelector(".tinfo b") || card.querySelector("h3") || { textContent: "" }).textContent}"
          tabindex="-1" aria-hidden="true" allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      box.dataset.mounted = "1";
      const f = $("iframe", box);
      let confirmed = false;
      f.addEventListener(
        "load",
        () => {
          confirmed = true;
          card.classList.add("playing");
          window.__ytHandshake && window.__ytHandshake(f);
        },
        { once: true },
      );
      f.addEventListener("yt:error", () => {
        card.dataset.embedBlocked = "1";
        unmountEmbed(card, box);
      });
      setTimeout(() => {
        if (!confirmed && box.dataset.mounted === "1") unmountEmbed(card, box);
      }, 3000);
    });
  };

  const unmountEmbed = (card, box) => {
    if (!box.dataset.mounted) return;
    box.dataset.mounted = "";
    box.innerHTML = "";
    card.classList.remove("playing");
  };

  const play = (card) => {
    const box = $(".tile-embed", card);
    const v = $(".tile-vid:not(.tile-poster)", card);
    clearTimeout(card.__pt);
    if (!v) {
      if (box) card.__pt = setTimeout(() => mountEmbed(card, box), 140);
      return;
    }
    if (!v.getAttribute("src") && v.dataset.slug) {
      card.__pt = setTimeout(() => {
        probeLocal(v.dataset.slug).then((found) => {
          const src = found || v.dataset.src || "";
          if (!src) {
            if (box) mountEmbed(card, box);
            return;
          }
          v.setAttribute("src", src);
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        });
      }, 140);
      return;
    }
    if (!v.getAttribute("src") && v.dataset.src)
      v.setAttribute("src", v.dataset.src);
    if (v.getAttribute("src")) {
      load(v);
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
      return;
    }
    if (box) card.__pt = setTimeout(() => mountEmbed(card, box), 140);
  };
  const stop = (card) => {
    clearTimeout(card.__pt);
    const box = $(".tile-embed", card);
    if (box) unmountEmbed(card, box);
    const v = $(".tile-vid:not(.tile-poster)", card);
    if (!v) return;
    v.pause();
    if (opts.resetOnLeave !== false) {
      try {
        v.currentTime = 0;
      } catch (e) {}
    }
    card.classList.remove("playing");
  };

  cards.forEach((card) => {
    const box = $(".tile-embed", card);
    const v = $(".tile-vid:not(.tile-poster)", card);
    if (!v && !box) return;
    if (opts.playOnHover !== false) {
      card.addEventListener("pointerenter", () => play(card));
      card.addEventListener("focusin", () => play(card));
      card.addEventListener("pointerleave", () => {
        if (!v) stop(card);
      });
      card.addEventListener("focusout", () => {
        if (!v) stop(card);
      });
    }
    if (!v) return;
    v.addEventListener("playing", () => card.classList.add("playing"));
    v.addEventListener("error", () => {
      card.classList.remove("playing");
      v.removeAttribute("src");
      v.load();
    });
  });

  if (opts.playOnView) {
    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (calm.matches) return;
            const box = $(".tile-embed", e.target);
            if (box && !$(".tile-vid", e.target)) {
              mountEmbed(e.target, box);
              return;
            }
            if ($(".tile-vid", e.target)) play(e.target);
          } else stop(e.target);
        });
      },
      { threshold: 0.45 },
    );
    cards.forEach((c) => {
      if ($(".tile-vid", c) || $(".tile-embed", c)) io.observe(c);
    });
  }
}

function calc() {
  const range = $("#secs"),
    out = $("#total"),
    unitOut = $("#unitNote"),
    chipsBox = $("#calcChips"),
    catsBox = $("#catPick"),
    secLabel = $("#secLabel");
  if (!range || !out) return;
  const CATS = [
    { label: "Simple MVs", per: 45 },
    { label: "Simple AMVs", per: 40 },
    { label: "Complex MVs", per: 90 },
    { label: "Complex AMVs", per: 80 },
  ];
  let cat = 0;
  const price = (s) => (CATS[cat].per * s) / 60;
  const update = () => {
    const s = parseFloat(range.value);
    secLabel.firstChild.nodeValue = String(s);
    out.textContent = fmtMoney(price(s));
    unitOut.textContent = fmtMoney(CATS[cat].per) + " / minute";
    $$(".chip", chipsBox).forEach((ch) =>
      ch.classList.toggle("on", parseFloat(ch.dataset.secs) === s),
    );
    $$("button", catsBox).forEach((b, i) =>
      b.classList.toggle("on", i === cat),
    );
  };
  catsBox.innerHTML = CATS.map(
    (c, i) => `<button type="button" data-cat="${i}">${c.label}</button>`,
  ).join("");
  $$("button", catsBox).forEach((b) =>
    b.addEventListener("click", () => {
      cat = parseInt(b.dataset.cat, 10);
      update();
    }),
  );
  const presets = [10, 30, 60, 90, 120, 160];
  chipsBox.innerHTML = presets
    .map(
      (x) =>
        `<button class="chip" data-secs="${x}" type="button">${x}s</button>`,
    )
    .join("");
  $$(".chip", chipsBox).forEach((ch) =>
    ch.addEventListener("click", () => {
      range.value = ch.dataset.secs;
      update();
    }),
  );
  range.addEventListener("input", update);
  update();
}

function renderRates() {
  const host = $("#rates");
  if (!host) return;
  host.innerHTML =
    RATES.map((r) =>
      r.group
        ? `<li class="grp"><span class="lbl"><b>${r.group}</b></span><em class="mono">${r.tag}</em></li>`
        : `<li><span class="lbl">${r.label}</span><b>${r.price}${r.unit ? `<span>${r.unit}</span>` : ""}</b></li>`,
    ).join("") +
    `<li class="note">Prices in USD. 50% up front, 50% on delivery. Local payment methods available in Indonesia.</li>`;
}

function renderSelects() {
  const sel = $("#projectType");
  if (sel)
    sel.innerHTML = PROJECT_TYPES.map((p) => `<option>${p}</option>`).join("");
}

function preloader() {
  const pre = $("#preloader"),
    num = $("#preNum"),
    lines = $("#preLines");
  if (!pre) return;
  const MIN_MS = REDUCED ? 200 : 1500;
  const t0 = performance.now();
  const steps = [
    "Loading type",
    "Booting timeline",
    "Building the grid",
    "Ready",
  ];
  lines.innerHTML = steps.map((s) => `<span>${s}</span>`).join("");
  const spans = $$("span", lines);
  let n = 0,
    si = 0;
  const tick = setInterval(
    () => {
      n = Math.min(100, n + Math.random() * 9 + 3);
      num.textContent = String(Math.round(n));
      const idx = Math.min(
        steps.length - 1,
        Math.floor(n / (100 / steps.length)),
      );
      if (idx !== si) {
        spans.forEach((s) => s.classList.remove("on"));
        spans[idx].classList.add("on");
        si = idx;
      }
      if (n >= 100) {
        clearInterval(tick);
        spans.forEach((s) => s.classList.remove("on"));
        spans[steps.length - 1].classList.add("on");
        setTimeout(
          () => {
            pre.classList.add("done");
            document.body.classList.remove("is-locked");
            document.dispatchEvent(new CustomEvent("site:ready"));
            setTimeout(() => pre.remove(), 800);
          },
          Math.max(REDUCED ? 60 : 420, MIN_MS - (performance.now() - t0)),
        );
      }
    },
    REDUCED ? 20 : 55,
  );
  document.body.classList.add("is-locked");
}

function nav() {
  const el = $("#nav"),
    prog = $("#bar");
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    el.classList.toggle("scrolled", y > 40);
    el.classList.toggle("hide", y > 520 && y > last + 4);
    last = y;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    const pct = $("#footPct");
    if (pct)
      pct.firstChild.nodeValue = String(Math.round(h > 0 ? (y / h) * 100 : 0));
    const top = $("#toTop");
    if (top) top.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function rail() {
  const links = $$(".rail a");
  const ids = ["top", "work", "artist", "pricing", "tos", "contact"];
  const targets = ids.map((id) => document.getElementById(id)).filter(Boolean);
  let ticking = false;
  const markRail = () => {
    ticking = false;
    const mid = scrollY + innerHeight * 0.5;
    let current = targets[0];
    targets.forEach((t) => {
      if (t.getBoundingClientRect().top + scrollY <= mid) current = t;
    });
    if (current)
      links.forEach((a) =>
        a.classList.toggle(
          "active",
          a.getAttribute("href") === "#" + current.id,
        ),
      );
  };
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(markRail);
      }
    },
    { passive: true },
  );
  addEventListener("resize", markRail);
  markRail();

  const navLinks = $$(".nav-links a");
  const io2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle(
            "active",
            a.getAttribute("href") === "#" + e.target.id,
          ),
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  ids.forEach((id) => {
    const s = document.getElementById(id);
    if (s) io2.observe(s);
  });
}

function reveal() {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        obs.unobserve(e.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
  );
  $$(".reveal").forEach((el) => io.observe(el));
}

function cursor() {
  if (TOUCH) {
    document.body.classList.add("no-cursor");
    return;
  }
  const ring = $("#cursor"),
    dot = $("#cursorDot");
  let x = innerWidth / 2,
    y = innerHeight / 2,
    rx = x,
    ry = y;
  addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate3d(${x}px,${y}px,0)`;
    const hot = e.target.closest(
      "[data-cursor], a, button, input, textarea, select",
    );
    ring.classList.toggle(
      "is-big",
      !!hot && !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName),
    );
    ring.classList.toggle("is-hide", false);
  });
  addEventListener("mouseleave", () => {
    ring.classList.add("is-hide");
    dot.classList.add("is-hide");
  });
  addEventListener("mouseenter", () => {
    ring.classList.remove("is-hide");
    dot.classList.remove("is-hide");
  });
  addEventListener("mousedown", () => ring.classList.add("is-big"));
  addEventListener("mouseup", () => ring.classList.remove("is-big"));
  (function loop() {
    rx += (x - rx) * 0.16;
    ry += (y - ry) * 0.16;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    requestAnimationFrame(loop);
  })();
}

function clock() {
  const el = $("#clock");
  const zones = [
    ["#tzId", "Asia/Jakarta"],
    ["#tzUs", "America/New_York"],
    ["#tzJp", "Asia/Tokyo"],
  ];
  const fmt = (tz, sec) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        ...(sec ? { second: "2-digit" } : {}),
        hour12: false,
      }).format(new Date());
    } catch (e) {
      return "--:--";
    }
  };
  const tick = () => {
    if (el) el.textContent = fmt(CONFIG.timezone, true) + " " + CONFIG.city;
    zones.forEach(([sel, tz]) => {
      const n = $(sel);
      if (n) n.textContent = fmt(tz, false);
    });
  };
  tick();
  setInterval(tick, 1000);
}

const Sound = (() => {
  const TRACK =
    "https://soundcloud.com/seal_of_approval/an-uncomfortable-middle-ground";
  let widget = null,
    ready = false,
    on = false,
    wantPlay = false;
  let vol = 60;
  try {
    const saved = parseInt(localStorage.getItem("ichihaaren-vol"), 10);
    if (!isNaN(saved)) vol = Math.min(100, Math.max(0, saved));
  } catch (e) {}

  const syncUI = () => {
    $$(".sound-toggle").forEach((b) => {
      b.dataset.on = String(on);
      b.setAttribute("aria-pressed", String(on));
      const l = $(".label", b);
      if (l) l.textContent = on ? "Music on" : "Music off";
    });
    const sp = $("#spPlay");
    if (sp) sp.textContent = on ? "Pause" : "Play";
  };
  const note = (msg) => {
    const n = $("#spNote");
    if (n && msg) n.textContent = msg;
  };

  const bind = () => {
    if (!window.SC || !$("#scFrame")) return false;
    widget = window.SC.Widget($("#scFrame"));
    widget.bind(window.SC.Widget.Events.READY, () => {
      ready = true;
      widget.setVolume(vol);
      note("SoundCloud · loops automatically");
      if (wantPlay) widget.play();
    });
    widget.bind(window.SC.Widget.Events.PLAY, () => {
      on = true;
      syncUI();
    });
    widget.bind(window.SC.Widget.Events.PAUSE, () => {
      on = false;
      syncUI();
    });
    widget.bind(window.SC.Widget.Events.FINISH, () => {
      try {
        widget.seekTo(0);
        widget.play();
      } catch (e) {}
    });
    widget.bind(window.SC.Widget.Events.ERROR, () =>
      note("Player error — open it on SoundCloud ↗"),
    );
    return true;
  };

  const ensure = () => {
    const frame = $("#scFrame");
    if (!frame) return;
    if (!frame.getAttribute("src")) {
      frame.src =
        "https://w.soundcloud.com/player/?url=" +
        encodeURIComponent(TRACK) +
        "&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false";
    }
    if (window.SC) {
      if (!widget) bind();
      return;
    }
    if (document.querySelector("script[data-sc-api]")) return;
    const sc = document.createElement("script");
    sc.src = "https://w.soundcloud.com/player/api.js";
    sc.dataset.scApi = "1";
    sc.onload = () => {
      if (!widget) bind();
      if (wantPlay && !ready)
        setTimeout(() => {
          if (wantPlay && widget && !ready) {
          }
        }, 50);
    };
    sc.onerror = () => note("Offline — music needs an internet connection");
    document.head.appendChild(sc);
    let tries = 0;
    const iv = setInterval(() => {
      if (widget || ++tries > 40) clearInterval(iv);
      else if (window.SC) bind();
    }, 250);
  };

  return {
    get on() {
      return on;
    },
    get volume() {
      return vol;
    },
    toggle() {
      wantPlay = !on;
      ensure();
      if (!widget || !ready) {
        note("Loading player…");
        return wantPlay;
      }
      if (on) widget.pause();
      else widget.play();
      return !on;
    },
    setVolume(v) {
      vol = Math.min(100, Math.max(0, Math.round(v)));
      try {
        localStorage.setItem("ichihaaren-vol", String(vol));
      } catch (e) {}
      if (widget && ready) widget.setVolume(vol);
      const val = $("#spVolVal");
      if (val) val.textContent = vol + "%";
      const range = $("#spVol");
      if (range && parseInt(range.value, 10) !== vol) range.value = String(vol);
    },
  };
})();

function soundUI() {
  const gear = $("#soundGear"),
    panel = $("#soundPanel");
  const range = $("#spVol"),
    playBtn = $("#spPlay");
  if (range) {
    range.value = String(Sound.volume);
    const v = $("#spVolVal");
    if (v) v.textContent = Sound.volume + "%";
  }
  if (range)
    range.addEventListener("input", () =>
      Sound.setVolume(parseInt(range.value, 10)),
    );
  if (playBtn) playBtn.addEventListener("click", () => Sound.toggle());
  if (!gear || !panel) return;
  const close = () => {
    panel.hidden = true;
    gear.setAttribute("aria-expanded", "false");
  };
  gear.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = panel.hidden;
    panel.hidden = !open;
    gear.setAttribute("aria-expanded", String(open));
  });
  panel.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function heroCanvas() {
  const c = $("#heroCanvas");
  if (!c) return;
  const ctx = c.getContext("2d");
  let w = 0,
    h = 0,
    t = 0,
    raf = null,
    live = true;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    w = r.width;
    h = r.height;
    c.width = Math.max(1, w * dpr);
    c.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = (dt) => {
    t += dt;
    ctx.clearRect(0, 0, w, h);
    const cx = w * 0.5,
      cy = h * 0.44,
      R = Math.min(w, h) * 0.34;
    const sy = (((t * 0.16) % 1.6) - 0.3) * h;
    const g = ctx.createLinearGradient(0, sy - 90, 0, sy + 90);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,.055)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, sy - 90, w, 180);
    for (let i = 0; i < 26; i++) {
      const seed = i * 12.9898;
      const px = ((Math.sin(seed) * 0.5 + 0.5) * w + t * (6 + (i % 5) * 4)) % w;
      const py =
        (Math.cos(seed * 1.7) * 0.5 + 0.5) * h + Math.sin(t * 0.6 + i) * 8;
      const a = 0.05 + 0.12 * Math.abs(Math.sin(t * 0.5 + i));
      ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
      ctx.fillRect(px, py, 1.6, 1.6);
    }
  };

  let prev = performance.now();
  const loop = (now) => {
    const raw = (now - prev) / 1000;
    const dt = Number.isFinite(raw) && raw > 0 ? Math.min(0.05, raw) : 0;
    prev = now;
    draw(dt);
    raf = live && !REDUCED ? requestAnimationFrame(loop) : null;
    if (REDUCED) {
      draw(0);
      raf = null;
    }
  };
  const start = () => {
    if (!raf && !REDUCED) {
      prev = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const stop = () => {
    if (raf) (cancelAnimationFrame(raf), (raf = null));
  };

  resize();
  if (REDUCED) {
    draw(0.6);
  } else start();
  addEventListener("resize", () => {
    resize();
    if (REDUCED) draw(0.6);
  });
  new IntersectionObserver(
    (e) => {
      live = e[0].isIntersecting;
      live ? start() : stop();
    },
    { threshold: 0.02 },
  ).observe(c);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
}

function reel() {
  const modal = $("#reel"),
    box = $(".modal-box", modal);
  const c = $("#reelCanvas");
  if (!modal || !c) return;
  const ctx = c.getContext("2d");
  let raf = null,
    t = 0,
    prev = 0,
    w = 0,
    h = 0;
  let reelTitle = "";
  const mediaHost = $("#modalMedia"),
    strip = $(".mstrip", modal),
    sceneName = $("#sceneName");
  const openers = [$("#openReel"), $("#openReel2")].filter(Boolean);

  async function showMedia(item) {
    const src =
      (item && item.video) || (CONFIG.showreel && CONFIG.showreel.video) || "";
    let local = item && item.slug ? await probeLocal(item.slug) : "";
    if (!local && mediaKind(src) === "file") local = src;
    if (local) {
      pause();
      if (local !== (mediaHost.dataset.src || "")) {
        mediaHost.dataset.src = local;
        mediaHost.innerHTML =
          '<video src="' +
          local +
          '"' +
          (item && item.poster ? ' poster="' + item.poster + '"' : "") +
          ' controls autoplay playsinline preload="metadata"></video>';
      }
      mediaHost.hidden = false;
      if (strip) strip.hidden = true;
      if (sceneName)
        sceneName.textContent =
          (item && item.title) || CONFIG.name + " — showreel";
      const lv = $("video", mediaHost);
      if (lv) {
        const pl = lv.play();
        if (pl && pl.catch) pl.catch(() => {});
      }
      return true;
    }
    const kind = mediaKind(src);
    const poster =
      (item && item.poster) ||
      (CONFIG.showreel && CONFIG.showreel.poster) ||
      "";
    const label = (item && item.title) || CONFIG.name + " — showreel";
    if (!mediaHost) return false;
    if (kind === "none") {
      mediaHost.hidden = true;
      mediaHost.innerHTML = "";
      if (strip) strip.hidden = false;
      resetCanvas();
      play();
      return false;
    }
    pause();
    if (src !== (mediaHost.dataset.src || "")) {
      mediaHost.dataset.src = src;
      mediaHost.innerHTML =
        kind === "embed"
          ? `<iframe src="${embedURL(src)}" title="${label}" loading="eager"
             allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`
          : `<video src="${src}"${poster ? ` poster="${poster}"` : ""} controls autoplay playsinline preload="metadata"></video>`;
    }
    mediaHost.hidden = false;
    if (strip) strip.hidden = true;
    if (sceneName) sceneName.textContent = label;
    const v = $("video", mediaHost);
    if (v) {
      const p = v.play();
      if (p && p.catch) p.catch(() => {});
    }
    const frame = $("iframe", mediaHost);
    if (frame) {
      frame.addEventListener(
        "load",
        () => window.__ytHandshake && window.__ytHandshake(frame),
        { once: true },
      );
      frame.addEventListener("yt:error", () => {
        const watch = src
          .replace(/\/embed\//, "/watch?v=")
          .replace("youtu.be/", "youtube.com/watch?v=");
        mediaHost.innerHTML = `<div class="media-fallback">
            <div class="mf-kicker mono">Can't be embedded</div>
            <p>YouTube won't allow this clip to play inside another site. You can still watch it on YouTube — or drop an <b>mp4</b> in the <code>videos/</code> folder and the card will play it inline.</p>
            <a class="btn" href="${watch}" target="_blank" rel="noopener noreferrer">Watch on YouTube <span class="ar" aria-hidden="true">↗</span></a>
          </div>`;
      });
    }
    return true;
  }
  function clearMedia() {
    if (!mediaHost) return;
    const v = $("video", mediaHost);
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    mediaHost.innerHTML = "";
    mediaHost.hidden = true;
    mediaHost.dataset.src = "";
    if (strip) strip.hidden = false;
  }

  let current = null;
  const resetCanvas = () => {
    t = 0;
    cur = -1;
  };
  let play = () => {};
  let pause = () => {};

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = c.getBoundingClientRect();
    w = r.width;
    h = r.height;
    c.width = Math.max(1, w * dpr);
    c.height = Math.max(1, h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const scenes = [
    {
      name: "REEL INTRO",
      draw(t) {
        const s = 0.9 + Math.sin(t * 1.2) * 0.02;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.scale(s, s);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 ${Math.min(w * 0.115, 150)}px "Bebas Neue", Impact, sans-serif`;
        ctx.fillText(
          (reelTitle || CONFIG.name).toUpperCase().slice(0, 26),
          0,
          -10,
        );
        ctx.font = `400 ${Math.min(w * 0.022, 22)}px "Space Mono", monospace`;
        ctx.fillStyle = "rgba(255,255,255,.66)";
        ctx.fillText(
          "SHOWREEL — " + new Date().getFullYear(),
          0,
          Math.min(w * 0.085, 96),
        );
        ctx.restore();
        const bw = w / 12;
        for (let i = 0; i < 12; i++) {
          const p = (t * 0.6 + i * 0.06) % 1;
          ctx.fillStyle =
            "rgba(255,255,255," + (0.06 * (1 - p)).toFixed(3) + ")";
          ctx.fillRect(i * bw + bw * 0.5, 0, bw * 0.02, h);
        }
      },
    },
    {
      name: "AUDIO BARS",
      draw(t) {
        const n = 44,
          bw = w / n;
        for (let i = 0; i < n; i++) {
          const v =
            (Math.sin(t * 3 + i * 0.5) * 0.5 + 0.5) *
            (0.35 + 0.65 * Math.abs(Math.sin(i * 0.31)));
          const bh = 20 + v * h * 0.62;
          ctx.fillStyle =
            "rgba(255,255,255," + (0.35 + v * 0.6).toFixed(3) + ")";
          ctx.fillRect(i * bw + bw * 0.22, h / 2 - bh / 2, bw * 0.55, bh);
        }
        ctx.strokeStyle = "rgba(255,255,255,.35)";
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      },
    },
    {
      name: "KINETIC TYPE",
      draw(t) {
        const words = ["PROMOS", "VISUALIZERS", "PRODUCT ADS", "MOGRAPH"];
        const idx = Math.floor(t / 1.4) % words.length;
        const lt = (t % 1.4) / 1.4;
        const off = (1 - Math.min(1, lt * 3)) * 60;
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.font = `700 ${Math.min(w * 0.1, 130)}px "Bebas Neue", Impact, sans-serif`;
        ctx.globalAlpha = Math.min(1, (1 - lt) * 3.2);
        ctx.fillText(words[idx], Math.sin(t * 6) * 6, off);
        ctx.restore();
        ctx.globalAlpha = 1;
      },
    },
    {
      name: "RINGS + GRID",
      draw(t) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.setLineDash([4, 10]);
          ctx.strokeStyle =
            "rgba(255,255,255," + (0.4 - i * 0.06).toFixed(3) + ")";
          const r =
            Math.min(w, h) * 0.1 +
            i * Math.min(w, h) * 0.075 +
            Math.sin(t * 1.4 + i) * 6;
          ctx.arc(
            0,
            0,
            r,
            t * (i % 2 ? -0.5 : 0.5),
            t * (i % 2 ? -0.5 : 0.5) + Math.PI * 1.6,
          );
          ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,.09)";
        for (let x = 0; x < w; x += 48) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 48) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      },
    },
  ];

  let cur = -1;
  const clampDt = (now, prev) => {
    const dt = (now - prev) / 1000;
    return Number.isFinite(dt) && dt > 0 ? Math.min(0.05, dt) : 0;
  };
  const draw = (now) => {
    const dt = clampDt(now, prev);
    prev = now;
    t += dt;
    if (!Number.isFinite(t) || t < 0) t = 0;
    const sIdx =
      ((Math.floor(t / 3.2) % scenes.length) + scenes.length) % scenes.length;
    if (sIdx !== cur) {
      cur = sIdx;
      $$(".mstrip i").forEach((d, i) => d.classList.toggle("on", i === sIdx));
      $("#sceneName").textContent = scenes[sIdx].name;
    }
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);
    const sg = ctx.createRadialGradient(
      w / 2,
      h / 2,
      0,
      w / 2,
      h / 2,
      Math.max(w, h) * 0.7,
    );
    sg.addColorStop(0, "rgba(255,255,255,.07)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.globalAlpha = Math.min(1, t * 1.6) > 0.99 ? 1 : 1;
    (scenes[sIdx] || scenes[0]).draw(t);
    ctx.restore();
    const tc = (() => {
      const s = Math.floor(t % 60),
        f = Math.floor((t % 1) * 24);
      return (
        "00:" + String(s).padStart(2, "0") + ":" + String(f).padStart(2, "0")
      );
    })();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.font = `400 11px "Space Mono", monospace`;
    ctx.textAlign = "left";
    ctx.fillText("REC ●", 14, h - 14);
    ctx.textAlign = "right";
    ctx.fillText(tc, w - 14, h - 14);
    ctx.textAlign = "center";
    ctx.fillText(
      CONFIG.name.toUpperCase() + " — " + CONFIG.role.toUpperCase(),
      w / 2,
      h - 14,
    );
    ctx.strokeStyle = "rgba(255,255,255,.14)";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    if (raf) raf = requestAnimationFrame(draw);
  };
  play = () => {
    resize();
    t = 0;
    cur = -1;
    prev = performance.now();
    if (!raf) raf = requestAnimationFrame(draw);
  };
  pause = () => {
    if (raf) (cancelAnimationFrame(raf), (raf = null));
  };

  const ambientRefresh = () => {
    $$("#gridAds .tile-vid, #gridArtist .tile-vid").forEach((v) => {
      const card = v.closest(".card");
      const r = card.getBoundingClientRect();
      const on = r.bottom > 0 && r.top < innerHeight;
      if (on && !v.paused) return;
      if (on) play(card);
      else stop(card);
    });
  };
  const openM = () => {
    $$(".tile-vid").forEach((v) => {
      v.pause();
      v.closest(".card").classList.remove("playing");
    });
    modal.classList.add("on");
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => {
      showMedia(current).then((used) => {
        if (!used) play();
      });
    });
    setTimeout(() => $("#closeReel") && $("#closeReel").focus(), 300);
  };
  const closeM = () => {
    modal.classList.remove("on");
    document.body.classList.remove("is-locked");
    pause();
    clearMedia();
    current = null;
    setTimeout(ambientRefresh, 350);
  };
  openers.forEach((o) =>
    o.addEventListener("click", (e) => {
      e.preventDefault();
      reelTitle = "";
      current = null;
      openM();
    }),
  );
  document.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-reel]");
    if (!tile) return;
    e.preventDefault();
    reelTitle = tile.dataset.title || "";
    current = {
      title: reelTitle,
      video: tile.dataset.video || "",
      poster: tile.dataset.poster || "",
      slug: tile.dataset.slug || "",
    };
    openM();
  });
  $("#closeReel").addEventListener("click", closeM);
  modal.addEventListener("click", (e) => {
    if (!e.target.closest(".modal-box")) closeM();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("on")) closeM();
  });
  addEventListener("resize", () => {
    if (modal.classList.contains("on")) resize();
  });
}

function hexField() {
  const c = $("#hexCanvas");
  if (!c) return;
  const host = c.parentElement;
  const opts = CONFIG.hex || {};
  if (opts.enabled === false) {
    host.style.display = "none";
    return;
  }
  const ctx = c.getContext("2d");
  const fc = document.createElement("canvas");
  const fx = fc.getContext("2d");
  const BSCALE = 0.22;
  let w = 0,
    h = 0,
    raf = null;
  let mx = -1e4,
    my = -1e4,
    lastMove = -1e4,
    lastDraw = 0,
    trail = [],
    parts = [];
  const PSTEP = innerWidth < 700 ? 9 : 8;

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = host.clientWidth || innerWidth;
    h = host.clientHeight || innerHeight;
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fc.width = Math.max(2, Math.round(w * BSCALE));
    fc.height = Math.max(2, Math.round(h * BSCALE));
    fx.setTransform(BSCALE, 0, 0, BSCALE, 0, 0);
    const n = Math.max(28, Math.min(95, Math.round((w * h) / 17000)));
    parts = [];
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 2.1,
        halo: 5 + Math.random() * 13,
        vy: 5 + Math.random() * 15,
        sway: 6 + Math.random() * 20,
        ph: Math.random() * 6.2832,
        tw: 0.25 + Math.random() * 0.8,
        a: 0.25 + Math.random() * 0.55,
      });
    }
  }

  function blob(c2, x, y, r, grey, a, sy) {
    c2.save();
    c2.translate(x, y);
    if (sy) c2.scale(1, sy);
    const g = c2.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, "rgba(" + grey + "," + grey + "," + grey + "," + a + ")");
    g.addColorStop(1, "rgba(" + grey + "," + grey + "," + grey + ",0)");
    c2.fillStyle = g;
    c2.fillRect(-r, -r, r * 2, r * 2);
    c2.restore();
  }
  function flux(x, y, t) {
    const nx = x / Math.max(w, 1),
      ny = y / Math.max(h, 1);
    let b =
      0.16 +
      0.13 *
        Math.sin(nx * 3.4 + t * 0.24 + Math.sin(ny * 2.8 - t * 0.17) * 1.7) +
      0.11 *
        Math.sin(
          (nx - ny) * 5.2 - t * 0.19 + Math.sin(nx * 4.1 + t * 0.11) * 1.2,
        ) +
      0.08 * Math.sin(ny * 7.6 + t * 0.13 + nx * 3.0);
    const ribbons = [
      [0.72, 0.3 + 0.09 * Math.sin(t * 0.051), 0.11, 2.3, 0.15, 0.15, 0.55],
      [
        -0.58,
        0.66 + 0.08 * Math.sin(t * 0.044 + 2.0),
        0.1,
        2.7,
        -0.11,
        0.13,
        0.45,
      ],
      [
        0.35,
        0.85 + 0.07 * Math.sin(t * 0.06 + 4.0),
        0.08,
        3.2,
        0.09,
        0.11,
        0.38,
      ],
    ];
    for (const [slope, base, amp, freq, spd, thick, gain] of ribbons) {
      const cy =
        base +
        slope * (nx - 0.5) +
        amp * Math.sin(nx * freq + t * spd + base * 9.0);
      const dd = Math.abs(ny - cy) / thick;
      if (dd < 1) b += gain * (1 - dd) * (1 - dd);
    }
    return b;
  }

  function draw(t) {
    const dt = lastDraw ? Math.min(0.05, t - lastDraw) : 0.016;
    lastDraw = t;
    const now = performance.now();
    trail = trail.filter((p) => now - p.t0 < 950);
    const M = Math.max(w, h);

    ctx.fillStyle = "#030304";
    ctx.fillRect(0, 0, w, h);
    fx.globalCompositeOperation = "source-over";
    fx.clearRect(0, 0, w, h);
    fx.globalCompositeOperation = "lighter";
    blob(
      fx,
      w * (0.22 + 0.09 * Math.sin(t * 0.07)),
      h * (0.3 + 0.1 * Math.sin(t * 0.052 + 2)),
      M * 0.55,
      165,
      0.2,
      0.55,
    );
    blob(
      fx,
      w * (0.78 + 0.07 * Math.cos(t * 0.06)),
      h * (0.62 + 0.09 * Math.sin(t * 0.046 + 4)),
      M * 0.5,
      140,
      0.17,
      0.6,
    );
    blob(
      fx,
      w * (0.55 + 0.11 * Math.sin(t * 0.041 + 1)),
      h * (0.88 + 0.05 * Math.cos(t * 0.058)),
      M * 0.44,
      115,
      0.12,
      0.5,
    );
    const bands = [
      [0.3, 0.72, 2.3, 0.15, 0.11],
      [0.66, -0.58, 2.7, -0.11, 0.1],
      [0.85, 0.35, 3.2, 0.09, 0.08],
    ];
    for (const [base0, slope, freq, spd, amp] of bands) {
      const base = base0 + 0.07 * Math.sin(t * 0.05 + base0 * 7.0);
      for (const [lw, a] of [
        [110, 0.035],
        [54, 0.05],
        [20, 0.07],
      ]) {
        fx.beginPath();
        for (let x = -40; x <= w + 40; x += 36) {
          const nx = x / Math.max(w, 1);
          const y =
            (base +
              slope * (nx - 0.5) +
              amp * Math.sin(nx * freq + t * spd + base0 * 9.0)) *
            h;
          x === -40 ? fx.moveTo(x, y) : fx.lineTo(x, y);
        }
        fx.strokeStyle = "rgba(225,225,225," + a + ")";
        fx.lineWidth = lw;
        fx.lineCap = "round";
        fx.stroke();
      }
    }
    fx.globalCompositeOperation = "source-over";
    blob(
      fx,
      w * (0.86 + 0.05 * Math.sin(t * 0.05 + 1)),
      h * (0.16 + 0.06 * Math.cos(t * 0.043)),
      M * 0.5,
      0,
      0.36,
      0.7,
    );
    blob(
      fx,
      w * (0.1 + 0.05 * Math.cos(t * 0.048 + 3)),
      h * (0.72 + 0.06 * Math.sin(t * 0.055)),
      M * 0.44,
      0,
      0.28,
      0.7,
    );
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(fc, 0, 0, fc.width, fc.height, 0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      const age = 1 - (now - p.t0) / 950;
      if (age <= 0) continue;
      blob(ctx, p.x, p.y, 8 + 30 * (1 - age), 235, 0.15 * age * age, 1);
    }
    const idle = TOUCH || performance.now() - lastMove > 3200;
    const gx = idle ? w * (0.5 + 0.33 * Math.sin(t * 0.21)) : mx;
    const gy = idle ? h * (0.5 + 0.29 * Math.sin(t * 0.29 + 1.1)) : my;
    blob(ctx, gx, gy, 190, 235, 0.12, 1);
    ctx.globalCompositeOperation = "source-over";
    const tp = trail.slice(-14);
    const paths = [];
    for (let k = 0; k <= 8; k++) paths.push(new Path2D());
    let row = 0;
    for (let y = PSTEP / 2; y < h + PSTEP; y += PSTEP, row++) {
      for (
        let x = PSTEP / 2 + (row % 2) * PSTEP * 0.5;
        x < w + PSTEP;
        x += PSTEP
      ) {
        let b = flux(x, y, t) * 0.62;
        const d = Math.hypot(x - gx, y - gy);
        if (d < 180) b += (1 - d / 180) * 0.5;
        for (let i = 0; i < tp.length; i++) {
          const p = tp[i];
          const age = 1 - (now - p.t0) / 950;
          if (age <= 0) continue;
          const dx = x - p.x,
            dy = y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 1444) b += (1 - Math.sqrt(d2) / 38) * 0.55 * age;
        }
        const k = Math.round(Math.max(0, Math.min(1, b)) * 8);
        if (k < 1) continue;
        const r = 0.3 + (k / 8) * PSTEP * 0.4;
        paths[k].moveTo(x + r, y);
        paths[k].arc(x, y, r, 0, 6.2832);
      }
    }
    ctx.fillStyle = "#fff";
    for (let k = 1; k <= 8; k++) {
      ctx.globalAlpha = 0.08 + (k / 8) * 0.82;
      ctx.fill(paths[k]);
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const pt of parts) {
      pt.y -= pt.vy * dt;
      pt.ph += dt * pt.tw;
      if (pt.y < -20) {
        pt.y = h + 20;
        pt.x = Math.random() * w;
      }
      const px = pt.x + Math.sin(pt.ph * 0.9 + pt.y * 0.012) * pt.sway * 0.35;
      const tw = 0.55 + 0.45 * Math.sin(pt.ph * 2.2);
      const alpha = pt.a * tw;
      if (alpha <= 0.02) continue;
      const g = ctx.createRadialGradient(px, pt.y, 0, px, pt.y, pt.halo);
      g.addColorStop(0, "rgba(255,255,255," + alpha * 0.3 + ")");
      g.addColorStop(0.4, "rgba(255,255,255," + alpha * 0.12 + ")");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, pt.y, pt.halo, 0, 6.2832);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255," + Math.min(0.95, alpha) + ")";
      ctx.beginPath();
      ctx.arc(px, pt.y, pt.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.restore();
    const v = ctx.createRadialGradient(
      w / 2,
      h * 0.44,
      Math.min(w, h) * 0.35,
      w / 2,
      h * 0.5,
      M * 0.78,
    );
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,.45)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(now) {
    draw(now / 1000);
    raf = requestAnimationFrame(frame);
  }
  const start = () => {
    if (!raf && !REDUCED) raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  };

  build();
  if (REDUCED) {
    draw(2.2);
    return;
  }
  addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(mx - last.x, my - last.y) > 7) {
        trail.push({ x: mx, y: my, t0: performance.now() });
        if (trail.length > 46) trail.splice(0, trail.length - 46);
      }
    },
    { passive: true },
  );
  addEventListener("resize", () => {
    build();
    if (REDUCED) draw(2.2);
  });
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  new IntersectionObserver(
    (e) => {
      e[0].isIntersecting ? start() : stop();
    },
    { threshold: 0 },
  ).observe(host);
  start();
}

function aboutArtClick() {
  const f = document.querySelector(".about-art");
  if (!f) return;
  f.setAttribute("title", "Click");
  const wrap = f.querySelector(".about-slides");
  const slides = [...f.querySelectorAll(".about-slide")];
  slides.forEach((img) => {
    img.draggable = false;
  });
  let idx = 0;
  const go = (n, dir) => {
    f.dataset.dir = dir || (n > idx ? "next" : "prev");
    idx = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle("on", i === idx));
    f.dataset.slide = String(idx + 1);
  };

  let timer = null,
    terlihat = true;
  const stopAuto = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  const startAuto = () => {
    stopAuto();
    if (
      slides.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    timer = setInterval(() => {
      if (terlihat && !document.hidden) go(idx + 1);
    }, 5000);
  };
  new IntersectionObserver(
    (en) => {
      terlihat = en[0].isIntersecting;
    },
    { threshold: 0.15 },
  ).observe(f);
  startAuto();

  let y0 = null,
    dy = 0,
    barusanDrag = false;
  const rotBase = () =>
    f.classList.contains("is-rot") ? " rotate(2.5deg) scale(1.05)" : "";
  wrap.addEventListener("pointerdown", (e) => {
    y0 = e.clientY;
    dy = 0;
    wrap.classList.add("dragging");
    wrap.setPointerCapture(e.pointerId);
    stopAuto();
  });
  wrap.addEventListener("pointermove", (e) => {
    if (y0 === null) return;
    dy = e.clientY - y0;
    wrap.style.transform = `translateY(${dy}px)${rotBase()}`;
  });
  const lepas = () => {
    if (y0 === null) return;
    wrap.classList.remove("dragging");
    wrap.style.transform = "";
    if (Math.abs(dy) > 55) {
      go(idx + (dy < 0 ? 1 : -1), dy < 0 ? "next" : "prev");
      barusanDrag = true;
    } else if (Math.abs(dy) > 8) barusanDrag = true;
    y0 = null;
    dy = 0;
    startAuto();
  };
  wrap.addEventListener("pointerup", lepas);
  wrap.addEventListener("pointercancel", lepas);

  f.addEventListener("click", () => {
    if (barusanDrag) {
      barusanDrag = false;
      return;
    }
    go(idx + 1, "next");
    startAuto();
  });
}

function forms() {
  const toast = $("#toast");
  const fire = (msg) => {
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(fire._t);
    fire._t = setTimeout(() => toast.classList.remove("on"), 3600);
  };
  const cf = $("#contactForm");
  if (cf) {
    cf.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(cf).entries());
      let bad = false;
      const need = { name: 2, email: 5, about: 8 };
      Object.keys(need).forEach((k) => {
        const f = cf.querySelector(`[name="${k}"]`);
        const field = f.closest(".field");
        const ok =
          (data[k] || "").trim().length >= need[k] &&
          (k !== "email" || /.+@.+\..+/.test(data.email));
        field.classList.toggle("err", !ok);
        $(".msg", field).textContent = ok
          ? ""
          : k === "email"
            ? "Enter a valid e-mail."
            : "This one is required.";
        if (!ok) bad = true;
      });
      if (bad) {
        fire("Check the highlighted fields");
        return;
      }
      try {
        localStorage.setItem(
          "yw_brief",
          JSON.stringify({ ...data, sentAt: Date.now() }),
        );
      } catch (err) {}
      cf.style.display = "none";
      const done = $("#contactSent");
      done.classList.add("on");
      $("#mailFallback").href =
        "mailto:" +
        CONFIG.email +
        "?subject=" +
        encodeURIComponent("New project — " + data.name) +
        "&body=" +
        encodeURIComponent(
          `Name: ${data.name}\nEmail: ${data.email}\nReach me at: ${data.socials || "-"}\nType: ${data.type || "-"}\nDeadline: ${data.when || "-"}\n\n${data.about}`,
        );
      fire("Brief saved — opening e-mail");
      setTimeout(() => open($("#mailFallback").href, "_blank"), 500);
    });
  }
  $$("[data-copy]").forEach((b) =>
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        fire("E-mail copied");
      } catch (err) {
        fire("Copy failed — select it manually");
      }
    }),
  );
}

function magnetic() {
  if (TOUCH || REDUCED) return;
  $$(".btn, .chip, .sound-toggle").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) / r.width;
      const my = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.transform = `translate(${mx * 7}px,${my * 7}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

function mountHeroVideo() {
  const video = Object.assign(document.createElement("video"), {
    className: "hero-video",
    autoplay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "metadata",
  });
  video.src = CONFIG.hero.video;
  $(".hero-bg").prepend(video);
}

function boot() {
  mountHeroVideo();
  fillConfig();
  renderHero();
  renderWork();
  renderRates();
  renderSelects();
  preloader();
  nav();
  rail();
  reveal();
  clock();
  if (!TOUCH) cursor();
  heroCanvas();
  hexField();
  reel();
  cardVideos();
  calc();
  forms();
  magnetic();
  $$(".sound-toggle").forEach((b) =>
    b.addEventListener("click", () => Sound.toggle()),
  );
  soundUI();
  aboutArtClick();
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
  addEventListener("load", reveal);
}
boot();
