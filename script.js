// Update a CSS variable with how much of one viewport height has been scrolled
window.addEventListener("scroll", setScrollVar);
window.addEventListener("resize", setScrollVar);

function setScrollVar() {
  const html = document.documentElement;
  const percentOfScreenHeightScrolled = html.scrollTop / html.clientHeight;
  html.style.setProperty("--scroll", Math.min(percentOfScreenHeightScrolled * 100, 100));
}
setScrollVar();
// --- Typing effect inside the white panel ---
window.addEventListener("load", () => {
  const el = document.querySelector(".typing");
  if (!el) return;

  new Typed(".typing", {
    strings: [
     // "Everything is connected.",
     "Ethical creation is always relational."

    ], 
    typeSpeed: 70,
    backSpeed: 40,
    backDelay: 1400,
    startDelay: 200,
    smartBackspace: true,
    loop: true,
    showCursor: true,
    cursorChar: "|"
  });
});

// === Smooth replay-on-scroll for section <h2> using IntersectionObserver ===
(() => {
  const headings = document.querySelectorAll(".full-screen-section h2, .page-head .scroll-reveal h2");
  if (!("IntersectionObserver" in window) || headings.length === 0) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target); // prevent flicker
      }
    });
  }, {
    root: null,
    rootMargin: "0px",
    threshold: 0.45,
  });

  headings.forEach((h2) => io.observe(h2));
})();
;

// === Shrink #about <h2> as you scroll ===
(() => {
  const aboutH2 = document.querySelector('#about > h2');
  if (!aboutH2) return;

  function updateH2Scale() {
    const rect = aboutH2.getBoundingClientRect();
    const vh   = window.innerHeight;

    // Start shrinking when the heading's top reaches 45% of the viewport,
    // finish shrinking by the time it reaches 10% from the top.
    const start = vh * 0.45;
    const end   = vh * 0.25;

    // progress: 0 (no shrink) -> 1 (fully shrunk)
    const tRaw = (start - rect.top) / (start - end);
    const t = Math.max(0, Math.min(1, tRaw));

    // Scale from 1.00 down to 0.80
    const scale = 1 - t * 0.80;

    aboutH2.style.setProperty('--h2-scale', scale.toFixed(3));
  }

  // Run and keep updated
  updateH2Scale();
  window.addEventListener('scroll', updateH2Scale, { passive: true });
  window.addEventListener('resize', updateH2Scale);
})();

document.addEventListener('DOMContentLoaded', () => {
  const fillEl = document.querySelector('.scroll-fill-text');
  if (!fillEl) return;

  // 1) Reveal the paragraph once it enters the viewport
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      fillEl.classList.add('visible');
    }
  }, { threshold: 0.15 });
  io.observe(fillEl);

  // 2) Drive the top→bottom fill based on how much of the element is in view
  const updateFill = () => {
    const rect = fillEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // Compute a smooth 0 → 1 progress as it comes into view
    // Start filling when the top is ~80% down the viewport; finish when centered
    const start = vh * 0.25;        // tweak to fill earlier/later
    const end   = vh * 0.15;        // where fill reaches 100%
    const raw   = (start - rect.top) / (start - end);
    const progress = Math.min(1, Math.max(0, raw));

    fillEl.style.setProperty('--text-fill', `${progress * 100}%`);
  };

  updateFill();
  window.addEventListener('scroll', updateFill, { passive: true });
  window.addEventListener('resize', updateFill);
});

document.addEventListener("DOMContentLoaded", () => {
  const pinned = document.querySelector(".pinned-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          pinned.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 } // Trigger when 20% of section is visible
  );

  observer.observe(pinned);
});

// Work Section Interactive 
    (function() {
      const reveals = document.querySelectorAll('.scroll-reveal');
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      reveals.forEach(el => observer.observe(el));
    })();

    (function () {
  const viewer   = document.getElementById('viewer');
  if (!viewer) return;

  const content  = document.getElementById('viewerContent');
  const closeBtn = viewer.querySelector('.viewer__close');
  const cards    = document.querySelectorAll('.columns .col');
  let lastFocused = null;

  function openViewer(type, src, isPowerpoint) {
    lastFocused = document.activeElement;

    // Reset any previous state
    viewer.classList.remove('viewer--pdf');
    content.innerHTML = '';

    const isPdfLike = isPowerpoint || type === 'pdf';
    let el;

    if (type === 'video') {
      el = document.createElement('video');
      el.src = src;
      el.controls = true;
      el.autoplay = true;
    } else if (type === 'pdf') {
      // real PDF: iframe
      el = document.createElement('iframe');
      el.src = src;
      el.setAttribute('frameborder', '0');
      el.setAttribute('allowfullscreen', '');
    } else {
      // images (jpg/png/etc.)
      el = document.createElement('img');
      el.src = src;
      el.alt = '';
    }

    el.className = 'viewer__media';
    content.appendChild(el);

    if (isPdfLike) {
      viewer.classList.add('viewer--pdf'); // zoom + internal scroll mode
    }

    viewer.classList.add('is-open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    closeBtn.focus();
  }

  function closeViewer() {
    viewer.classList.remove('is-open', 'viewer--pdf');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    content.innerHTML = '';

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  // Attach handlers to design grid cards
  cards.forEach(card => {
    const type = card.dataset.type;
    const src  = card.dataset.src;
    if (!type || !src) return;

    const isPowerpoint = 
    card.classList.contains('powerpoint') || 
    card.classList.contains('layout');

    function activate(e) {
      if (
        e.type === 'click' ||
        (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))
      ) {
        e.preventDefault();
        openViewer(type, src, isPowerpoint);
      }
    }

    card.addEventListener('click', activate);
    card.addEventListener('keydown', activate);
  });

  // Close behaviours
  closeBtn.addEventListener('click', closeViewer);

  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) {
      closeViewer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewer.classList.contains('is-open')) {
      closeViewer();
    }
  });
})();

// === Scroll text reveal (no paid plugins) ===
gsap.registerPlugin(ScrollTrigger);

(function () {
  const block = document.querySelector(".scroll-fill-text");
  if (!block) return;

  // 1) Split on <br> and wrap each segment in .reveal-line spans
  //    (preserves your manual line breaks from the HTML)
  const raw = block.innerHTML
    .split(/<br\s*\/?>/i)
    .map(s => s.trim())
    .filter(Boolean);

  block.innerHTML = raw
    .map((segment, i) => `<span class="reveal-line" data-i="${i}">${segment}</span>${i < raw.length - 1 ? "<br>" : ""}`)
    .join("");

  const lines = block.querySelectorAll(".reveal-line");

  // Respect reduced motion
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    lines.forEach(el => {
      el.style.transform = "none";
      el.style.backgroundSize = "100% 100%";
    });
    block.style.opacity = 1;
    block.style.transform = "none";
  }
})();

// 2) Intro fade for the block
    const block = document.getElementById('about');
    ScrollTrigger.create({
      trigger: block,
      start: "top 80%",
      onEnter: () => block.classList.add('visible')
    });

    // 3) Line-by-line fill (left→right), sequencing top→bottom
    const lines = gsap.utils.toArray(".scroll-fill-text .reveal-line");

    gsap.to(lines, {
      backgroundSize: "100% 100%",
      opacity: 1,
      y: 0,
      ease: "power2.out",
      duration: 0.9,
      stagger: {
        each: 0.65,    // time between lines
        from: "start", // top → bottom
      },
      scrollTrigger: {
        trigger: block,
        start: "top 30%",
        end: "bottom 30%",
        scrub: true,
        // once: true
      }
    });

// Research Section 

(() => {
  /**
   * Converts vertical scroll into horizontal translation for any [data-hscroll] section.
   * - Sets the section height to 100vh + (trackWidth - viewportWidth)
   * - While the section is in view, translates the track left by the vertical progress.
   */
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function setupSection(section) {
    const viewport = section.querySelector('.hscroll__viewport');
    const track = section.querySelector('.hscroll__track');

    function measure() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const trackWidth = track.scrollWidth;          // total px width of all panels
      const extra = Math.max(0, trackWidth - vw);    // how far we need to move horizontally
      // Give the section enough vertical height to drive the horizontal distance
      section.style.height = `calc(100vh + ${extra}px)`;
      return { trackWidth, extra, vw, vh };
    }

    let dims = measure();

    function onScroll() {
      const start = section.offsetTop;                    // top of the section
      const end = start + section.offsetHeight - window.innerHeight; // when we unpin
      const y = window.pageYOffset;
      const progress = clamp((y - start) / (end - start || 1), 0, 1);
      const x = -progress * (dims.trackWidth - dims.vw);  // negative to move left
      track.style.transform = `translate3d(${x}px,0,0)`;
      // expose progress so other logic (like Panel C vertical scroll) can read it
      section.dataset.hscrollProgress = String(progress);
    }

    // Recompute on resize / fonts load
    const ro = new ResizeObserver(() => { dims = measure(); onScroll(); });
    ro.observe(track);
    window.addEventListener('resize', () => { dims = measure(); onScroll(); }, { passive:true });
    window.addEventListener('scroll', onScroll, { passive:true });

    // Kick off
    onScroll();
  }

  document.querySelectorAll('[data-hscroll]').forEach(setupSection);
})();
// Design Shrink

// === Shrink #design <h2> as you scroll ===
(() => {
  const designH2 = document.querySelector('#design h2');
  if (!designH2) return;

  function updateDesignScale() {
    const rect = designH2.getBoundingClientRect();
    const vh = window.innerHeight;

    // Start shrinking when the heading's top reaches 45% of the viewport,
    // finish shrinking by the time it reaches 10% from the top.
    const start = vh * 0.8;
    const end = vh * 0.4;

    // progress: 0 (no shrink) -> 1 (fully shrunk)
    const tRaw = (start - rect.top) / (start - end);
    const t = Math.max(0, Math.min(1, tRaw));

    // Scale from 1.00 down to 0.80
    const scale = 1 - t * 0.75; // same shrink ratio as #about

    designH2.style.setProperty('--h2-scale', scale.toFixed(3));
  }

  window.addEventListener('scroll', updateDesignScale);
  window.addEventListener('resize', updateDesignScale);
})();

// === Shrink and move up "design" heading when .wrap-design scrolls ===
(() => {
  gsap.registerPlugin(ScrollTrigger);

  const designH2 = document.querySelector(".wrap-design .scroll-reveal h2");
  if (!designH2) return;

  gsap.to(designH2, {
    scrollTrigger: {
      trigger: ".wrap-design",
      start: "top 1%",  // 10% of section has entered (≈ 10% scroll)
      end: "1%",    // finishes by the time top of section hits 10% viewport
      scrub: true,
    },
  });
})();
// === Shrink #teaching on scroll (mobile only) ===
(() => {
  const teaching = document.querySelector('#teaching');
  if (!teaching) return;

  function updateTeachingScale() {
    // Only apply on mobile
    if (window.innerWidth > 900) {
      teaching.style.removeProperty('--h2-scale');
      return;
    }

    const rect = teaching.getBoundingClientRect();
    const vh   = window.innerHeight;

    // Same idea: start shrinking around mid-screen, finish near top
    const start = vh * 0.8;
    const end   = vh * 0.4;

    const tRaw = (start - rect.top) / (start - end);
    const t = Math.max(0, Math.min(1, tRaw));

    // Scale from 1.00 → 0.80 (gentler than your about block)
    const scale = 1 - t * 0.75;

    teaching.style.setProperty('--h2-scale', scale.toFixed(3));
  }

  updateTeachingScale();
  window.addEventListener('scroll', updateTeachingScale, { passive: true });
  window.addEventListener('resize', updateTeachingScale);
})();
/* ===== On-Scroll “Watch-Intro” Text Reveal (no libraries) ===== */
(() => {
  const blocks = document.querySelectorAll('[data-reveal]');

  blocks.forEach(block => {
    block.querySelectorAll('.reveal-line').forEach(line => {
      const letters = [...line.textContent];
      line.textContent = '';
      letters.forEach(ch => {
        const span = document.createElement('span');
        span.className = 'letter';
        if (ch === " ") span.innerHTML = "&nbsp;";
        else span.textContent = ch;
        line.appendChild(span);
      });
    });
  });

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      animateBlock(el);
      obs.unobserve(el);
    });
  }, { threshold:0.45 });

  blocks.forEach(b => io.observe(b));

  function animateBlock(block){
    const lines = [...block.querySelectorAll('.reveal-line')];
    lines.forEach((line, li) => {

      line.animate(
        [
          { transform:'translateY(22px)', opacity:.88, backgroundSize:'0% 100%' },
          { transform:'translateY(0)', opacity:1, backgroundSize:'100% 100%' }
        ],
        { duration:820, delay:120 + li * 160, easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' }
      );

      const letters = [...line.querySelectorAll('.letter')];
      letters.forEach((span, i) => {
        span.animate(
          [
            { transform:'translateY(18px)', opacity:0 },
            { transform:'translateY(0)', opacity:1 }
          ],
          { duration:380, delay:320 + li * 160 + i * 12,
            easing:'cubic-bezier(.2,.7,.2,1)', fill:'forwards' }
        );
      });
    });
  }
})();
// === Smooher Scrolling ===
gsap.registerPlugin(ScrollTrigger);

gsap.to("#design h2", {
  scale: 0.35, // shrinking in size "design"
  scrollTrigger: {
    trigger: "#design",
    start: "top center",
    end: "bottom top",
    scrub: true
  }
});

// Smooth scroll with easing
window.addEventListener('scroll', function() {
  clearTimeout(window.scrollTimeout);
  window.scrollTimeout = setTimeout(() => {
    window.requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = 'smooth';
    });
  }, 50);
});

// Intersection Observer reveal
const cards = document.querySelectorAll('.reveal');

// Use a lower threshold on mobile so things reveal sooner
const isMobile = window.innerWidth <= 900;

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, {
  threshold: isMobile ? 0.1 : 0.35,    // 👈 earlier on mobile
  // You could also tweak rootMargin if you want it even earlier:
  // rootMargin: isMobile ? "0px 0px -15%" : "0px"
});

cards.forEach(el => io.observe(el));

// === Per-word hover fill for the "relational design quote" ===
(function () {
  const quote = document.querySelector('section[aria-label="relational design quote"] .watch-reveal');
  if (!quote) return;

  // For each line, wrap words in <span class="word">…</span>
  const lines = quote.querySelectorAll('.reveal-line');
  lines.forEach(line => {
    const words = line.textContent
      .trim()
      .split(/\s+/)
      .map(w => {
        // preserve punctuation attached to the end of a word
        const m = w.match(/^(.+?)([.,;:!?]+)?$/);
        const core = m ? m[1] : w;
        const punct = m && m[2] ? m[2] : '';
        return `<span class="word" tabindex="0" aria-label="${core}">${core}</span>${punct ? `<span aria-hidden="true">${punct}</span>` : ''}`;
      })
      .join(' ');
    line.innerHTML = words;
  });

  // Delegate hover fill via a tiny class toggle (useful if you want to do more later)
  quote.addEventListener('mouseover', (e) => {
    const word = e.target.closest('.word');
    if (word) word.classList.add('is-filled');
  });
  quote.addEventListener('mouseout', (e) => {
    const word = e.target.closest('.word');
    if (word) word.classList.remove('is-filled');
  });

  // Optional: make the experience nice on touch (tap to fill/unfill)
  quote.addEventListener('click', (e) => {
    const word = e.target.closest('.word');
    if (word) {
      word.classList.toggle('is-filled');
    }
  });
})();

// === Principles (Pinned Two Columns) ===
// Pinned section with scroll-progress-driven swaps
(() => {
  const eyebrowEl = document.getElementById('p-eyebrow');
  const titleEl   = document.getElementById('p-title');
  const introEl   = document.getElementById('p-intro');
  const bodyEl    = document.getElementById('p-body');
  const asideEl   = document.getElementById('p-aside');
  const section   = document.querySelector('section.principles');

  if (!eyebrowEl || !titleEl || !introEl || !bodyEl || !asideEl || !section) return;

  // Content steps (edit freely)
  const steps = [
     {
      title: 'Decolonial Design Researcher',
      body: 'A design scholar and practitioner working at the intersection of three domains: ethics and relational accountability, decolonial digital sovereignty, and design-led methodologies for AI and data systems.',
    },

    {
      title: 'Ethics and Relational Accountability',
      body: 'Here my work foregrounds how knowledge is produced and whose worldviews are authorized within scholarly practice. Grounded in decolonial theory and sustained relationships with Indigenous Elders, this domain critiques extractive academic traditions and proposes relational methodologies that centre consent, continuing accountability, and epistemic justice.',
      // aside: 'Craft, care, and attention.'
    },
    {
      title: 'Decolonial Digital Sovereignty',
      body: 'This domain treats digital design as an explicit site of ethical and political practice rather than neutral infrastructure. I develop relational design methods that embed Indigenous data sovereignty, care-based ethics, and community-defined governance into system design. The DRAW platform emerges as a methodological intervention: a co-created, sovereign, and accountable digital environment that resists extractive UX norms.',
      // aside: 'Curiosity as an operating system.'
    },
    {
      title: 'Design-Led Methodologies for AI and Data Systems',
      body: 'Here I examine how algorithmic infrastructures reproduce digital colonialism, amplify structural inequities, and undermine procedural fairness. I develop decolonial governance approaches that integrate relational consent, accountability, and transparency into AI policy and oversight. The critique here moves toward systemic intervention, proposing governance mechanisms capable of reshaping how public institutions deploy AI in ways that honour dignity and uphold justice.',
      // aside: 'Kind honesty creates alignment.'
    }
    // {
      // title: 'Lead by example',
      // intro: 'Show the culture by embodying it.',
      // body: 'Model the standards you expect from others. Set tempo, define quality, and demonstrate how to respond under pressure with grace.',
      // aside: 'Culture is learned by watching.'
    // }
  ];

  // Keep CSS --steps in sync with data length
  document.documentElement.style.setProperty('--steps', steps.length);

  // Gentle crossfade swap
  const swap = (data) => {
    titleEl.style.opacity = 0; titleEl.style.transform = 'translateY(6px)';
    bodyEl.style.opacity  = 0; bodyEl.style.transform  = 'translateY(6px)';
    introEl.style.opacity = 0; introEl.style.transform = 'translateY(6px)';
    asideEl.style.opacity = 0; asideEl.style.transform = 'translateY(6px)';
    eyebrowEl.style.opacity = 0; eyebrowEl.style.transform = 'translateY(6px)';

    setTimeout(() => {
      eyebrowEl.textContent = data.eyebrow || 'Researcher';
      titleEl.textContent   = data.title   || '';
      introEl.textContent   = data.intro   || '';
      bodyEl.textContent    = data.body    || '';
      asideEl.textContent   = data.aside   || '';
      titleEl.style.opacity = 1; titleEl.style.transform = 'translateY(0)';
      bodyEl.style.opacity  = 1; bodyEl.style.transform  = 'translateY(0)';
      introEl.style.opacity = 1; introEl.style.transform = 'translateY(0)';
      asideEl.style.opacity = 1; asideEl.style.transform = 'translateY(0)';
      eyebrowEl.style.opacity = 1; eyebrowEl.style.transform = 'translateY(0)';
    }, 110);
  };

  // Map the scroll progress through the section (which is taller than 100vh)
  // to step indices. Because the inner wrapper is sticky, the section rect will
  // move upward while the content remains visually fixed.
  let currentIndex = -1;
  let ticking = false;

  const computeProgress = () => {
    const rect = section.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const totalScrollable = Math.max(1, rect.height - viewport); // height over which the section scrolls
    // When the section's top is at the top of the viewport => progress ~0
    // When the section's bottom is at the bottom => progress ~1
    const scrolled = Math.min(totalScrollable, Math.max(0, -rect.top));
    return scrolled / totalScrollable;
  };

  const update = () => {
    ticking = false;
    const p = computeProgress();
    const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(p * steps.length)));
    if (idx !== currentIndex) {
      currentIndex = idx;
      swap(steps[idx]);
    }
  };

  const onScrollOrResize = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  // Init and listeners
  update();
  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
})();
// === End Principles ===

// --- Added: research_title fold-in (character-by-character) at ~35% visibility ---
(() => {
  const title = document.querySelector('.research_title');
  if (!title) return;

  const text = title.textContent;
  title.setAttribute('aria-label', text);
  title.textContent = '';
  const frag = document.createDocumentFragment();
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.setProperty('--i', i);
    frag.appendChild(span);
  });
  title.appendChild(frag);

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      title.classList.add('in-view');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.75 });
  io.observe(title);
})();

// Split #research into spans and set --i for staggering
(function () {
  const el = document.querySelector('#research') || document.querySelector('.research_title');
  if (!el) return;

  if (!el.querySelector('.char')) {
    const t = el.textContent;
    el.textContent = '';
    const frag = document.createDocumentFragment();
    [...t].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'char';
      s.style.setProperty('--i', i);          // <-- index used for stagger
      if (ch === ' ') { s.textContent = '\u00A0'; s.style.width = '0.35em'; s.style.display='inline-block'; }
      else { s.textContent = ch; }
      frag.appendChild(s);
    });
    el.appendChild(frag);
  }

  // Trigger when ~35% of the element is visible (animate once)
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && e.intersectionRatio >= 0.35) {
        el.classList.add('in-view');
        io.unobserve(el);
      }
    }
  }, { threshold: Array.from({length:101}, (_,i)=>i/100).concat(0.35).sort((a,b)=>a-b) });
  io.observe(el);
})();

const target = document.querySelector("h2.page-title span");

gsap.fromTo(target, 
  { "--underlineW": "0%" }, 
  {
    "--underlineW": "85%",
    duration: 1.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: target,
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  }
);
// === Compact FAB Menu Toggle (replaces fullscreen overlay logic) ===
const fabToggle = document.getElementById('fabToggle');
const fabMenu   = document.getElementById('fabMenu');
const fabLinks  = fabMenu ? fabMenu.querySelectorAll('.fab-menu__link') : [];

if (fabToggle && fabMenu) {

  const closeFabMenu = () => {
    fabMenu.classList.remove('is-open');
    fabToggle.setAttribute('aria-expanded', 'false');
    fabToggle.classList.remove('is-open');   // 🔹 remove X state
  };

  // Open/close on FAB click
  fabToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = fabMenu.classList.toggle('is-open');
    fabToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    fabToggle.classList.toggle('is-open', isOpen);  // 🔹 toggle X state
  });

  // Close when clicking a link
  fabLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeFabMenu();
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!fabMenu.contains(e.target) && !fabToggle.contains(e.target)) {
      closeFabMenu();
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFabMenu();
    }
  });
}


// ...........


// Cursor 

const cursor = document.getElementById("cursor");

  document.addEventListener("mousemove", e => {
    // Move the main circle
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    // Create trailing dot
    const dot = document.createElement("div");
    dot.classList.add("trail");
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;

    document.body.appendChild(dot);

    // Remove dot after animation
    setTimeout(() => dot.remove(), 600);
  });

/* ---- Hide Navigation When Reaching Contact Section ---- */
document.addEventListener("DOMContentLoaded", () => {
  const contactSection = document.querySelector("#contact");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.body.classList.add("hide-nav");
        } else {
          document.body.classList.remove("hide-nav");
        }
      });
    },
    {
      threshold: 0.1   // triggers as soon as 10% of contact becomes visible
    }
  );

  if (contactSection) observer.observe(contactSection);
});

// === Underline key teaching phrases in panel--b on scroll ===
(() => {
  const phrases = document.querySelectorAll(".contact-quote .underline-on-scroll, .panel.panel--b .underline-on-scroll");
  if (!phrases.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // animate once per phrase
        }
      });
    },
    {
      root: null,
      threshold: 0.7, // trigger when about half the phrase is in view
    }
  );

  phrases.forEach((el) => observer.observe(el));
})();


// ===== Scroll To Discover Animation =====
gsap.fromTo(".scroll-text",
  { opacity: 0, y: 14 },
  {
    opacity: 1,
    y: 0,
    duration: 1.2,
    delay: 0.8,
    ease: "power3.out"
  }
);

gsap.to(".scroll-discover", {
  opacity: 0,
  y: -10,
  scrollTrigger: {
    trigger: "#hero",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});


// 
document.addEventListener('DOMContentLoaded', () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const quoteSection = document.querySelector(
    'section[aria-label="relational design quote"] .watch-reveal'
  );

  if (!quoteSection) return;

  // Split into words
  const lines = quoteSection.querySelectorAll('.reveal-line');
  lines.forEach(line => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';

    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      line.appendChild(span);

      if (i !== words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });

  if (!isMobile) return;

  const allWords = quoteSection.querySelectorAll('.word');

  // Observer for entering (~1% visible)
  const enterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          allWords.forEach(w => w.classList.remove('is-filled'));
          entry.target.classList.add('is-filled');
        }
      });
    },
    { threshold: 0.99 } // ~1%
  );

  // Observer for exiting (~1% leaving upward)
  const exitObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          entry.target.classList.remove('is-filled');
        }
      });
    },
    { threshold: 0.10 }
  );

  allWords.forEach(word => {
    enterObserver.observe(word);
    exitObserver.observe(word);
  });
});

// Reveal principles__right when scrolled into view
const rightSection = document.querySelector('.principles__right');

if (rightSection) {
  const ioRight = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        rightSection.classList.add('in-view');
        ioRight.unobserve(rightSection);
      }
    });
  }, {
    threshold: 0.25   // 25% visible = start animation
  });

  ioRight.observe(rightSection);
}

/* Mobile reveal for TEACHING (no stretch effect) */
document.addEventListener('DOMContentLoaded', () => {
  const teaching = document.getElementById('teaching');
  if (!teaching) return;

  const ioTeach = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && window.innerWidth <= 900) {
        teaching.classList.add('visible');
        ioTeach.unobserve(teaching);
      }
    });
  }, { threshold: 0.25 });

  ioTeach.observe(teaching);
});

// ==============================
// Hidden on desktop → scroll down → FAB appears → scroll back up → FAB disappears
// ==============================

// ==============================
// Hidden on desktop → scroll down → FAB appears at .wrap-about → scroll back up → FAB disappears
// ==============================
// ==============================
// FAB visibility: desktop only appears from .wrap-about down
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.querySelector(".fab-nav");
  const trigger = document.querySelector(".wrap-about"); // section where FAB should start showing

  if (!fab || !trigger) return;

  function updateFab() {
    const isDesktop = window.innerWidth >= 1200;

    // Always clear flag first so hero + top of page stay hidden on desktop
    document.body.classList.remove("show-fab");

    // On mobile / tablet, base CSS shows FAB,
    // so we don't need the class at all.
    if (!isDesktop) {
      return;
    }

    const scrollY = window.scrollY;
    const triggerPoint = trigger.offsetTop - 100; // show slightly before wrap-about

    if (scrollY >= triggerPoint) {
      document.body.classList.add("show-fab");
    }
  }

  updateFab();
  window.addEventListener("scroll", updateFab);
  window.addEventListener("resize", updateFab);  
});

// =========================
// Signature Draw on 100% Viewport
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const sigContainer = document.querySelector(".signature-container");
  const sigPath = document.getElementById("signature-path");

  if (!sigContainer || !sigPath) return;

  const length = sigPath.getTotalLength();

  // Prepare hidden stroke
  sigPath.style.strokeDasharray = length;
  sigPath.style.strokeDashoffset = length;

  ScrollTrigger.create({
    trigger: sigContainer,
    start: "top 100%",     // <-- triggers when 100% in viewport
    once: true,           // <-- fire only once
    onEnter: () => {
      sigContainer.classList.add("visible");
      gsap.to(sigPath, {
        strokeDashoffset: 0,
        duration: 7,
        ease: "power2.out",
        delay: 1   // <-- delay before animation starts
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const overlayInner = document.querySelector(".page-transition__inner");
  if (!overlayInner || typeof gsap === "undefined") return;

  // Helper to run the transition and then navigate
  function runPageTransition(targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    // Animate overlay in (bottom -> center)
    gsap.to(overlayInner, {
      y: "0%",
      duration: 0.55,
      ease: "power4.inOut",
      onStart() {
        overlayInner.parentElement.style.pointerEvents = "auto";
      },
      onComplete() {
        // Jump to the section while covered
        target.scrollIntoView({ behavior: "auto", block: "start" });

        // Animate overlay out (center -> top)
        gsap.to(overlayInner, {
          y: "-100%",
          duration: 0.55,
          ease: "power4.inOut",
          onComplete() {
            // Reset to starting position for next click
            gsap.set(overlayInner, { y: "100%" });
            overlayInner.parentElement.style.pointerEvents = "none";
          }
        });
      }
    });
  }

  // Intercept clicks on all internal nav links
  const links = document.querySelectorAll(
    ".nav-link, .fab-menu__link, .contact__link"
  );

  links.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      // Only handle in-page anchors like #about, #design, etc.
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      runPageTransition(href);
    });
  });
});

// Creativity Line
  (() => {
  const lockEl = document.getElementById("orientationLock");
  const art = document.getElementById("art");

  // Loop settings
  const LOOP = true;
  const LOOP_GAP_MS = 500;

  // Animation pacing
  const BASE_DELAY_MS = 220;
  const PER_STROKE_DELAY_MS = 550;

  let paused = false;
  let loopTimer = null;
  let runningAnims = [];

  // ---------- Device gating: phones + tablets only ----------
  function isTouchDevice() {
    return (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
  }

  function isLandscape() {
    return window.matchMedia("(orientation: landscape)").matches;
  }

  // Exclude desktop/laptops that have a fine pointer (trackpad/mouse)
  function isPhoneOrTablet() {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    return isTouchDevice() && !finePointer;
  }

  function isActive() {
    return !!lockEl && isPhoneOrTablet() && isLandscape();
  }

  function clearTimers() {
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
  }

  function cancelRunning() {
    runningAnims.forEach(a => { try { a.cancel(); } catch {} });
    runningAnims = [];
  }

  function getLen(el) {
    try {
      if (typeof el.getTotalLength === "function") {
        const l = el.getTotalLength();
        if (Number.isFinite(l) && l > 0) return l;
      }
    } catch {}
    try {
      const b = el.getBBox();
      const approx = 2 * (b.width + b.height);
      return Number.isFinite(approx) ? approx : 0;
    } catch {}
    return 0;
  }

  function animateStroke(el, len, delayMs, durMs, mode) {
    const start = mode === "reverse" ? 0 : len;
    const end   = mode === "reverse" ? len : 0;

    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(start);

    const anim = el.animate(
      [{ strokeDashoffset: start }, { strokeDashoffset: end }],
      { duration: durMs, delay: delayMs, easing: "ease", fill: "forwards" }
    );

    runningAnims.push(anim);
    return anim;
  }

  function run(mode = "forward") {
    if (!isActive()) return;

    clearTimers();
    cancelRunning();

    const svg = art && art.querySelector("svg");
    if (!svg) return;

    // IMPORTANT: your integrated SVG uses .st0 for the string paths :contentReference[oaicite:2]{index=2}
    const paths = Array.from(svg.querySelectorAll("path.st0"));
    const lines = Array.from(svg.querySelectorAll("line.st0"));

    // Reset
    [...paths, ...lines].forEach(el => {
      el.style.strokeDasharray = "";
      el.style.strokeDashoffset = "";
    });

    let maxEnd = 0;

    // Lines first (if any)
    lines.forEach(ln => {
      const x1 = parseFloat(ln.getAttribute("x1") || "0");
      const y1 = parseFloat(ln.getAttribute("y1") || "0");
      const x2 = parseFloat(ln.getAttribute("x2") || "0");
      const y2 = parseFloat(ln.getAttribute("y2") || "0");
      const len = Math.hypot(x2 - x1, y2 - y1);
      if (!Number.isFinite(len) || len < 2) return;

      const durMs = Math.min(1100, Math.max(650, (len / 900) * 1000));
      const delayMs = BASE_DELAY_MS;

      animateStroke(ln, len, delayMs, durMs, mode);
      maxEnd = Math.max(maxEnd, delayMs + durMs);
    });

    // Paths sequentially
    let idx = 0;
    paths.forEach(p => {
      const len = getLen(p);

      // Skip tiny/empty paths (your SVG has a tiny stub path at the top) :contentReference[oaicite:3]{index=3}
      if (!Number.isFinite(len) || len < 2) return;

      const durMs = Math.min(5200, Math.max(2400, (len / 900) * 1600));
      const delayMs = BASE_DELAY_MS + (idx * PER_STROKE_DELAY_MS);

      animateStroke(p, len, delayMs, durMs, mode);
      maxEnd = Math.max(maxEnd, delayMs + durMs);
      idx += 1;
    });

    // Ping-pong loop: forward -> reverse -> forward -> ...
    if (LOOP && !paused) {
      const nextMode = mode === "forward" ? "reverse" : "forward";
      loopTimer = setTimeout(() => run(nextMode), Math.ceil(maxEnd + LOOP_GAP_MS));
    }
  }

  // ---------- Hook to your overlay toggle ----------
  function updateLock() {
    const shouldLock = isActive();

    document.body.classList.toggle("is-landscape-locked", shouldLock);
    if (lockEl) lockEl.setAttribute("aria-hidden", shouldLock ? "false" : "true");

    if (shouldLock) {
      // Wait 2 frames so SVG has layout (Safari/iPad Chrome reliability)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => run("forward"));
      });
    } else {
      clearTimers();
      cancelRunning();
    }
  }

  window.addEventListener("resize", () => setTimeout(updateLock, 60));
  window.addEventListener("orientationchange", () => setTimeout(updateLock, 60));
  document.addEventListener("DOMContentLoaded", () => setTimeout(updateLock, 60));
})();




