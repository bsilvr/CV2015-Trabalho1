//////////////////////////////////////////////////////////////////////////////
//
//	Universidade de Aveiro - 2015
//
//	Computação Visual - Trabalho 1 WebGL
//
//	Bruno Silva - 68535
//	Bernardo Ferreira - 67413
//
//////////////////////////////////////////////////////////////////////////////

// Stats Variables
var iterations = 0;
var swaps = 0;

// Global Variables
var randomArray = [];
var defaultRandomArray = [6, 11, 15, 1, 4, 9, 10, 14, 0, 5, 17, 13, 8, 19, 7, 2, 16, 3, 18, 12];
var defaultNearlySortedArray = [0, 2, 1, 3, 4, 6, 5, 9, 7, 8, 10, 11, 12, 14, 13, 15, 16, 19, 17, 18];
var defaultReversedArray = [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
var customArray = [];
var bluePos = -1;
var ongoing = false;
var paused = false;
var delay = 200;
var aux = 0;
var mim = 0;
var sortedVertices = null;
var vertexPerCollumn = 36*3;
var lastTime = 0;
var intervalID;
var index;

// WebGL Variables
var gl = null;
var shaderProgram = null;
var triangleVertexPositionBuffer = null;
var triangleVertexColorBuffer = null;

// The translation vector
var tx = 0.0;
var ty = 0.0;
var tz = 0.0;

// The rotation angles in degrees
var angleXX = 0.0;
var angleYY = 0.0;
var angleZZ = 0.0;

// The scaling factors
var sx = 0.8;
var sy = 0.8;
var sz = 0.8;

// Animation controls
var rotationXX_ON = 1;
var rotationXX_DIR = 1;
var rotationXX_SPEED = 1;
var rotationYY_ON = 1;
var rotationYY_DIR = 1;
var rotationYY_SPEED = 1;
var rotationZZ_ON = 1;
var rotationZZ_DIR = 1;
var rotationZZ_SPEED = 1;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

function initBuffers(){
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertices.length / 3;

	gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute,
							triangleVertexPositionBuffer.itemSize,
							gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 3;
	triangleVertexColorBuffer.numItems = colors.length / 3;

	gl.vertexAttribPointer( shaderProgram.vertexColorAttribute,
							triangleVertexColorBuffer.itemSize,
							gl.FLOAT, false, 0, 0);
}

function drawModel( angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix){
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );
	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX ) );
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );

	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
}

function drawScene() {
	var pMatrix;
	var mvMatrix = mat4();

	gl.clear(gl.COLOR_BUFFER_BIT);
	pMatrix = perspective( 45, 1, 0.05, 10 );
	tz = -2.25;

	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	drawModel(-angleXX, angleYY, angleZZ, sx, sy, sz, tx, ty, tz, mvMatrix);
}

function initWebGL( canvas ) {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		gl.enable( gl.DEPTH_TEST );
	} catch (e) {}

	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}
}

function runWebGL() {
	document.getElementById("custom-array").style.display = "none";
	document.getElementById("error-div").style.display = "none";
	var canvas = document.getElementById("my-canvas");
	initWebGL(canvas);

	triangleVertexPositionBuffer = gl.createBuffer();
	triangleVertexColorBuffer = gl.createBuffer();
	shaderProgram = initShaders(gl);
	setEventListeners(canvas);

	randomArray = defaultRandomArray.slice();
	createSortedBars();
	setRandomBars(randomArray);

	tick();
}

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
    var newX = event.clientX;
    var newY = event.clientY;
    var deltaX = newX - lastMouseX;
    angleYY += radians( 10 * deltaX  )
    var deltaY = newY - lastMouseY;
    angleXX += radians( 10 * deltaY  )
    lastMouseX = newX
    lastMouseY = newY;
  }
function tick() {
	changeBlue(bluePos);
	requestAnimFrame(tick);

	initBuffers();
	drawScene();
}

function setEventListeners( canvas ){
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

	document.getElementById("reset-button").onclick = function(){
		changeSelectedArray();
	};

	document.getElementById("start").onclick = function(){
		ongoing = true;
		var s = document.getElementById("sort-select").selectedIndex;
		switch(s){
			case 0 :
				// Bubble Sort
				if(!paused){
					index=0;
					bluePos = 0;
				}
				intervalID = setInterval(sortArrayBubble, delay);
				break;
			case 1 :
				// Selection Sort
				if(!paused){
					index=0;
					aux = 0;
					bluePos = 0;
					min = randomArray[index];
				}
				intervalID = setInterval(sortArraySelection, delay);
				break;
			case 2 :
				// Insertion Sort
				if(!paused){
					index=1;
					aux = 1;
					bluePos = 1;
				}
				intervalID = setInterval(sortArrayInsertion, delay);
				break;
		}
		paused = false;
	};

	document.getElementById("pause").onclick = function(){
		clearInterval(intervalID);
		ongoing = false;
		paused = true;
	};

	document.getElementById("sort-select").onchange = function(){
		changeSelectedArray();
	};

	document.getElementById("myRange").oninput = function(){
		delay = document.getElementById("myRange").value;
		document.getElementById("delay").innerHTML = delay;
		if(ongoing){
			var s = document.getElementById("sort-select").selectedIndex;
			clearInterval(intervalID);
			switch(s){
				case 0 :
					// Bubble Sort
					intervalID = setInterval(sortArrayBubble, delay);
					break;
				case 1 :
					// Selection Sort
					intervalID = setInterval(sortArraySelection, delay);
					break;
				case 2 :
					// Insertion Sort
					intervalID = setInterval(sortArrayInsertion, delay);
					break;
			}
		}
	};

	document.getElementById("array-select").onchange = function(){
		document.getElementById("error").innerHTML = "";
		if(document.getElementById("array-select").selectedIndex != 3){
			document.getElementById("custom-array").style.display = "none";
		}
		changeSelectedArray();
	};
}

function sortArrayBubble() {
	var swapped;
	swapped = false;
	bluePos = index+1;
	if(randomArray[index] > randomArray[index+1]){
		var temp = randomArray[index];
		randomArray[index] = randomArray[index+1];
		randomArray[index+1] = temp;
		swapped = true;
		switchBars(index, index+1);
		swaps +=1;
	}
	index+=1;
	if(index == randomArray.length){
		changeColors(index-1);
		index = 0;
	}
	changeColors(index-1);
	changeColors(index);
	changeColors(index+1);
	if (isFinished()){
		clearInterval(intervalID);
	}
	iterations +=1;
	updateStats();
}

function sortArraySelection() {
	bluePos = aux+1;
	if (randomArray[min] > randomArray[aux+1]) {
		min = aux+1;
	}
	aux+=1;
	if(aux == randomArray.length){
		var temp = randomArray[min];
		randomArray[min] = randomArray[index];
		randomArray[index] = temp;
		switchBars(min, index);
		changeColors(min);
		changeColors(index);
		index+=1;
		aux = index;
		min = aux;
		swaps +=1;
	}
	changeColors(bluePos-1);
	if (isFinished()){
		clearInterval(intervalID);
	}
	iterations +=1;
	updateStats();
}

function sortArrayInsertion() {
	bluePos = aux-1;
	changeColors(aux);
	if (randomArray[aux] < randomArray[aux-1]) {
		var temp = randomArray[aux];
		randomArray[aux] = randomArray[aux-1];
		randomArray[aux-1] = temp;
		switchBars(aux, aux - 1);
		changeColors(bluePos+1);
		changeColors(aux);
		changeColors(aux-1);
		aux -=1;
		swaps +=1;
	}
	else{
		index+=1;
		aux = index;
		bluePos = aux;
		changeColors(bluePos-1);
	}
	changeColors(bluePos);
	if (isFinished()){
		clearInterval(intervalID);
	}
	iterations +=1;
	updateStats();
}

function isFinished(){
	if (ArrayEqual(vertices, sortedVertices)){
		bluePos = -1;
		ongoing = false;
		return true;
	}
	return false;
}

function switchBars(b1, b2){
	for (var i = 1; i < vertexPerCollumn; i+=3){
		if (vertices[b1*vertexPerCollumn+i] != -0.8){
			var temp = vertices[b1*vertexPerCollumn+i];
			vertices[b1*vertexPerCollumn+i] = vertices[b2*vertexPerCollumn+i];
			vertices[b2*vertexPerCollumn+i] = temp;
		}
	}
}

function createSortedBars(){
	var tmpColors = colors.slice(0, vertexPerCollumn);
	for (var i = 1; i < randomArray.length; i++){
		var tmp = vertices.slice(0, vertexPerCollumn);
		for (var j = 1; j < vertexPerCollumn; j+=3){
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
	for (var i = 0; i < randomArray.length; i++){
		setBars(i, randomArray[i]);
		changeColors(i);
	}
	initBuffers();
	drawScene();
}

function setBars(b1, b2){
	for (var i = 1; i < vertexPerCollumn; i+=3){
		if (vertices[b1*vertexPerCollumn+i] != -0.8){
			vertices[b1*vertexPerCollumn+i] = sortedVertices[b2*vertexPerCollumn+i];
		}
	}
}

function changeColors(pos){
	var a = vertices.slice(pos*vertexPerCollumn, pos*vertexPerCollumn + vertexPerCollumn);
	var b = sortedVertices.slice(pos*vertexPerCollumn, pos*vertexPerCollumn + vertexPerCollumn);
	if(ArrayEqual(a, b)){
		changeGreen(pos);
	}else{
		changeRed(pos);
	}
}

function changeGreen(pos){
	for(var i = 0; i < vertexPerCollumn; i++){
		colors[pos*vertexPerCollumn+i] = colorsGreen[i];
	}
}

function changeRed(pos){
	for(var i = 0; i < vertexPerCollumn; i++){
		colors[pos*vertexPerCollumn+i] = colorsRed[i];
	}
}

function changeBlue(pos){
	for(var i = 0; i < vertexPerCollumn; i++){
		colors[pos*vertexPerCollumn+i] = colorsBlue[i];
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

function reset(){
		tx = 0.0;
		ty = 0.0;
		tz = 0.0;
		angleXX = 0.0;
		angleYY = 0.0;
		angleZZ = 0.0;
		sx = 0.8;
		sy = 0.8;
		sz = 0.8;
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
		resetStats();
		bluePos = -1;
		ongoing = false;
		paused = false;
		setRandomBars(randomArray);
}

function updateStats(){
	document.getElementById("iterations").innerHTML = iterations;
	document.getElementById("swaps").innerHTML = swaps;
}

function resetStats(){
	iterations = 0;
	swaps = 0;
	document.getElementById("iterations").innerHTML = iterations;
	document.getElementById("swaps").innerHTML = swaps;
}

function showArrayFields(){
	var form = document.getElementById("custom-array-form");
	form.innerHTML = "";
	for(var i = 0; i < randomArray.length; i++){
		if(i % 10 == 0){
			form.innerHTML += "<br><br>";
		}
		form.innerHTML += "<input style=\"max-width:25px\" maxlength=\"2\" type=\"text\" id=\"" + i + "\">&nbsp;&nbsp;";
	}
	form.style.display = "block";
	document.getElementById("custom-array").style.display = "block";
}

function changeSelectedArray(){
	document.getElementById("error-div").style.display = "none";
	var s = document.getElementById("array-select").selectedIndex;
	switch(s){
		case 0 :
			randomArray = defaultRandomArray.slice();
			break;
		case 1 :
			randomArray = defaultNearlySortedArray.slice();
			break;
		case 2 :
			randomArray = defaultReversedArray.slice();
			break;
		case 3 :
			showArrayFields();
			break;
	}
	reset();
}

function changeCustomArray(){
	console.log(randomArray.length);
	var tmp;
	for(var i = 0; i < randomArray.length; i++){
		tmp = document.getElementById(i.toString()).value;
		console.log(tmp);
		if(tmp == ""){
			displayError("Empty Value found at position " + parseInt(i+1));
			return;
		}
		tmp = parseInt(tmp);
		if(tmp < 0 || tmp > 19){
			displayError("Found Value out of range at position " + parseInt(i+1));
			return;
		}
		customArray[i]= tmp;
	}
	if(customArray.length != randomArray.length){
		displayError("Some internal error occured");
		customArray = [];
		return;
	}
	for(i = 0; i < randomArray.length; i++){
		if(customArray.indexOf(i) == -1){
			displayError("All numbers from 0 to 19 must be present");
			customArray = [];
			return;
		}
	}
	randomArray = customArray.slice();
	document.getElementById("custom-array").style.display = "none";
	reset();
}

function displayError(error){
	document.getElementById("custom-array").style.display = "none";
	document.getElementById("error").innerHTML = error;
	document.getElementById("error-div").style.display = "block";

}
