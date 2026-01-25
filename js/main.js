// ========================================
// Main - Application Entry Point
// ========================================

const App = {
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    hoveredObject: null,

    async init() {
        // Initialize scene
        SpaceScene.init();

        // Load planet data
        await Planets.load();

        // Create solar system
        Planets.createSun();
        Planets.createPlanets();

        // Initialize controls
        Controls.init();
        Spaceship.init();

        // Initialize UI
        UI.init();

        // Bind interaction events
        this.bindEvents();

        // Hide loading screen
        UI.hideLoading();

        // Start animation loop
        this.animate();
    },

    bindEvents() {
        const canvas = SpaceScene.renderer.domElement;

        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('click', (e) => this.onClick(e));
    },

    onMouseMove(e) {
        // Update mouse coordinates
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Raycast
        this.raycaster.setFromCamera(this.mouse, SpaceScene.camera);
        const allObjects = [Planets.sun, ...Planets.objects];
        const intersects = this.raycaster.intersectObjects(allObjects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;

            if (obj !== this.hoveredObject) {
                this.hoveredObject = obj;
                const data = obj.userData.data;
                const name = UI.currentLang === 'zh' ?
                    (data.nameCN || data.name) : data.name;
                UI.showHoverLabel(name, e.clientX, e.clientY);
            }

            document.body.style.cursor = 'pointer';
        } else {
            if (this.hoveredObject) {
                this.hoveredObject = null;
                UI.hideHoverLabel();
            }
            document.body.style.cursor = Spaceship.enabled ? 'crosshair' : 'grab';
        }
    },

    onClick(e) {
        if (Spaceship.enabled) return;

        this.raycaster.setFromCamera(this.mouse, SpaceScene.camera);
        const allObjects = [Planets.sun, ...Planets.objects];
        const intersects = this.raycaster.intersectObjects(allObjects);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            const data = obj.userData.data;

            if (obj.userData.type === 'sun') {
                // Show developer info
                UI.showPanel({
                    name: data.name,
                    nameCN: data.nameCN,
                    description: data.description,
                    descriptionCN: data.descriptionCN,
                    techStack: ['Full-Stack', 'AI', 'React', 'Spring Boot'],
                    milestones: [
                        { date: '2023', version: '', content: 'Started coding journey' },
                        { date: '2024', version: '', content: 'Building amazing projects' }
                    ],
                    github: data.github
                });
            } else {
                UI.showPanel(data);
                Controls.focusOnPlanet(obj);
            }
        }
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update planets
        Planets.update();

        // Update spaceship
        Spaceship.update();

        // Update minimap
        UI.updateMinimap();

        // Render scene
        SpaceScene.render();
    }
};

// Start application
window.addEventListener('DOMContentLoaded', () => App.init());
