const WHATSAPP_NUMBER = "919592400575";
const products = {
  stickers: { name: "Premium Matte Vinyl Stickers", price: 48, image: "sticker-collection.png", category: "Stickers" },
  gel: { name: "Premium Gel Decals", price: 100, image: "premium-gel-decals.png", category: "Stickers" },
  pcr: { name: "PCR Light", price: 250, image: "pcr-light.png", category: "Accessories" },
  fixAntenna: { name: "Fix Antenna", price: 950, image: "fix-antenna.png", category: "Accessories" },
  antenna: { name: "Magnetic Car Antenna", price: 1050, image: "magnetic-antenna.png", category: "Accessories" },
  ak47: { name: "AK47 Car Hanging", price: 210, image: "ak47-car-hanging.png", category: "Accessories" },
  jersey: { name: "Customized Car Hanging", price: 250, image: "custom-jersey-keychain.png", category: "Accessories" },
  taiwanAntenna: { name: "Magnetic Antenna (Made in Taiwan, 4.6 FT)", price: 2750, image: "magnetic-antenna-taiwan.png", category: "Accessories" },
  slimPlate: { name: "Slim Font Plate (Pair)", price: 1420, image: "slim-font-plate.png", category: "Accessories" },
  hsrpPlate: { name: "HSRP Style Plate (Pair)", price: 1420, image: "hsrp-style-plate.png", category: "Accessories" }
};
let cart = [];
let activeFilter = "all";
const $ = (selector) => document.querySelector(selector);
const money = (value) => "₹" + Number(value).toLocaleString("en-IN");

// Per-cart-line state for the desktop-only minus-control Easter egg.
function randomMinusPosition(item, bounds, previous = null) {
  const maxX = Math.max(0, bounds.width - 23);
  const maxY = Math.max(0, bounds.height - 23);
  let point = { x: Math.random() * maxX, y: Math.random() * maxY };
  // Prefer a clearly noticeable move when the slot has enough room.
  if (previous && maxX >= 120) {
    for (let tries = 0; tries < 16; tries++) {
      const candidate = { x: Math.random() * maxX, y: Math.random() * maxY };
      if (Math.hypot(candidate.x - previous.x, candidate.y - previous.y) >= Math.min(120, maxX * .55)) {
        point = candidate;
        break;
      }
    }
  }
  item.minusRecentPositions = [...(item.minusRecentPositions || []), point].slice(-2);
  return point;
}
function resetMinusState(item) {
  item.minusEscapes = 0;
  item.minusRecentPositions = [];
  item.minusX = null;
  item.minusY = null;
  item.minusCooldownUntil = 0;
}
function placeMinus(button, item, randomize = false) {
  const slot = button.closest('.qty-minus-slot');
  if (!slot) return;
  const bounds = { width: slot.clientWidth, height: slot.clientHeight };
  if (bounds.width < 24 || bounds.height < 24) return;
  // Keep the minus in its normal top-left position when the bag first renders.
  // Random destinations are selected only by the proximity-triggered escape handler.
  if (!Number.isFinite(item.minusX) || !Number.isFinite(item.minusY)) {
    item.minusX = 0;
    item.minusY = 0;
  } else {
    item.minusX = Math.max(0, Math.min(item.minusX, bounds.width - 23));
    item.minusY = Math.max(0, Math.min(item.minusY, bounds.height - 23));
  }
  button.style.left = `${item.minusX}px`;
  button.style.top = `${item.minusY}px`;
  button.style.transform = 'none';
}
function showMinusMotion(slot, from, to) {
  slot.querySelectorAll('.minus-motion-trail, .minus-destination').forEach(el => el.remove());
  const trail = document.createElement('span');
  trail.className = 'minus-motion-trail';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  trail.style.left = `${from.x + 11.5}px`;
  trail.style.top = `${from.y + 11.5}px`;
  trail.style.width = `${Math.hypot(dx, dy)}px`;
  trail.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  slot.appendChild(trail);
  const marker = document.createElement('span');
  marker.className = 'minus-destination';
  marker.style.left = `${to.x + 11.5}px`;
  marker.style.top = `${to.y + 11.5}px`;
  slot.appendChild(marker);
  setTimeout(() => { trail.remove(); marker.remove(); }, 480);
}
$("#year").textContent = new Date().getFullYear();

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}
function openCart() {
  $("#cartOverlay").hidden = false;
  document.body.style.overflow = "hidden";
  renderCart();
}
function closeCart() {
  $("#cartOverlay").hidden = true;
  document.body.style.overflow = "";
}
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#cartCloseBackdrop").addEventListener("click", closeCart);
$("#menuToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
$("#navLinks").querySelectorAll("a").forEach(link => link.addEventListener("click", () => $("#navLinks").classList.remove("open")));

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    filterProducts();
  });
});
$("#searchInput").addEventListener("input", filterProducts);
function filterProducts() {
  const query = $("#searchInput").value.trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll(".product-card").forEach(card => {
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = card.dataset.name.toLowerCase().includes(query);
    card.hidden = !(matchesFilter && matchesSearch);
    if (!card.hidden) visible++;
  });
  $("#emptyState").hidden = visible !== 0;
}

document.querySelectorAll("[data-add]").forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.add;
    if (id === "jersey") {
      const message = "Hi DBP CUSTOMS! I'd like to order a Customized Car Hanging for ₹250 per piece. Please share customisation details.";
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
      return;
    }
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
      resetMinusState(existing);
    } else {
      const item = { id, qty: 1 };
      resetMinusState(item);
      cart.push(item);
    }
    openCart();
showToast(`${products[id].name} added to your bag`);
  });
});
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  $("#cartCount").textContent = count;
  $("#cartTitleCount").textContent = `(${count})`;
  const cartItems = $("#cartItems");
  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Your bag is empty. Find something for your ride.</p>';
  } else {
    cartItems.innerHTML = cart.map(item => {
      const product = products[item.id];
      return `<div class="cart-line">
        <img src="${product.image}" alt="">
        <div><h3>${product.name}</h3><p>${money(product.price)} each</p>
          <div class="qty-controls"><span class="qty-minus-slot" aria-label="Decrease quantity control area"><button class="qty-minus" data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity / remove at one">−</button></span><span class="qty-value">${item.qty}</span><button class="qty-plus" data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button></div>
        </div><strong>${money(product.price * item.qty)}</strong>
      </div>`;
    }).join("");
  }
  const subtotal = cart.reduce((sum, item) => sum + products[item.id].price * item.qty, 0);

  // Position each minus independently inside its own bounded interaction zone.
  cartItems.querySelectorAll('.qty-minus').forEach(button => {
    const item = cart.find(i => i.id === button.dataset.qty);
    if (item) placeMinus(button, item);
  });

  // Proximity-based escape: pointer movement triggers it before any click.
  const desktopMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (desktopMouse && !reducedMotion) {
    let lastPointer = { x: -10000, y: -10000 };
    let pendingFrame = 0;
    cartItems.onpointermove = event => {
      if (event.pointerType && event.pointerType !== 'mouse') return;
      lastPointer = { x: event.clientX, y: event.clientY };
      if (pendingFrame) return;
      pendingFrame = requestAnimationFrame(() => {
        pendingFrame = 0;
        const buttons = cartItems.querySelectorAll('.qty-minus');
        for (const button of buttons) {
          const item = cart.find(i => i.id === button.dataset.qty);
          if (!item || item.minusEscapes >= 3 || performance.now() < (item.minusCooldownUntil || 0)) continue;
          const rect = button.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          if (Math.hypot(lastPointer.x - cx, lastPointer.y - cy) > 88) continue;
          const slot = button.closest('.qty-minus-slot');
          if (!slot) continue;
          const from = { x: item.minusX, y: item.minusY };
          const bounds = { width: slot.clientWidth, height: slot.clientHeight };
          const to = randomMinusPosition(item, bounds, from);
          if (Math.hypot(to.x - from.x, to.y - from.y) < 45 && bounds.width > 80) {
            to.x = Math.max(0, Math.min(bounds.width - 23, from.x < bounds.width / 2 ? bounds.width - 23 : 0));
            to.y = Math.max(0, Math.min(bounds.height - 23, Math.random() * (bounds.height - 23)));
            item.minusRecentPositions[item.minusRecentPositions.length - 1] = { ...to };
          }
          item.minusEscapes++;
          item.minusCooldownUntil = performance.now() + 500;
          item.minusX = to.x;
          item.minusY = to.y;
          showMinusMotion(slot, from, to);
          button.classList.add('minus-escape-nudge');
          button.style.left = `${to.x}px`;
          button.style.top = `${to.y}px`;
          setTimeout(() => button.classList.remove('minus-escape-nudge'), 480);
          break;
        }
      });
    };
  } else {
    cartItems.onpointermove = null;
  }

  cartItems.querySelectorAll('[data-qty]').forEach(button => {
    button.addEventListener('click', event => {
      const item = cart.find(i => i.id === button.dataset.qty);
      if (!item) return;
      // Keyboard activation and touch always work normally; proximity escapes never intercept clicks.
      const delta = Number(button.dataset.delta);
      item.qty += delta;
      if (item.qty <= 0) cart = cart.filter(i => i.id !== button.dataset.qty);
      renderCart();
    });
  });

  $("#cartSubtotal").textContent = money(subtotal);
}
$("#checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your bag is empty");
    return;
  }
  const subtotal = cart.reduce((sum, item) => sum + products[item.id].price * item.qty, 0);
  const lines = cart.map(item => `• ${products[item.id].name} × ${item.qty} — ${money(products[item.id].price * item.qty)}`);
  const shipping = subtotal >= 3750 ? "Eligible for free shipping (order above ₹3,750)." : "Please confirm shipping charges.";
  const message = `Hi DBP CUSTOMS! I'd like to place an order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(subtotal)}\n${shipping}\n\nPlease confirm availability, delivery charges and payment/COD options.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});
renderCart();
// Play the hero video once per page load. Reveal the brand after the Fortuner
// has exited, then keep the final brand frame visible while the video stays ended.
const heroVideo = document.getElementById("heroVideo");
const heroBrandReveal = document.getElementById("heroBrandReveal");
if (heroVideo && heroBrandReveal) {
  const revealAt = 5.2; // timed to the supplied clip, after the Fortuner exits
  let revealShown = false;

  const showBrand = () => {
    if (revealShown) return;
    heroBrandReveal.classList.add("is-visible");
    heroBrandReveal.setAttribute("aria-hidden", "false");
    revealShown = true;
  };

  const syncBrandReveal = () => {
    if ((heroVideo.currentTime || 0) >= revealAt) showBrand();
  };

  heroVideo.addEventListener("timeupdate", syncBrandReveal);
  heroVideo.addEventListener("seeked", syncBrandReveal);
  heroVideo.addEventListener("playing", syncBrandReveal);

  // If the clip ends before the time-based reveal fires for any reason,
  // ensure the final brand state is still shown and the video does not replay.
  heroVideo.addEventListener("ended", showBrand);
}





// Stronger magnetic cursor response: buttons begin attracting the pointer
// before it reaches them, with a smooth pull from a wider distance.
(() => {
  const selectors = '.site-header nav a[href="#shop"], .site-header nav a[href="#about"], .site-header nav a[href="#contact"], .add-button, .shipping-band .button, .text-link, #contactWhatsapp';
 const targets = [...document.querySelectorAll(selectors)];

const hasMouse = window.matchMedia(
  '(hover: hover) and (pointer: fine)'
).matches;

if (!hasMouse) {
  targets.forEach(target => {
    target.addEventListener('touchstart', () => {
      target.style.transition = 'transform 160ms ease';
      target.style.transform = 'scale(1.04)';
    }, { passive: true });

    const resetTouchAnimation = () => {
      target.style.transform = '';

      setTimeout(() => {
        target.style.transition = '';
      }, 180);
    };

    target.addEventListener('touchend', resetTouchAnimation, {
      passive: true
    });

    target.addEventListener('touchcancel', resetTouchAnimation, {
      passive: true
    });
  });

  return;
}

  const defaultReach = 240;       // Header buttons keep their current comfortable range.
  const defaultStrength = 10;     // Restrained pull for the other buttons.
  targets.forEach(target => target.classList.add('magnetic-target'));

  let frame = null;
  let pointerX = -10000;
  let pointerY = -10000;

  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      targets.forEach(target => {
        const rect = target.getBoundingClientRect();
        const dx = pointerX - (rect.left + rect.width / 2);
        const dy = pointerY - (rect.top + rect.height / 2);
        const distance = Math.hypot(dx, dy);
        // Add to Bag gets a small boost so its attraction feels closer to the header links.
        const isAddToBag = target.matches('.add-button');
        const reach = isAddToBag ? 265 : defaultReach;
        const maxStrength = isAddToBag ? 11 : defaultStrength;

        if (distance >= reach) {
          target.style.transform = '';
          return;
        }

        // Smoothly taper the attraction as the pointer gets farther away.
        const influence = 1 - distance / reach;
        const strength = influence * influence * maxStrength;
        target.style.transform = `translate(${(dx / Math.max(distance, 1) * strength).toFixed(2)}px, ${(dy / Math.max(distance, 1) * strength).toFixed(2)}px)`;
      });
    });
  }, { passive: true });

  window.addEventListener('blur', () => {
    if (frame) cancelAnimationFrame(frame);
    targets.forEach(target => { target.style.transform = ''; });
  });
})();

// Subtle, one-time scroll reveals for a polished editorial feel.
// Elements stay hidden only until they approach the viewport; no large or bouncy motion.
(() => {
  const revealGroups = [
    [".intro > .section-kicker", "reveal-from-left"],
    [".intro h2", "reveal-from-left"],
    [".intro-description", "reveal-from-right"],
    [".shop-heading", "reveal-from-left"],
    [".shop-controls", "reveal-from-up"],
    [".product-card", "reveal-from-up"],
    [".shipping-band > :first-child", "reveal-from-left"],
    [".shipping-band > :nth-child(2)", "reveal-from-right"],
    [".shipping-band > .button", "reveal-from-up"],
    [".feature-photo", "reveal-from-left"],
    [".feature-copy", "reveal-from-right"],
    [".contact-inner > :first-child", "reveal-from-left"],
    [".contact-right", "reveal-from-right"]
  ];
  revealGroups.forEach(([selector, direction]) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add("reveal-on-scroll", direction);
      if (element.matches(".product-card")) {
        element.style.setProperty("--reveal-delay", `${(index % 3) * 75}ms`);
      }
    });
  });

  const targets = document.querySelectorAll(".reveal-on-scroll");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(element => element.classList.add("is-in-view"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
  targets.forEach(element => observer.observe(element));
})();
/* Open product images in a full-screen viewer */
(function () {
    let lightbox = document.querySelector(".image-lightbox");

    if (!lightbox) {
        lightbox = document.createElement("div");
        lightbox.className = "image-lightbox";
        lightbox.setAttribute("role", "dialog");
        lightbox.setAttribute("aria-modal", "true");
        lightbox.setAttribute("aria-label", "Enlarged product image");

        lightbox.innerHTML = `
            <button class="image-lightbox-close"
                    type="button"
                    aria-label="Close image">&times;</button>
            <img src="" alt="Enlarged product">
        `;

        document.body.appendChild(lightbox);
    }

    const largeImage = lightbox.querySelector("img");
    const closeButton = lightbox.querySelector(".image-lightbox-close");

    function closeLightbox() {
        lightbox.classList.remove("is-open");
        largeImage.src = "";
        document.body.style.overflow = "";
    }

    document.addEventListener("click", function (event) {
        const imageLink = event.target.closest(".product-image");

        if (!imageLink) return;

        const productImage = imageLink.querySelector("img");

        if (!productImage) return;

        event.preventDefault();

        largeImage.src = productImage.currentSrc || productImage.src;
        largeImage.alt = productImage.alt || "Enlarged product image";

        lightbox.classList.add("is-open");
        document.body.style.overflow = "hidden";
    });

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
            closeLightbox();
        }
    });
})();

```css
/* =========================================
   DBP CUSTOMS — ABOUT SECTION FINAL FIX
   Text on left, image on right
========================================= */

.about-hero-section {
    display: grid !important;
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr) !important;
    align-items: center !important;
    gap: 40px !important;

    width: 100% !important;
    max-width: 1800px !important;
    margin: 0 auto !important;
    padding: 55px 6% !important;

    box-sizing: border-box !important;
    overflow: hidden;
    background: #f5f4f1;
}

/* LEFT SIDE — TEXT */

.about-hero-copy {
    grid-column: 1 !important;
    grid-row: 1 !important;

    width: 100% !important;
    max-width: none !important;
    min-width: 0 !important;
}

.about-hero-copy h2 {
    max-width: 100% !important;
    font-size: clamp(40px, 4.1vw, 64px) !important;
    line-height: 1.05 !important;
    letter-spacing: -1.3px !important;
    margin: 0 0 22px !important;
}

.about-hero-copy h2 span {
    white-space: normal;
}

.about-hero-description {
    max-width: 540px !important;
    font-size: 14px !important;
    line-height: 1.85 !important;
    margin: 0 0 25px !important;
}

/* FEATURES UNDER THE BUTTON */

.about-hero-features {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 0 !important;
    margin-top: 42px !important;
}

.about-hero-feature {
    min-width: 0 !important;
    padding: 0 12px !important;
    border-right: 1px solid #d5d5d5;
}

.about-hero-feature:first-child {
    padding-left: 0 !important;
}

.about-hero-feature:last-child {
    padding-right: 0 !important;
    border-right: none !important;
}

.about-hero-feature h3 {
    font-size: 10px !important;
    line-height: 1.5 !important;
}

.about-hero-feature p {
    font-size: 11px !important;
    line-height: 1.7 !important;
}

/* RIGHT SIDE — IMAGE */

.about-hero-visual {
    grid-column: 2 !important;
    grid-row: 1 !important;

    display: block !important;
    position: relative !important;

    width: 100% !important;
    height: clamp(350px, 42vw, 560px) !important;
    min-width: 0 !important;
    max-width: none !important;

    margin: 0 !important;
    align-self: center !important;
    justify-self: stretch !important;

    overflow: hidden !important;
    clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
}

.about-hero-visual img {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;

    object-fit: cover !important;
    object-position: center !important;
}

/* TABLETS */

@media (max-width: 1000px) {
    .about-hero-section {
        grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr) !important;
        gap: 25px !important;
        padding: 45px 4% !important;
    }

    .about-hero-copy h2 {
        font-size: clamp(36px, 4.5vw, 48px) !important;
    }

    .about-hero-visual {
        height: 420px !important;
    }

    .about-hero-features {
        margin-top: 32px !important;
    }

    .about-hero-feature {
        padding: 0 8px !important;
    }
}

/* MOBILE — TEXT FIRST, IMAGE BELOW */

@media (max-width: 700px) {
    .about-hero-section {
        grid-template-columns: minmax(0, 1fr) !important;
        gap: 32px !important;
        padding: 40px 6% !important;
    }

    .about-hero-copy {
        grid-column: 1 !important;
        grid-row: 1 !important;
    }

    .about-hero-visual {
        grid-column: 1 !important;
        grid-row: 2 !important;

        width: 100% !important;
        height: auto !important;
        aspect-ratio: 1.15 / 1;
        clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);
    }

    .about-hero-copy h2 {
        font-size: clamp(38px, 9vw, 55px) !important;
    }

    .about-hero-description {
        font-size: 14px !important;
    }

    .about-hero-features {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    .about-hero-visual img {
        transition: none !important;
    }
}
```

/* =========================================
   DBP CUSTOMS — CAR CUSTOMIZER INTERACTIONS
   ========================================= */

(() => {
    const garage = document.getElementById("dbpCustomizer");
    if (!garage || garage.dataset.initialized === "true") return;

    garage.dataset.initialized = "true";

    const scene = document.getElementById("dbpGarageScene");
    const plateInput = document.getElementById("dbpPlateInput");
    const svgPlate = document.getElementById("dbpSvgPlate");
    const status = document.getElementById("dbpSceneStatus");
    const glowButton = document.getElementById("dbpGlowToggle");
    const lightsButton = document.getElementById("dbpLightsToggle");
    const resetButton = document.getElementById("dbpReset");

    const defaultColor = "#c7c7c7";
    const defaultPlate = "DBP 0575";

    function setStatus(message) {
        status.textContent = message;
    }

    // 1. Change the car's paint colour.
    garage.querySelectorAll(".dbp-paint").forEach((button) => {
        button.addEventListener("click", () => {
            const color = button.dataset.color;

            garage.style.setProperty("--dbp-car-color", color);

            garage.querySelectorAll(".dbp-paint").forEach((paint) => {
                const active = paint === button;
                paint.classList.toggle("active", active);
                paint.setAttribute("aria-pressed", String(active));
            });

            setStatus("PAINT UPDATED");
        });
    });

    // 2. Switch wheel styles.
    garage.querySelectorAll("[data-wheel]").forEach((button) => {
        button.addEventListener("click", () => {
            const wheel = button.dataset.wheel;

            garage.dataset.wheel = wheel;

            garage.querySelectorAll("[data-wheel]").forEach((option) => {
                const active = option === button;
                option.classList.toggle("active", active);
                option.setAttribute("aria-pressed", String(active));
            });

            setStatus("WHEELS UPDATED");
        });
    });

    // 3. Update the number plate while typing.
    plateInput.addEventListener("input", () => {
        const text = plateInput.value.trim().slice(0, 10);
        svgPlate.textContent = text || "DBP";
        setStatus("PLATE UPDATED");
    });

    // 4. Toggle neon underglow.
    glowButton.addEventListener("click", () => {
        const enabled = garage.classList.toggle("dbp-glow-on");

        glowButton.setAttribute("aria-pressed", String(enabled));
        setStatus(enabled ? "NEON ACTIVATED" : "NEON OFF");
    });

    // 5. Toggle cinematic garage lighting.
    lightsButton.addEventListener("click", () => {
        const enabled = scene.classList.toggle("dbp-lights-on");

        lightsButton.setAttribute("aria-pressed", String(enabled));
        setStatus(enabled ? "GARAGE LIGHTS ON" : "LIGHTS READY");
    });

    // 6. Reset all settings to their defaults.
    resetButton.addEventListener("click", () => {
        garage.style.setProperty("--dbp-car-color", defaultColor);
        garage.dataset.wheel = "sport";

        garage.classList.remove("dbp-glow-on");
        scene.classList.remove("dbp-lights-on");

        plateInput.value = defaultPlate;
        svgPlate.textContent = "0575";

        garage.querySelectorAll(".dbp-paint").forEach((button) => {
            const active = button.dataset.color === defaultColor;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        garage.querySelectorAll("[data-wheel]").forEach((button) => {
            const active = button.dataset.wheel === "sport";
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        glowButton.setAttribute("aria-pressed", "false");
        lightsButton.setAttribute("aria-pressed", "false");

        setStatus("BUILD RESET");
    });
})();
