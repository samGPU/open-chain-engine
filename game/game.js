import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default class Game {
    #SCORE = 10;
    #MODELS = [
        "./models/delivery.glb",
        "./models/ambulance.glb",
        "./models/deliveryFlat.glb",
        "./models/tractor.glb",
        "./models/truck.glb",
        "./models/truckFlat.glb",
        "./models/van.glb",
        "./models/firetruck.glb",
        "./models/garbageTruck.glb",
        "./models/police.glb",
        "./models/sedan.glb",
        "./models/suv.glb",
        "./models/suvLuxury.glb",
        "./models/taxi.glb",
        "./models/tractorShovel.glb",
        "./models/sedanSports.glb",
        "./models/hatchbackSports.glb",
        "./models/race.glb",
        "./models/raceFuture.glb",
    ]

    constructor() {
        this.sizes = {
            width: window.innerWidth,
            height: window.innerHeight
        }

        this.direction = "idle";
        this.speed = 0.1;

        this.modelPath = this.#MODELS[0];

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
            this.vehicle.rotateY(-Math.PI / 1.5)
            this.vehicle.position.z = -2;
            this.scene.add(this.vehicle)
            this.vehicleBoundingBox.setFromObject(this.vehicle)
            this.loaded++;
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

        this.#SCORE = 0;
    }

    loadNewVehicleModel(value = 0) {
        if(this.vehicle == null) {
            return;
        }
        if(value >= this.#MODELS.length - 1) {
            value = this.#MODELS.length - 1;
        }
        let modelPath = this.#MODELS[value];
        this.loader.load( modelPath, ( gltf ) => {
            this.scene.remove(this.vehicle)
            // get vehicle position and rotation
            let position = this.vehicle.position;
            let rotation = this.vehicle.rotation;
            this.vehicle = gltf.scene;
            this.vehicle.traverse((o) => {
                if (o.isMesh) o.material = this.matcapMaterial;
            });
            this.vehicle.position.set(position.x, position.y, position.z);
            this.vehicle.rotation.set(rotation.x, rotation.y, rotation.z);
            this.scene.add(this.vehicle)
            this.vehicleBoundingBox.setFromObject(this.vehicle)
        });
    }

    getScore() {
        return this.#SCORE;
    }

    #increaseScore() {
        this.#SCORE++;
    }

    resetScore() {
        this.#SCORE = 0;
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
        if(keyCode == "a" || keyCode == "ArrowLeft") {
            this.direction = "left";
        } else if(keyCode == "d" || keyCode == "ArrowRight") {
            this.direction = "right";
        }
    }

    keyUpHandle(keyCode) {
        if(keyCode == "a" || keyCode == "ArrowLeft") {
            this.direction = "forward";
        } else if(keyCode == "d" || keyCode == "ArrowRight") {
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

        if(this.direction !== 'idle') {
            this.vehicle.translateZ(-this.speed);
        }

        this.camera.lookAt(
            this.vehicle.position.x, 
            this.vehicle.position.y, 
            this.vehicle.position.z
        )

        // get distance between camera and vehicle
        let distance = this.camera.position.distanceTo(this.vehicle.position)
        if(distance > 80) {
            //spin the car around 140 degrees
            this.vehicle.rotateY(140)
        }

        if(this.vehicleBoundingBox.intersectsBox(this.flagBoundingBox)) {
            this.flag.position.set(
                (Math.floor((Math.random() * 50) + 1) - 25), 
                0, 
                (Math.floor((Math.random() * 50) + 1) - 25)
            )
            this.flagBoundingBox.setFromObject(this.flag)
            this.#increaseScore();
            this.speed += 0.01;
        }

        this.renderer.render(this.scene, this.camera)
    }
}