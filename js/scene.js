// ========================================
// Scene Setup - Three.js Scene Initialization
// ========================================

const SpaceScene = {
    scene: null,
    camera: null,
    renderer: null,
    meteors: [],

    init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 300, 600);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(this.renderer.domElement);

        // Add lights
        this.addLights();

        // Add starfield
        this.addStarfield();

        // Add meteors
        this.addMeteors();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    },

    addLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambient);

        // Point light at sun position
        const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);
    },

    addStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 5000;
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            const radius = 2000 + Math.random() * 3000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }

        starsGeometry.setAttribute('position',
            new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    },

    addMeteors() {
        for (let i = 0; i < 15; i++) {
            this.createMeteor();
        }
    },

    createMeteor() {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(new THREE.Vector3(-30, -30, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.3
        });

        const meteor = new THREE.Line(geometry, material);
        this.resetMeteor(meteor);
        this.scene.add(meteor);
        this.meteors.push(meteor);
    },

    resetMeteor(meteor) {
        meteor.position.set(
            (Math.random() - 0.5) * 4000,
            Math.random() * 1500 + 500,
            (Math.random() - 0.5) * 4000
        );
        meteor.userData.speed = Math.random() * 8 + 4;
    },

    updateMeteors() {
        this.meteors.forEach(meteor => {
            meteor.position.x += meteor.userData.speed;
            meteor.position.y -= meteor.userData.speed;

            if (meteor.position.y < -500) {
                this.resetMeteor(meteor);
            }
        });
    },

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    render() {
        this.renderer.render(this.scene, this.camera);
    }
};
