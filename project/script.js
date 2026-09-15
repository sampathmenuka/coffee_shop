'use strict';

/* ==========================================================================
   Data
   ========================================================================== */
const MENU = [
    { id: 'espresso',     name: 'Espresso',          type: 'hot',    price: 3.50, description: 'Rich and bold, pulled as a double with a thick hazelnut crema.', tag: 'Classic' },
    { id: 'cappuccino',   name: 'Cappuccino',        type: 'hot',    price: 4.00, description: 'Equal parts espresso, steamed milk and velvety foam.', tag: 'Popular' },
    { id: 'latte',        name: 'Vanilla Latte',     type: 'hot',    price: 4.50, description: 'Smooth and creamy with house-made Madagascar vanilla syrup.' },
    { id: 'americano',    name: 'Americano',         type: 'hot',    price: 3.00, description: 'Espresso lengthened with hot water for a clean, classic cup.' },
    { id: 'flat-white',   name: 'Flat White',        type: 'hot',    price: 4.25, description: 'A ristretto double under a thin layer of silky microfoam.' },
    { id: 'mocha',        name: 'Dark Mocha',        type: 'hot',    price: 4.75, description: '70% single-origin chocolate melted into espresso and milk.' },
    { id: 'cold-brew',    name: 'Cold Brew',         type: 'cold',   price: 4.25, description: 'Steeped for 18 hours for a naturally sweet, low-acid sip.', tag: 'Popular' },
    { id: 'iced-latte',   name: 'Iced Oat Latte',    type: 'cold',   price: 4.75, description: 'Espresso over ice with creamy oat milk. Dairy-free by default.', tag: 'Vegan' },
    { id: 'affogato',     name: 'Affogato',          type: 'cold',   price: 5.25, description: 'A scoop of vanilla gelato drowned in a fresh shot of espresso.' },
    { id: 'nitro',        name: 'Nitro Cold Brew',   type: 'cold',   price: 5.00, description: 'Nitrogen-infused on tap for a creamy, stout-like cascade.', tag: 'New' },
    { id: 'croissant',    name: 'Butter Croissant',  type: 'bakery', price: 3.25, description: 'Laminated over three days and baked fresh every morning.' },
    { id: 'banana-bread', name: 'Banana Bread',      type: 'bakery', price: 3.75, description: 'Walnuts, brown butter and a crackly demerara crust.' },
    { id: 'cinnamon-bun', name: 'Cardamom Bun',      type: 'bakery', price: 4.00, description: 'Swedish-style knot with cardamom sugar and orange zest.', tag: 'New' }
];

const ICONS = {
    hot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>',
    cold: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 8 1.75 12.28a2 2 0 0 0 2 1.72h4.54a2 2 0 0 0 2-1.72L18 8"/><path d="M5 8h14"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/><path d="m12 8 1-6h2"/></svg>',
    bakery: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
};

// Opening hours, 24h clock. 0 = Sunday.
const HOURS = { 0: [8, 21], 1: [7, 20], 2: [7, 20], 3: [7, 20], 4: [7, 20], 5: [7, 20], 6: [8, 21] };
const TAX_RATE = 0.08875;
const CART_KEY = 'coffee-cart';

/* ==========================================================================
   Helpers
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const formatPrice = (n) => `$${n.toFixed(2)}`;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const storage = {
    get(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value === null ? fallback : JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { /* storage unavailable — keep working in memory */ }
    }
};

function toast(message) {
    const stack = $('#toasts');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = ICONS.check;
    el.append(message);
    stack.append(el);

    setTimeout(() => {
        el.classList.add('is-leaving');
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 2600);
}

/* ==========================================================================
   Theme
   ========================================================================== */
const root = document.documentElement;
const themeToggle = $('#theme-toggle');

function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    if (persist) {
        try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    }
}

setTheme(root.getAttribute('data-theme') || 'light', false);

themeToggle.addEventListener('click', () => {
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
});

/* ==========================================================================
   Header, mobile nav, scrollspy, back-to-top
   ========================================================================== */
const header = $('#header');
const nav = $('#nav');
const menuToggle = $('#menu-toggle');
const backToTop = $('#back-to-top');

function setNavOpen(open) {
    nav.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    onScroll();
}

menuToggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('active')));
$$('.nav-link').forEach((link) => link.addEventListener('click', () => setNavOpen(false)));

document.addEventListener('click', (e) => {
    if (nav.classList.contains('active') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
        setNavOpen(false);
    }
});

function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 40 || nav.classList.contains('active'));
    backToTop.classList.toggle('is-visible', y > window.innerHeight * 0.8);
}

let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        onScroll();
        scrollTicking = false;
    });
}, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

// Highlight the nav link for the section currently in view
const navLinks = $$('.nav-link');
const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
    });
}, { rootMargin: '-45% 0px -50% 0px' });

$$('main section[id]').forEach((section) => spyObserver.observe(section));

/* ==========================================================================
   Scroll reveal
   ========================================================================== */
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
        // Drop the stagger once revealed so hover effects aren't delayed
        setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1000);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

$$('.reveal').forEach((el) => {
    // Stagger siblings in a grid slightly
    const siblings = el.parentElement.querySelectorAll(':scope > .reveal');
    if (siblings.length > 1) el.style.transitionDelay = `${[...siblings].indexOf(el) * 90}ms`;
    revealObserver.observe(el);
});

/* ==========================================================================
   Hero stat counters
   ========================================================================== */
function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if (prefersReducedMotion) return;

    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

$$('[data-count]').forEach(animateCount);

/* ==========================================================================
   Menu: render, filter, search
   ========================================================================== */
const menuGrid = $('#menu-grid');
const menuEmpty = $('#menu-empty');
const menuSearch = $('#menu-search');
const chips = $$('.chip');
let activeFilter = 'all';

function renderMenu() {
    const query = menuSearch.value.trim().toLowerCase();
    const items = MENU.filter((item) =>
        (activeFilter === 'all' || item.type === activeFilter) &&
        (!query || item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query))
    );

    menuGrid.innerHTML = items.map((item, i) => `
        <article class="menu-item" style="animation-delay:${Math.min(i, 8) * 40}ms">
            <div class="menu-thumb">${ICONS[item.type]}</div>
            <div class="menu-body">
                <div class="menu-top">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">${formatPrice(item.price)}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-bottom">
                    ${item.tag ? `<span class="tag">${item.tag}</span>` : ''}
                    <button class="add-btn" data-id="${item.id}" aria-label="Add ${item.name} to order">
                        ${ICONS.plus}<span>Add</span>
                    </button>
                </div>
            </div>
        </article>
    `).join('');

    menuEmpty.hidden = items.length > 0;
}

chips.forEach((chip) => {
    chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        chips.forEach((c) => {
            const on = c === chip;
            c.classList.toggle('is-active', on);
            c.setAttribute('aria-pressed', String(on));
        });
        renderMenu();
    });
});

let searchTimer;
menuSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(renderMenu, 120);
});

menuGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-btn');
    if (!btn) return;

    cart.add(btn.dataset.id);

    btn.classList.add('added');
    btn.innerHTML = `${ICONS.check}<span>Added</span>`;
    clearTimeout(btn._timer);
    btn._timer = setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `${ICONS.plus}<span>Add</span>`;
    }, 1200);
});

/* ==========================================================================
   Cart
   ========================================================================== */
const cartEl = $('#cart');
const overlay = $('#overlay');
const cartOpenBtn = $('#cart-open');
const cartCount = $('#cart-count');
const cartItemsEl = $('#cart-items');
const cartEmpty = $('#cart-empty');
const cartFoot = $('#cart-foot');
let lastFocused = null;

const cart = {
    // { [id]: qty }
    lines: storage.get(CART_KEY, {}),

    add(id) {
        this.lines[id] = (this.lines[id] || 0) + 1;
        this.save();
        const item = MENU.find((m) => m.id === id);
        toast(`${item.name} added to your order`);
        cartCount.classList.remove('bump');
        void cartCount.offsetWidth; // restart animation
        cartCount.classList.add('bump');
    },

    change(id, delta) {
        this.lines[id] = (this.lines[id] || 0) + delta;
        if (this.lines[id] <= 0) delete this.lines[id];
        this.save();
    },

    clear() {
        this.lines = {};
        this.save();
    },

    entries() {
        return Object.entries(this.lines)
            .map(([id, qty]) => ({ item: MENU.find((m) => m.id === id), qty }))
            .filter((line) => line.item);
    },

    save() {
        storage.set(CART_KEY, this.lines);
        renderCart();
    }
};

function renderCart() {
    const lines = cart.entries();
    const count = lines.reduce((sum, l) => sum + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => sum + l.qty * l.item.price, 0);
    const tax = subtotal * TAX_RATE;

    cartCount.textContent = count;
    cartCount.hidden = count === 0;
    cartOpenBtn.setAttribute('aria-label', `Open your order (${count} item${count === 1 ? '' : 's'})`);

    cartItemsEl.innerHTML = lines.map(({ item, qty }) => `
        <li class="cart-line">
            <span class="cart-line-name">${item.name}</span>
            <span class="cart-line-price">${formatPrice(item.price * qty)}</span>
            <span class="cart-line-unit">${formatPrice(item.price)} each</span>
            <span class="qty">
                <button data-id="${item.id}" data-delta="-1" aria-label="Remove one ${item.name}">−</button>
                <output aria-live="polite">${qty}</output>
                <button data-id="${item.id}" data-delta="1" aria-label="Add one ${item.name}">+</button>
            </span>
        </li>
    `).join('');

    cartEmpty.hidden = lines.length > 0;
    cartFoot.hidden = lines.length === 0;
    $('#cart-subtotal').textContent = formatPrice(subtotal);
    $('#cart-tax').textContent = formatPrice(tax);
    $('#cart-total').textContent = formatPrice(subtotal + tax);
}

function openCart() {
    lastFocused = document.activeElement;
    setNavOpen(false);
    overlay.hidden = false;
    cartEl.classList.add('is-open');
    cartEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    cartEl.focus();
}

function closeCart() {
    overlay.hidden = true;
    cartEl.classList.remove('is-open');
    cartEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
}

cartOpenBtn.addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
$('#cart-browse').addEventListener('click', closeCart);

cartItemsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-delta]');
    if (btn) cart.change(btn.dataset.id, Number(btn.dataset.delta));
});

$('#cart-clear').addEventListener('click', () => cart.clear());

$('#checkout').addEventListener('click', () => {
    const ref = Math.random().toString(36).slice(2, 7).toUpperCase();
    cart.clear();
    closeCart();
    toast(`Order #${ref} placed — ready for pickup in ~10 min`);
});

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (cartEl.classList.contains('is-open')) closeCart();
    else if (nav.classList.contains('active')) {
        setNavOpen(false);
        menuToggle.focus();
    }
});

// Keep keyboard focus inside the open drawer
cartEl.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = $$('button, a[href], input', cartEl).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === cartEl)) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
});

/* ==========================================================================
   Open / closed status
   ========================================================================== */
function updateOpenStatus() {
    const el = $('#open-status');
    const now = new Date();
    const [open, close] = HOURS[now.getDay()];
    const hour = now.getHours() + now.getMinutes() / 60;
    const isOpen = hour >= open && hour < close;
    const fmt = (h) => `${((h + 11) % 12) + 1}${h < 12 ? 'AM' : 'PM'}`;

    let text;
    if (isOpen) {
        text = `Open now · until ${fmt(close)}`;
    } else if (hour < open) {
        text = `Closed · opens today at ${fmt(open)}`;
    } else {
        text = `Closed · opens tomorrow at ${fmt(HOURS[(now.getDay() + 1) % 7][0])}`;
    }

    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);
    $('.open-text', el).textContent = text;
}

updateOpenStatus();
setInterval(updateOpenStatus, 60 * 1000);

/* ==========================================================================
   Contact form
   ========================================================================== */
const contactForm = $('#contact-form');
const formMessage = $('#form-message');
const messageInput = $('#message');
const charCount = $('#char-count');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validators = {
    name: (v) => (v.length >= 2 ? '' : 'Please tell us your name.'),
    email: (v) => (!v ? 'We need an email to reply to.' : EMAIL_RE.test(v) ? '' : 'That email doesn’t look quite right.'),
    message: (v) => (v.length >= 10 ? '' : 'A little more detail, please (10+ characters).')
};

function validateField(name) {
    const input = contactForm.elements[name];
    const error = validators[name](input.value.trim());
    const group = input.closest('.form-group');
    group.classList.toggle('has-error', Boolean(error));
    input.setAttribute('aria-invalid', String(Boolean(error)));
    input.setAttribute('aria-describedby', `${name}-error`);
    $(`#${name}-error`).textContent = error;
    return !error;
}

Object.keys(validators).forEach((name) => {
    const input = contactForm.elements[name];
    input.addEventListener('blur', () => { if (input.value) validateField(name); });
    input.addEventListener('input', () => {
        if (input.closest('.form-group').classList.contains('has-error')) validateField(name);
    });
});

messageInput.addEventListener('input', () => {
    charCount.textContent = `${messageInput.value.length} / ${messageInput.maxLength}`;
});

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formMessage.className = 'form-message';
    formMessage.textContent = '';

    const results = Object.keys(validators).map(validateField);
    if (results.includes(false)) {
        const firstInvalid = $('[aria-invalid="true"]', contactForm);
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const submitBtn = $('button[type="submit"]', contactForm);
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    $('.btn-label', submitBtn).textContent = 'Sending';

    // Simulated request — replace with a real endpoint (e.g. fetch('/api/contact', …))
    setTimeout(() => {
        const name = contactForm.elements.name.value.trim().split(' ')[0];
        formMessage.textContent = `Thanks, ${name}! We’ll get back to you within one business day.`;
        formMessage.className = 'form-message success';
        contactForm.reset();
        charCount.textContent = `0 / ${messageInput.maxLength}`;
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        $('.btn-label', submitBtn).textContent = 'Send Message';
    }, 900);
});

// Links like "Book a course" pre-select the contact topic
$$('[data-subject]').forEach((link) => {
    link.addEventListener('click', () => {
        contactForm.elements.subject.value = link.dataset.subject;
    });
});

/* ==========================================================================
   Newsletter
   ========================================================================== */
$('#newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#newsletter-email');
    if (!EMAIL_RE.test(input.value.trim())) {
        input.focus();
        toast('Please enter a valid email address');
        return;
    }
    input.value = '';
    toast('You’re on the list — welcome!');
});

/* ==========================================================================
   Init
   ========================================================================== */
$('#year').textContent = new Date().getFullYear();
renderMenu();
renderCart();
