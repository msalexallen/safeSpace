$(function () {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
});

function imageIsLoaded(e) {
    document.getElementById('canvasDiv').style.display = 'block';
    console.log(document.getElementById('canvasDiv').clientWidth);
    document.getElementById('editableCanvas').width = document.getElementById('canvasDiv').clientWidth;	
    document.getElementById('tempCanvas').width = document.getElementById('canvasDiv').clientWidth;	
    //document.getElementById('tempCanvas').height = document.getElementById('canvasDiv').clientHeight;	
    $('#myImg').attr('src', e.target.result);
    //document.getElementById('myImg').height = document.getElementById('myImg').height*.25;
    if (document.getElementById('myImg').height > 500){
    	var resizeCanvas = document.createElement('canvas');
    	var resizeContext = resizeCanvas.getContext('2d');
    	resizeCanvas.height = 500;
    	resizeCanvas.width = (document.getElementById('myImg').width/document.getElementById('myImg').height)*500;
    	resizeContext.drawImage(document.getElementById('myImg'),0,0, resizeCanvas.width, resizeCanvas.height);
    	$('#myImg').attr('src', resizeCanvas.toDataURL());
    	//document.getElementById('myImg')
    }
    var storageCanvas = document.createElement('canvas');
    var storageContext = storageCanvas.getContext('2d');
    storageCanvas.width = document.getElementById('myImg').width;
   	storageCanvas.height = document.getElementById('myImg').height;
    storageContext.drawImage(document.getElementById('myImg'),0,0);
    passImg.value = storageCanvas.toDataURL();
    

    document.querySelector('#editableCanvas').getContext('2d').drawImage(myImg,0,0);
};

function submitMe() {
    
    var storageCanvas = document.createElement('canvas');
    var storageContext = storageCanvas.getContext('2d');
    storageCanvas.width = document.getElementById('myImg').width;
   	storageCanvas.height = document.getElementById('myImg').height;
    storageContext.drawImage(document.getElementById('myImg'),0,0);
    $.post("/signup/passimg", 
	{image: storageCanvas.toDataURL(),
	content: document.getElementById("finalSquares").value
	}
    ).success(function(data){
	window.location = "/signup/success";
	});
}

window.addEventListener('load', function() {
	// Get the context of the editable canvas in the html
	var canvas = document.querySelector('#editableCanvas');
	var context = canvas.getContext('2d');
	
	//Give it the same features as its enclosing div
	var drawing1 = document.querySelector('#canvasDiv');
	var drawingStyle = getComputedStyle(drawing1);

	canvas.width = parseInt(drawingStyle.getPropertyValue('width'));
	canvas.height = parseInt(drawingStyle.getPropertyValue('height'));
	
	var crayonPoints = [];
	var squares = [];
	var drawColor = 'blue';
	var op = 0;

	// Make a temporary canvas (same feats as canvas) to store the changes before they 
	// get added to the final document ex sample lines with the line tool before you release the mouse
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');
	tempCanvas.id = 'tempCanvas';
	tempCanvas.width = canvas.width;
	tempCanvas.height = canvas.height;

	//add in the temp image
	var o1 =0;
	var offset = 0;
	var img = myImg;
	//img.src = "temp.png"
	img.onload = function () {
	    context.drawImage(img,0,0);
    	canvas.height = img.height;
    	tempCanvas.height = img.height;
    	o1 = img.width - canvas.width;
    	render();
	}

	function render(){
	    context.clearRect(0,0,canvas.width, canvas.height);
	    tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
	    op = Math.max(offset-o1, 0);
	    context.drawImage(img, offset, 0, canvas.width-op, img.height, 0, 0, canvas.width-op, img.height)
	    context.drawImage(img,0,0,op, img.height,canvas.width-op ,0,op,img.height);

	    for (i = 0; i < squares.length; i++) {
	    	tempContext.strokeRect(squares[i].x-offset, squares[i].y, squares[i].w, squares[i].h);
			if (op != 0){
				tempContext.strokeRect(squares[i].x+canvas.width-op, squares[i].y, squares[i].w, squares[i].h);
			}
		}
		finalSquares.value = JSON.stringify(squares);
	}
		//tempContext.stroke();
	
	drawing1.appendChild(tempCanvas);

	// Dictionary to define a mouse location (x,y)
	var mouse = {x: 0, y: 0};
	
	// Set the code to capture the initial mouse movement
	tempCanvas.addEventListener('mousemove', function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	}, false);
	
	// Set initial values for the temporary canvas's drawing tools
	tempContext.lineWidth = 3;
	tempContext.lineJoin = 'round';
	tempContext.lineCap = 'round';
	tempContext.strokeStyle = drawColor;
	tempContext.fillStyle = drawColor;

	// Add a listener to the temporary canvas for when the mouse is down
	tempCanvas.addEventListener('mousedown', function(e) {
		// While the mouse is down and moving, add the changes to the temporary canvas

		tempContext.lineWidth = 3;
		context.lineWidth = 3;
		tempContext.strokeStyle = drawColor;
		context.strokeStyle = drawColor;
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
		//context.drawImage(tempCanvas, 0, 0);
		// Clearing tmp canvas
		//tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		
		// Remove the old crayon points from the list

		//handle getting the point order right
		xL = crayonPoints[0].x
		xR = crayonPoints[crayonPoints.length - 1].x
		yT = crayonPoints[0].y
		yB = crayonPoints[crayonPoints.length - 1].y
		if (xR < xL){
			t = xR
			xR = xL
			xL = t
		}
		if (yB > yT) {
			t = yB
			yB = yT
			yT = t
		}

		x1Point = xL + offset;
		if (x1Point > img.width){
			x1Point = x1Point - img.width;
		}
		squares.push({x: x1Point, y: yT, 
			w: xR - xL, 
			h: yB - yT});
		crayonPoints = [];
		// console.log(squares[squares.length -1].x1);
		// console.log(squares[squares.length -1].y1);
		// console.log(squares[squares.length -1].x2);
		// console.log(squares[squares.length -1].y2);
		render();

		//Temporarily save the canvas
		//saveImage.value = canvas.toDataURL();
		//saveContent.value = document.querySelector('#textBox').innerHTML;
	}, false);


	//The actual painting function (adds the mouse movements to the canvas)
	var onPaint = function() {
		// Add the last mouse location to the array
		crayonPoints.push({x: mouse.x, y: mouse.y});
		
		// Clear the temporary canvas now that another change has been added
		tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
	    for (i = 0; i < squares.length; i++) {
	    	tempContext.strokeRect(squares[i].x-offset, squares[i].y, squares[i].w, squares[i].h);
			if (op != 0){
				tempContext.strokeRect(squares[i].x+canvas.width-op, squares[i].y, squares[i].w, squares[i].h);
			}
		}
		
		// Begin the path at the initial crayon location
		tempContext.beginPath();
		tempContext.moveTo(crayonPoints[0].x, crayonPoints[0].y);
		
		//draw a rectangle
		var width = crayonPoints[0].x - crayonPoints[crayonPoints.length - 1].x;
		var height = crayonPoints[0].y - crayonPoints[crayonPoints.length - 1].y;
		tempContext.rect(crayonPoints[0].x, crayonPoints[0].y, -1*width, -1*height);
		//tempContext.fill();
		
		// Now actually draw the thing
		tempContext.stroke();
		
	};

	window.onkeydown = function(e) {
	    var key = e.keyCode;
	    if (key == 37) {
	        offset -= 100;
	    } else if (key == 39) {
	        offset += 100;
	    }
	    if(offset >= img.width){
	        offset= offset%img.width;
	    } else if (offset <= 0) {
	        offset=img.width+offset;
	    }
	    render();
	}	

}, false);