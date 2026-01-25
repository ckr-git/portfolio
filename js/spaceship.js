// ========================================
// Spaceship - First Person Controls
// ========================================

const Spaceship = {
    enabled: false,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),

    // Movement
    speed: 0,
    maxSpeed: 10,
    acceleration: 0.5,
    deceleration: 0.98,

    // Rotation
    euler: new THREE.Euler(0, 0, 0, 'YXZ'),
    mouseSensitivity: 0.002,

    // Key states
    keys: {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false
    },

    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('wheel', (e) => this.onWheel(e));
    },

    onKeyDown(e) {
        if (!this.enabled) return;
        this.updateKey(e.code, true);
    },

    onKeyUp(e) {
        if (!this.enabled) return;
        this.updateKey(e.code, false);
    },

    updateKey(code, pressed) {
        switch (code) {
            case 'KeyW': this.keys.forward = pressed; break;
            case 'KeyS': this.keys.backward = pressed; break;
            case 'KeyA': this.keys.left = pressed; break;
            case 'KeyD': this.keys.right = pressed; break;
            case 'Space': this.keys.up = pressed; break;
            case 'ShiftLeft': this.keys.down = pressed; break;
        }
    },

    onMouseMove(e) {
        if (!this.enabled) return;

        this.euler.setFromQuaternion(SpaceScene.camera.quaternion);
        this.euler.y -= e.movementX * this.mouseSensitivity;
        this.euler.x -= e.movementY * this.mouseSensitivity;

        // Clamp vertical rotation
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));

        SpaceScene.camera.quaternion.setFromEuler(this.euler);
    },

    onWheel(e) {
        if (!this.enabled) return;
        e.preventDefault();

        this.maxSpeed = Math.max(1, Math.min(20, this.maxSpeed - e.deltaY * 0.01));
    },

    enable() {
        this.enabled = true;
        Controls.enabled = false;
        document.body.classList.add('spaceship-mode');
        document.body.requestPointerLock();
    },

    disable() {
        this.enabled = false;
        Controls.enabled = true;
        document.body.classList.remove('spaceship-mode');
        document.exitPointerLock();
        this.resetKeys();
    },

    resetKeys() {
        Object.keys(this.keys).forEach(key => this.keys[key] = false);
        this.speed = 0;
    },

    update() {
        if (!this.enabled) return;

        // Calculate direction
        this.direction.set(0, 0, 0);

        if (this.keys.forward) this.direction.z -= 1;
        if (this.keys.backward) this.direction.z += 1;
        if (this.keys.left) this.direction.x -= 1;
        if (this.keys.right) this.direction.x += 1;
        if (this.keys.up) this.direction.y += 1;
        if (this.keys.down) this.direction.y -= 1;

        // Apply camera rotation to direction
        if (this.direction.length() > 0) {
            this.direction.normalize();
            this.direction.applyQuaternion(SpaceScene.camera.quaternion);
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else {
            this.speed *= this.deceleration;
        }

        // Update position
        this.velocity.copy(this.direction).multiplyScalar(this.speed);
        SpaceScene.camera.position.add(this.velocity);

        // Update HUD
        this.updateHUD();
    },

    updateHUD() {
        const pos = SpaceScene.camera.position;
        document.getElementById('speed-value').textContent = this.speed.toFixed(1);
        document.getElementById('coord-x').textContent = pos.x.toFixed(0);
        document.getElementById('coord-y').textContent = pos.y.toFixed(0);
        document.getElementById('coord-z').textContent = pos.z.toFixed(0);
    }
};
