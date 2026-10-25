(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dot-matrix K ---------- */
  const canvas = document.querySelector(".dot-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const cols = 14;
    const rows = 18;
    const map = [
      "110000001111",
      "110000011111",
      "110000111011",
      "110001110011",
      "110011100011",
      "110111000011",
      "111110000011",
      "111100000011",
      "111110000011",
      "110111000011",
      "110011100011",
      "110001110011",
      "110000111011",
      "110000011111",
      "110000001111",
      "110000000011",
      "110000000011",
      "110000000011",
    ];
    const draw = (t = 0) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const gapX = w / (cols + 1);
      const gapY = h / (rows + 1);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < 12; x++) {
          if (map[y][x] !== "1") continue;
          const pulse = 0.65 + 0.35 * Math.sin(t * 0.003 + x * 0.4 + y * 0.25);
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${pulse})`;
          ctx.arc((x + 1.2) * gapX, (y + 1) * gapY, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- Sparklines ---------- */
  document.querySelectorAll(".spark").forEach((c, i) => {
    const ctx = c.getContext("2d");
    let phase = i * 12;
    const paint = () => {
      const w = c.width;
      const h = c.height;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = i === 0 ? "#ff6a1a" : "#d6ff4b";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin((x + phase) * 0.12) * (6 + i * 2) + Math.sin((x + phase) * 0.05) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += reduceMotion ? 0 : 1.2;
      if (!reduceMotion) requestAnimationFrame(paint);
    };
    paint();
  });

  /* ---------- Count-up ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const start = performance.now();
    const dur = 1100;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          cio.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Scroll progress + parallax + reveal ---------- */
  const progress = document.querySelector(".scroll-progress i");
  const aurora = document.querySelector(".hero__aurora");
  const reveals = document.querySelectorAll(".reveal, .glass");

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = `${p * 100}%`;
    if (aurora && !reduceMotion) {
      aurora.style.setProperty("--scroll-y", `${window.scrollY * 0.06}px`);
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if ("IntersectionObserver" in window) {
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          rio.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => rio.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Cursor glow ---------- */
  const glow = document.querySelector(".cursor-glow");
  if (glow && !reduceMotion && matchMedia("(pointer:fine)").matches) {
    document.body.classList.add("is-pointer");
    window.addEventListener("pointermove", (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  /* ---------- Horizontal work strip ---------- */
  const hscroll = document.querySelector("[data-hscroll]");
  const track = hscroll?.querySelector(".hscroll__track");
  if (hscroll && track) {
    const syncH = () => {
      const rect = hscroll.getBoundingClientRect();
      const total = hscroll.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      const maxX = Math.max(track.scrollWidth - window.innerWidth + 48, 0);
      const x = total > 0 ? (scrolled / total) * maxX : 0;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
    };
    // Give the section enough height for the scrub distance
    const resizeH = () => {
      const travel = Math.max(track.scrollWidth - window.innerWidth, window.innerWidth * 0.6);
      hscroll.style.height = `${window.innerHeight + travel}px`;
      syncH();
    };
    resizeH();
    window.addEventListener("scroll", syncH, { passive: true });
    window.addEventListener("resize", resizeH);
  }

  /* ---------- Service catalog ---------- */
  const SERVICES = {
    site: {
      title: "Сайт / доработка / авто",
      code: "01 / Web",
      desc: "Выберите тип задачи — покажу ориентир по цене и сроку.",
      time: "1–2 дня",
      build(root, update) {
        root.innerHTML = `
          <div class="ctrl">
            <label>Тип работ</label>
            <div class="opts" data-group="type">
              <button type="button" class="opt is-on" data-v="edit">Доработка</button>
              <button type="button" class="opt" data-v="new">Новый сайт</button>
              <button type="button" class="opt" data-v="auto">Автоматизация</button>
            </div>
          </div>`;
        const prices = { edit: 8000, new: 15000, auto: 5000 };
        const labels = { edit: "доработка сайта", new: "новый сайт", auto: "автоматизация" };
        let type = "edit";
        root.querySelectorAll(".opt").forEach((btn) => {
          btn.addEventListener("click", () => {
            root.querySelectorAll(".opt").forEach((b) => b.classList.remove("is-on"));
            btn.classList.add("is-on");
            type = btn.dataset.v;
            update({
              price: `от ${prices[type].toLocaleString("ru-RU")} ₽`,
              time: "1–2 дня",
              msg: `Здравствуйте! Нужна услуга: ${labels[type]}`,
            });
          });
        });
        update({
          price: `от ${prices.edit.toLocaleString("ru-RU")} ₽`,
          time: "1–2 дня",
          msg: "Здравствуйте! Нужна услуга: доработка сайта",
        });
      },
    },
    text: {
      title: "Тексты",
      code: "02 / Copy",
      desc: "Двигайте объём — цена считается от 150 ₽ за 1 000 знаков (минимум 1 000 ₽).",
      time: "1–3 дня",
      build(root, update) {
        root.innerHTML = `
          <div class="ctrl">
            <label>Объём: <span id="charsVal">3000</span> знаков</label>
            <input type="range" min="1000" max="20000" step="500" value="3000" id="chars" />
          </div>`;
        const input = root.querySelector("#chars");
        const label = root.querySelector("#charsVal");
        const calc = () => {
          const n = Number(input.value);
          label.textContent = n.toLocaleString("ru-RU");
          const price = Math.max(1000, Math.round((n / 1000) * 150));
          update({
            price: `≈ ${price.toLocaleString("ru-RU")} ₽`,
            time: n > 8000 ? "2–3 дня" : "1–2 дня",
            msg: `Здравствуйте! Нужен текст ~${n} знаков`,
          });
        };
        input.addEventListener("input", calc);
        calc();
      },
    },
    deck: {
      title: "Презентации",
      code: "03 / Deck",
      desc: "Базовый пакет 8–15 слайдов. Больше слайдов — уточним в чате.",
      time: "2–4 дня",
      build(root, update) {
        root.innerHTML = `
          <div class="ctrl">
            <label>Формат</label>
            <div class="opts">
              <button type="button" class="opt is-on" data-v="pptx">PPTX</button>
              <button type="button" class="opt" data-v="pdf">PDF</button>
              <button type="button" class="opt" data-v="both">Оба</button>
            </div>
          </div>`;
        let format = "PPTX";
        root.querySelectorAll(".opt").forEach((btn) => {
          btn.addEventListener("click", () => {
            root.querySelectorAll(".opt").forEach((b) => b.classList.remove("is-on"));
            btn.classList.add("is-on");
            format = btn.textContent.trim();
            update({
              price: "от 3 000 ₽",
              time: "2–4 дня",
              msg: `Здравствуйте! Нужна презентация, формат ${format}`,
            });
          });
        });
        update({
          price: "от 3 000 ₽",
          time: "2–4 дня",
          msg: "Здравствуйте! Нужна презентация, формат PPTX",
        });
      },
    },
    card: {
      title: "Карточки Ozon / WB",
      code: "04 / Market",
      desc: "Сколько карточек нужно? От 5 шт. обсудим скидку в чате.",
      time: "1–2 дня",
      build(root, update) {
        root.innerHTML = `
          <div class="ctrl">
            <label>Площадка</label>
            <div class="opts" data-g="mp">
              <button type="button" class="opt is-on" data-v="WB">Wildberries</button>
              <button type="button" class="opt" data-v="Ozon">Ozon</button>
              <button type="button" class="opt" data-v="Both">Обе</button>
            </div>
          </div>
          <div class="ctrl">
            <label>Количество: <span id="qtyVal">1</span></label>
            <input type="range" min="1" max="20" step="1" value="1" id="qty" />
          </div>`;
        let mp = "WB";
        const qty = root.querySelector("#qty");
        const qtyVal = root.querySelector("#qtyVal");
        const calc = () => {
          const n = Number(qty.value);
          qtyVal.textContent = String(n);
          const price = n * 200;
          update({
            price: `от ${price.toLocaleString("ru-RU")} ₽`,
            time: n > 5 ? "2–4 дня" : "1–2 дня",
            msg: `Здравствуйте! Нужны карточки ${mp}, количество: ${n}`,
          });
        };
        root.querySelectorAll("[data-g='mp'] .opt").forEach((btn) => {
          btn.addEventListener("click", () => {
            root.querySelectorAll("[data-g='mp'] .opt").forEach((b) => b.classList.remove("is-on"));
            btn.classList.add("is-on");
            mp = btn.dataset.v;
            calc();
          });
        });
        qty.addEventListener("input", calc);
        calc();
      },
    },
    "card-site": {
      title: "Сайт-визитка",
      code: "05 / Card site",
      desc: "Одна страница за день: кто вы, услуги, контакты, кнопка в мессенджер.",
      time: "1 день",
      build(root, update) {
        root.innerHTML = `
          <div class="ctrl">
            <label>Дополнительно</label>
            <div class="opts">
              <button type="button" class="opt is-on" data-v="0">Только визитка</button>
              <button type="button" class="opt" data-v="1500">+ форма заявки</button>
              <button type="button" class="opt" data-v="2500">+ мини-анимации</button>
            </div>
          </div>`;
        let extra = 0;
        let label = "только визитка";
        root.querySelectorAll(".opt").forEach((btn) => {
          btn.addEventListener("click", () => {
            root.querySelectorAll(".opt").forEach((b) => b.classList.remove("is-on"));
            btn.classList.add("is-on");
            extra = Number(btn.dataset.v);
            label = btn.textContent.trim();
            const price = 4000 + extra;
            update({
              price: `от ${price.toLocaleString("ru-RU")} ₽`,
              time: "1 день",
              msg: `Здравствуйте! Нужна сайт-визитка (${label})`,
            });
          });
        });
        update({
          price: "от 4 000 ₽",
          time: "1 день",
          msg: "Здравствуйте! Нужна сайт-визитка (только визитка)",
        });
      },
    },
  };

  const panel = document.getElementById("servicePanel");
  const panelTitle = document.getElementById("panelTitle");
  const panelDesc = document.getElementById("panelDesc");
  const panelCode = document.getElementById("panelCode");
  const panelControls = document.getElementById("panelControls");
  const panelPrice = document.getElementById("panelPrice");
  const panelTime = document.getElementById("panelTime");
  const panelOrder = document.getElementById("panelOrder");
  const cards = [...document.querySelectorAll(".glass")];

  const openService = (key) => {
    const cfg = SERVICES[key];
    if (!cfg || !panel) return;
    cards.forEach((c) => c.classList.toggle("is-active", c.dataset.service === key));
    panel.hidden = false;
    panelTitle.textContent = cfg.title;
    panelDesc.textContent = cfg.desc;
    panelCode.textContent = cfg.code;
    panelControls.innerHTML = "";
    cfg.build(panelControls, ({ price, time, msg }) => {
      panelPrice.textContent = price;
      panelTime.textContent = time;
      panelOrder.href = `https://t.me/Koding_md?text=${encodeURIComponent(msg)}`;
    });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }
  };

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openService(btn.dataset.open);
    });
  });

  cards.forEach((card) => {
    card.addEventListener("click", () => openService(card.dataset.service));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openService(card.dataset.service);
      }
    });
  });

  document.querySelector(".panel__close")?.addEventListener("click", () => {
    if (!panel) return;
    panel.hidden = true;
    cards.forEach((c) => c.classList.remove("is-active"));
  });

  /* Filters */
  const chips = document.querySelectorAll(".chip");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.toggle("is-on", c === chip);
        c.setAttribute("aria-selected", c === chip ? "true" : "false");
      });
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("is-dim", !show);
        card.hidden = false;
        if (!show && card.classList.contains("is-active") && panel) {
          panel.hidden = true;
          card.classList.remove("is-active");
        }
      });
    });
  });
})();
