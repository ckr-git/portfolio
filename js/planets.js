// ========================================
// Planets - Planet Creation and Management
// ========================================

const Planets = {
    data: null,
    objects: [],
    blackholes: [],
    sun: null,

    async load() {
        const response = await fetch('data/projects.json');
        this.data = await response.json();
    },

    createSun() {
        const geometry = new THREE.SphereGeometry(50, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.9
        });

        this.sun = new THREE.Mesh(geometry, material);
        SpaceScene.scene.add(this.sun);

        // Sun glow
        const glowGeometry = new THREE.SphereGeometry(55, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffdd44,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.sun.add(glow);

        // Store developer data
        this.sun.userData = {
            type: 'sun',
            data: this.data.developer
        };
    },

    createPlanets() {
        this.data.planets.forEach((planetData, index) => {
            // Create planet mesh
            const geometry = new THREE.SphereGeometry(planetData.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({
                color: planetData.color,
                roughness: 0.7,
                metalness: 0.3
            });

            const planet = new THREE.Mesh(geometry, material);

            // Set initial position on orbit
            const angle = (index / this.data.planets.length) * Math.PI * 2;
            planet.position.x = Math.cos(angle) * planetData.orbitRadius;
            planet.position.z = Math.sin(angle) * planetData.orbitRadius;

            // Store planet data
            planet.userData = {
                type: 'planet',
                data: planetData,
                angle: angle,
                orbitRadius: planetData.orbitRadius,
                orbitSpeed: planetData.orbitSpeed,
                rotationSpeed: planetData.rotationSpeed
            };

            SpaceScene.scene.add(planet);
            this.objects.push(planet);

            // Create orbit ring
            this.createOrbit(planetData.orbitRadius);

            // Create Saturn's ring if needed
            if (planetData.hasRing) {
                this.createRing(planet, planetData.size);
            }
        });

        // Create blackholes
        this.createBlackholes();
    },

    createBlackholes() {
        if (!this.data.blackholes) return;

        this.data.blackholes.forEach(bhData => {
            const group = new THREE.Group();

            // Event horizon (black sphere)
            const coreGeometry = new THREE.SphereGeometry(bhData.size, 32, 32);
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000
            });
            const core = new THREE.Mesh(coreGeometry, coreMaterial);
            group.add(core);

            // Accretion disk
            const diskGeometry = new THREE.RingGeometry(
                bhData.size * 1.5,
                bhData.size * 3,
                64
            );
            const diskMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            const disk = new THREE.Mesh(diskGeometry, diskMaterial);
            disk.rotation.x = Math.PI / 2.2;
            group.add(disk);

            // Outer glow
            const glowGeometry = new THREE.SphereGeometry(bhData.size * 1.2, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x4400ff,
                transparent: true,
                opacity: 0.3
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            group.add(glow);

            // Position
            group.position.set(bhData.position.x, 0, bhData.position.z);

            // Store data
            group.userData = {
                type: 'blackhole',
                data: bhData
            };

            SpaceScene.scene.add(group);
            this.blackholes.push(group);
        });
    },

    createOrbit(radius) {
        const points = [];
        const segments = 128;

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                0,
                Math.sin(angle) * radius
            ));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.2
        });

        const orbit = new THREE.Line(geometry, material);
        SpaceScene.scene.add(orbit);
    },

    createRing(planet, planetSize) {
        const innerRadius = planetSize * 1.4;
        const outerRadius = planetSize * 2.2;
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0xc9a227,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });

        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2.5;
        planet.add(ring);
    },

    update() {
        // Rotate sun
        if (this.sun) {
            this.sun.rotation.y += 0.002;
        }

        // Update planets
        this.objects.forEach(planet => {
            const data = planet.userData;

            // Orbit around sun
            data.angle += data.orbitSpeed;
            planet.position.x = Math.cos(data.angle) * data.orbitRadius;
            planet.position.z = Math.sin(data.angle) * data.orbitRadius;

            // Self rotation
            planet.rotation.y += data.rotationSpeed;
        });

        // Update blackholes
        this.blackholes.forEach(bh => {
            bh.rotation.y += 0.005;
        });
    }
};
