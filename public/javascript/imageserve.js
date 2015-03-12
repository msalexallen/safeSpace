window.addEventListener('load', function() {
	document.getElementById('canvasDiv').style.display = 'block';
	//document.getElementById('editableCanvas').width = document.getElementById('canvasDiv').clientWidth;	
	//document.getElementById('tempCanvas').width = document.getElementById('canvasDiv').clientWidth;
	// Get the context of the editable canvas in the html
	var canvas = document.querySelector('#editableCanvas');
	var context = canvas.getContext('2d');
	
	//Give it the same features as its enclosing div
	var drawing1 = document.querySelector('#canvasDiv');
	var drawingStyle = getComputedStyle(drawing1);
	
	canvas.width = parseInt(drawingStyle.getPropertyValue('width'));
	canvas.height = parseInt(drawingStyle.getPropertyValue('height'));
	
	var squares = [];
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

	//img.onload = function () {
		console.log(img.height);
	    context.drawImage(img,0,0);
    	canvas.height = img.height;
    	tempCanvas.height = img.height;
    	o1 = img.width - canvas.width;
    	render();
	//}

	function render(){
	    context.clearRect(0,0,canvas.width, canvas.height);
	    tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);
	    op = Math.max(offset-o1, 0);
	    context.drawImage(img, offset, 0, canvas.width-op, img.height, 0, 0, canvas.width-op, img.height)
	    context.drawImage(img,0,0,op, img.height,canvas.width-op ,0,op,img.height);

		passPoints.value = JSON.stringify(squares);
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
	
	// Add a listener to the temporary canvas for when the mouse is down
	tempCanvas.addEventListener('mouseclick', function(e) {

		// Get the x and y of the mouse where it is down
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		
		// Add the x and y to the crayon 'visited' points
		x1Point = mouse.x + offset;
		if (x1Point > img.width){
			x1Point = x1Point - img.width;
		}
		squares.push({x: x1Point, y: mouse.y});

	}, false);

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