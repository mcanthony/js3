
/**
 * JS3 - A simple AS3 drawing api for the JavaScript Canvas
 * Version : 0.1.0
 * Link : https://github.com/braitsch/JS3
 * Author : Stephen Braitsch :: @braitsch
**/

function JS3(cnvs)
{
	// private instance vars //	
		var _canvas 	= document.getElementById(cnvs);
		var _context 	= _canvas.getContext("2d");
		var _width 		= _canvas.width;
		var _height 	= _canvas.height;
		var _children 	= [];
		var _graphics	= [];
		var _runners	= [];
		var _tweens		= [];
		var _drawClean 	= true;
		var _background = '#ffffff';
		var _frameNum	= 0;
		var _frameRate	= 60;		
		var _frameTime	= new Date() * 1;
		var _running 	= false;
	
	// public getters & setters //
	 	this.__defineGetter__("width", 			function()		{ return _width;});
	 	this.__defineGetter__("height", 		function()		{ return _height;});
	 	this.__defineGetter__("numChildren", 	function()		{ return _children.length;});
	 	this.__defineSetter__("drawClean", 		function(b)		{ _drawClean = b;});
	 	this.__defineSetter__("background", 	function(b)		{ _background = b; drawBackground();});
	
	// public constants //
		JS3.LINE 		= 'line';	
		JS3.ARC 		= 'arc';			
		JS3.RECT 		= 'rect';	
		JS3.CIRCLE	 	= 'circle';	
		JS3.TRIANGLE	= 'triangle';
		JS3.TEXT 		= 'text';
		JS3.GRAPHIC 	= {	x:0, y:0, alpha:1, scale:1, rotation:1, fill:true, fillColor:'#fff', fillAlpha:1,
						size:25, stroke:true, strokeColor:'#eee', strokeAlpha:1, strokeWidth:4, capStyle:'butt'};
		JS3.TEXTFIELD 	= {	x:0, y:0, alpha:1, scale:1, rotation:1, text:'', size:12, font:'Arial', color:'#333'};						
	
	// display list management //	
	
		this.addChild = function(o){
			_children.push(o);
			if (!_running) render();
		}	
		this.addChildAt = function(o, n){
			if (n <= _children.length) _children.splice(n, 0, o);
			if (!_running) render();			
		}			
		this.getChildAt = function(n){
			return _children[n];
		}
		this.getChildAtRandom = function(){
			return _children[Math.floor(Math.random()*_children.length)];
		}		
		this.removeChildAt = function(n){
			_children.splice(n, 1);
		}		
		
	// 	animation methods //
		
		this.run = function(func, delay, repeat){
		// prevent double running //	
			for (var i = _runners.length - 1; i >= 0; i--) if (func == _runners[i].f) return;
			_runners.push({f:func, d:delay, r:repeat});
			if (_running == false) startAnimating();
		}	
		this.stop = function(func){
			for (var i = _runners.length - 1; i >= 0; i--) if (func == _runners[i].f) _runners.splice(i, 1);
		}	
		this.tween = function(obj, secs, props){
			if (obj.isTweening) return;
		// calc delta to tween for each prop //				
			props.d = {};
			props.n = Math.round((secs * 1000) / 30);
			for (var k in props) if (obj[k] !=undefined) props.d[k] = (props[k] - obj[k]) / props.n;  
			props.o = obj;
			props.o.isTweening = true;
			_tweens.push(props);
			if (_running == false) startAnimating();
		}			
		
	// save canvas as a png //
		
		this.save = function(){
			var img = _canvas.toDataURL('image/png');
			var win = window.open('', '_blank', 'width='+_width+', height='+_height);
				win.document.write('<!DOCTYPE html style="padding:0; margin:0"><head><title>My Canvas</title>');
	 			win.document.write('</head><body style="background: #f2f2f2; padding:0; margin:0">');
	 			win.document.write('<img src="' + img + '"/>');
	 			win.document.write('</body></html>');
	 			win.document.close();
		}
		
	// basic drawing methods //	
		this.render		= function(){ render() };
		this.clear		= function(){ drawBackground() };				
		this.drawLine	= function(o){ _graphics.push(new JS3Line(o)); 		if (!_running) render();	}
		this.drawArc	= function(o){ _graphics.push(new JS3Arc(o)); 		if (!_running) render();	}
		this.drawRect	= function(o){ _graphics.push(new JS3Rect(o));  	if (!_running) render();	}
		this.drawCircle	= function(o){ _graphics.push(new JS3Circle(o));	if (!_running) render();	}
		this.drawTri	= function(o){ _graphics.push(new JS3Tri(o));		if (!_running) render();	}				
		this.drawText 	= function(o){ _graphics.push(new JS3Text(o)); 		if (!_running) render();	}	
	
	// private instance methods //
		var drawLine = function(o){	
			_context.globalAlpha = o.alpha;			
			_context.moveTo(o.x1, o.y1);  
			_context.lineTo(o.x2, o.y2);
			stroke(o);
			_context.globalAlpha = 1;			
		}
		var drawArc = function(o){
			_context.globalAlpha = o.alpha;
			_context.moveTo(o.x1, o.y1);	
		 	_context.quadraticCurveTo(o.cx, o.cy, o.x2, o.y2);
			stroke(o);
			_context.globalAlpha = 1;			
		}		
		var drawRect = function(o){
			_context.globalAlpha = o.alpha;	
			_context.beginPath();
			_context.rect(o.x, o.y, o.width, o.height);
			if (o.fill) fill(o);
			if (o.stroke) stroke(o);			
			_context.globalAlpha = 1;
		}
		var drawCircle = function(o){
			_context.globalAlpha = o.alpha;	
		 	_context.beginPath();		
		    _context.arc(o.x, o.y, o.size/2, 0, 2 * Math.PI, false);
			if (o.fill) fill(o);
			if (o.stroke) stroke(o);
			_context.globalAlpha = 1;
		}
		var drawTri = function(o){
			_context.globalAlpha = o.alpha;	
		 	_context.beginPath();
			o.p1.x = o.p1.x || o.x - o.size/2;
			o.p1.y = o.p1.y || o.y + o.size/2;
			o.p2.x = o.p2.x || o.x;			
			o.p2.y = o.p2.y || o.y - o.size/2;
			o.p3.x = o.p3.x || o.x + o.size/2;
			o.p3.y = o.p3.y || o.y + o.size/2;							
			_context.lineTo(o.p1.x, o.p1.y);
			_context.lineTo(o.p2.x, o.p2.y);
			_context.lineTo(o.p3.x, o.p3.y);
			_context.lineTo(o.p1.x, o.p1.y);			
			if (o.fill) fill(o);
			if (o.stroke) stroke(o);
			_context.globalAlpha = 1;
		}		
		var fill = function(o){
			_context.globalAlpha = o.alpha * o.fillAlpha;			
		    _context.fillStyle = o.fillColor;
			_context.fill();
			_context.globalAlpha = 1;
		}
		var stroke = function(o){			
			_context.globalAlpha = o.alpha * o.strokeAlpha;
			_context.lineCap = o.capStyle;
		    _context.lineWidth = o.strokeWidth;
		    _context.strokeStyle = o.strokeColor;	
			_context.stroke();
			_context.globalAlpha = 1;
		}
		var drawText = function(o){
			_context.globalAlpha = o.alpha;
			_context.font = o.size+'pt '+o.font;
			_context.fillStyle = o.color;
			_context.textAlign = o.align;
			_context.fillText(o.text, o.x, o.y);			
			_context.globalAlpha = 1;			
		}	
		var drawBackground = function(){
			_context.fillStyle = _background;
			_context.fillRect(0, 0, _width, _height);				
		}
		var render = function()
		{
		// render non-persistent graphics //
			i = 0;
			while ( i < _graphics.length ) {
				var k = _graphics[i];
				paint(k);
				_graphics.splice(i, 1);
				k = null; i++;
			}
		// render display list object //				
			i = 0;
			while ( i < _children.length ) {
				paint(_children[i]); i++;
			}
		}
		var paint = function(o)
		{
			switch(o.type){
				case JS3.ARC :
					drawArc(o);
				break;				
				case JS3.LINE :
					drawLine(o);
				break;				
				case JS3.RECT :
					drawRect(o);
				break;					
				case JS3.CIRCLE :
					drawCircle(o);
				break;
				case JS3.TRIANGLE :
					drawTri(o);
				break;				
				case JS3.TEXT :
					drawText(o);
				break;										
			}			
		}
		var startAnimating = function()
		{
			getFrameRate();
			// execute runners //
			for (var i = 0; i < _runners.length; i++) {
				if (_runners[i].d === undefined){
					_runners[i].f();
			// execute on delay //		
				}	else if (_frameNum % _runners[i].d == 0){
					_runners[i].f();
					_runners[i].r -= 1;
					if (_runners[i].r == 0)	_runners.splice(i, 1);
				}
			}
			// execute tweens //
			for (var i = 0; i < _tweens.length; i++) {
				var twn = _tweens[i];
				// write new vals on target object //
				for (var k in twn.d) twn.o[k] += twn.d[k];
				// prevent negative alpha values from throwing errors //
				if (twn.o.alpha < 0) twn.o.alpha = 0;
					twn.n -=1;
				if (twn.n == 0) {
					_tweens.splice(i, 1);
					twn.o.isTweening = false;
					if (twn.onComplete != undefined) twn.onComplete(twn.o);
				}
			}
			if (_drawClean) drawBackground(); render();
			_running = (_tweens.length != 0 || _runners.length != 0);
			if (_running) requestAnimFrame(startAnimating);
		}
		var requestAnimFrame = (function(callback){
		    return window.requestAnimationFrame ||
		    window.webkitRequestAnimationFrame ||
		    window.mozRequestAnimationFrame ||
		    window.oRequestAnimationFrame ||
		    window.msRequestAnimationFrame ||
		    function(callback){ window.setTimeout(callback, 1000 / 60); };
		})();
		var getFrameRate = function()
		{
			_frameNum ++;
			if (_frameNum % 60 == 0){
				var now = new Date * 1;
				_frameRate = 1000 / ((now - _frameTime) / 60);
				_frameTime = now;
			}
		}		
}

// public static methods //
JS3.getRandomColor = function(){return '#' + Math.round(0xffffff * Math.random()).toString(16);}
JS3.getRandomValue = function(n1, n2)
{
	if (n1 == undefined){
		return Math.random();
	}	else if (n2 == undefined){
		return Math.random() * n1;
	}	else{
		return (Math.random() * (n2-n1)) + n1;
	}
}
JS3.copyProps = function(o1, o2){ for (var k in o1) o2[k] = o1[k]; if (o1.alpha != undefined) o2.strokeAlpha = o2.fillAlpha = o1.alpha; o1 = null;}	

// graphic primitives //

function JS3Line(o)
{
	this.type = JS3.LINE;
	for (var k in JS3.GRAPHIC) this[k] = JS3.GRAPHIC[k];
	if (o) JS3.copyProps(o, this);
}

function JS3Arc(o)
{
	this.type = JS3.ARC;
	for (var k in JS3.GRAPHIC) this[k] = JS3.GRAPHIC[k];
	if (o) JS3.copyProps(o, this);
}

function JS3Tri(o)
{
	this.type = JS3.TRIANGLE;
	this.p1 = {}; this.p2 = {}; this.p3 = {};		
	for (var k in JS3.GRAPHIC) this[k] = JS3.GRAPHIC[k];
	if (o) JS3.copyProps(o, this);
}

function JS3Rect(o)
{
	this.type = JS3.RECT;		
	for (var k in JS3.GRAPHIC) this[k] = JS3.GRAPHIC[k];		
	if (o) JS3.copyProps(o, this);
	if (this.width == undefined || this.height == undefined) this.width = this.height = this.size;
}

function JS3Circle(o)
{
	this.type = JS3.CIRCLE;	
	for (var k in JS3.GRAPHIC) this[k] = JS3.GRAPHIC[k];
	if (o) JS3.copyProps(o, this);	
}

function JS3Text(o)
{
	this.type = JS3.TEXT;
	for (var k in JS3.TEXTFIELD) this[k] = JS3.TEXTFIELD[k];	
	if (o) JS3.copyProps(o, this);	
}

var trace = function(m){ try{ console.log(m); } catch(e){ return; }};
