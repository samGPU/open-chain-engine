import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Game {
    constructor() {
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.direction = "idle";
        this.speed = 0.1;

        this.models = [
            "./models/ambulance.glb",
            "./models/delivery.glb",
            "./models/deliveryFlat.glb",
            "./models/firetruck.glb",
            "./models/garbageTruck.glb",
            "./models/hatchbackSports.glb",
            "./models/police.glb",
            "./models/race.glb",
            "./models/raceFuture.glb",
            "./models/sedan.glb",
            "./models/sedanSports.glb",
            "./models/suv.glb",
            "./models/suvLuxury.glb",
            "./models/taxi.glb",
            "./models/tractor.glb",
            "./models/tractorShovel.glb",
            "./models/truck.glb",
            "./models/truckFlat.glb",
            "./models/van.glb"
        ]
        this.modelPath = this.models[0];

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75, 
            this.sizes.width / this.sizes.height, 
            0.1, 
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('.webgl'),
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.camera.position.setZ(5);
        this.camera.position.setY(2);

        this.textureLoader = new THREE.TextureLoader()
        this.matcapTexture = this.textureLoader.load('./images/325.jpg')
        this.matcapMaterial = new THREE.MeshMatcapMaterial(
            { matcap: this.matcapTexture }
        );

        this.loader = new GLTFLoader();
        this.loaded = 0;

        this.vehicle = null;
        this.vehicleBoundingBox = new THREE.Box3();
        this.loader.load( this.modelPath, ( gltf ) => {
            this.vehicle = gltf.scene;
            this.vehicle.traverse((o) => {
                if (o.isMesh) o.material = this.matcapMaterial;
            });
            this.scene.add(this.vehicle)
            this.vehicleBoundingBox.setFromObject(this.vehicle)
            this.loaded++;
            if(this.loaded > 2) {
                this.animate()
            }
        });

        this.flag = null;
        this.flagBoundingBox = new THREE.Box3()
        this.loader.load( "./models/flag.glb", ( gltf ) => {
            this.flag = gltf.scene;
            this.flag.traverse((o) => {
                if (o.isMesh) o.material = this.matcapMaterial;
            });
            this.scene.add(this.flag);
            this.flag.position.set(
                (Math.floor((Math.random() * 10) + 1)), 
                0, 
                (Math.floor((Math.random() * 10) + 1))
            )
            this.flagBoundingBox.setFromObject(this.flag)
            this.loaded++;
            if(this.loaded > 2) {
                this.animate()
            }
        });

        this.arrow;
        this.loader.load( "./models/arrow.glb", ( gltf ) => {
            this.arrow = gltf.scene;
            this.arrow.traverse((o) => {
                if (o.isMesh) o.material = this.matcapMaterial;
            });
            this.scene.add(this.arrow);
            this.arrow.position.set(0, 0, 0)
            this.arrow.rotation.y = (Math.PI / 2)
            this.loaded++;
            if(this.loaded > 2) {
                this.animate()
            }
        });

        this.ring = new THREE.Mesh(
            new THREE.RingGeometry(0.8, 1, 32),
            this.matcapMaterial
        )
        this.scene.add(this.ring)
        this.ring.rotation.x = -(Math.PI / 2)

        this.floor = new THREE.Mesh(
            new THREE.PlaneGeometry(1000, 1000, 100, 100),
            new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true })
        )
        this.scene.add(this.floor)
        this.floor.position.y = -0.5
        this.floor.rotation.x = -(Math.PI / 2)

        this.score = 0;
    }

    resize() {
        this.sizes.width = window.innerWidth
        this.sizes.height = window.innerHeight

        this.camera.aspect = this.sizes.width / this.sizes.height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(this.sizes.width, this.sizes.height)
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    keyDownHandle(keyCode) {
        if(keyCode == "a") {
            this.direction = "left";
        } else if(keyCode == "d") {
            this.direction = "right";
        }
    }

    keyUpHandle(keyCode) {
        if(keyCode == "a") {
            this.direction = "forward";
        } else if(keyCode == "d") {
            this.direction = "forward";
        }
    }

    animate() {
        if(this.loaded < 3) {
            return;
        }

        this.vehicleBoundingBox.setFromObject(this.vehicle)

        if(this.direction == "left") {
            this.vehicle.rotation.y += 0.05;
        }
        else if(this.direction == "right") {
            this.vehicle.rotation.y -= 0.05;
        }

        this.ring.position.x = this.flag.position.x
        this.ring.position.z = this.flag.position.z

        this.arrow.lookAt(
            this.flag.position.x, 
            this.flag.position.y, 
            this.flag.position.z
        )
        this.arrow.position.set(
            this.vehicle.position.x, 
            this.vehicle.position.y, 
            this.vehicle.position.z
        )

        this.vehicle.translateZ(-this.speed);

        this.camera.lookAt(
            this.vehicle.position.x, 
            this.vehicle.position.y, 
            this.vehicle.position.z
        )

        if(this.vehicleBoundingBox.intersectsBox(this.flagBoundingBox)) {
            this.flag.position.set(
                (Math.floor((Math.random() * 50) + 1) - 25), 
                0, 
                (Math.floor((Math.random() * 50) + 1) - 25)
            )
            this.flagBoundingBox.setFromObject(this.flag)
            this.score++;
            this.speed += 0.01;
        }

        this.renderer.render(this.scene, this.camera)
    }
}