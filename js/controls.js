// ========================================
// Controls - Orbit Camera Controls
// ========================================

const Controls = {
    enabled: true,
    target: new THREE.Vector3(0, 0, 0),

    // Spherical coordinates
    spherical: {
        radius: 700,
        theta: 0,
        phi: Math.PI / 3
    },

    // Limits
    minRadius: 150,
    maxRadius: 1500,
    minPhi: 0.1,
    maxPhi: Math.PI - 0.1,

    // Mouse state
    isDragging: false,
    previousMouse: { x: 0, y: 0 },

    // Sensitivity
    rotateSensitivity: 0.005,
    zoomSensitivity: 0.1,

    init() {
        this.updateCameraPosition();
        this.bindEvents();
    },

    bindEvents() {
        const canvas = SpaceScene.renderer.domElement;

        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('mouseleave', () => this.onMouseUp());
        canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // Touch support
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', () => this.onMouseUp());
    },

    onMouseDown(e) {
        if (!this.enabled) return;
        this.isDragging = true;
        this.previousMouse.x = e.clientX;
        this.previousMouse.y = e.clientY;
        document.body.classList.add('grabbing');
    },

    onMouseMove(e) {
        if (!this.enabled || !this.isDragging) return;

        const deltaX = e.clientX - this.previousMouse.x;
        const deltaY = e.clientY - this.previousMouse.y;

        this.spherical.theta -= deltaX * this.rotateSensitivity;
        this.spherical.phi += deltaY * this.rotateSensitivity;

        // Clamp phi
        this.spherical.phi = Math.max(this.minPhi,
            Math.min(this.maxPhi, this.spherical.phi));

        this.previousMouse.x = e.clientX;
        this.previousMouse.y = e.clientY;

        this.updateCameraPosition();
    },

    onMouseUp() {
        this.isDragging = false;
        document.body.classList.remove('grabbing');
    },

    onWheel(e) {
        if (!this.enabled) return;
        e.preventDefault();

        this.spherical.radius += e.deltaY * this.zoomSensitivity;
        this.spherical.radius = Math.max(this.minRadius,
            Math.min(this.maxRadius, this.spherical.radius));

        this.updateCameraPosition();
    },

    onTouchStart(e) {
        if (!this.enabled || e.touches.length !== 1) return;
        this.isDragging = true;
        this.previousMouse.x = e.touches[0].clientX;
        this.previousMouse.y = e.touches[0].clientY;
    },

    onTouchMove(e) {
        if (!this.enabled || !this.isDragging) return;
        e.preventDefault();

        const deltaX = e.touches[0].clientX - this.previousMouse.x;
        const deltaY = e.touches[0].clientY - this.previousMouse.y;

        this.spherical.theta -= deltaX * this.rotateSensitivity;
        this.spherical.phi += deltaY * this.rotateSensitivity;

        this.spherical.phi = Math.max(this.minPhi,
            Math.min(this.maxPhi, this.spherical.phi));

        this.previousMouse.x = e.touches[0].clientX;
        this.previousMouse.y = e.touches[0].clientY;

        this.updateCameraPosition();
    },

    updateCameraPosition() {
        const { radius, theta, phi } = this.spherical;

        SpaceScene.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        SpaceScene.camera.position.y = radius * Math.cos(phi);
        SpaceScene.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);

        SpaceScene.camera.lookAt(this.target);
    },

    focusOnPlanet(planet) {
        const targetPos = planet.position.clone();
        this.target.copy(targetPos);
        this.spherical.radius = 150;
        this.updateCameraPosition();
    },

    resetView() {
        this.target.set(0, 0, 0);
        this.spherical.radius = 700;
        this.spherical.theta = 0;
        this.spherical.phi = Math.PI / 3;
        this.updateCameraPosition();
    }
};
