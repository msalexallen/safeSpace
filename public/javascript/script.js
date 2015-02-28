window.addEventListener('load', function() {

	// CANVAS LISTENERS AND CODE

	//Create variables for the editor buttons
	var black = document.querySelector('#blackButton');
	var brown = document.querySelector('#brownButton');
	var red = document.querySelector('#redButton');
	var orange = document.querySelector('#orangeButton');
	var yellow = document.querySelector('#yellowButton');
	var green = document.querySelector('#greenButton');
	var blue = document.querySelector('#blueButton');
	var purple = document.querySelector('#purpleButton');
	var text = document.querySelector('#textButton');
	var crayon = document.querySelector('#crayonButton');

	// Get the context of the editable canvas in the html
	var canvas = document.querySelector('#editableCanvas');
	var context = canvas.getContext('2d');
	
	//Give it the same features as its enclosing div
	var drawing1 = document.querySelector('#canvasDiv');
	var drawingStyle = getComputedStyle(drawing1);
	canvas.width = parseInt(drawingStyle.getPropertyValue('width'));
	canvas.height = parseInt(drawingStyle.getPropertyValue('height'));
	
	//add in the temp image
	var img = new Image();
	img.src = "temp.png"
	img.onload = function () {
	   context.drawImage(img,0,0);
	}

	//Make sure the system can save right away
	saveContent.value = document.querySelector('#textBox').innerHTML;
	saveImage.value = canvas.toDataURL();
	
	// Make a temporary canvas (same feats as canvas) to store the changes before they 
	// get added to the final document ex sample lines with the line tool before you release the mouse
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');
	tempCanvas.id = 'tempCanvas';
	tempCanvas.width = canvas.width;
	tempCanvas.height = canvas.height;
	
	drawing1.appendChild(tempCanvas);

	// Dictionary to define a mouse location (x,y)
	var mouse = {x: 0, y: 0};
	
	// An array to capture the crayon movements, the drawing tool value,
	// and variable to store color value
	var crayonPoints = [];
	var drawTool = "crayon";
	var drawColor = 'black';
	
	// Set the code to capture the initial mouse movement
	tempCanvas.addEventListener('mousemove', function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	}, false);
	
	
	// Set initial values for the temporary canvas's drawing tools
	tempContext.lineWidth = 5;
	tempContext.lineJoin = 'round';
	tempContext.lineCap = 'round';
	tempContext.strokeStyle = drawColor;
	tempContext.fillStyle = drawColor;

	// Add a listener to the temporary canvas for when the mouse is down
	tempCanvas.addEventListener('mousedown', function(e) {
		// While the mouse is down and moving, add the changes to the temporary canvas
		tempCanvas.addEventListener('mousemove', onPaint, false);
		
		// Get the x and y of the mouse where it is down
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		
		// Add the x and y to the crayon 'visited' points
		crayonPoints.push({x: mouse.x, y: mouse.y});
		
		// Repaint the temporary canvas
		onPaint();
	}, false);
	
	// Add a listener to the temporary canvas for when the mouse is up
	tempCanvas.addEventListener('mouseup', function() {
		// When the mouse is lifted, remove the listener for the mouse movement (we aren't
		// trying to draw anymore so we don't need it)
		tempCanvas.removeEventListener('mousemove', onPaint, false);
		
		// Now take what is on the temporary canvas and add it to the final canvas
		context.drawImage(tempCanvas, 0, 0);
		// Clearing tmp canvas
		//tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		
		// Remove the old crayon points from the list
		crayonPoints = [];

		//Temporarily save the canvas
		saveImage.value = canvas.toDataURL();
		saveContent.value = document.querySelector('#textBox').innerHTML;
	}, false);
	

	//The actual painting function (adds the mouse movements to the canvas)
	var onPaint = function() {
		// Add the last mouse location to the array
		crayonPoints.push({x: mouse.x, y: mouse.y});
		
		// If less than three points have been traversed just draw a circle at the first point
		if (crayonPoints.length < 3) {
			var b = crayonPoints[0];
			tempContext.beginPath();
			tempContext.arc(b.x, b.y, tempContext.lineWidth / 2, 0, Math.PI * 2, !0);
			tempContext.fill();
			tempContext.closePath();
			
			return;
		}
		
		// Clear the temporary canvas now that another change has been added
		tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		
		// Begin the path at the initial crayon location
		tempContext.beginPath();
		tempContext.moveTo(crayonPoints[0].x, crayonPoints[0].y);
		
		if (drawTool === "crayon"){
			// For all the points except the last, make a curve from that point to the average to
			//the next point
			for (var i = 1; i < crayonPoints.length - 1; i++) {
				var c = (crayonPoints[i].x + crayonPoints[i + 1].x) / 2;
				var d = (crayonPoints[i].y + crayonPoints[i + 1].y) / 2;
				
				tempContext.quadraticCurveTo(crayonPoints[i].x, crayonPoints[i].y, c, d);
			}
		} else if (drawTool === "line"){
			// For the line tool, draw a line from the first crayon location to the last
			tempContext.lineTo(crayonPoints[crayonPoints.length - 1].x, crayonPoints[crayonPoints.length - 1].y);
		} else if (drawTool === "rect"){
			// For the line tool, draw a line from the first crayon location to the last
			var width = crayonPoints[0].x - crayonPoints[crayonPoints.length - 1].x;
			var height = crayonPoints[0].y - crayonPoints[crayonPoints.length - 1].y;
			tempContext.rect(crayonPoints[0].x, crayonPoints[0].y, -1*width, -1*height);
			tempContext.fill();
		} else if (drawTool === "circle"){
			// For the line tool, draw a line from the first crayon location to the last
			var dist = (Math.abs(crayonPoints[0].x - crayonPoints[crayonPoints.length - 1].x)/2 + Math.abs(crayonPoints[0].y - crayonPoints[crayonPoints.length - 1].y)/2);
			tempContext.arc(crayonPoints[0].x, crayonPoints[0].y, dist, 0, 2 * Math.PI, false);
			tempContext.closePath();
			tempContext.fill();
		}
		// Now actually draw the thing
		tempContext.stroke();
		
	};

	// BUTTON LISTENERS AND CODE

	//Set initial values for the editable box's focii (text should be editable initially)
	document.querySelector('#textBox').style.zIndex = 1;
	document.querySelector('#canvasDiv').style.zIndex = 0;

	//                      COLOR CHANGING BUTTONS!
	// Add event listeners for each of the color buttons so that they update the drawColor
	// Not sure what exactly is going wrong with creating a universal function for these,
	// but the problem is there :/
   	black.addEventListener('click', function() {
        drawColor = 'black';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
		saveContent.value = document.querySelector('#textBox').innerHTML;
    } ,false);
   	brown.addEventListener('click', function() {
        drawColor = 'brown';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);
   	red.addEventListener('click', function() {
        drawColor = 'red';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);
   	orange.addEventListener('click', function() {
        drawColor = 'orange';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);
   	yellow.addEventListener('click', function() {
        drawColor = 'yellow';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);
   	green.addEventListener('click', function() {
        drawColor = 'green';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);
    blue.addEventListener('click', function() {
        drawColor = 'blue';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);
   	purple.addEventListener('click', function() {
        drawColor = 'purple';
    	tempContext.strokeStyle = drawColor;
		tempContext.fillStyle = drawColor;
		document.querySelector('#crayon1').style.fill=drawColor;
		document.querySelector('#crayon2').style.fill=drawColor;
    } ,false);

    //                       FOCUS CHANGING BUTTONS!
    // Add event listeners for the editor tool buttons to modify which editable
    // object is in focus.
   	text.addEventListener('click', function() {
    	document.querySelector('#textBox').style.zIndex = 1;
    	document.querySelector('#canvasDiv').style.zIndex = 0;
    	document.querySelector('#canvasButtons').style.display = 'none';
    	document.querySelector('#fontButtons').style.display = 'inline';
	    crayon.style.backgroundColor="gray";
	    text.style.backgroundColor="#00688B";
    } ,false);
   	crayon.addEventListener('click', function() {
    	document.querySelector('#textBox').style.zIndex = 0;
    	document.querySelector('#canvasDiv').style.zIndex = 1;
    	document.querySelector('#canvasButtons').style.display = 'inline';
    	document.querySelector('#fontButtons').style.display = 'none';
	    text.style.backgroundColor="gray";
	    crayon.style.backgroundColor="#00688B";
    } ,false);

    //                       DRAW TOOL CHANGING BUTTONS!
	// Add event listeners for the drawing tools
	var drawCrayon = document.querySelector('#drawCrayonButton');
	var drawLine = document.querySelector('#drawLineButton');
	var drawRect = document.querySelector('#drawRectButton');
	var drawCircle = document.querySelector('#drawCircleButton');

	drawCrayon.addEventListener('click', function(event) {
		drawTool = 'crayon';
	    drawCrayon.style.backgroundColor="#00688B";
	    drawLine.style.backgroundColor="gray";
	    drawRect.style.backgroundColor="gray";
	    drawCircle.style.backgroundColor="gray";
	}, false);
	drawLine.addEventListener('click', function(event) {
		drawTool = 'line';
	    drawLine.style.backgroundColor="#00688B";
	    drawCrayon.style.backgroundColor="gray";
	    drawRect.style.backgroundColor="gray";
	    drawCircle.style.backgroundColor="gray";
	}, false);
	drawRect.addEventListener('click', function(event) {
		drawTool = 'rect';
	    drawRect.style.backgroundColor="#00688B";
	    drawCrayon.style.backgroundColor="gray";
	    drawLine.style.backgroundColor="gray";
	    drawCircle.style.backgroundColor="gray";
	}, false);
	drawCircle.addEventListener('click', function(event) {
		drawTool = 'circle';
	    drawCircle.style.backgroundColor="#00688B";
	    drawCrayon.style.backgroundColor="gray";
	    drawRect.style.backgroundColor="gray";
	    drawLine.style.backgroundColor="gray";
	}, false);


   	//                         TEXT EDITING BUTTONS!
    // Add event listeners for the text editing buttons to modify the contents of the textbox 
	var bold = document.querySelector('#boldButton');
	var italics = document.querySelector('#italicsButton');
	var underline = document.querySelector('#underlineButton');
	var ordList = document.querySelector('#ordListButton');
	var unordList = document.querySelector('#unordListButton');
	var isB = false;
	var isI = false;
	var isU = false;
	var isOLi = false;
	var isULi = false;

	//Each div needs a listener for mousedown to prevent the loss of focus on the text
	//bold
	bold.addEventListener('mousedown', function(event) {
		event.preventDefault ? event.preventDefault() : (event.returnValue=false);
	}, false);
	bold.addEventListener('mouseup', function() {
	    	document.execCommand('bold',false,null);
	    	if (isB){
	    		isB = false;
	    		bold.style.backgroundColor="gray";
	    	} else {
	    		isB = true;
	    		bold.style.backgroundColor="#00688B";
	    	}
	    } ,false);

	//italics
	italics.addEventListener('mousedown', function(event) {
		event.preventDefault ? event.preventDefault() : (event.returnValue=false);
	}, false);
	italics.addEventListener('mouseup', function() {
	    	document.execCommand('italic',false,null);
	    	if (isI){
	    		isI = false;
	    		italics.style.backgroundColor="gray";
	    	} else {
	    		isI = true;
	    		italics.style.backgroundColor="#00688B";
	    	}
	    } ,false);

	//underline
	underline.addEventListener('mousedown', function(event) {
		event.preventDefault ? event.preventDefault() : (event.returnValue=false);
	}, false);
	underline.addEventListener('mouseup', function() {
	    	document.execCommand('underline',false,null);
	    	if (isU){
	    		isU = false;
	    		underline.style.backgroundColor="gray";
	    	} else {
	    		isU = true;
	    		underline.style.backgroundColor="#00688B";
	    	}
	    } ,false);

	//ordered list
	ordList.addEventListener('mousedown', function(event) {
		event.preventDefault ? event.preventDefault() : (event.returnValue=false);
	}, false);
	ordList.addEventListener('mouseup', function() {
	    	document.execCommand('insertOrderedList',false,null);
	    	if (isOLi){
	    		isOLi = false;
	    		ordList.style.backgroundColor="gray";
	    	} else {
	    		isOLi = true;
	    		ordList.style.backgroundColor="#00688B";
	    	}
	    } ,false);

	//unordered list
	unordList.addEventListener('mousedown', function(event) {
		event.preventDefault ? event.preventDefault() : (event.returnValue=false);
	}, false);
	unordList.addEventListener('mouseup', function() {
	    	document.execCommand('insertUnorderedList',false,null);
	    	if (isULi){
	    		isULi = false;
	    		unordList.style.backgroundColor="gray";
	    	} else {
	    		isULi = true;
	    		unordList.style.backgroundColor="#00688B";
	    	}
	    } ,false);

	//Temporarily save the html content
	document.querySelector('#textBox').addEventListener('keyup', function(event) {
		saveContent.value = document.querySelector('#textBox').innerHTML;
		saveImage.value = canvas.toDataURL();
	}, false);

	
}, false);
