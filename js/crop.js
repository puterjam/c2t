/**
 * 通过ID获取DOM节点
 */
var $ = $ || function (id) {
	return document.getElementById(id);
};

//var c2t = c2t || {};

/**
 * 拖拽控制
 */
c2t.DragDrop = {
	/**
	 * 在使用拖动功能前保证初始化拖放管理器
	 */
	initial: function(){
		if (!this._init) {
			window.addEventListener("mousemove", this._onMouseMove, false);
			window.addEventListener("mouseup", this._handleMouseUp, false);
			this._init = true;
		}
	},
	
	_handleMouseUp : function (evt) {
		c2t.DragDrop.stopDrag();
	},
	
	/**
	 * 当不需要再使用拖动功能时可以销毁管理器从而节省资源
	 */
	destroy: function(){
		window.removeEventListener("mousemove", this._onMouseMove);
		window.removeEventListener("mouseup", this._handleMouseUp, false);
	},
	/**
	 * 使该HTML元素开始被拖拽
	 *
	 * @param {HTMLElement} element 需要被拖拽的对象
	 * @param {Rectangle} bounds 被约束的范围(矩形)
	 */
	startDrag: function(element, bounds){
		if (typeof(bounds) != 'undefined') {
			this._bounds = bounds;
		}
		else {
			this._bounds = null;
		}
		
		var ns = c2t.DragDrop;
		ns.stopDrag();
		if (ns.controllElement != element) {
			ns.iDiffX = ns.mouseX - element.offsetLeft;
			ns.iDiffY = ns.mouseY - element.offsetTop;
			ns.controllElement = element;
		}
	},
	/**
	 * 停止当前的拖拽操作
	 */
	stopDrag: function(){
		c2t.DragDrop.controllElement = null;
		if (typeof(this.onDragStop) == 'function') {
			this.onDragStop(this.mouseX - this.iDiffX, this.mouseY - this.iDiffY);
			//this.onDragStop = null;
		}
	},
	
	_onMouseUp: function(event){
		c2t.DragDrop.stopDrag();
	},
	
	_onMouseMove: function(event){
		var ns = c2t.DragDrop;
		ns.mouseX = parseInt(event.clientX, 10);
		ns.mouseY = parseInt(event.clientY, 10);
		if (!!ns.controllElement) {
			//org.youyee.Event.preventDefault(event);
			event.preventDefault();
			var _x = ns.mouseX - ns.iDiffX;
			var _y = ns.mouseY - ns.iDiffY;
			
			if (!!ns._bounds) {
				var b = ns._bounds;
				if (_x < b.x) {
					_x = b.x;
				}
				else if (_x > b.x + b.width) {
						_x = b.x + b.width;
				}
				
				if (_y < b.y) {
					_y = b.y;
				}
				else if (_y > b.y + b.height) {
					_y = b.y + b.height;
				}
			}
			ns.controllElement.style.left = _x + 'px';
			ns.controllElement.style.top = _y + 'px';
			
			if (typeof(ns.onMouseMove) == 'function') {
				// 执行onMouseMove函数并将X Y轴坐标传入
				ns.onMouseMove(_x, _y);
			}
		}
	},
	_bounds: null,
	controllElement: null,
	mouseX: 0,
	mouseY: 0,
	iDiffX: 0,
	iDiffY: 0
};

/**
 *  一个用于图片截取的小工具
 */
c2t.CropUtil = {
	_readyToUse : false,
	_dragPointWidth : 0,
	_centerPointWidth : 0,
	_width : 0,
	_height : 0,
	_imgSrc : "",
	_uiContent : '<div id="crop_placeholder" style="height:{%height%}px;"></div><div id="image_list" class="imagelist"></div><canvas id="linecanvas" class="linelayer"></canvas><div id="cd" class="centerpoint"></div><div id="lt" class="ltpoint"></div><div id="rt" class="rtpoint"></div><div id="lb" class="lbpoint"></div><div id="rb" class="rbpoint"></div><div id="lm" class="lmpoint"></div><div id="tm" class="tmpoint"></div><div id="rm" class="rmpoint"></div><div id="bm" class="bmpoint"></div>',
	_selectedCallback : null,
	
	lt : null,
	lb : null,
	rt : null,
	rb : null,
	cd : null,
	
	lm : null,
	tm : null,
	bm : null,
	rm : null,
	
	placeHolder : null,
	imageList : null,
	dragPoints : [],
	lineCanvas : null,
	image : null,
	files : [],
	images : [],

	/**
	 * 初始化图片截取工具
	 * @param imgSrc 图片地址
	 * @param canvasWidth 画布的宽度（不能小于图片的宽度）
	 * @param canvasHeight 画布的高度（不能小于图片的高度）
	 * @param selectedCallBack 选中后的回调
	 * @param files 需要在图片列表中呈现的图片文件
	 */
	initial : function (imgSrc, canvasWidth, canvasHeight, selectedCallBack, files) {
		this._readyToUse = false;
		this._imgSrc = imgSrc;
		this._width = canvasWidth;
		this._height = canvasHeight;
		this._selectedCallback = selectedCallBack;
		this.files = files;
		this._initUI();
	},
	
	/**
	 * 添加一个图片到图片列表
	 * @param src 图片地址
	 */
	addImage : function(src) {
		var img = new Image();
		img.src = src;
		img.className = "imagelistitem";
		
		var span = document.createElement("span");
		span.className = "image_wrapper";
		
		span.appendChild(img);
		
		span.addEventListener("click", function(evt){
			var len = c2t.CropUtil.images.length;
			
			for (var i=0; i<len; ++i) {
				c2t.CropUtil.images[i].className = "image_wrapper";
			}
			
			span.className = "image_wrapper select";
			c2t.CropUtil.setCurrentImageUrl(img.src);
		}, false);
		
		if (this.imageList){
			this.imageList.appendChild(span);
			this.images.push(span);
		}
	},
	
	/**
	 * 通过传入的文件数组，来设置图片列表呈现的文件
	 * @param files 文件列表
	 */
	addImagesByFiles : function(files) {
		var reader;
		var len = files.length;
		var file;
		for (var i=0; i<len; ++i) {
			file = files[i];
			if (/image/.test(file.type)) {
				reader = new FileReader();
				reader.onload = function (e) {
					var dataUrl = e.target.result;
					c2t.CropUtil.addImage(dataUrl);
				};
				
				reader.readAsDataURL(file);
			}
		}
	},
	
	/**
	 * 设置当前呈现的图片
	 * @param src 图片文件的地址
	 */
	setCurrentImageUrl : function(src) {
		if (this.lineCanvas) {
			this.lineCanvas.style.background = "url(" + src + ")";
		}
	},
	
	_initUI : function () {
		this.image = new Image();
		this.image.addEventListener("load", this._handleImageLoaded.bind(this), false);
		this.image.src = this._imgSrc;
	},

	_handleUIInitialized : function () {
		this.lt = $("lt");
		this.lb = $("lb");
		this.rt = $("rt");
		this.rb = $("rb");
		this.cd = $("cd");
		
		this.lm = $("lm");
		this.rm = $("rm");
		this.tm = $("tm");
		this.bm = $("bm");
		
		//FIXME 这里不应该出现这个Magic Number
		this._dragPointWidth = 10 / 2;
		this._centerPointWidth = 16 / 2;

		this.lineCanvas = $("linecanvas");
		this.placeHolder = $("crop_placeholder");
		this.imageList = $("image_list");
		this.dragPoints = [this.lt, this.lb, this.rt, this.rb];
		
		this._initUIComponent();
	},
	
	_handleImageLoaded : function (evt) {
		this.image.removeEventListener("load", arguments.callee);
		var html = this._uiContent.replace("{%height%}", this.image.height + 60);
		c2t.maskDialog.show('选择裁剪区域', html, {
			callback : this._handleUIInitialized.bind(this),
			buttons : [
				{ text : "裁剪图片" , click : "c2t.CropUtil.getCropRectangleAndCallBack();"}
			]
		});
	},
	
	_initUIComponent : function() {
		this.lineCanvas.width = Math.max(this._width, this.image.width);
		
		this.lineCanvas.style.background = "url(" + this.image.src + ")";
		this.lineCanvas.height = Math.max(this._height, this.image.height);
		this.lineCanvas.className += " fade_in";
		
		this.addImagesByFiles(this.files);
		
		//this.placeHolder.style.width = this.image.width + "px";
		//this.placeHolder.style.height = this.image.height + "px";
		
		setTimeout(this._initDragPoints.bind(this), 1000);
	},
	
	_initDragPoints : function() {
		this.lineCanvas.style.display = "block";
		this.lineCanvas.style.left = 500 / 2 - this.image.width / 2 + "px";
		this.lineCanvas.style.top = 50 + this.placeHolder.offsetHeight / 2 - this.image.height / 2 + "px";
		
		var x = this.lineCanvas.offsetLeft;
		var y = this.lineCanvas.offsetTop;
		var fixValue = this._dragPointWidth;
		
		this.rt.style.top = this.lt.style.top = y - fixValue + "px";
		this.lb.style.left = this.lt.style.left = x - fixValue + "px";
		this.rb.style.left = this.rt.style.left = x + this.image.width - fixValue + "px";
		this.rb.style.top = this.lb.style.top = y + this.image.height - fixValue + "px";
		
		this.lm.style.left = x - fixValue + "px";
		this.tm.style.top = y - fixValue + "px";
		this.rm.style.left = x + this.image.width - fixValue + "px";
		this.bm.style.top = y + this.image.height - fixValue + "px";
		
		this.lm.style.top = this.rm.style.top = y + this.image.height / 2 - fixValue + "px";
		this.tm.style.left = this.bm.style.left = x + this.image.width / 2 - fixValue + "px";
		
		fixValue = this._centerPointWidth;
		this.cd.style.left = x + this.lineCanvas.width / 2 - fixValue + "px";
		this.cd.style.top = y + this.lineCanvas.height / 2 - fixValue + "px";
		
		this._initDragPointEvent(this.lt);
		this._initDragPointEvent(this.lb);
		this._initDragPointEvent(this.rt);
		this._initDragPointEvent(this.rb);
		
		this._initHorizonDragPointEvent(this.lm);
		this._initHorizonDragPointEvent(this.rm);
		this._initVerticalDragPointEvent(this.tm);
		this._initVerticalDragPointEvent(this.bm);
		
		cd.addEventListener("mousedown", this._initCenterDragPointEvent.bind(this), false);
		
		this._makeElementFadeIn([
			this.lt, this.lb, this.rt, this.rb, this.cd,
			this.lm, this.rm, this,tm, this.bm
		]);
		
		c2t.DragDrop.initial();
		this.drawGuidLine();
		this._readyToUse = true;
	},
	
	_makeElementFadeIn : function (elements) {
		var len = elements.length;
		
		for (var i=0; i<len; ++i) {
			elements[i].className += " fade_in";
		}
	},
	
	_initHorizonDragPointEvent : function (element) {
		var ns = this;
		
		element.addEventListener("mousedown", function (evt) {
			var x = ns.lineCanvas.offsetLeft;
			
			var bounds = {
				x : x - ns._dragPointWidth,
				y : element.offsetTop,
				width : ns.lineCanvas.width,
				height : 0
			};
			
			c2t.DragDrop.startDrag(element, bounds);
			c2t.DragDrop.onMouseMove = ns._handleDragMove.bind(ns);
		}, false);
	},
	
	_initVerticalDragPointEvent : function (element) {
		var ns = this;
		
		element.addEventListener("mousedown", function (evt) {
			var y = ns.lineCanvas.offsetTop;
			
			var bounds = {
				x : element.offsetLeft,
				y : y - ns._dragPointWidth,
				width : 0,
				height : ns.lineCanvas.height
			};
			
			c2t.DragDrop.startDrag(element, bounds);
			c2t.DragDrop.onMouseMove = ns._handleDragMove.bind(ns);
		}, false);
	},
	
	_initCenterDragPointEvent : function(evt) {
		var fixValue = this._centerPointWidth;
		var rect = this.getCropRectangle();
		var newRect = { x : this.lineCanvas.offsetLeft + rect.halfWidth - fixValue, y : this.lineCanvas.offsetTop + rect.halfHeight - fixValue, width : this.lineCanvas.width - rect.width, height : this.lineCanvas.height - rect.height };
		//document.title = newRect.x + "," + newRect.y + "," + newRect.width + "," + newRect.height;
		c2t.DragDrop.startDrag(cd, newRect);
		c2t.DragDrop.onMouseMove = this._handleDragMove.bind(this);
	},

	_initDragPointEvent : function(element) {
		var ns = this;
		element.addEventListener("mousedown", function (evt) {
			var x = ns.lineCanvas.offsetLeft;
			var y = ns.lineCanvas.offsetTop;
			var bounds = {
				x : x - ns._dragPointWidth,
				y : y - ns._dragPointWidth,
				width : ns.lineCanvas.width,
				height : ns.lineCanvas.height
			};
			c2t.DragDrop.startDrag(element, bounds);
			c2t.DragDrop.onMouseMove = ns._handleDragMove.bind(ns);
		}, false);
	},

	_handleDragMove : function (x, y) {
		var rect;
		var valueFix;
		
		if (c2t.DragDrop.controllElement == this.lt) {
			this.rt.style.top = y + "px";
			this.lb.style.left = x + "px";
		} else if (c2t.DragDrop.controllElement == this.rt) {
			this.lt.style.top = y + "px";
			this.rb.style.left = x + "px";
		} else if (c2t.DragDrop.controllElement == this.lb) {
			this.lt.style.left = x + "px";
			this.rb.style.top = y + "px";
		} else if (c2t.DragDrop.controllElement == this.rb) {
			this.rt.style.left = x + "px";
			this.lb.style.top = y + "px";
		} else if (c2t.DragDrop.controllElement == this.lm) {
			this.lt.style.left = this.lb.style.left = x + "px";
		} else if (c2t.DragDrop.controllElement == this.rm) {
			this.rt.style.left = this.rb.style.left = x + "px";
		} else if (c2t.DragDrop.controllElement == this.tm) {
			this.lt.style.top = this.rt.style.top = y + "px";
		} else if (c2t.DragDrop.controllElement == this.bm) {
			this.rb.style.top = this.lb.style.top = y + "px";
		} else if (c2t.DragDrop.controllElement == this.cd) {
			var x_fix = x + this._centerPointWidth - this._dragPointWidth;
			var y_fix = y + this._centerPointWidth - this._dragPointWidth;
			rect = this.getCropRectangle();
			this.lb.style.left = this.lt.style.left = x_fix - rect.halfWidth + "px";
			this.rt.style.top = this.lt.style.top = y_fix - rect.halfHeight + "px";
			this.rb.style.left = this.rt.style.left = x_fix + rect.halfWidth + "px";
			this.lb.style.top = this.rb.style.top = y_fix + rect.halfHeight + "px";
		}
		
		rect = this.getCropRectangle();
		valueFix = this._dragPointWidth;
		
		this.cd.style.left = rect.x + rect.halfWidth - this._centerPointWidth + "px";
		this.cd.style.top = rect.y + rect.halfHeight - this._centerPointWidth + "px";
		
		this.lm.style.left = rect.x - valueFix + "px";
		this.tm.style.top = rect.y - valueFix + "px";
		this.rm.style.left = rect.x + rect.width - valueFix + "px";
		this.bm.style.top = rect.y + rect.height - valueFix + "px";
		
		this.lm.style.top = this.rm.style.top = rect.y + rect.halfHeight - valueFix + "px";
		this.tm.style.left = this.bm.style.left = rect.x + rect.halfWidth - valueFix + "px";
		
		this.drawGuidLine();
	},

	/**
	 * 绘制剪裁引导线
	 */
	drawGuidLine : function() {
		var r = this.getCropRectangle(true);
		var context = this.lineCanvas.getContext("2d");

		if (context) {
			context.clearRect(0, 0, this.lineCanvas.width, this.lineCanvas.height);
			context.lineWidth = 1;
			//FIXME 这里应该放到静态变量去哈
			context.strokeStyle = "#26344D";
			context.beginPath();
			context.moveTo(r.x, r.y);
			context.lineTo(r.x + r.width, r.y);
			context.lineTo(r.x + r.width, r.y + r.height);
			context.lineTo(r.x, r.y + r.height);
			context.lineTo(r.x, r.y);
			context.closePath();
			context.globalAlpha = 0.7;
			context.stroke();
		}
	},
	
	/**
	 *  获取截取的矩形
	 *  @param {Boolean} forCanvas 是否是为Canvas绘制引导线条输出的矩形
	 *  @return {Object} {x : int, y : int, width : int, height :int}
	 */
	getCropRectangle : function (forCanvas) {
		var xMin = Number.MAX_VALUE;
		var xMax = 0;
		var yMin = Number.MAX_VALUE;
		var yMax = 0;
		var len = this.dragPoints.length;

		for (var i=0; i<len; ++i)
		{
			xMin = Math.min(this.dragPoints[i].offsetLeft, xMin);
			xMax = Math.max(this.dragPoints[i].offsetLeft, xMax);
			yMin = Math.min(this.dragPoints[i].offsetTop, yMin);
			yMax = Math.max(this.dragPoints[i].offsetTop, yMax);
		}

		var fixValue = this._dragPointWidth;
		var result = { x : xMin + fixValue, y : yMin + fixValue, width : xMax - xMin, height : yMax - yMin };

		if (forCanvas) {
			var x = this.lineCanvas.offsetLeft;
			var y = this.lineCanvas.offsetTop;
			result.x -= x;
			result.y -= y;
			
			result.x = result.x < 0 ? 0 : result.x;
			result.y = result.y < 0 ? 0 : result.y;
			result.x = result.x > this.image.width ? this.image.width : result.x;
			result.y = result.y > this.image.height ? this.image.height : result.y;
		}
		
		result.halfWidth = result.width  / 2;
		result.halfHeight = result.height / 2;

		return result;
	},
	
	/**
	 *  执行确认选区后的回调
	 */
	getCropRectangleAndCallBack : function() {
		if (!this._readyToUse) {
			return ;
		}
		var rect = this.getCropRectangle(true);
		if (typeof this._selectedCallback == "function") {
			this._selectedCallback(rect);
		}
		else
		{
			alert("[x:" + rect.x + ", y" + rect.y + ", width:" + rect.width + ", height:" + rect.height +  "]");
		}
		
		this.destroy();
		c2t.maskDialog.hide();
	},
	
	/**
	 *  销毁
	 */
	destroy : function() {
		this._readyToUse = false;
		this._imgSrc = "";
		this._selectedCallback = null;
		this.lt = this.lb = this.rt = this.rb = this.lm = this.rm = this.tm = this.bm = this.cd = null;
		this.placeHolder = null;
		this.imageList = null;
		this.dragPoint = [];
		this.lineCanvas = null;
		this.image = null;
		this.files = [];
		this.images = [];
	}
};