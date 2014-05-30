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
 
(function(){
	var _fps = 24;
	var _fpsTime = 1000/_fps;
	var _timer
	
	var _activitySprites = {}; //活动中的精灵
	var _count = 0; //动画计数器
	var _isStop = 0;
	/**
	 * 帧动画，动画引擎。用于控制每一个动画剪辑的播放情况，时间统一。
	 */
	QZFL.css2d.engine = {};
	
	/**
	 * 设置动画帧数
	 */
	QZFL.css2d.engine.setFPS = function(fps){
		_fps = fps;
		_fpsTime = 1000/_fps;
	}
	
	/**
	 * 启动动画引擎
	 */
	QZFL.css2d.engine.start = function(){
		_isStop = 0;
		QZFL.css2d.engine._repeat();
	}
	
	/**
	 * 动画引擎停止工作, 所有动画剪辑都会停止
	 */
	QZFL.css2d.engine.stop = function(){
		clearTimeout(_timer);
		_isStop = 1;
	}
	
	/**
	 * 动画引擎循环播放
	 */
	QZFL.css2d.engine._repeat = function(){
		if (_isStop == 1) {return}
		_timer = setTimeout(QZFL.css2d.engine._playActivitySprites,_fpsTime);
	}	
	
	/**
	 * 播放激活中的动画精灵
	 */
	QZFL.css2d.engine._playActivitySprites = function(){
		QZFL.object.each(_activitySprites,function(){
			//setTimeout(QZFL.event.bind(this,this.next),0);
			this.next();
			//console.log("play")
		});
		
		//循环播放
		QZFL.css2d.engine._repeat();
	}
	
	/**
	 * 把动画剪辑压入队列提供播放支持
	 * @param {QZFL.css2d.ClipHandler} clip 剪辑对象
	 */
	QZFL.css2d.engine.setActivity = function(clip){
		if (!_activitySprites[clip.entityName]) {
			_count++;
		}
		_activitySprites[clip.entityName] = clip;
	}

	/**
	 * 把动画剪辑移出动画活跃区域禁止播放支持
	 * @param {QZFL.css2d.ClipHandler} clip 剪辑对象
	 */
	QZFL.css2d.engine.setInactivity = function(clip){
		if (_activitySprites[clip.entityName]) {
			_count--;
		}
		delete _activitySprites[clip.entityName];
	}
	
	/**
	 * 获得动画活动区的计数器
	 * @return {Number} 返回活动区域的计数
	 */
	QZFL.css2d.engine.getCount = function(){
		return _count;
	}
	
	/**
	 * 初始化引擎支持
	 */
	QZFL.css2d.engine._init = function(){
		//设置动画引擎播放
		QZFL.css2d.engine.start();
	}
	
	QZFL.css2d.engine._init();
})();