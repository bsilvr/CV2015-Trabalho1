//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_26.js
//
//  Interaction using the keyboard and the mouse
//
//   - November 2015
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//
var randomArray = [6, 11, 15, 1, 4, 9, 10, 14, 0, 5, 17, 13, 8, 7, 2, 16, 3, 18, 12];

var bluePos = 0;

var sortedVertices = null;

var gl = null; // WebGL context

var shaderProgram = null;

var triangleVertexPositionBuffer = null;

var triangleVertexColorBuffer = null;

// The global transformation parameters

// The translation vector

var tx = 0.0;

var ty = 0.0;

var tz = 0.0;

// The rotation angles in degrees

var angleXX = 0.0;

var angleYY = 0.0;

var angleZZ = 0.0;

// The scaling factors

var sx = 0.9;

var sy = 0.9;

var sz = 0.9;

// NEW - Animation controls

var rotationXX_ON = 1;

var rotationXX_DIR = 1;

var rotationXX_SPEED = 1;

var rotationYY_ON = 1;

var rotationYY_DIR = 1;

var rotationYY_SPEED = 1;

var rotationZZ_ON = 1;

var rotationZZ_DIR = 1;

var rotationZZ_SPEED = 1;

// To allow choosing the way of drawing the model triangles

var primitiveType = null;

// To allow choosing the projection type

var projectionType = 0;

// For storing the vertices defining the triangles

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex and the Color Buffers

function initBuffers() {

	// Coordinates

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertices.length / 3;

	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			triangleVertexPositionBuffer.itemSize,
			gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 3;
	triangleVertexColorBuffer.numItems = colors.length / 3;

	// Associating to the vertex shader

	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
	triangleVertexColorBuffer.itemSize,
	gl.FLOAT, false, 0, 0);

}

//----------------------------------------------------------------------------


function switchBars(b1, b2){
	for (var i = 1; i < 36*3; i+=3){
		if (vertices[b1*36*3+i] != -0.8){
			var temp = vertices[b1*36*3 +i];
			vertices[b1*36*3+i] = vertices[b2*36*3+i];
			vertices[b2*36*3+i] = temp;
		}
	}
}

//  Drawing the model

function drawModel( angleXX, angleYY, angleZZ,
					sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType ) {

    // Pay attention to transformation order !!


	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );

	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );

	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );

	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );

	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	// Passing the Model View Matrix to apply the current transformation

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

	// Drawing the contents of the vertex buffer

	// primitiveType allows drawing as filled triangles / wireframe / vertices

	if( primitiveType == gl.LINE_LOOP ) {

		// To simulate wireframe drawing!

		// No faces are defined! There are no hidden lines!

		// Taking the vertices 3 by 3 and drawing a LINE_LOOP

		var i;

		for( i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++ ) {

			gl.drawArrays( primitiveType, 3 * i, 3 );
		}
	}
	else {

		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems);

	}
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {

	var pMatrix;

	var mvMatrix = mat4();

	// Clearing with the background color

	gl.clear(gl.COLOR_BUFFER_BIT);

	// NEW --- Computing the Projection Matrix

	if( projectionType == 0 ) {

		// For now, the default orthogonal view volume

		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );

		tz = 0;

		// TO BE DONE !

		// Allow the user to control the size of the view volume
	}
	else {

		// A standard view volume.

		// Viewer is at (0,0,0)

		// Ensure that the model is "inside" the view volume

		pMatrix = perspective( 45, 1, 0.05, 10 );

		tz = -2.25;

	}

	// Passing the Projection Matrix to apply the current projection

	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");

	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// NEW --- Instantianting the same model more than once !!

	// And with diferent transformation parameters !!

	// Call the drawModel function !!

	// Instance 1 --- RIGHT TOP

	drawModel( -angleXX, angleYY, angleZZ,
	           sx, sy, sz,
	           tx, ty, tz,
	           mvMatrix,
	           primitiveType );

}

//----------------------------------------------------------------------------
//
//  NEW --- Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {

	var timeNow = new Date().getTime();

	if( lastTime != 0 ) {

		var elapsed = timeNow - lastTime;

		if( rotationXX_ON ) {

			angleXX += rotationXX_DIR * rotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationYY_ON ) {

			angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationZZ_ON ) {

			angleZZ += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }
	}

	lastTime = timeNow;
}

//----------------------------------------------------------------------------

// Handling mouse events

// Adapted from www.learningwebgl.com


var mouseDown = false;

var lastMouseX = null;

var lastMouseY = null;

function handleMouseDown(event) {

    mouseDown = true;

    lastMouseX = event.clientX;

    lastMouseY = event.clientY;
}

function handleMouseUp(event) {

    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {

      return;
    }

    // Rotation angles proportional to cursor displacement

    var newX = event.clientX;

    var newY = event.clientY;

    var deltaX = newX - lastMouseX;

    angleYY += radians( 10 * deltaX  )

    var deltaY = newY - lastMouseY;

    angleXX += radians( 10 * deltaY  )

    lastMouseX = newX

    lastMouseY = newY;
  }
//----------------------------------------------------------------------------

// Timer

function tick() {

	changeBlue(bluePos);

	requestAnimFrame(tick);

	//switchBars(0, 1);

	initBuffers();

	// NEW --- Processing keyboard events


	drawScene();

	//animate();
}

//----------------------------------------------------------------------------

var intervalID;
var index;
function setEventListeners( canvas ){

	// NEW ---Handling the mouse

	// From learningwebgl.com

    canvas.onmousedown = handleMouseDown;

    document.onmouseup = handleMouseUp;

    document.onmousemove = handleMouseMove;


	document.getElementById("reset-button").onclick = function(){

		// The initial values

		tx = 0.0;

		ty = 0.0;

		tz = 0.0;

		angleXX = 0.0;

		angleYY = 0.0;

		angleZZ = 0.0;

		sx = 0.9;

		sy = 0.9;

		sz = 0.9;

		rotationXX_ON = 0;

		rotationXX_DIR = 1;

		rotationXX_SPEED = 1;

		rotationYY_ON = 0;

		rotationYY_DIR = 1;

		rotationYY_SPEED = 1;

		rotationZZ_ON = 0;

		rotationZZ_DIR = 1;

		rotationZZ_SPEED = 1;

		clearInterval(intervalID);
	};

	document.getElementById("start").onclick = function(){
		index=0;
		intervalID = setInterval(sortArrayBubble, 100);
	};
}

function sortArrayBubble() {
	var swapped;
	swapped = false;
	for (i=index; i < randomArray.length; i++) {
		bluePos = i+1;
		if (randomArray[i] > randomArray[i+1]) {
			var temp = randomArray[i];
			randomArray[i] = randomArray[i+1];
			randomArray[i+1] = temp;
			swapped = true;
			switchBars(i, i+1);
			//changeColors(i);
			//changeColors(i+1);
		}
		index+=1;
		if(index == randomArray.length){
			index = 0;
		}
		clockSwitch();
		break;
	}
	changeColors(i);
	changeColors(i+1);
	if (isFinished(i)){
		clockSwitch();
		clearInterval(intervalID);
	}
}

function sortArrayQuick() {
	var swapped;
	swapped = false;
	for (i=index; i < randomArray.length; i++) {
		bluePos = i+1;
		if (randomArray[i] > randomArray[i+1]) {
			var temp = randomArray[i];
			randomArray[i] = randomArray[i+1];
			randomArray[i+1] = temp;
			swapped = true;
			switchBars(i, i+1);
			//changeColors(i);
			//changeColors(i+1);
		}
		index+=1;
		if(index == randomArray.length){
			index = 0;
		}
		clockSwitch();
		break;
	}
	changeColors(i);
	changeColors(i+1);
	if (isFinished(i)){
		clockSwitch();
		clearInterval(intervalID);
	}
}

function isFinished(i){
	if (ArrayEqual(vertices, sortedVertices)){

		return true;
	}
	return false;
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {

		// Create the WebGL context

		// Some browsers still need "experimental-webgl"

		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		// DEFAULT: The viewport occupies the whole canvas

		// DEFAULT: The viewport background color is WHITE

		// NEW - Drawing the triangles defining the model

		primitiveType = gl.TRIANGLES;

		// DEFAULT: The Depth-Buffer is DISABLED

		// Enable it !

		gl.enable( gl.DEPTH_TEST );

	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}
}

//----------------------------------------------------------------------------

function runWebGL() {

	var canvas = document.getElementById("my-canvas");

	projectionType = 1;

	initWebGL( canvas );

	triangleVertexPositionBuffer = gl.createBuffer();

	triangleVertexColorBuffer = gl.createBuffer();


	shaderProgram = initShaders( gl );

	setEventListeners( canvas );


	createSortedBars();

	setRandomBars(randomArray);


	// switchBars(0, 1);
	//

	// NEW --- Processing keyboard events

	//handleKeys();

	//intervalID = setInterval(clockSwitch, 1000);


	tick();		// A timer controls the rendering / animation
}

function clockSwitch(a,b){
	//initBuffers();
	//drawScene();

}


function createSortedBars(){
	var tmpColors = colors.slice(0, 36*3);
	for (var i = 1; i < 19; i++){
		var tmp = vertices.slice(0, 36*3);
		for (var j = 1; j < 36*3; j+=3){
			if (tmp[j] != -0.8){
				tmp[j] = tmp[j] + 0.08*i;
			}
			tmp[j-1] += 0.1*i;
		}
		vertices = vertices.concat(tmp);
		colors = colors.concat(tmpColors);

	}
	sortedVertices = vertices.slice();
}

function setRandomBars(randomArray){
	for (var i = 0; i < 19; i++){
		setBars(i, randomArray[i]);
		changeColors(i);
	}

	initBuffers();

	drawScene();
}

function setBars(b1, b2){
	for (var i = 1; i < 36*3; i+=3){
		if (vertices[b1*36*3+i] != -0.8){
			vertices[b1*36*3+i] = sortedVertices[b2*36*3+i];
		}
	}
}

function changeColors(pos){
	var a = vertices.slice(pos*36*3, pos*36*3 + 36*3);
	var b = sortedVertices.slice(pos*36*3, pos*36*3 + 36*3);
	if(ArrayEqual(a, b)){
		changeGreen(pos);
	}else{
		changeRed(pos);
	}
}

function changeGreen(pos){
	for(var i = 0; i < 36*3; i++){
		colors[pos*36*3+i] = colorsGreen[i];
	}
}

function changeRed(pos){
	for(var i = 0; i < 36*3; i++){
		colors[pos*36*3+i] = colorsRed[i];
	}
}

function changeBlue(pos){
	for(var i = 0; i < 36*3; i++){
		colors[pos*36*3+i] = colorsBlue[i];
	}
}

function ArrayEqual(a, b){
	if (a.length != b.length){
		return false;
	}
	for(var i = 1; i < a.length; i+=36){
		if(a[i] != b[i]){
			return false;
		}
	}
	return true;
}
