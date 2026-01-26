// ========================================
// Tutorial - First Visit Guide
// ========================================

const Tutorial = {
    steps: [
        {
            en: 'Welcome to my Space Portfolio! Click the Sun to learn about me.',
            zh: '欢迎来到我的太空作品集！点击太阳了解我。'
        },
        {
            en: 'Click any planet to view project details.',
            zh: '点击任意行星查看项目详情。'
        },
        {
            en: 'Drag to rotate view, scroll to zoom.',
            zh: '拖拽旋转视角，滚轮缩放。'
        },
        {
            en: 'Try Spaceship mode for first-person exploration!',
            zh: '试试飞船模式进行第一人称探索！'
        }
    ],
    currentStep: 0,
    overlay: null,

    init() {
        if (localStorage.getItem('tutorialCompleted')) return;
        this.createOverlay();
        this.showStep(0);
    },

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.innerHTML = `
            <div class="tutorial-box">
                <p id="tutorial-text"></p>
                <div class="tutorial-nav">
                    <span id="tutorial-dots"></span>
                    <button id="tutorial-next">Next</button>
                    <button id="tutorial-skip">Skip</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        document.getElementById('tutorial-next')
            .addEventListener('click', () => this.nextStep());
        document.getElementById('tutorial-skip')
            .addEventListener('click', () => this.complete());
    },

    showStep(index) {
        const lang = UI.currentLang;
        const step = this.steps[index];
        document.getElementById('tutorial-text').textContent = step[lang];

        // Update dots
        const dots = this.steps.map((_, i) =>
            `<span class="dot ${i === index ? 'active' : ''}"></span>`
        ).join('');
        document.getElementById('tutorial-dots').innerHTML = dots;

        // Update button text
        const nextBtn = document.getElementById('tutorial-next');
        if (index === this.steps.length - 1) {
            nextBtn.textContent = lang === 'zh' ? '开始探索' : 'Start';
        } else {
            nextBtn.textContent = lang === 'zh' ? '下一步' : 'Next';
        }
    },

    nextStep() {
        this.currentStep++;
        if (this.currentStep >= this.steps.length) {
            this.complete();
        } else {
            this.showStep(this.currentStep);
        }
    },

    complete() {
        localStorage.setItem('tutorialCompleted', 'true');
        this.overlay.classList.add('fade-out');
        setTimeout(() => this.overlay.remove(), 500);
    }
};
