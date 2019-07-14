var distValue = "000", fieldDistance, texture;

function initialize(){
  Colors = {
    red:0xf25346,
    white:0xFFFFFF,
    yellow:0xF0E68C,
    blue:0x68c3c0,
    yellowDesert:0xca8d16,
    pink: 0xFF69B4,
    black: 0x000000,
    green: 0xf7ff00, 
    chocolate: 0xD2691E
  };
  
  varGame = {
          textureLoaded: true,
          speedFactor:1,
          speed:0,
          baseSpeed:0.00035,
          rotationDesert:0.005,
          rotationSky:0.005,
          view:70,
          rr:0,

          deltaTime:0,
          distance:0,
          ratioSpeedDistance:50,
          near:1,
          far:10000,
          farLight:1000,

          birdInitialHeight:100,
          birdEndUpdPosY: 0.5,
          birdEndUpdRotY: 0.01,
          planeAmpHeight:80,
          birdSpeed:0,
          rotationWing:0.1,

          desertRadius:650,
          desertLength:800,

          diskDistanceToKeep:15,
          scoreValue:5,
          disksSpeed:.5,
          diskLastAdd:0,
          distanceForDiskAdd:115,

          sphereDistanceToKeep:15,
          ennemyValue:10,
          ennemiesSpeed:.6,
          sphereLastAdd:0,
          distanceForSphereAdd:170,
          SCORE: 0, 
          LEVEL: 0, 
          LIFE: 3,
          playOn:true,
          isGameOver:false,
          UP:false,
          DOWN:false
         };
}

var scene,
    camera, renderer, container, ambientLight, 
    hemisphereLight, shadowLight;

var newTime = new Date().getTime();
var oldTime = new Date().getTime();

var HEIGHT, WIDTH;

/*this function is used to configure the texture that must be applied to the rock spheres*/
function configureTextureRocks() {
  var side = 32;
  var amount = Math.pow(side, 2); // you need 4 values for every pixel in side*side plane
  var data = new Uint8Array(amount);
  for (var i = 0; i < amount; i++) {
    data[i] = Math.random()*120;
  }
  texture = new THREE.DataTexture(data, side, side, THREE.LuminanceFormat, THREE.UnsignedByteType);
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true; 
}

function createScene() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  scene = new THREE.Scene();
  varGame.rr = WIDTH / HEIGHT;
  camera = new THREE.PerspectiveCamera(
    varGame.view,
    varGame.rr,
    varGame.near,
    varGame.far
  );
  scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
  camera.position.x = 0;
  camera.position.z = 250;
  camera.position.y = 100;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  container = document.getElementById('thescene');
  container.appendChild(renderer.domElement);
  window.addEventListener('resize', handleWindowResize, false);
}

//Handle window resize
function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function createLightsAndShadows() {
  ambientLight = new THREE.AmbientLight(0xdc8874, .5);
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, 1.0);
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(100,200,200);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -300;
  shadowLight.shadow.camera.right = 300;
  shadowLight.shadow.camera.top = 300;
  shadowLight.shadow.camera.bottom = -300;
  shadowLight.shadow.camera.near = varGame.near;
  shadowLight.shadow.camera.far = varGame.farLight;
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

var AngryBird = function(color, tailPosition, transparent, setOpacity){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "angryBird";
  // Create the body - the form is oval applying the matrix
  var geomBody = new THREE.SphereGeometry( 60, 70, 20 );
  geomBody.applyMatrix( new THREE.Matrix4().makeScale( 0.95, 0.8, 0.6 ) );
  var matBody = new THREE.MeshPhongMaterial({color:color, 
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent});
  var body = new THREE.Mesh(geomBody, matBody);
  body.castShadow = true;
  body.receiveShadow = true;
  this.mesh.add(body);
  // Create Tail
  var geomTail = new THREE.BoxGeometry(15,20,5,1,1,1);
  var matTail = new THREE.MeshPhongMaterial({color:Colors.black, 
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent});
  this.tail = new THREE.Mesh(geomTail, matTail);
  this.tail.position.set(-50,tailPosition,0);
  this.tail.castShadow = true;
  this.tail.receiveShadow = true;
  this.mesh.add(this.tail);
  // Create Beak
  var geomBeak = new THREE.BoxGeometry(30,15,15,1,1,1);
  var matBeak = new THREE.MeshPhongMaterial({color:Colors.yellow, 
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent});
  this.beak = new THREE.Mesh(geomBeak, matBeak);
  this.beak.position.set(65,0,0);
  this.beak.castShadow = true;
  this.beak.receiveShadow = true;
  this.mesh.add(this.beak);
  // modify the structure of the beak
  geomBeak.vertices[4].y+=9;
  geomBeak.vertices[4].z-=6;
  geomBeak.vertices[5].y+=9;
  geomBeak.vertices[5].z+=6;
  geomBeak.vertices[6].y-=9;
  geomBeak.vertices[6].z-=6;
  geomBeak.vertices[7].y-=9;
  geomBeak.vertices[7].z+=6;
  // Create DX Wing
  var geomSideDXWing = new THREE.BoxGeometry(50,8,50,1,1,1);
  var matSideDXWing = new THREE.MeshPhongMaterial({color:color, 
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent});
  this.sideDXWing = new THREE.Mesh(geomSideDXWing, matSideDXWing);
  this.sideDXWing.position.set(0,0,30);
  this.sideDXWing.castShadow = true;
  this.sideDXWing.receiveShadow = true;
  this.mesh.add(this.sideDXWing);
  // modify the structure of the wing
  geomSideDXWing.vertices[4].y+=5;
  geomSideDXWing.vertices[5].y+=5;
  geomSideDXWing.vertices[5].z+=4;
  geomSideDXWing.vertices[7].z+=4;
  // Create SX Wing
  var geomSideSXWing = new THREE.BoxGeometry(50,8,50,1,1,1);
  var matSideSXWing = new THREE.MeshPhongMaterial({color:color, 
    flatShading:THREE.FlatShading,
    opacity: setOpacity,
    transparent:transparent});
  this.sideSXWing = new THREE.Mesh(geomSideSXWing, matSideSXWing);
  this.sideSXWing.position.set(0,0,-30);
  this.sideSXWing.castShadow = true;
  this.sideSXWing.receiveShadow = true;
  this.mesh.add(this.sideSXWing);
  // modify the structure of the wing
  geomSideSXWing.vertices[4].y+=5;
  geomSideSXWing.vertices[5].y+=5;
  geomSideSXWing.vertices[5].z-=4;
  geomSideSXWing.vertices[7].z-=4;
}

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.numELem = 12;
  this.genericBirds = [];
  var stepToAdd = Math.PI*2 / this.numELem;
  for(var i=0; i<this.numELem; i++){
    var c = new AngryBird(Colors.white, -30, true, 0.8);
    var s = 0.10+Math.random()*0.15; //to have different dimensions
    this.genericBirds.push(c);
    var a = stepToAdd*i;
    var h = 800 + Math.random()*300;
    c.mesh.position.z = -300-Math.random()*100;
    c.mesh.rotation.z = a + Math.PI/2;
    c.mesh.position.y = Math.sin(a)*h;
    c.mesh.position.x = Math.cos(a)*h;
    c.mesh.scale.set(s,s,s);
    this.mesh.add(c.mesh);
  }
}

Desert = function(){
  var geom = new THREE.CylinderGeometry(varGame.desertRadius,varGame.desertRadius,varGame.desertLength,100,10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.yellowDesert,
    flatShading:THREE.FlatShading,
    opacity: .7,
    transparent:true
  });
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true; //to see the shadow of the object in the scene
}

Sphere = function(){
  var geom = new THREE.SphereGeometry( 12, 12, 8 ), mat;
  if(varGame.textureLoaded)  
    mat = new THREE.MeshPhongMaterial( { 
      map: texture,
      side: THREE.DoubleSide
    } );
  else
    mat = new THREE.MeshPhongMaterial({
    color:Colors.chocolate ,
    flatShading:THREE.FlatShading
  });
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

SphereOwner = function (){
  this.mesh = new THREE.Object3D();
  this.sphereInScene = [];
  this.sphereStock = [];
  var sphere = new Sphere();
  this.sphereStock.push(sphere);
}

SphereOwner.prototype.addSphere = function(){
  var sphere;
  var dist = varGame.desertRadius + varGame.birdInitialHeight + (-1 + Math.random() * 2) * (varGame.planeAmpHeight-20);
  if (this.sphereStock.length) {
    sphere = this.sphereStock.pop();
  }else{
    sphere = new Sphere();
  }
  this.mesh.add(sphere.mesh);
  this.sphereInScene.push(sphere);
  sphere.angle = - 0.5;
  sphere.distance = dist + Math.cos(0.7);
  sphere.mesh.position.y = -varGame.desertRadius + Math.sin(sphere.angle)*sphere.distance;
  sphere.mesh.position.x = Math.cos(sphere.angle)*sphere.distance;
}


SphereOwner.prototype.sphereAnimation = function(){
  for (var i=0; i<this.sphereInScene.length; i++){
    var sphere = this.sphereInScene[i];
    if (sphere.exploding) continue;
    sphere.angle += varGame.speed*varGame.deltaTime*varGame.disksSpeed;
    if (sphere.angle>Math.PI*2) sphere.angle -= Math.PI*2;
    sphere.mesh.position.y = -(varGame.desertRadius-100) + Math.sin(sphere.angle)*sphere.distance;
    sphere.mesh.position.x = Math.cos(sphere.angle)*(sphere.distance*varGame.speedFactor);
    sphere.mesh.rotation.z += Math.random()*.1;
    sphere.mesh.rotation.y += Math.random()*.1;

    var dist = angryBird.mesh.position.clone().sub(sphere.mesh.position.clone()).length();
    if (dist<varGame.sphereDistanceToKeep){
      updateLife();
      this.sphereStock.unshift(this.sphereInScene.splice(i,1)[0]);
      angryBird.mesh.position.x -= 30;
      this.mesh.remove(sphere.mesh);
      ambientLight.intensity = 2;
      //simulate blink of the bird
      if(scene.children[4].name == "angryBird") {
        var visible = false;  // initial opacity
        var op = 1.0;  // initial opacity
        alarmmsg.style.opacity = op;
        alarmmsg.style.display="block";
        var timer = setInterval(function () {
          if (op <= 0){
            visible = true;
              alarmmsg.style.display = "none";
              scene.children[4].visible = visible;
              clearInterval(timer);
          }
          scene.children[4].visible = visible;
          visible = !visible;
          alarmmsg.style.opacity = op;
          alarmmsg.style.filter = 'alpha(opacity=' + op + ")";
          op -= 0.03;
        }, 50);
    }
      i--;
    }
  }
}

Disk = function(){
  var geom = new THREE.TorusGeometry( 3, 3, 3, 100 );
  var mat = new THREE.ShaderMaterial( {
    vertexShader: document.getElementById( 'vertexShaderId' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShaderId' ).textContent
  } );
  this.mesh = new THREE.Mesh(geom,mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

DiskOwner = function (num){
  this.mesh = new THREE.Object3D();
  this.diskInScene = [];
  this.diskStock = [];
  for (var i=0; i<num; i++){
    var disk = new Disk();
    this.diskStock.push(disk);
  }
}

DiskOwner.prototype.addDisk = function(){
  var num = Math.floor(Math.random()*5)+2;
  var amp = Math.round(Math.random()*10);
  var dist = varGame.desertRadius + varGame.birdInitialHeight + (-1 + Math.random() * 2) * (varGame.planeAmpHeight-20);
  for (var i=0; i<num; i++){
    var disk;
    if (this.diskStock.length) {
      disk = this.diskStock.pop();
    }else{
      disk = new Disk();
    }
    this.mesh.add(disk.mesh);
    this.diskInScene.push(disk);
    disk.distance = dist + Math.cos(i*.5)*amp;
    disk.angle = -(i*0.02);
    disk.mesh.position.y = -varGame.desertRadius + Math.sin(disk.angle)*disk.distance;
    disk.mesh.position.x = Math.cos(disk.angle)*disk.distance;
  }
}

DiskOwner.prototype.diskAnimation = function(){
  for (var i=0; i<this.diskInScene.length; i++){
    var disk = this.diskInScene[i];
    disk.angle += varGame.speed*varGame.deltaTime*varGame.disksSpeed;
    if (disk.angle>Math.PI*2) disk.angle -= Math.PI*2;
    disk.mesh.position.x = Math.cos(disk.angle)*(disk.distance*varGame.speedFactor);
    disk.mesh.position.y = -(varGame.desertRadius-100) + Math.sin(disk.angle)*disk.distance;
    disk.mesh.rotation.y += Math.random()*.1;
    disk.mesh.rotation.z += Math.random()*.1;
    var dist = angryBird.mesh.position.clone().sub(disk.mesh.position.clone()).length();
    if (dist<varGame.diskDistanceToKeep){
      updateScore();
      if(pointWin.style.display!="block") {
        var op = 1.0;  // initial opacity
        pointWin.style.display="block";
        var timer = setInterval(function () {
          if (op <= 0){
              clearInterval(timer);
              pointWin.style.display = "none";
          }
          pointWin.style.opacity = op;
          pointWin.style.filter = 'alpha(opacity=' + op + ")";
          op -= 0.03;
        }, 50);
      }      
      this.diskStock.unshift(this.diskInScene.splice(i,1)[0]);
      this.mesh.remove(disk.mesh);
      i--;
    }
  }
}

var desert, angryBird, sky, diskOwner, sphereOwner;

function createDesert(){
  desert = new Desert();
  desert.mesh.position.y = -580;
  scene.add(desert.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -580;
  scene.add(sky.mesh);
}

function createAngryBird(){
  angryBird = new AngryBird(Colors.red, 30, false, 1.0);
  angryBird.mesh.scale.set(.27,.27,.27);
  angryBird.mesh.position.y = varGame.birdInitialHeight;
  angryBird.mesh.position.z = 0;
  scene.add(angryBird.mesh);
}

function createDisk(){
  diskOwner = new DiskOwner(100);
  scene.add(diskOwner.mesh)
}

function createSphere(){
  sphereOwner = new SphereOwner(100);
  scene.add(sphereOwner.mesh)
}

function loop(){
  newTime = new Date().getTime();
  varGame.deltaTime = newTime-oldTime;
  oldTime = newTime;
  if(varGame.playOn) {
    if (Math.floor(varGame.distance)%varGame.distanceForDiskAdd == 0 && Math.floor(varGame.distance) > varGame.diskLastAdd){
      varGame.diskLastAdd = Math.floor(varGame.distance);
      diskOwner.addDisk();
    }
    if (Math.floor(varGame.distance)%varGame.distanceForSphereAdd == 0 && Math.floor(varGame.distance) > varGame.sphereLastAdd){
      varGame.sphereLastAdd = Math.floor(varGame.distance);
      sphereOwner.addSphere();
    }
    updateBird();
    updateGenericBird();
    updateDistance();
    varGame.speed = varGame.baseSpeed * varGame.birdSpeed;
    diskOwner.diskAnimation();
    sphereOwner.sphereAnimation();
    desert.mesh.rotation.z += varGame.rotationDesert;
    sky.mesh.rotation.z += varGame.rotationSky;
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
}
/*
This function is called to show a summarized description of the rules that will be
follow to play the game. When START GAME button is pressed it starts the animation
*/
function preInit() {
  var scene = document.getElementById("thescene");
  scene.style.display = "none";
  document.getElementById("myButtonStart").onclick = function ()  {
    init();
  };
}

/*
This function is called when START GAME button is pressed , all the objects of the scene
are showed and the game / animation starts
*/
function init(){
  var scene = document.getElementById("thescene");
  scene.style.display = "block";
  fieldDistance = distValue;
  document.addEventListener('keydown', manageAnimation, false);
  gameOver = document.getElementById("gameOver");
  totalScore = document.getElementById("totalScore");
  actualLevel = document.getElementById("actualLevel");
  stopPauseGame = document.getElementById("stopPauseGame");
  alarmMsg = document.getElementById("alarmmsg");
  pointWin = document.getElementById("pointWin");
  document.getElementById("pageReset").onclick = function ()  {varGame.LIFE = 1; updateLife()};
  initialize();
  configureTextureRocks();
  createScene();
  createLightsAndShadows();
  createDesert();
  createSky();
  createAngryBird();
  createDisk();
  createSphere();
  loop();
}

function manageAnimation(event) {
  if(gameOver.style.display!="block") {
    if (event.keyCode == 32) {
      varGame.playOn = !varGame.playOn;
      if (!varGame.playOn) stopPauseGame.style.display="block";
      else {
        stopPauseGame.style.display="none";
        loop();
      }
    }
  }
}

function move() {
  if(varGame.UP) { 
    angryBird.mesh.position.y += 5;
    angryBird.mesh.rotation.z = 0.2;
    if(angryBird.mesh.position.y >= 260) varGame.UP = false;
  }
  if(varGame.DOWN) {
    angryBird.mesh.position.y -= 5; 
    angryBird.mesh.rotation.z = -0.2;
    if(angryBird.mesh.position.y <= 70) varGame.DOWN = false;
  } 
  if (varGame.LIFE == 0) {    
    varGame.isGameOver = true;
    showGameOver();  
  }
}

document.onkeydown = function(e) {
  if(e.keyCode == 38) {
    varGame.UP = true;
  }
  if(e.keyCode == 40) {
    varGame.DOWN = true;
  }
}

function roundToOneValue(v,vmin,vmax,tmin,tmax){
  var nv = Math.max(Math.min(v,vmax), vmin);
  var dv = vmax-vmin;
  var pc = (nv-vmin)/dv;
  var dt = tmax-tmin;
  var tv = tmin + (pc*dt);
  return tv;
}

function updateDistance(){
  varGame.distance += varGame.speed*varGame.deltaTime*varGame.ratioSpeedDistance;
}

function updateBird(){  
  varGame.birdSpeed = roundToOneValue(0,-.5,.5, 1, 3);
  if(angryBird.sideDXWing.rotation.x > 0.7 || angryBird.sideDXWing.rotation.x < -0.7) varGame.rotationWing*=-1;  
  angryBird.sideDXWing.rotation.x += varGame.rotationWing;
  angryBird.sideSXWing.rotation.x += -varGame.rotationWing;
  angryBird.tail.rotation.y += -varGame.rotationWing;
  move();
}

function updateGenericBird() {
  sky.genericBirds.forEach(function (nextElem){
    nextElem.sideDXWing.rotation.x += varGame.rotationWing;
    nextElem.sideSXWing.rotation.x += -varGame.rotationWing;
    nextElem.tail.rotation.y += -varGame.rotationWing;
  });
}

document.onkeyup = function(e) {
  if(e.keyCode == 38) varGame.UP = false;
  if(e.keyCode == 40) varGame.DOWN = false;
  if(angryBird != undefined ) angryBird.mesh.rotation.z = 0;
}

function updateScore() {
  if(!varGame.isGameOver){
    varGame.SCORE += varGame.scoreValue;
    var value=document.getElementById("score");
    value.textContent= varGame.SCORE;
    if(varGame.SCORE % 100 == 0 && varGame.SCORE != 0)
      updateLevelAndSpeed();
  }  
}

function updateLife() {
  if(varGame.LIFE > 0) {
    varGame.LIFE -= 1;
    var value=document.getElementById("life");
    value.textContent= varGame.LIFE;
  }  
}

function updateLevelAndSpeed() {
  varGame.LEVEL += 1;
  var value=document.getElementById("level");
  value.textContent= varGame.LEVEL;
  varGame.rotationSky += .0005;
  varGame.rotationDesert += .0005;
  varGame.speedFactor += 0.25;
}

function showGameOver(){
  playOn = false;
  var timer = setInterval(function () {
    if (angryBird.mesh.position.y <= -50){
        varGame.playOn = false;
        clearInterval(timer);
    }
    angryBird.mesh.position.y -= varGame.birdEndUpdPosY;
    angryBird.mesh.rotation.y -= varGame.birdEndUpdRotY;
  }, 100);  
  if(gameOver.style.display!="block" && totalScore.style.display!="block" && actualLevel.style.display!="block" ) {
    totalScore.textContent += varGame.SCORE;
    actualLevel.textContent += varGame.LEVEL;
    gameOver.style.display="block";
    totalScore.style.display="block";
    actualLevel.style.display="block";
  }
}

window.addEventListener('load', preInit, false);

