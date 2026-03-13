// ========================================
// Planets - Planet Creation and Management
// ========================================

const Planets = {
    data: null,
    objects: [],
    blackholes: [],
    sun: null,
    paused: false,

    async load() {
        const response = await fetch('data/projects.json?v=' + Date.now());
        this.data = await response.json();
    },

    createSun() {
        const group = new THREE.Group();

        // Core sun
        const geometry = new THREE.SphereGeometry(50, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 1
        });
        const core = new THREE.Mesh(geometry, material);
        group.add(core);

        // Inner glow layer
        const glow1Geometry = new THREE.SphereGeometry(54, 32, 32);
        const glow1Material = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.6
        });
        const glow1 = new THREE.Mesh(glow1Geometry, glow1Material);
        group.add(glow1);

        // Middle glow layer
        const glow2Geometry = new THREE.SphereGeometry(60, 32, 32);
        const glow2Material = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.35
        });
        const glow2 = new THREE.Mesh(glow2Geometry, glow2Material);
        group.add(glow2);

        // Outer corona
        const glow3Geometry = new THREE.SphereGeometry(70, 32, 32);
        const glow3Material = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.15
        });
        const glow3 = new THREE.Mesh(glow3Geometry, glow3Material);
        group.add(glow3);

        // Store for animation
        group.userData = {
            type: 'sun',
            data: this.data.developer,
            glowLayers: [glow1, glow2, glow3],
            pulsePhase: 0
        };

        this.sun = group;
        SpaceScene.scene.add(group);
    },

    createPlanets() {
        this.data.planets.forEach((planetData, index) => {
            const group = new THREE.Group();

            // Create planet mesh with enhanced material
            const geometry = new THREE.SphereGeometry(planetData.size, 48, 48);
            const material = new THREE.MeshStandardMaterial({
                color: planetData.color,
                roughness: 0.55,
                metalness: 0.15,
                emissive: planetData.color,
                emissiveIntensity: 0.08
            });

            const planet = new THREE.Mesh(geometry, material);
            group.add(planet);

            // Add rim light glow for larger planets
            if (planetData.size >= 10) {
                const rimGeometry = new THREE.SphereGeometry(planetData.size * 1.08, 32, 32);
                const rimMaterial = new THREE.MeshBasicMaterial({
                    color: planetData.color,
                    transparent: true,
                    opacity: 0.15,
                    side: THREE.BackSide
                });
                const rim = new THREE.Mesh(rimGeometry, rimMaterial);
                group.add(rim);
            }

            // Set initial position on orbit
            const angle = (index / this.data.planets.length) * Math.PI * 2;
            group.position.x = Math.cos(angle) * planetData.orbitRadius;
            group.position.z = Math.sin(angle) * planetData.orbitRadius;

            // Store planet data
            group.userData = {
                type: 'planet',
                data: planetData,
                angle: angle,
                orbitRadius: planetData.orbitRadius,
                orbitSpeed: planetData.orbitSpeed,
                rotationSpeed: planetData.rotationSpeed
            };

            // Add featured ring for highlighted projects (golden glow)
            if (planetData.featured) {
                this.createFeaturedRing(group, planetData.size);
            }

            // Add atmosphere effect for all planets
            this.createAtmosphere(group, planetData.size, planetData.color);

            SpaceScene.scene.add(group);
            this.objects.push(group);

            // Create Saturn's ring if needed
            if (planetData.hasRing) {
                this.createRing(group, planetData.size);
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

            // Inner accretion disk (hot orange-white)
            const disk1Geometry = new THREE.RingGeometry(
                bhData.size * 1.3,
                bhData.size * 2,
                64
            );
            const disk1Material = new THREE.MeshBasicMaterial({
                color: 0xffaa44,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            const disk1 = new THREE.Mesh(disk1Geometry, disk1Material);
            disk1.rotation.x = Math.PI / 2.2;
            group.add(disk1);

            // Outer accretion disk (cooler orange-red)
            const disk2Geometry = new THREE.RingGeometry(
                bhData.size * 2,
                bhData.size * 3.5,
                64
            );
            const disk2Material = new THREE.MeshBasicMaterial({
                color: 0xff6622,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const disk2 = new THREE.Mesh(disk2Geometry, disk2Material);
            disk2.rotation.x = Math.PI / 2.2;
            group.add(disk2);

            // Gravitational lensing glow (purple-blue)
            const glowGeometry = new THREE.SphereGeometry(bhData.size * 1.15, 32, 32);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0x6622ff,
                transparent: true,
                opacity: 0.4
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            group.add(glow);

            // Outer halo
            const haloGeometry = new THREE.SphereGeometry(bhData.size * 1.4, 32, 32);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: 0x4400aa,
                transparent: true,
                opacity: 0.15
            });
            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            group.add(halo);

            // Position
            group.position.set(bhData.position.x, 0, bhData.position.z);

            // Store data
            group.userData = {
                type: 'blackhole',
                data: bhData,
                disks: [disk1, disk2]
            };

            SpaceScene.scene.add(group);
            this.blackholes.push(group);
        });
    },

    createOrbit(radius, index = 0) {
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

        // Gradient color based on orbit distance
        const hue = 0.55 + (index / 15) * 0.15; // cyan to purple
        const color = new THREE.Color().setHSL(hue, 0.8, 0.5);

        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.25
        });

        const orbit = new THREE.Line(geometry, material);
        SpaceScene.scene.add(orbit);
    },

    createRing(planet, planetSize) {
        // Inner ring (brighter)
        const inner1 = planetSize * 1.3;
        const outer1 = planetSize * 1.7;
        const ring1Geometry = new THREE.RingGeometry(inner1, outer1, 64);
        const ring1Material = new THREE.MeshBasicMaterial({
            color: 0xddc060,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
        ring1.rotation.x = Math.PI / 2.5;
        planet.add(ring1);

        // Outer ring (dimmer)
        const inner2 = planetSize * 1.8;
        const outer2 = planetSize * 2.4;
        const ring2Geometry = new THREE.RingGeometry(inner2, outer2, 64);
        const ring2Material = new THREE.MeshBasicMaterial({
            color: 0xaa9040,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
        ring2.rotation.x = Math.PI / 2.5;
        planet.add(ring2);
    },

    createFeaturedRing(planet, planetSize) {
        // Golden featured ring - subtle but visible
        const ringGeometry = new THREE.RingGeometry(
            planetSize * 1.5,
            planetSize * 1.8,
            64
        );
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.userData.isFeaturedRing = true;
        planet.add(ring);

        // Outer glow ring
        const glowGeometry = new THREE.RingGeometry(
            planetSize * 1.8,
            planetSize * 2.1,
            64
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = Math.PI / 2;
        planet.add(glow);
    },

    createAtmosphere(planet, planetSize, color) {
        // Atmosphere glow effect (Fresnel-like)
        const atmosphereGeometry = new THREE.SphereGeometry(planetSize * 1.12, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.12,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
    },

    update() {
        // Skip animation if paused (star map mode)
        if (this.paused) return;

        // Rotate sun with pulse effect
        if (this.sun) {
            this.sun.rotation.y += 0.002;

            // Pulse animation for glow layers
            if (this.sun.userData.glowLayers) {
                this.sun.userData.pulsePhase += 0.02;
                const pulse = Math.sin(this.sun.userData.pulsePhase);

                this.sun.userData.glowLayers.forEach((glow, i) => {
                    const baseScale = 1 + i * 0.08;
                    const pulseAmount = 0.02 * (i + 1);
                    const scale = baseScale + pulse * pulseAmount;
                    glow.scale.setScalar(scale);
                });
            }
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

            // Animate featured ring pulse
            if (data.data.featured) {
                planet.children.forEach(child => {
                    if (child.userData && child.userData.isFeaturedRing) {
                        const pulse = 0.3 + 0.1 * Math.sin(Date.now() * 0.002);
                        child.material.opacity = pulse;
                    }
                });
            }
        });

        // Update blackholes with disk rotation
        this.blackholes.forEach(bh => {
            bh.rotation.y += 0.008;

            // Rotate disks at different speeds
            if (bh.userData.disks) {
                bh.userData.disks[0].rotation.z += 0.015;
                bh.userData.disks[1].rotation.z += 0.008;
            }
        });
    }
};
