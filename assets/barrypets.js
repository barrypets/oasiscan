/*
 * barrypets: el botón de reservar para la web de un negocio (BARRY-562).
 *
 *   <div class="barrypets-reservar" data-negocio="ID" data-local="ID"
 *        data-formato="boton|servicios" data-color="#FF7A1A"
 *        data-servicios="ID,ID"></div>   (optional: only these, in the list)
 *   <script src="https://barrypets.es/widget.js" async></script>
 *
 * The booking opens over the shop's page in a frame of /reservar/{id}/embed,
 * the one route allowed in a frame (next.config.ts). Without barrypets Pro
 * the button goes to the shop's barrypets page instead. Everything from the
 * server goes in as text (textContent), never as HTML: this runs on their site.
 */
(function () {
  var me = document.currentScript;
  // A copy kept on the shop's own site says where barrypets is (data-origin).
  var origin = (me && me.getAttribute("data-origin")) || (me && me.src ? new URL(me.src).origin : "https://barrypets.es");
  var Z = 2147483000;

  function colorOf(c) { return /^#[0-9a-f]{6}$/i.test(c || "") ? c : "#FF7A1A"; }
  // White or dark letters, whichever reads on the shop's colour.
  function inkOn(hex) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 170 ? "#1c1917" : "#ffffff";
  }
  function el(tag, style, text) {
    var e = document.createElement(tag);
    if (style) e.style.cssText = style;
    if (text != null) e.textContent = text;
    return e;
  }
  function euros(n) { return (Math.round(n * 100) / 100).toLocaleString("es-ES") + " €"; }
  // "25 €", or "desde 20 €" when it depends on the pet. Same rule as the app
  // (lib/catalogPricing.ts): the floor is the cheapest size or the flat price;
  // coat and age only ever add on top, so they make it "desde" but never set it.
  function priceText(s) {
    function nums(o) { return Object.keys(o || {}).map(function (k) { return o[k]; }).filter(function (n) { return typeof n === "number"; }); }
    var sizes = nums(s.priceBySize);
    var extra = nums(s.priceByCoatType).concat(nums(s.priceByLifeStage));
    var all = (typeof s.price === "number" ? [s.price] : []).concat(sizes);
    if (!all.length) return "";
    var min = Math.min.apply(null, all);
    var varies = sizes.length > 0 || extra.some(function (n) { return n > 0; });
    return min > 0 || varies ? (varies ? "desde " : "") + euros(min) : "";
  }

  // Press feedback for our buttons: inline styles cannot hold :active, one small sheet does.
  function css() {
    if (document.getElementById("barrypets-css")) return;
    var st = el("style");
    st.id = "barrypets-css";
    st.textContent = ".barrypets-btn{transition:transform .16s cubic-bezier(.23,1,.32,1)}.barrypets-btn:active{transform:scale(.97)}" +
      "@media (prefers-reduced-motion:reduce){.barrypets-btn:active{transform:none;filter:brightness(.94)}}";
    document.head.appendChild(st);
  }
  var calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  // Enter with a strong ease-out, leave faster than it came. A phone gets a sheet from the bottom.
  function move(node, frames, ms, easing) {
    return node.animate ? node.animate(frames, { duration: ms, easing: easing, fill: "forwards" }) : null;
  }

  // Booked with a barrypets account (lib/admission.ts needsAccount), and the
  // requirements as the shop's page lists them (admissionLabels). Same lists as there.
  function needsAccount(ad) {
    ad = ad || {};
    return !!ad.accountOnly || ["neutered", "emergencyContact", "insurance", "noPpp"].some(function (k) { return ad[k]; });
  }
  function requirements(ad, services) {
    ad = ad || {};
    var trial = ad.trialItemId && services.filter(function (x) { return x.id === ad.trialItemId; })[0];
    return [ad.neutered && "Castrado", ad.emergencyContact && "Contacto de emergencia", ad.insurance && "Seguro de responsabilidad civil",
      ad.noPpp && "Sin razas PPP", ad.trialItemId && (trial ? "Antes: " + trial.name : "Prueba de adaptación previa"),
      ad.approval && "Cada reserva la confirma el negocio"].filter(Boolean);
  }

  // The service as on the shop's barrypets page (9 nov 2026): photo, price,
  // requirements and the whole description, then Reservar.
  function detail(s, color, services, book) {
    var d = el("div", "height:100%;overflow-y:auto;display:flex;flex-direction:column;font-family:system-ui,-apple-system,sans-serif;color:#1c1917;");
    if (/^https:\/\//.test(s.photo || "")) {
      var img = el("img", "display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:rgba(0,0,0,.05);flex:none;");
      img.src = s.photo;
      img.alt = s.name;
      img.onerror = function () { img.remove(); };
      d.appendChild(img);
    }
    var pad = el("div", "padding:20px 20px 8px;flex:1;");
    pad.appendChild(el("h2", "margin:0 44px 0 0;font-size:22px;line-height:1.25;font-weight:700;", s.name));
    var p = priceText(s);
    if (p) pad.appendChild(el("div", "margin-top:6px;font-size:17px;font-weight:700;", p));
    var req = requirements(s.admission, services);
    if (req.length) pad.appendChild(el("div", "margin-top:8px;font-size:13px;line-height:1.45;opacity:.65;", "Requisitos: " + req.join(" · ") + "."));
    if (s.description) pad.appendChild(el("p", "margin:14px 0 0;font-size:15px;line-height:1.6;white-space:pre-line;opacity:.85;", s.description));
    if (needsAccount(s.admission)) pad.appendChild(el("p", "margin:14px 0 0;font-size:14px;opacity:.75;", "Se reserva con una cuenta de barrypets."));
    d.appendChild(pad);
    // Always in reach, however long the description.
    var foot = el("div", "position:sticky;bottom:0;padding:12px 20px calc(12px + env(safe-area-inset-bottom));background:#fafaf9;border-top:1px solid rgba(0,0,0,.08);");
    var b = button("Reservar", color);
    b.style.width = "100%";
    b.onclick = book;
    foot.appendChild(b);
    d.appendChild(foot);
    return d;
  }

  // The booking over the shop's page; with a service, that service first, and
  // its Reservar turns the same window into the booking.
  function open(src, s, color, services) {
    var back = el("div", "position:fixed;inset:0;z-index:" + Z + ";background:rgba(28,25,23,.55);display:flex;align-items:center;justify-content:center;");
    var phone = window.innerWidth < 600;
    var box = el("div", "position:relative;background:#fafaf9;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);" +
      (phone ? "width:100%;height:100%;" : "width:480px;max-width:calc(100% - 32px);height:min(760px,calc(100% - 48px));border-radius:16px;"));
    var close = el("button", "position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:50%;border:0;background:#fff;color:#1c1917;font:600 22px/40px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2);", "×");
    close.type = "button";
    close.className = "barrypets-btn";
    close.setAttribute("aria-label", "Cerrar");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.appendChild(el("div"));
    box.appendChild(close);
    function book() {
      var frame = el("iframe", "border:0;width:100%;height:100%;display:block;");
      frame.src = src;
      frame.title = "Reservar cita con barrypets";
      box.replaceChild(frame, box.firstChild);
      box.setAttribute("aria-label", "Reservar cita");
      close.focus();
    }
    if (s) {
      box.replaceChild(detail(s, color, services, book), box.firstChild);
      box.setAttribute("aria-label", s.name);
    } else book();
    back.appendChild(box);
    var before = document.activeElement, overflow = document.documentElement.style.overflow;
    var leaving = false;
    function gone() {
      back.remove();
      document.documentElement.style.overflow = overflow;
      if (before && before.focus) before.focus();
    }
    function done() {
      if (leaving) return;
      leaving = true;
      document.removeEventListener("keydown", onKey);
      var fade = move(back, [{ opacity: 1 }, { opacity: 0 }], 160, "ease-out");
      if (!calm) move(box, phone ? [{ transform: "none" }, { transform: "translateY(100%)" }] : [{ transform: "none" }, { transform: "scale(.97)" }], 160, "ease-out");
      if (fade) fade.onfinish = gone; else gone();
    }
    function onKey(e) { if (e.key === "Escape") done(); }
    close.onclick = done;
    back.onclick = function (e) { if (e.target === back) done(); };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(back);
    move(back, [{ opacity: 0 }, { opacity: 1 }], 200, "ease-out");
    if (!calm) move(box, phone ? [{ transform: "translateY(100%)" }, { transform: "none" }] : [{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }],
      phone ? 320 : 220, phone ? "cubic-bezier(.32,.72,0,1)" : "cubic-bezier(.23,1,.32,1)");
    close.focus();
  }

  function button(label, color, small) {
    var b = el("button", "display:inline-block;border:0;border-radius:999px;cursor:pointer;font-family:inherit;font-weight:700;line-height:1.2;font-size:" + (small ? "14px" : "16px") + ";" +
      "padding:" + (small ? "8px 16px" : "12px 24px") + ";background:" + color + ";color:" + inkOn(color) + ";", label);
    b.type = "button";
    b.className = "barrypets-btn";
    return b;
  }

  function draw(host) {
    if (host.getAttribute("data-barrypets-listo")) return;
    host.setAttribute("data-barrypets-listo", "1");
    css();
    var id = host.getAttribute("data-negocio") || "";
    var sede = host.getAttribute("data-local") || "";
    if (!/^[\w-]{1,128}$/.test(id) || (sede && !/^[\w-]{1,128}$/.test(sede))) return;
    var list = host.getAttribute("data-formato") === "servicios";
    var color = colorOf(host.getAttribute("data-color"));
    var q = sede ? "sede=" + encodeURIComponent(sede) : "";
    var bookAt = function (item) {
      return origin + "/reservar/" + encodeURIComponent(id) + "/embed" + (q || item ? "?" : "") + q + (item ? (q ? "&" : "") + "item=" + encodeURIComponent(item) : "");
    };
    fetch(origin + "/api/booking-link?b=" + encodeURIComponent(id) + (q ? "&" + q : ""))
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (page) {
        // No online booking (no Pro, or switched off): the shop's page, in a new tab.
        if (page && page.open === false) {
          var a = el("a", "display:inline-block;text-decoration:none;border-radius:999px;font-family:inherit;font-weight:700;line-height:1.2;font-size:16px;padding:12px 24px;background:" + color + ";color:" + inkOn(color) + ";", "Reservar cita");
          a.href = origin + "/negocios/" + encodeURIComponent(id) + (q ? "?" + q : "");
          a.target = "_blank";
          a.className = "barrypets-btn";
          a.rel = "noopener";
          host.appendChild(a);
          return;
        }
        var ids = {};
        if (page) page.sedes.forEach(function (s) { s.serviceIds.forEach(function (x) { ids[x] = true; }); });
        // The shop may pick some services one by one (data-servicios).
        var only = (host.getAttribute("data-servicios") || "").split(",").filter(Boolean);
        // None of them offered any more: all of them, as with none picked.
        var offered = page ? page.services.filter(function (s) { return ids[s.id]; }) : [];
        var picked = offered.filter(function (s) { return only.indexOf(s.id) >= 0; });
        var services = picked.length ? picked : offered;
        // A hidden business (a demo) answers nothing here: the button, and
        // the booking decides who may see it.
        if (!list || !services.length) {
          var b = button("Reservar cita", color);
          b.onclick = function () { open(bookAt()); };
          host.appendChild(b);
          return;
        }
        var ul = el("ul", "list-style:none;margin:0;padding:0;font-family:inherit;");
        services.forEach(function (s) {
          // Photo, name, two lines of description and price; a tap shows the whole service (9 nov 2026).
          var li = el("li", "display:flex;align-items:flex-start;gap:14px;padding:16px 0;border-bottom:1px solid rgba(0,0,0,.1);");
          if (/^https:\/\//.test(s.photo || "")) {
            var img = el("img", "flex:0 0 64px;width:64px;height:64px;border-radius:12px;object-fit:cover;background:rgba(0,0,0,.05);");
            img.src = s.photo;
            img.alt = "";
            img.loading = "lazy";
            img.onerror = function () { img.remove(); };
            li.appendChild(img);
          }
          var text = el("div", "flex:1;min-width:0;");
          var show = function () { open(bookAt(s.id), s, color, services); };
          li.style.cursor = "pointer";
          li.onclick = show;
          var name = el("button", "background:none;border:0;padding:0;margin:0;font:inherit;font-weight:700;color:inherit;text-align:left;cursor:pointer;line-height:1.3;", s.name);
          name.type = "button";
          text.appendChild(name);
          if (s.description) text.appendChild(el("div", "font-size:14px;line-height:1.45;opacity:.75;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;", s.description));
          var p = [priceText(s), needsAccount(s.admission) ? "con cuenta de barrypets" : ""].filter(Boolean).join(" · ");
          var foot = el("div", "display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;");
          foot.appendChild(el("div", "font-size:14px;font-weight:600;", p));
          var b = button("Reservar", color, true);
          b.setAttribute("aria-label", "Reservar " + s.name);
          b.onclick = function (e) { e.stopPropagation(); open(bookAt(s.id)); };
          foot.appendChild(b);
          text.appendChild(foot);
          li.appendChild(text);
          ul.appendChild(li);
        });
        host.appendChild(ul);
      });
  }

  function all() { Array.prototype.forEach.call(document.querySelectorAll(".barrypets-reservar"), draw); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all);
  else all();
})();
