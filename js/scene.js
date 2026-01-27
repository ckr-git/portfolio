// ========================================
// Scene Setup - Three.js Scene Initialization
// ========================================

const SpaceScene = {
    scene: null,
    camera: null,
    renderer: null,
    meteors: [],
    time: 0,

    init() {
        // Create scene
        this.scene = new THREE.Scene();

        // Add deep space gradient background
        this.createSpaceBackground();

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 300, 600);
        this.camera.lookAt(0, 0, 0);

        // Create renderer with enhanced settings
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        document.body.appendChild(this.renderer.domElement);

        // Add lights
        this.addLights();

        // Add starfield
        this.addStarfield();

        // Add nebula clouds
        this.addNebula();

        // Add meteors
        this.addMeteors();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    },

    createSpaceBackground() {
        // Create gradient sphere for deep space
        const canvas = document.createElement('canvas');
        canvas.width = 2;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Deep space gradient: dark blue to purple to black
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#030014');
        gradient.addColorStop(0.3, '#0a0520');
        gradient.addColorStop(0.6, '#0d0a1a');
        gradient.addColorStop(1, '#020108');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2, 512);

        const texture = new THREE.CanvasTexture(canvas);
        const bgGeometry = new THREE.SphereGeometry(5000, 32, 32);
        const bgMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        });
        const background = new THREE.Mesh(bgGeometry, bgMaterial);
        this.scene.add(background);
    },

    addLights() {
        // Ambient light - slightly blue tinted
        const ambient = new THREE.AmbientLight(0x303050, 0.6);
        this.scene.add(ambient);

        // Point light at sun position - warm color
        const sunLight = new THREE.PointLight(0xffeecc, 2.5, 1500);
        sunLight.position.set(0, 0, 0);
        this.scene.add(sunLight);

        // Subtle rim light from behind
        const rimLight = new THREE.DirectionalLight(0x4488ff, 0.3);
        rimLight.position.set(0, 100, -500);
        this.scene.add(rimLight);
    },

    addStarfield() {
        // Layer 1: Distant small stars
        this.createStarLayer(8000, 2000, 4000, 0xffffff, 1.0, 0.6);
        // Layer 2: Medium stars with slight blue tint
        this.createStarLayer(3000, 1800, 3500, 0xaaccff, 1.5, 0.7);
        // Layer 3: Closer bright stars
        this.createStarLayer(1000, 1500, 3000, 0xffffff, 2.5, 0.9);
        // Layer 4: Rare colored stars
        this.createStarLayer(200, 1600, 3200, 0xffccaa, 3.0, 0.8);
        this.createStarLayer(150, 1700, 3300, 0xaaffff, 2.8, 0.75);
    },

    createStarLayer(count, minRadius, maxRadius, color, size, opacity) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count * 3; i += 3) {
            const radius = minRadius + Math.random() * (maxRadius - minRadius);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i + 2] = radius * Math.cos(phi);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: opacity,
            sizeAttenuation: true
        });

        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
    },

    addNebula() {
        // Create colorful nebula clouds using particle systems
        const nebulaColors = [
            { color: 0x6622aa, opacity: 0.08 },  // Purple
            { color: 0x2244aa, opacity: 0.06 },  // Blue
            { color: 0xaa2266, opacity: 0.05 },  // Pink
            { color: 0x22aa88, opacity: 0.04 }   // Teal
        ];

        nebulaColors.forEach((nebula, index) => {
            this.createNebulaCloud(nebula.color, nebula.opacity, index);
        });
    },

    createNebulaCloud(color, opacity, seed) {
        const count = 300;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        // Create cloud-like distribution
        const centerX = (seed % 2 === 0 ? 1 : -1) * (1500 + seed * 300);
        const centerZ = (seed < 2 ? 1 : -1) * (1200 + seed * 200);

        for (let i = 0; i < count * 3; i += 3) {
            const r = Math.random() * 800;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i] = centerX + r * Math.sin(phi) * Math.cos(theta);
            positions[i + 1] = (Math.random() - 0.5) * 400;
            positions[i + 2] = centerZ + r * Math.sin(phi) * Math.sin(theta);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 80,
            transparent: true,
            opacity: opacity,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        const nebula = new THREE.Points(geometry, material);
        this.scene.add(nebula);
    },

    addMeteors() {
        const colors = [0xffffff, 0xaaccff, 0xffddaa, 0x88ffff];
        for (let i = 0; i < 20; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.createMeteor(color);
        }
    },

    createMeteor(color = 0xffffff) {
        // Create gradient trail with multiple segments
        const trailLength = 40 + Math.random() * 30;
        const segments = 8;
        const group = new THREE.Group();

        for (let i = 0; i < segments; i++) {
            const points = [];
            const segLen = trailLength / segments;
            const startOffset = i * segLen;

            points.push(new THREE.Vector3(-startOffset, -startOffset, 0));
            points.push(new THREE.Vector3(-startOffset - segLen, -startOffset - segLen, 0));

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const opacity = (1 - i / segments) * 0.7;
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: opacity
            });

            const segment = new THREE.Line(geometry, material);
            group.add(segment);
        }

        // Add bright head
        const headGeometry = new THREE.SphereGeometry(1.5, 8, 8);
        const headMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        group.add(head);

        this.resetMeteor(group);
        this.scene.add(group);
        this.meteors.push(group);
    },

    resetMeteor(meteor) {
        meteor.position.set(
            (Math.random() - 0.5) * 4000,
            Math.random() * 1500 + 500,
            (Math.random() - 0.5) * 4000
        );
        meteor.userData.speed = Math.random() * 10 + 5;
        meteor.userData.flickerPhase = Math.random() * Math.PI * 2;
    },

    updateMeteors() {
        this.time += 0.05;
        this.meteors.forEach(meteor => {
            meteor.position.x += meteor.userData.speed;
            meteor.position.y -= meteor.userData.speed;

            // Flicker effect
            const flicker = 0.7 + 0.3 * Math.sin(this.time * 3 + meteor.userData.flickerPhase);
            meteor.children.forEach((child, i) => {
                if (child.material) {
                    const baseOpacity = i === meteor.children.length - 1 ? 0.9 : (1 - i / 8) * 0.7;
                    child.material.opacity = baseOpacity * flicker;
                }
            });

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
