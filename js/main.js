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

        // Initialize tutorial
        Tutorial.init();

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
        const allObjects = [Planets.sun, ...Planets.objects, ...Planets.blackholes];
        const intersects = this.raycaster.intersectObjects(allObjects, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            // Handle group objects (blackholes)
            if (obj.parent && obj.parent.userData && obj.parent.userData.type) {
                obj = obj.parent;
            }

            if (obj !== this.hoveredObject && obj.userData && obj.userData.data) {
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
        const allObjects = [Planets.sun, ...Planets.objects, ...Planets.blackholes];
        const intersects = this.raycaster.intersectObjects(allObjects, true);

        if (intersects.length > 0) {
            let obj = intersects[0].object;
            // Handle group objects (blackholes)
            if (obj.parent && obj.parent.userData && obj.parent.userData.type) {
                obj = obj.parent;
            }

            if (!obj.userData || !obj.userData.data) return;
            const data = obj.userData.data;

            if (obj.userData.type === 'sun') {
                UI.showDeveloperPanel(data);
            } else if (obj.userData.type === 'blackhole') {
                UI.showPanel(data);
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

        // Update camera animation
        Controls.updateAnimation();

        // Update meteors
        SpaceScene.updateMeteors();

        // Update minimap
        UI.updateMinimap();

        // Render scene
        SpaceScene.render();
    }
};

// Start application
window.addEventListener('DOMContentLoaded', () => App.init());
