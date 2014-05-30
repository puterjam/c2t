/**
 * @fileOverview QZFL 帧动画引擎。
 * @version 1.0
 * @author zishunchen
 */
// @include "../../../outerlib/qzfl_lite.js"

 /**
  * QZFL 帧动画引擎
  * @namespace QZFL.css2d
  */
QZFL.css2d = QZFL.css2d || {};

// 帧动画方向
QZFL.css2d.DIRECTION = {};
/**
 * 帧动画方向，横向
 * @type Number
 */
QZFL.css2d.DIRECTION.HORIZONTAL = 0;

/**
 * 帧动画方向，纵向
 * @type Number
 */
QZFL.css2d.DIRECTION.VERTICAL = 1;

(function() {
	var assets = [];
	var clip = {};
	var clipCount = 0;
	
	var df = document.createDocumentFragment();
	var _hiddenDom = document.createElement("div"); //df下的一个不渲染的dom
	
	df.appendChild(_hiddenDom);
	
	/**
	 * 动画剪辑对象，这里描述每个动画的属性和方法
	 * @namespace 动画剪辑对象
	 */
	QZFL.css2d.ClipHandler = function() {
		this.isAppend = false;
		this.assetId;
		this.dom;
		this.currentFrame = 1;
		this.entityName = "clip_" + clipCount;
		clipCount++;
	}

	QZFL.css2d.ClipHandler.prototype = {	
		/**
		 * 播放下一帧动画
		 */
		next : function(){
			this.play(this.currentFrame + 1);
		},
		
		/**
		 * 播放上一帧动画
		 */
		prev : function(){
			this.play(this.currentFrame - 1);
		},
		
		play : function(frame){
			var _a = assets[this.assetId];
			//console.log(frame)
			this._draw(_a, (frame ||　this.currentFrame + 1));
			
			//把动画推入动画引擎队列
			QZFL.css2d.engine.setActivity(this);
			
			this._doEvent(_a,this.currentFrame);
			_a = null;
		},
		
		stop : function(frame){
			var _a = assets[this.assetId];	
			
			//把动画移出动画引擎队列
			QZFL.css2d.engine.setInactivity(this);
			
			if (frame) {
				this._draw(_a, frame);
				this._doEvent(_a,frame);
			}
			
			//this._doEvent(_a,frame);
			_a = null;
		},
		
		addEvent : function(eventType,fn){
			fn = QZFL.event.bind(this,fn);
			QZFL.event.addEvent(this.dom, eventType, fn);
		},
		
		removeEvent : function(eventType){
			QZFL.event.removeEvent(this.dom, eventType);
		},
		
		/**
		 * 添加到某一个dom上
		 * @param {element} e element对象
		 * @param {Object} [opt] 参数
		 */
		append : function(e,opt){
			e = QZFL.dom.get(e);
			var _a = assets[this.assetId];
			opt = opt || {};
			if (!e || !_a) { //如果没有素材信息和没有对象，则返回
				return false;
			}
			
			this.isAppend = true;
			
			if (!this.dom) {
				this.dom = document.createElement("div");
				this._initDom(_a,opt.style);
			}
			
			e.appendChild(this.dom);
			
			this.play(this.currentFrame);
			_a = null;
		},
		
		/**
		 * 从页面上移除剪辑
		 */
		remove : function(){
			this.isAppend = false;
			QZFL.dom.removeElement(this.dom);
			this.dom = null;
			QZFL.css2d.engine.setInactivity(this);
		},
		
		/**
		 * 切换素材
	 	 * @param {Number} assetID 动画剪辑对象ID
		 * @param {Object} [opt] 参数
		 */
		loadAsset : function(assetID,opt){
			this.assetId = assetID;
			var _a = assets[this.assetId];
			opt = opt || {};
			
			if (this.dom) {
				this._initDom(_a, opt.style);
			}
			
			//this.currentFrame = 1;
			this.play(1);
		},
		
		getDom : function(){
			return this.dom;
		},
		/**
		 * 构建一个动画剪辑
	 	 * @param {Number} assetID 动画剪辑对象ID
		 * @return {QZFL.css2d.ClipHandler}
		 */
		_create : function(assetID) {
			this.assetId = assetID;
			return this;
		},
					
		/**
		 * 初始化 dom
		 * @param {Object} _a asset 对象
		 * @param {string} style 对象扩展样式
		 */
		_initDom : function(_a, style){
			//代理dom先复制需要处理的dom的csstext
			_hiddenDom.style.cssText = this.dom.style.cssText;
			
			//设置必须的样式
			_hiddenDom.style.width = (_a.width || 100) + "px";
			_hiddenDom.style.height = (_a.height || 100) + "px";
			_hiddenDom.style.backgroundImage = 'url('+ _a.url +')';
			_hiddenDom.style.backgroundRepeat = "no-repeat";
			
			//一次设置dom的css,减少浏览器渲染次数
			//var _position = [_a.frame.x + "px",_a.frame.y + "px"].join(" "); 
			this.dom.style.cssText = _hiddenDom.style.cssText + ";" + (style || ""); //'width:'+_w+';height:'+_h+';background-image:'+_bimg+';background-repeat:no-repeat;' + (style || "");
		},
		
		/**
		 * 绘制剪辑特定帧的动画
		 * @param {Object} assets　素材对象
		 * @param {Number} frame 绘制的帧
		 */
		_draw : function(assets,frame){
			var _dir =  assets.frame.direction || QZFL.css2d.DIRECTION.HORIZONTAL;
			
			if (frame>assets.frame.total) {
				frame = 1;
			}
			
			frame = Math.max(1,frame);
			
			this.currentFrame = frame;
				
			if (this.dom) {
				var _x = assets.frame.x - (_dir==QZFL.css2d.DIRECTION.HORIZONTAL?(frame-1)*assets.width:0) + "px"
				var _y = assets.frame.y - (_dir==QZFL.css2d.DIRECTION.VERTICAL?(frame-1)*assets.height:0)  + "px"; 
			
				this.dom.style.backgroundPosition = [_x,_y].join(" ");
			}
			
			assets　=　null;
		},
		
		/**
		 * 执行特定帧的帧事件
		 * @param {Object} assets　素材对象
		 * @param {Number} frame 需要执行函数的帧
		 */
		_doEvent : function(assets,frame){
			var e = assets["event"];
			e && e[frame] && e[frame].call(this);
		}
	}
	
	/**
	 * 创建动画素材
	 * @param {Object} assetObject 动画素材配置
	 * @return {Number} assetID
	 */
	QZFL.css2d.createAsset = function(assetObject){
		assets.push(assetObject);
		return assets.length - 1;
	}
	
	/**
	 *  创建动画剪辑
	 *  @param {Number} assetID 动画剪辑对象ID
	 *  @return {QZFL.css2d.ClipHandler}
	 */
	QZFL.css2d.createClip = function(assetID) {
		var _c = new QZFL.css2d.ClipHandler();
		return _c._create(assetID);
	}
})();
