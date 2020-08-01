import * as THREE from '../three/three.module.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';

var rotationY = 0;

export function init() {
  // カメラを作成
  var camera = new THREE.PerspectiveCamera( 45, (window.innerWidth/1.1) / (window.innerHeight/2.2));
  camera.position.set(0, 0, 11);

  // シーンを作成
  var worldScene = new THREE.Scene();

  // スポットライト
  const light = new THREE.SpotLight(0xffffff, 5, 80, Math.PI / 15, 1, 1.2);
  light.position.set(0, 15, 0);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  worldScene.add(light);

  // 床を作成
  const meshFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(10, 10, 0.01, 32),
    new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.0 })
   );

   meshFloor.position.set(0,-3,0);

   // 影を受け付ける
  meshFloor.receiveShadow = true;
  worldScene.add(meshFloor);

  // シーンに環境光を追加
  const ambientLight = new THREE.AmbientLight(0xffffff);
  //worldScene.add(ambientLight);

  var scene;
  var gltf;

  // レンダラーを作成
  var renderer = new THREE.WebGLRenderer( {
    canvas: document.querySelector('#myCanvasIndex'),
    alpha: true}
  );

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( (window.innerWidth/1.1) , (window.innerHeight/2.2));
  renderer.setClearColor( 0x000000, 0 );	// 背景を透明にする
  // レンダラー：シャドウを有効にする
  renderer.shadowMap.enabled = true;


  // 起動時にオブジェクトを一つ追加
  var loader = new GLTFLoader().setPath( 'models/' );
  loader.load( 'nimaru3.gltf', function ( gltf ) {
    scene = gltf.scene;
    gltf.scene.getObjectByName("Cube").rotation.y = rotationY;

    gltf.scene.getObjectByName("Cube").castShadow = true;
    worldScene.add( gltf.scene );

    animate();

    function animate() {
      gltf.scene.getObjectByName("Cube").rotation.y = rotationY;
      rotationY += 0.007;
      console.log(rotationY);
      requestAnimationFrame( animate );
      renderer.render( worldScene, camera );
    }
  } );
}
