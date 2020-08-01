import * as THREE from '../three/three.module.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';
import { SkeletonUtils } from '../utils/SkeletonUtils.js';
// import { addObject, setPosition, setPosture, setSize, OnTouchStart, OnTouchMove,OnTouchEnd} from '../controller/controller.js';

var camera;
var worldScene;
var renderer;
var mixer;

var clock;

// この平面に対してオブジェクトを平行に動かす
// デフォルトは(1,0,0) -> yz平面
var plane = new THREE.Plane();
var raycaster = new THREE.Raycaster();
var touchPoint = new THREE.Vector2();
var touchPointRot = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
// ドラッグしているオブジェクト
var draggedObj;
// 位置、向き、大きさ制御用変数
var controlState = "position" //初期値は位置
const position = "position";
const posture = "posture";
const size = "size";

var dx;
var dy;

var oldX;
var oldY;

// オブジェクトを格納する配列
var objects = [];
var gltfs = [];
var mixers = [];

export function init() {

  // カメラを作成
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight);
  camera.position.set(0, 0, 20);

  clock = new THREE.Clock();

  // シーンを作成
  worldScene = new THREE.Scene();

  // 平行光源を作成
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1);
  worldScene.add(directionalLight);

  // シーンに環境光を追加
  const ambientLight = new THREE.AmbientLight(0xffffff);
  worldScene.add(ambientLight);

  // 起動時にオブジェクトを一つ追加
  addObject("1");

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer( {
    canvas: document.querySelector('#myCanvas'),
    alpha: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0x000000, 0 );	// 背景を透明にする

    // イベントの定義
    document.getElementById( 'addButton' ).addEventListener('click',addObject,false);
    document.getElementById( 'positionButton' ).addEventListener('click',setPosition,false);
    document.getElementById( 'postureButton' ).addEventListener('click',setPosture,false);
    document.getElementById( 'sizeButton' ).addEventListener('click',setSize,false);
    renderer.domElement.addEventListener( 'touchstart', OnTouchStart, false );
    renderer.domElement.addEventListener( 'touchmove', OnTouchMove, false );
    renderer.domElement.addEventListener( 'touchend', OnTouchEnd, false );
    window.addEventListener( 'resize', onWindowResize, false );
  }

export function animate() {
  //console.table(objects);
  requestAnimationFrame( animate );

  	var mixerUpdateDelta = clock.getDelta();

    mixers.forEach(function(mixer){
      mixer.update( mixerUpdateDelta );
    });

    renderer.render( worldScene, camera );
  }

// object追加関数
export function addObject(firstFlag){
  console.log("addObject");
  // シーンにGLTFモデルを追加
  var loader = new GLTFLoader().setPath( 'models/' );
  loader.load( 'nimaru3.gltf', function ( gltf ) {

    var animations = gltf.animations;
    var scene = gltf.scene;
    var mixer

    mixer = new THREE.AnimationMixer(scene);
    var clip = THREE.AnimationClip.findByName( animations, "CubeAction.001" );

    if ( clip ) {
      var action = mixer.clipAction( clip );
      action.play();
    }

    if(firstFlag != "1"){
      ;
      gltf.scene.position.copy(generateRandamPosition());
    }

    console.log(gltf.scene.getObjectByName("Cube").position);

    worldScene.add( gltf.scene );
    mixers[gltf.scene.getObjectByName("Cube").id] = (mixer);
    gltfs[gltf.scene.getObjectByName("Cube").id] = gltf;
    objects.push(gltf.scene.getObjectByName("Cube"));

  } );
}

// 位置制御
export function setPosition(){
  controlState = position;
  console.log(controlState);
  //alert(controlState);
}

// 姿勢制御
export function setPosture(){
  controlState = posture;
  console.log(controlState);
  //alert(controlState);
}

// 大きさ制御
export function setSize(){
  controlState = size;
  console.log(controlState);
  //alert(controlState);
}

// touchイベントの登録
// 指を置いた時のアクション
export function OnTouchStart( event ) {
  console.log("touchstarat");
  event.preventDefault();
  //controls.enabled = false;

  // 平行移動させる平面の法線ベクトルをカメラの方向ベクトルに合わせる
  camera.getWorldDirection( plane.normal );

  // 画面上で指を動かした量から、三次元空間の移動量を決定する
  touchPoint.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
  touchPoint.y = - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

  oldX = touchPoint.x;
  oldY = touchPoint.y;

  // タッチ点とカメラのレイキャストを設定
  raycaster.setFromCamera( touchPoint, camera );

  // オブジェクト群から、マウスとカメラの方向ベクトルの先にあるオブジェクト(平行移動させる物体)を抽出する。
  var intersects = raycaster.intersectObjects( objects );

  // マウスとカメラの方向ベクトルの先にオブジェクトがあったとき
  if ( intersects.length > 0 ) {

    // 1個目をドラッグするオブジェクトとして設定
    draggedObj = intersects[ 0 ].object;

    // rayとplaneの交点を求めてintersectionに設定
    if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
      // offsetにドラッグ中のオブジェクトとplaneの距離を設定する。
      offset.copy( intersection ).sub( draggedObj.position );
    }
  }
}

// 指を動かした時のアクション
export function OnTouchMove( event ) {
  console.log("touchmove");
  // touchmove に対してデフォルト設定されている動作をキャンセル
  // iOS のオーバースクロール効果（コンテンツの境界を越えてスクロールすると表示が戻る機能）など
  event.preventDefault();

  // ドラッグしているオブジェクトがあるとき
  if ( draggedObj ) {

    // 画面上で指を動かした量から、三次元空間の移動量を決定する
    touchPoint.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    touchPoint.y = - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

    if(controlState == position){
      var clip = THREE.AnimationClip.findByName( gltfs[draggedObj.id].animations, "CubeAction.001" );

      if ( clip ) {
        var action = mixers[draggedObj.id].clipAction( clip );
        action.stop();
      }

      // タッチ点とカメラのレイキャストを設定
      raycaster.setFromCamera( touchPoint, camera );

      // rayとplaneの交点をintersectionに設定
      if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
        // ドラッグしているオブジェクトをplaneに対して平行に移動させる
        draggedObj.position.copy( intersection.sub( offset ) );
      }
    }
    else if(controlState == posture){
      var rotX = draggedObj.rotation.x;
      var rotY = draggedObj.rotation.y;
      var rotZ = draggedObj.rotation.z;

      dx = touchPoint.x - oldX;
      dy = touchPoint.y - oldY;

      oldX = touchPoint.x;
      oldY = touchPoint.y;

      draggedObj.rotation.set(rotX - dy*1.5 , rotY + dx*1.5, rotZ  );

      console.log("(" + rotX + "," + rotY + "," + rotZ + ")");
    }
    else if(controlState == size){
      var scaleX = draggedObj.scale.x;
      var scaleY = draggedObj.scale.y;
      var scaleZ = draggedObj.scale.z;

      dy = touchPoint.y - oldY;

      oldY = touchPoint.y;

      draggedObj.scale.set(scaleX + dy, scaleY + dy, scaleZ + dy);
    }
  }
}

// 指を離した時のアクション
export function OnTouchEnd( event ) {
  console.log("touchend");
  event.preventDefault();

console.log(draggedObj.position.x + "," + draggedObj.position.y);
 if(draggedObj)
 {
  var clip = THREE.AnimationClip.findByName( gltfs[draggedObj.id].animations, "CubeAction.001" );
  if ( clip ) {
    var action = mixers[draggedObj.id].clipAction( clip);
    action.play();
  }

  gltfs[draggedObj.id].scene.position.add(draggedObj.position);

}

  draggedObj = null;

}

// 画面サイズが変更された時のアクション
function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function generateRandamPosition(){
  var returnValue = new THREE.Vector3();

  var randomPoint = new THREE.Vector2();
  randomPoint.x = Math.random() * 1.6 - 0.75;
  randomPoint.y = Math.random() * 1.6 - 0.7;

  camera.getWorldDirection( plane.normal );

  // タッチ点とカメラのレイキャストを設定
  raycaster.setFromCamera( randomPoint, camera );

  // rayとplaneの交点をintersectionに設定
  if (raycaster.ray.intersectPlane( plane, returnValue )) {
  }

return returnValue;

}
