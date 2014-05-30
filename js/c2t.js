var c2t = {};
c2t.files = {};
c2t.count = 0;
c2t.isMac = /mac/i.test(navigator.userAgent);

c2t.CANVAS = null;
c2t.Storage = localStorage;
c2t.pushHelpID = "help1";//如果这个id变化，就会继续推帮助界面

c2t.opt = {
    canvas: {
        width: 800,
        height: 600
    },

    sort: {
        type: 1,
        //1按名字排序
        order: 1 //1顺序，0逆序
    },
    preview: {
    	width:0,
    	height:0,
    	frame:0
    }
}

/**
* 设置界面高度
*/
c2t.resize = function () {
    document.getElementById("content").style.height = document.body.clientHeight - 39 + "px"
};

/**
* 初始化入口
*/
c2t.init = function () {
    _DROP_AREA = window;
    _DROP_AREA.addEventListener("dragenter", c2t._dragenter, false);
    _DROP_AREA.addEventListener("dragover", c2t._dragover, false);
    _DROP_AREA.addEventListener("drop", c2t._drop, false);
    c2t.CANVAS = document.getElementById("canvas");
    c2t.initEvent();
    c2t.resize();
    c2t.setCanvasSize(800,600);
    window.onresize = c2t.resize;
//    if (!c2t.Storage.getItem(c2t.pushHelpID)) {
//	    c2t.showHelp();
//	}
}

c2t.showHelp = function(){
   c2t.maskDialog.show('欢迎使用 CSS 2D 动画转换工具','我可以帮你把逐帧动画的图片组合成一张大图. 您只需要把一批序列化(需要保持数字序列)的图片拖拽到界面中即可.<br/><img src="./img/tips1.png" alt="" class="img_frame_1" style="margin:10px;"/><div style="position: absolute;margin-top: 25px;"><label><input id="no_Help" type="checkbox" />下次进入不再显示</label></div>',{
   	callback : function(){
   		var _nh = document.getElementById("no_Help");
   		_nh.checked = !!c2t.Storage.getItem(c2t.pushHelpID);
   		_nh.addEventListener("click",function(){
   			c2t.Storage.setItem(c2t.pushHelpID,_nh.checked);
   		},false);
   		c2t.Storage.getItem(c2t.pushHelpID)
   	}
   });
}

/**
* 初始化界面按钮
*/
c2t.initEvent = function(){
	document.getElementById("button_new").addEventListener("click",c2t.new, false);
	document.getElementById("button_preview").addEventListener("click",c2t.preview, false);
	document.getElementById("button_publish").addEventListener("click",c2t.publish, false);
	document.getElementById("button_apply_canvas").addEventListener("click",c2t.apple_canvas, false);
	document.getElementById("button_help").addEventListener("click",c2t.showHelp, false);
	
	
	document.getElementById("button_sort").addEventListener("click",c2t.sort, false);	
	
	document.getElementById("preview_frame").addEventListener("change",c2t.change_frame, false);	
	
	document.getElementById("select_sort_order").addEventListener("change",function(){
		c2t.opt.sort.order = parseInt(document.getElementById("select_sort_order").value)
	}, false);
	
	window.addEventListener("keydown",c2t.event.keyPress,false);
	
	document.getElementById("mask").addEventListener("webkitTransitionEnd",c2t.maskDialog.transitionEnd,false);
	document.getElementById("button_dialog_close").addEventListener("click",c2t.maskDialog.hide,false);
	
	document.getElementById("input_fileSelect").addEventListener("change",c2t.handleFiles,false);
	
	document.getElementById("button_open").addEventListener("click",c2t.open,false);
}

c2t.open = function(){
	var _f = document.getElementById("input_fileSelect");
////	alert(_f.value)
	_f.value = "";
	_f.click();
}

c2t.handleFiles = function (e) {
    var dt = e.dataTransfer || this;
    var files = dt.files;
//	alert(files.length)
	if (files.length) {
    	c2t.openFiles(files);
	}
};

c2t.openFiles = function ( /*@type {Files}*/ files) {
	this._files = files;
	for (var i = 0, l = files.length; i < l; i++) {
    	if (/image/.test(files[i].type)) {
    		//c2t.readFile(, i);
			this.cropImageByFile(files[i], c2t._handleCropSectionSelected.bind(this), files);
			break;
    	}else{
    		console.log("image only")
    	}
    }
	
}

c2t._handleCropSectionSelected = function (rect) {
	this.cropRect = rect;
	this.tempCanvas = document.createElement("canvas");
	var files = this._files;
    for (var i = 0, l = files.length; i < l; i++) {
    	if (/image/.test(files[i].type)) {
    		c2t.readFile(files[i], i);
    	}else{
    		console.log("image only")
    	}
    }
};

c2t.cropImageByFile = function(/*@type {File}*/ file, callback, files) {
	var reader = new FileReader();
	
	reader.onload = function (e) {
		var dataUrl = e.target.result;
		
		//if (!c2t.CropUtil._init) {
		c2t.CropUtil.initial(dataUrl, 0, 0, callback, files);
		//}
	};
	
	reader.readAsDataURL(file);
} 

c2t.readFile = function ( /*@type {File}*/ file, /*@type {int}*/ index) {
    var reader = new FileReader();

    reader.onprogress = function ( /*@type {ProgressEvent}*/ e) {
        if (e.lengthComputable) {
            //document.title = (Math.ceil(100*e.loaded/file.size))
        }
    };

    reader.onloadstart = function ( /*@type {ProgressEvent}*/ e) {

    };

    reader.onload = function ( /*@type {ProgressEvent}*/ e) {
        var _result = e.target.result;
		var img = new Image();
		img.addEventListener("load", function () {
			var r = c2t.cropRect;
			var c = c2t.tempCanvas;
			
			c.width = r.width;
			c.height = r.height;
			
			var context = c.getContext("2d");
			
			if (context) {
				//try {
					context.drawImage(img, r.x, r.y, r.width, r.height, 0, 0, r.width, r.height);
				/*} catch (error) {
					new c2t.img(file.fileName, _result);
					return ;
				}*/
				
				new c2t.img(file.fileName, c.toDataURL("image/png"));
			}
		}, false);
		
		img.src = _result;
    };
	
	reader.onerror = function (e) {
		console.log(e);
	};

    reader.readAsDataURL(file);
};

c2t._dragenter = function (e) {
    e.stopPropagation();
    e.preventDefault();
};
c2t._dragover = function (e) {
    e.stopPropagation();
    e.preventDefault();
};
c2t._drop = function (e) {
    c2t.handleFiles(e);
    e.stopPropagation();
    e.preventDefault();
};

/**
*图标排序
*/
c2t.sort = function () {
	var isAutoFix = document.getElementById("check_autoFix").checked;
	var padding = parseInt(document.getElementById("pic_padding").value,10);
	
	c2t.fileNames = [];
	
	for (var k in c2t.files){
		c2t.fileNames.push([c2t.files[k].instanceID,c2t.files[k].name]);
	};
	
	//根据名字后缀数字排序
    var _s = c2t.fileNames.sort(function (a, b) {
        _a = parseInt(a[1].replace(/[^0-9]/g, ""));
        _b = parseInt(b[1].replace(/[^0-9]/g, ""));
        return ((c2t.opt.sort.order ? _a > _b : _a < _b) ? 1 : -1)
    });
    
    var _x = 0 + padding;
    var _y = 0 + padding;
    var _maxWidth = _maxHeight = 0;

	//根据排序结果输出结果
    _s.forEach(function(value){
        size = c2t.files[value[0]].getSize();
		console.log(size)
        if (!isAutoFix && _x + size.width> c2t.opt.canvas.width) {
            _x = 0 + padding;
            _y = _y + size.height + padding;
        }

        c2t.files[value[0]].setXY(_x, _y);

        _x = _x + size.width + padding;
        _maxWidth = Math.max(_maxWidth,size.width + padding*2);
        _maxHeight = Math.max(_maxHeight,size.height + padding*2);
    });
    
    c2t.opt.preview.width = _maxWidth;
    c2t.opt.preview.height = _maxHeight;
    c2t.opt.preview.frame = _s.length;
    
    if (isAutoFix) {
    	c2t.setCanvasSize(_x,_maxHeight)
    }
}

/**
*清空画布
*/
c2t.cleanAll = function(){
	for (var k in c2t.files){
		c2t.files[k].remove();
	};
}

/**
* 新建
*/
c2t.new  = function(){
	location.reload();
//	c2t.cleanAll();

//	c2t.setCanvasSize(800,600);
}

/**
* 设置画布尺寸
*/
c2t.setCanvasSize = function(width,height){
	c2t.opt.canvas.width = Math.max(32,parseInt(width));
	c2t.opt.canvas.height = Math.max(32,parseInt(height));

	document.getElementById("canvas").style.width = c2t.opt.canvas.width + "px";
	document.getElementById("canvas").style.height = c2t.opt.canvas.height + "px";

	document.getElementById("canvas_width").value = c2t.opt.canvas.width;
	document.getElementById("canvas_height").value = c2t.opt.canvas.height;
	
	document.getElementById("you_can_not_see_me").style.width = c2t.opt.canvas.width + 10 + "px";
}

/**
* 更新画板设置
*/
c2t.apple_canvas = function(){
	c2t.setCanvasSize(document.getElementById("canvas_width").value,document.getElementById("canvas_height").value);
}

c2t.publish = function(){
	   c2t.maskDialog.show('导出图片','文件名：<input id="dialog_filename" type="text" size="20" placeholder="请输入文件名" required="required"/><span class="file_ext">.png</span> &nbsp;&nbsp;&nbsp;PNG类型：<select id="dialog_png_type" value="8"><option value="8">PNG8</option><option value="32">PNG32</option></select>',{buttons:[{
	   	text:"预览",
	   	click:"c2t.previewResult()"
	   },{
	   	text:"导出",
	   	click:"c2t.save()"
	   }]});
}

c2t.preview = function(){
 	c2t.maskDialog.show('动画预览 - beta（一定会有bug）','<div id="div_preview"></div>',{callback:c2t._preview});
}

c2t._preview = function(){
	var asset = {
		url:c2t._publish(true),
		width:c2t.opt.preview.width, //宽度
		height:c2t.opt.preview.height, //高度
		frame : { //帧信息
			x : 0, //第一帧信息x坐标
			y : 0, //第一帧信息y坐标
			padding : 0, //帧间距
			total:c2t.opt.preview.frame, //总帧数
			direction:QZFL.css2d.DIRECTION.HORIZONTAL
		}
	};  
//	console.log(asset);
	QZFL.css2d.engine.setFPS(document.getElementById("preview_frame").value || 24);
	
	asset = QZFL.css2d.createAsset(asset);
	var _clip = QZFL.css2d.createClip(asset);
	_clip.append("div_preview");
}

c2t.previewResult = function(){
	if (!c2t._publishCheck(true)){
		return;
	}
	document.getElementById("input_preview").value = "1";
	document.getElementById("save_form").target = "_blank";

	c2t._publish();
}

c2t.save = function(){
	if (!c2t._publishCheck()){
		return;
	}
	document.getElementById("input_preview").value = "0";
	document.getElementById("save_form").target = "save_frame";

	c2t._publish();
	c2t.maskDialog.hide();
}

c2t._publishCheck = function(noCheck){
	var fn = document.getElementById("dialog_filename");
	if (!fn.checkValidity() && !noCheck){
		fn.select();
		return false;
	}
	document.getElementById("input_pngtype").value = document.getElementById("dialog_png_type").value;
	document.getElementById("input_filename").value = fn.value;
	return true
}

/**
* 发布资源
*/
c2t._publish = function(isReturnValue){
	var _c = document.createElement("canvas");
	_c.style.cssText = "position:absolute;left:0;top:0";
	_c.width = c2t.opt.canvas.width;
	_c.height = c2t.opt.canvas.height;
	document.body.appendChild(_c);
	var context = _c.getContext("2d");
	for (var k in c2t.files) {
		var xy = c2t.files[k].getXY();
		var size = c2t.files[k].getSize();
		//console.log(size)
		context.drawImage(c2t.files[k].getImg(),parseInt(xy.x,10),parseInt(xy.y,10));

	}
	if (isReturnValue){
		var dataUrl =  _c.toDataURL("image/png");
		_c.parentNode.removeChild(_c);
		return dataUrl;
	}else{
		//window.open(_c.toDataURL("image/png"));
		//_c.parentNode.removeChild(_c);
		document.getElementById("input_dataUrl").value = _c.toDataURL("image/png");
		document.getElementById("save_form").submit();
		_c.parentNode.removeChild(_c);
	}
}

c2t.maskDialog = {
	show:function(title,content,opt){	
		document.getElementById("mask").style.display = "-webkit-box"
		setTimeout(function(){document.getElementById("mask").style.opacity = "1";},0);
		c2t.maskDialog.arguments = {
			title : title || "提示:",
			content : content || "",
			opt : opt || {}
		};
		
		if (c2t.maskDialog._isOpened) {
			c2t.maskDialog.setContent();
		}
	},
	hide:function(){
		document.getElementById("mask").style.opacity = "0";
		c2t.maskDialog._isOpened = false;
	},
	transitionEnd:function(e){
		if (e.target.id!="mask"){ //只有仅仅当mask对象动画结束的时候才进行，否则会有很多动画的transition End
				return
			}
		if (document.getElementById("mask").style.opacity == "0") {
			document.getElementById("mask").style.display = "none";
			document.getElementById("dialog").className = "dialog";
		}else{
			c2t.maskDialog._isOpened = true;
			c2t.maskDialog.setContent();
			document.getElementById("dialog").className = "dialog dialog_display";
		}
	},
	setContent:function(){
			document.querySelector("#dialog>h1").innerHTML = c2t.maskDialog.arguments.title;
			document.querySelector("#dialog>section").innerHTML = c2t.maskDialog.arguments.content;
			
			var bHtml = [];
			if (c2t.maskDialog.arguments.opt.buttons){
				c2t.maskDialog.arguments.opt.buttons.forEach(function(v){
					bHtml.push('<button onclick="' + v.click + '">' + (v.text || "无标题") +'</button>')
				});
			}
			document.querySelector("#expand_buttons").innerHTML = bHtml.join("");
			
			if (c2t.maskDialog.arguments.opt.callback) {
				c2t.maskDialog.arguments.opt.callback();
			}
				
	}
}


//=============================================================================
/**
*　动画图片对象
*/
c2t.img = function (name, dataUrl) {
    this.name = name;
    this.instanceID = "c2t_" + c2t.count;
    this.selected = false;
    
    c2t.files[this.instanceID] = this;
    c2t.count++;
    
    //create image
    this.pic = new Image();
    c2t.CANVAS.appendChild(this.pic);
        
    this.pic.src = dataUrl;
    //init pic style

    this.pic.style.cssText = "position:absolute;top:0;left:0;-webkit-transition: all 0.2s;"
    this.pic.style.width = this.pic.width + "px";
	this.pic.style.height = this.pic.height + "px";
	    
    this.pic.alt = this.pic.title = name;
    c2t.files[this.instanceID] = this;
    
    this.pic.addEventListener("load",(function(){
		 //init pic style
		this.pic.style.width = this.pic.width + "px";
		this.pic.style.height = this.pic.height + "px";
		
    	this.pic.style.cssText = "position:absolute;top:0;left:0; -webkit-transition: all 0.2s;";
		this.pic.alt = this.pic.title = name;
		
		c2t.CANVAS.appendChild(this.pic);
    }).bind(this),false);
	
    //this.pic.style.width = this.pic.width + "px";
	//this.pic.style.height = this.pic.height + "px";
    
    //bind event
    this.pic.addEventListener("click",c2t.img.select.bind(this),false);
    
    //appendChild
    this.pic.src = dataUrl;
}

c2t.img.prototype.setXY = function (x, y) {
    this.pic.style.top = y + "px";
    this.pic.style.left = x + "px";
}

c2t.img.prototype.getXY = function (x, y) {
	return {
		x: this.pic.style.left,
		y: this.pic.style.top
	}
}

c2t.img.prototype.getSize = function () {
    return {
        width: this.pic.width,
        height: this.pic.height
    };
}

c2t.img.prototype.remove = function (){
	this.pic.className = "";
	this.pic.style.margin = this.pic.width/2+"px 0 0 "+ this.pic.height/2 + "px"
	this.pic.style.width = this.pic.style.height = "0";

	setTimeout((function(){
		this.pic.parentNode.removeChild(this.pic);
		this.pic = null;
		delete c2t.files[this.instanceID];
	}).bind(this),200);
}

c2t.img.prototype.getImg = function (){
	return this.pic;
}

//选择一个图片元素
c2t.img.select = function(e){
	c2t.img.select.group = c2t.img.select.group || [];
	
	if (!this.selected && !e.shiftKey && c2t.img.select.group.length > 0) {
		c2t.img.select.group.forEach(function(instanceID){
			if (!instanceID) {
				return 
			}
			c2t.files[instanceID].pic.className = "";
			c2t.files[instanceID].selected = false;
		})
		c2t.img.select.group = [];
	}
	
	this.pic.className = this.selected?"":"select";
	this.selected = !this.selected;
	
	if (this.selected) {
		c2t.img.select.group.push(this.instanceID);
	} else {
		c2t.img.select.group.forEach(function(v,k){
			
			if (v == this.instanceID) {
				c2t.img.select.group[k] = null;
			}
		}.bind(this));
	}
}

//删除选中的图片
c2t.img.deleteSelect = function(){
	if (c2t.img.select.group) {
		c2t.img.select.group.forEach(function(instanceID){
			if (!instanceID) {
				return 
			}
			c2t.files[instanceID].remove();
		});
		c2t.img.select.group = [];
	}
}

/**
* 事件处理
*/
c2t.event = {};
/*
* 全局按键处理
*/
c2t.event.keyPress = function(e){
	//alert(e.keyCode)
	if (e.keyCode == 46){
		c2t.img.deleteSelect();
	}
	
	//兼容mac电脑的delete按键
	if (e.keyCode == 8 && c2t.isMac){
		c2t.img.deleteSelect();
		e.preventDefault();
	}
}

//初始化入口
window.onload = function() {
	c2t.init();
}