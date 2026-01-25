// ========================================
// UI - User Interface Management
// ========================================

const UI = {
    currentLang: 'en',
    panel: null,
    hoverLabel: null,
    minimap: null,
    minimapCtx: null,

    init() {
        this.panel = document.getElementById('planet-panel');
        this.hoverLabel = document.getElementById('hover-label');
        this.minimap = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimap.getContext('2d');

        this.setupMinimap();
        this.bindEvents();
    },

    bindEvents() {
        // Language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLanguage(btn.dataset.lang);
            });
        });

        // Mode switcher
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMode(btn.dataset.mode);
            });
        });

        // Close panel
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.hidePanel();
        });
    },

    setLanguage(lang) {
        this.currentLang = lang;

        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update all translatable elements
        document.querySelectorAll('[data-en]').forEach(el => {
            el.textContent = el.dataset[lang] || el.dataset.en;
        });
    },

    setMode(mode) {
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Toggle HUD visibility
        const hud = document.getElementById('spaceship-hud');

        if (mode === 'spaceship') {
            Spaceship.enable();
            hud.classList.remove('hidden');
        } else {
            Spaceship.disable();
            hud.classList.add('hidden');
            Controls.resetView();
        }
    },

    showPanel(data) {
        const isZh = this.currentLang === 'zh';

        document.getElementById('panel-name').textContent =
            isZh ? data.nameCN : data.name;

        document.getElementById('panel-desc').textContent =
            isZh ? data.descriptionCN : data.description;

        // Badge
        const badge = document.getElementById('panel-badge');
        if (data.isCommercial) {
            badge.textContent = isZh ? '商业项目' : 'Commercial';
            badge.className = 'badge commercial';
        } else {
            badge.textContent = isZh ? '开源项目' : 'Open Source';
            badge.className = 'badge';
        }

        // Tech stack
        const techContainer = document.getElementById('panel-tech');
        techContainer.innerHTML = data.techStack
            .map(tech => `<span class="tech-tag">${tech}</span>`)
            .join('');

        // Timeline
        const timeline = document.getElementById('panel-timeline');
        timeline.innerHTML = data.milestones
            .map(m => `
                <div class="timeline-item">
                    <div class="timeline-date">${m.date}</div>
                    <div class="timeline-version">${m.version}</div>
                    <div class="timeline-content">${m.content}</div>
                </div>
            `).join('');

        // GitHub link
        const githubBtn = document.getElementById('panel-github');
        if (data.github) {
            githubBtn.href = data.github;
            githubBtn.classList.remove('hidden');
        } else {
            githubBtn.classList.add('hidden');
        }

        this.panel.classList.remove('hidden');
    },

    hidePanel() {
        this.panel.classList.add('hidden');
    },

    showHoverLabel(text, x, y) {
        this.hoverLabel.textContent = text;
        this.hoverLabel.style.left = (x + 15) + 'px';
        this.hoverLabel.style.top = (y + 15) + 'px';
        this.hoverLabel.classList.remove('hidden');
    },

    hideHoverLabel() {
        this.hoverLabel.classList.add('hidden');
    },

    setupMinimap() {
        this.minimap.width = 180;
        this.minimap.height = 180;
    },

    updateMinimap() {
        const ctx = this.minimapCtx;
        const w = this.minimap.width;
        const h = this.minimap.height;
        const scale = 0.15;
        const cx = w / 2;
        const cy = h / 2;

        // Clear
        ctx.fillStyle = 'rgba(10, 5, 30, 0.9)';
        ctx.fillRect(0, 0, w, h);

        // Draw orbits
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        Planets.data.planets.forEach(p => {
            ctx.beginPath();
            ctx.arc(cx, cy, p.orbitRadius * scale, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw sun
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw planets
        Planets.objects.forEach(planet => {
            const x = cx + planet.position.x * scale;
            const y = cy + planet.position.z * scale;
            ctx.fillStyle = planet.userData.data.color;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw camera position
        const camX = cx + SpaceScene.camera.position.x * scale;
        const camY = cy + SpaceScene.camera.position.z * scale;
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(camX, camY, 4, 0, Math.PI * 2);
        ctx.fill();
    },

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.classList.add('fade-out');
        setTimeout(() => loading.style.display = 'none', 500);
    }
};
