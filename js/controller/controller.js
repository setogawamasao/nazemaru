import * as THREE from '../three/three.module.js';

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

// object追加関数
export function addObject()
{
  console.log("addObject");
  loader.load('models/3ds/portalgun/nimaru4.3ds',  (object) => {
    // 読み込み後に3D空間に追加
    scene.add(object);
    objects.push(object.children[0]);
  });
}

// 位置制御
export function setPosition()
{
  controlState = position;
  console.log(controlState);
  //alert(controlState);
}

// 姿勢制御
export function setPosture()
{
  controlState = posture;
  console.log(controlState);
  //alert(controlState);
}

// 大きさ制御
export function setSize()
{
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

    console.log("x : " +  touchPoint.x);
    console.log("y : " +  touchPoint.y);

    if(controlState == position){
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

      draggedObj.rotation.set(rotX - dy*1.5 , rotY , rotZ - dx*1.5 );

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

  //controls.enabled = true;

  draggedObj = null;
}
