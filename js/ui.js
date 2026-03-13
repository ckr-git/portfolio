// ========================================
// UI - User Interface Management
// ========================================

const UI = {
    currentLang: 'en',
    panel: null,
    hoverLabel: null,
    minimap: null,
    minimapCtx: null,
    skillsCanvas: null,
    skillsCtx: null,
    currentScreenshots: [],
    currentScreenshotIndex: 0,
    currentPanelData: null,

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

        // Star map exit button
        const starmapExit = document.getElementById('starmap-exit');
        if (starmapExit) {
            starmapExit.addEventListener('click', () => {
                this.setMode('orbit');
            });
        }
    },

    setLanguage(lang) {
        this.currentLang = lang;

        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update all translatable elements (static HTML with data-en/data-zh)
        document.querySelectorAll('[data-en]').forEach(el => {
            el.textContent = el.dataset[lang] || el.dataset.en;
        });

        // Re-render project panel if open
        if (this.currentPanelData && !this.panel.classList.contains('hidden')) {
            this.showPanel(this.currentPanelData);
        }

        // Re-render developer panel if open
        const devPanel = document.getElementById('developer-panel');
        if (devPanel && !devPanel.classList.contains('hidden')) {
            this.showDeveloperPanel(Planets.data.developer);
        }

        // Re-render star map labels if visible
        const starmapLabels = document.getElementById('starmap-labels');
        if (starmapLabels && !starmapLabels.classList.contains('hidden')) {
            this.showStarMapLabels();
        }
    },

    setMode(mode) {
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Toggle HUD visibility
        const hud = document.getElementById('spaceship-hud');
        const starmapExit = document.getElementById('starmap-exit');

        if (mode === 'spaceship') {
            Spaceship.enable();
            hud.classList.remove('hidden');
            starmapExit.classList.add('hidden');
            if (Controls.isStarMapMode) {
                Controls.exitStarMapMode();
                // Close any panels opened in star map mode
                this.hidePanel();
                this.hideDeveloperPanel();
            }
        } else if (mode === 'starmap') {
            Spaceship.disable();
            hud.classList.add('hidden');
            starmapExit.classList.remove('hidden');
            Controls.enterStarMapMode();
            // Generate labels after camera animation
            setTimeout(() => this.showStarMapLabels(), 1200);
        } else {
            Spaceship.disable();
            hud.classList.add('hidden');
            starmapExit.classList.add('hidden');
            if (Controls.isStarMapMode) {
                Controls.exitStarMapMode();
                // Close any panels opened in star map mode
                this.hidePanel();
                this.hideDeveloperPanel();
            }
            Controls.resetView();
        }
    },

    showPanel(data) {
        this.currentPanelData = data;
        const isZh = this.currentLang === 'zh';

        document.getElementById('panel-name').textContent =
            isZh ? data.nameCN : data.name;

        document.getElementById('panel-desc').textContent =
            isZh ? data.descriptionCN : data.description;

        // Screenshots gallery
        const screenshotContainer = document.getElementById('panel-screenshot');
        if (data.screenshots && data.screenshots.length > 0 && screenshotContainer) {
            this.currentScreenshots = data.screenshots;
            this.currentScreenshotIndex = 0;
            this.renderScreenshotGallery(screenshotContainer, data.name);
        } else if (screenshotContainer) {
            screenshotContainer.style.display = 'none';
        }

        // Badge
        const badge = document.getElementById('panel-badge');
        if (data.status === 'in_progress') {
            badge.textContent = isZh ? '开发中' : 'In Progress';
            badge.className = 'badge in-progress';
        } else if (data.isCommercial) {
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
        this.currentPanelData = null;
    },

    renderScreenshotGallery(container, altText) {
        const screenshots = this.currentScreenshots;
        const index = this.currentScreenshotIndex;
        const hasMultiple = screenshots.length > 1;

        let html = `<div class="gallery-wrapper">`;
        html += `<img src="${screenshots[index]}" alt="${altText}" onerror="this.parentElement.parentElement.style.display='none'">`;

        if (hasMultiple) {
            html += `<button class="gallery-btn gallery-prev" onclick="UI.prevScreenshot()">&#10094;</button>`;
            html += `<button class="gallery-btn gallery-next" onclick="UI.nextScreenshot()">&#10095;</button>`;
            html += `<div class="gallery-dots">`;
            for (let i = 0; i < screenshots.length; i++) {
                html += `<span class="gallery-dot ${i === index ? 'active' : ''}" onclick="UI.goToScreenshot(${i})"></span>`;
            }
            html += `</div>`;
            html += `<div class="gallery-counter">${index + 1} / ${screenshots.length}</div>`;
        }

        html += `</div>`;
        container.innerHTML = html;
        container.style.display = 'block';
    },

    prevScreenshot() {
        if (this.currentScreenshots.length <= 1) return;
        this.currentScreenshotIndex = (this.currentScreenshotIndex - 1 + this.currentScreenshots.length) % this.currentScreenshots.length;
        const container = document.getElementById('panel-screenshot');
        if (container) this.renderScreenshotGallery(container, '');
    },

    nextScreenshot() {
        if (this.currentScreenshots.length <= 1) return;
        this.currentScreenshotIndex = (this.currentScreenshotIndex + 1) % this.currentScreenshots.length;
        const container = document.getElementById('panel-screenshot');
        if (container) this.renderScreenshotGallery(container, '');
    },

    goToScreenshot(index) {
        this.currentScreenshotIndex = index;
        const container = document.getElementById('panel-screenshot');
        if (container) this.renderScreenshotGallery(container, '');
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
    },

    showDeveloperPanel(data) {
        const isZh = this.currentLang === 'zh';
        const devPanel = document.getElementById('developer-panel');
        if (!devPanel) return;

        document.getElementById('dev-name').textContent =
            isZh ? data.nameCN : data.name;
        document.getElementById('dev-desc').textContent =
            isZh ? data.descriptionCN : data.description;
        document.getElementById('dev-email').textContent = data.email;
        document.getElementById('dev-email').href = 'mailto:' + data.email;

        const resumeBtn = document.getElementById('dev-resume');
        if (data.resume && resumeBtn) {
            resumeBtn.href = data.resume;
            resumeBtn.classList.remove('hidden');
        }

        this.drawSkillsRadar();
        devPanel.classList.remove('hidden');
    },

    hideDeveloperPanel() {
        const devPanel = document.getElementById('developer-panel');
        if (devPanel) devPanel.classList.add('hidden');
    },

    drawSkillsRadar() {
        const canvas = document.getElementById('skills-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width = 280;
        const h = canvas.height = 280;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = 100;

        ctx.clearRect(0, 0, w, h);

        const skills = Planets.data.skills;
        const allSkills = [];

        Object.entries(skills).forEach(([category, items]) => {
            Object.entries(items).forEach(([name, value]) => {
                allSkills.push({ name, value, category });
            });
        });

        const count = allSkills.length;
        const angleStep = (Math.PI * 2) / count;

        // Draw grid
        for (let r = 2; r <= 10; r += 2) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            for (let i = 0; i <= count; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const radius = (r / 10) * maxR;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw axes
        allSkills.forEach((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
            ctx.stroke();

            // Labels
            const labelR = maxR + 25;
            const lx = cx + Math.cos(angle) * labelR;
            const ly = cy + Math.sin(angle) * labelR;
            ctx.fillStyle = '#94a3b8';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(skill.name, lx, ly);
        });

        // Draw data
        ctx.beginPath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;

        allSkills.forEach((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (skill.value / 10) * maxR;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw points
        allSkills.forEach((skill, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = (skill.value / 10) * maxR;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;

            ctx.beginPath();
            ctx.fillStyle = '#38bdf8';
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    // Star Map Mode Methods
    showStarMapLabels() {
        const container = document.getElementById('starmap-labels');
        if (!container) return;

        const isZh = this.currentLang === 'zh';
        let html = '';

        // Add sun label
        const sunPos = this.project3DTo2D(new THREE.Vector3(0, 0, 0));
        html += `<div class="starmap-label starmap-sun" style="left:${sunPos.x}px;top:${sunPos.y}px"
                     onclick="UI.onStarMapSunClick()">
                    <span class="label-dot sun-dot"></span>
                    <span class="label-text">${isZh ? '关于我' : 'About Me'}</span>
                </div>`;

        // Add planet labels
        Planets.objects.forEach((planet, index) => {
            const data = planet.userData.data;
            const pos = this.project3DTo2D(planet.position);
            const name = isZh ? data.nameCN : data.name;
            const featured = data.featured ? 'featured' : '';

            html += `<div class="starmap-label ${featured}" style="left:${pos.x}px;top:${pos.y}px"
                         onclick="UI.onStarMapLabelClick(${index})">
                        <span class="label-dot" style="background:${data.color}"></span>
                        <span class="label-text">${name}</span>
                        ${data.featured ? '<span class="label-star">★</span>' : ''}
                    </div>`;
        });

        container.innerHTML = html;
        container.classList.remove('hidden');
    },

    hideStarMapLabels() {
        const container = document.getElementById('starmap-labels');
        if (container) {
            container.classList.add('hidden');
            container.innerHTML = '';
        }
        document.getElementById('starmap-exit').classList.add('hidden');
    },

    project3DTo2D(position) {
        const vector = position.clone();
        vector.project(SpaceScene.camera);

        return {
            x: (vector.x * 0.5 + 0.5) * window.innerWidth,
            y: (-vector.y * 0.5 + 0.5) * window.innerHeight
        };
    },

    onStarMapLabelClick(index) {
        const planet = Planets.objects[index];
        if (planet) {
            this.showPanel(planet.userData.data);
        }
    },

    onStarMapSunClick() {
        this.showDeveloperPanel(Planets.data.developer);
    }
};
