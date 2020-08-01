import * as THREE from "../three/three.module.js";
import { GLTFLoader } from "../loaders/GLTFLoader.js";
import { OrbitControls } from "../controller/OrbitControls.js";
var camera;
var worldScene;
var renderer;
var mixer;
var clock;
var objects = [];
var gltfs = [];
var mixers = [];

export function init() {
  // カメラを作成
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight
  );
  camera.position.set(0, 0, 43);

  // カメラコントローラーを作成
  const controls = new OrbitControls(camera);

  clock = new THREE.Clock();

  // シーンを作成
  worldScene = new THREE.Scene();

  // 座標軸を表示
  // 赤：x 緑：y 青：z
  // var axes = new THREE.AxisHelper(25);
  // worldScene.add(axes);

  // 平行光源を作成
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  worldScene.add(directionalLight);

  // シーンに環境光を追加
  const ambientLight = new THREE.AmbientLight(0xffffff);
  worldScene.add(ambientLight);

  // なぜ平面を追加
  worldScene.add(makeNazePlane(0, 0, -10, 0, 0, 0, "naze1.jpg")); // front
  worldScene.add(makeNazePlane(0, 0, 10, 0, Math.PI, 0, "naze3.jpg")); // back
  worldScene.add(makeNazePlane(-10, 0, 0, 0, Math.PI / 2, 0, "naze2.jpg")); // right
  worldScene.add(makeNazePlane(10, 0, 0, 0, -Math.PI / 2, 0, "naze4.jpg")); // left
  worldScene.add(makeNazePlane(0, 10, 0, Math.PI / 2, 0, 0, "naze5.jpg")); // ceiling
  worldScene.add(makeNazePlane(0, -10, 0, -Math.PI / 2, 0, 0, "naze6.jpg")); // Ground

  // 起動時にオブジェクトを3つ追加
  const radius = 5;
  addObject(0, 0, radius);
  addObject(radius * Math.sin(Math.PI / 3), 0, -radius * Math.cos(Math.PI / 3));
  addObject(
    -radius * Math.sin(Math.PI / 3),
    0,
    -radius * Math.cos(Math.PI / 3)
  );

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0); // 背景を透明にする
}

export function animate() {
  requestAnimationFrame(animate);

  var mixerUpdateDelta = clock.getDelta();

  mixers.forEach(function (mixer) {
    mixer.update(mixerUpdateDelta);
  });

  renderer.render(worldScene, camera);
}

export function addObject(x, y, z) {
  console.log("addObject");
  // シーンにGLTFモデルを追加
  var loader = new GLTFLoader().setPath("models/");
  loader.load("nimaru.gltf", function (gltf) {
    var animations = gltf.animations;
    var scene = gltf.scene;
    var mixer;

    mixer = new THREE.AnimationMixer(scene);
    var clip = THREE.AnimationClip.findByName(animations, "CubeAction.001");

    if (clip) {
      var action = mixer.clipAction(clip);
      action.play();
    }

    gltf.scene.position.x = x;
    gltf.scene.position.y = y;
    gltf.scene.position.z = z;

    console.log(gltf.scene.getObjectByName("Cube").position);

    worldScene.add(gltf.scene);
    mixers[gltf.scene.getObjectByName("Cube").id] = mixer;
    gltfs[gltf.scene.getObjectByName("Cube").id] = gltf;
    objects.push(gltf.scene.getObjectByName("Cube"));
  });
}

function makeNazePlane(x, y, z, rotX, rotY, rotZ, fileName) {
  // なぜ壁
  var texture = THREE.ImageUtils.loadTexture("./img/" + fileName);
  var material = new THREE.MeshBasicMaterial({ map: texture });
  var geometry = new THREE.PlaneGeometry(20, 20);
  var nazePlane = new THREE.Mesh(geometry, material);

  nazePlane.position.x = x;
  nazePlane.position.y = y;
  nazePlane.position.z = z;
  nazePlane.rotation.x = rotX;
  nazePlane.rotation.y = rotY;
  nazePlane.rotation.z = rotZ;

  return nazePlane;
}
