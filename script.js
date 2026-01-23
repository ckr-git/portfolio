// ========================================
// Sci-Fi Portfolio Scripts
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initLanguageSwitcher();
    initScrollAnimations();
    initTypewriter();
});

// ========================================
// Particle Background
// ========================================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random position
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';

    // Random size (smaller for stars)
    const size = Math.random() * 2 + 1;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    // Random animation duration
    particle.style.animationDuration = (Math.random() * 3 + 2) + 's, ' + (Math.random() * 25 + 15) + 's';
    particle.style.animationDelay = (Math.random() * 3) + 's';

    // Random color (ice blue or purple)
    if (Math.random() > 0.7) {
        particle.style.background = '#a855f7';
        particle.style.boxShadow = '0 0 6px #a855f7';
    }

    container.appendChild(particle);
}

// ========================================
// Language Switcher
// ========================================
function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('portfolio-lang') || 'en';

    // Apply saved language
    setLanguage(savedLang);

    // Update active button
    langBtns.forEach(btn => {
        if (btn.dataset.lang === savedLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }

        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);

            // Update active state
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Save preference
            localStorage.setItem('portfolio-lang', lang);
        });
    });
}

function setLanguage(lang) {
    const elements = document.querySelectorAll('[data-en][data-zh]');

    elements.forEach(el => {
        const text = el.dataset[lang];
        if (text) {
            el.textContent = text;
        }
    });

    // Update glitch data-text attribute
    const glitchEl = document.querySelector('.glitch');
    if (glitchEl) {
        const glitchSpan = glitchEl.querySelector('span');
        if (glitchSpan) {
            glitchEl.setAttribute('data-text', glitchSpan.textContent);
        }
    }

    // Update document language
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => observer.observe(el));
}

// ========================================
// Typewriter Effect
// ========================================
function initTypewriter() {
    const typewriterEl = document.querySelector('.typewriter span');
    if (!typewriterEl) return;

    // Store original texts
    const enText = typewriterEl.dataset.en;
    const zhText = typewriterEl.dataset.zh;

    // Get current language
    const currentLang = localStorage.getItem('portfolio-lang') || 'en';
    const text = currentLang === 'zh' ? zhText : enText;

    // Clear and type
    typewriterEl.textContent = '';
    typeText(typewriterEl, text, 0);
}

function typeText(element, text, index) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typeText(element, text, index + 1), 80);
    }
}

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// Mouse Glow Effect on Cards
// ========================================
document.querySelectorAll('.project').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const glow = card.querySelector('.project-glow');
        if (glow) {
            glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 240, 255, 0.08) 0%, transparent 50%)`;
        }
    });
});

// ========================================
// Console Easter Egg
// ========================================
console.log('%c Welcome to my portfolio! ', 'background: #0a0a0f; color: #00f0ff; font-size: 16px; padding: 10px; border: 1px solid #00f0ff;');
console.log('%c Built with passion for technology ', 'color: #888; font-size: 12px;');
