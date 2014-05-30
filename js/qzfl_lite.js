/**
 * @fileoverview QZFL 主框架逻辑，<br/>QZFL 最后的 L 有两个意思，其中一个意思是 Library
 *               功能库，说明这是一个前台的框架库; 同时 L 也是 Liberation 解放的意思，这是希望通过 QZFL
 *               能把大家在JS开发工作中解放出来。
 * @version 1.$Rev: 1921 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */
/**
 * QZFL全局对象
 *
 * @namespace QZFL 全局对象。 QZFL 是由空间平台开发组，开发的一套js框架库。 Qzone Front-end Library:
 *            Liberation
 * @type {Object}
 */
window.QZFL = window.QZONE = window.QZFL || window.QZONE || {};

QZFL.version = "2.0.9.6";
QZFL._qzfl = 2.096;

/**
 * 定义一个通用空函数
 */
QZFL.emptyFn = function() {
};

/**
 * 定义一个通用透传函数
 */
QZFL.returnFn = function(v) {
	return v;
};

/**
 * 客户浏览器类型判断
 *
 * @namespace QZFL 浏览器判断引擎，给程序提供浏览器判断的接口
 */
(function(){
	var ua = QZFL.userAgent = {}, agent = navigator.userAgent, nv = navigator.appVersion, r, m;
	/**
	 * 调整浏览器行为
	 *
	 * @ignore
	 */
	ua.adjustBehaviors = QZFL.emptyFn;
	
	if (window.ActiveXObject) {//ie (document.querySelectorAll)
		ua.ie = 9 - ((agent.indexOf('Trident/5.0') > -1) ? 0 : 1) - (window.XDomainRequest ? 0 : 1) - (window.XMLHttpRequest ? 0 : 1);
		ua.isBeta = navigator.appMinorVersion && navigator.appMinorVersion.toLowerCase().indexOf('beta') > -1;
		if (ua.ie) {
			if (ua.ie < 7) {
				try {
					document.execCommand('BackgroundImageCache', false, true);
				} catch (ign) {}
			}
			QZFL._doc = document;
			eval("var document = QZFL._doc;");
		}
	} else if (document.getBoxObjectFor || typeof(window.mozInnerScreenX) != 'undefined') {
		r = /(?:Firefox|GranParadiso|Iceweasel|Minefield).(\d+\.\d+)/i;
		ua.firefox = parseFloat((r.exec(agent) || r.exec('Firefox/3.3'))[1], 10);
	} else if (!navigator.taintEnabled) {//webkit
		m = /AppleWebKit.(\d+\.\d+)/i.exec(agent);
		ua.webkit = m ? parseFloat(m[1], 10) : (document.evaluate ? (document.querySelector ? 525 : 420) : 419);
		
		if ((m = /Chrome.(\d+\.\d+)/i.exec(agent)) || window.chrome) {
			ua.chrome = m ? parseFloat(m[1], 10) : '2.0';
		} else if ((m = /Version.(\d+\.\d+)/i.exec(agent)) || window.safariHandler) {
			ua.safari = m ? parseFloat(m[1], 10) : '3.3';
		}
		ua.air = agent.indexOf('AdobeAIR') > -1 ? 1 : 0;
		ua.isiPad = agent.indexOf('iPad') > -1;
		ua.isiPhone = agent.indexOf('iPhone') > -1;
	} else if (window.opera) {//opera
		ua.opera = parseFloat(navigator.appVersion, 10);
	} else {//默认IE6吧
		ua.ie = 6;
	}
	
	if (!(ua.macs = agent.indexOf('Mac OS X') > -1)) {
		ua.windows = (m = /Windows.+?(\d+\.\d+)/i.exec(agent)) ? parseFloat(m[1], 10) : '5.1';
	}
})();
/**
 * object 处理
 *
 * @namespace QZFL 对Javascript Object的接口封装
 */
QZFL.object = QZFL.namespace = {
	/**
	 * 把命名空间的方法映射到全局。不推荐常使用，避免变量名冲突
	 *
	 * @param {Object} object 对象
	 * @param {Object} [scope] 目标空间
	 *            @example
	 *            QZFL.object.map(QZFL.lang)
	 */

	map : function(object, scope) {
		return QZFL.object.extend(scope || window, object);
	},

	/**
	 * 命名空间功能扩展
	 *
	 * @param {Object} namespace 需要被扩展的命名空间
	 * @param {Object} extendModule 扩展模块
	 *            @example
	 *            QZFL.object.extend(QZFL.dialog,{fn1:function(){}})
	 * @return {Object} 返回被扩展的命名空间
	 */
	extend : function() {
		var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}

		if ( typeof target !== "object" && QZFL.object.getType(target) !== "function" ) {
			target = {};
		}

		if ( length === i ) {
			target = QZFL;
			--i;
		}

		for ( ; i < length; i++ ) {
			if ( (options = arguments[ i ]) != null ) {
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					if ( target === copy ) {
						continue;
					}

					if ( deep && copy && typeof copy === "object" && !copy.nodeType ) {
						var clone;

						if ( src ) {
							clone = src;
						} else if ( QZFL.lang.isArray(copy) ) {
							clone = [];
						} else if ( QZFL.object.getType(copy) === 'object' ) {
							clone = {};
						} else {
							clone = copy;
						}

						target[ name ] = QZFL.object.extend( deep, clone, copy );

					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		return target;
	},
	
	/**
	 * 批量执行对象
	 *
	 * @param {object} object 对象
	 * @param {function} fn 回调函数
	 * @return {Boolean} 是否执行完成
	 *         @example
	 *         QZFL.object.each([1,2,3],function(){alert(this)})
	 */
	each : function(obj, callback) {
		var name, value,
			i = 0,
			length = obj.length,
			isObj = (length === undefined) || (typeof(obj)=="function");
		if (isObj) {
			for (name in obj) {
				if (callback.call(obj[name], obj[name], name, obj) === false) {
					break;
				}
			}
		} else {
			for (value = obj[0]; i < length && callback.call(value, value, i, obj) !== false; value = obj[++i]) {
			}
		}
		return obj;
	},

	/**
	 * 获取对象类型
	 *
	 * @param {object} object
	 * @return {String} 返回对象类型字符串
	 *         @example
	 *         QZFL.object.getType([1,2,3])
	 */
	getType : function(obj) {
		return obj === null ? 'null' : (obj === undefined ? 'undefined' : Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
	},
	
	/**
	 * route用到的正则对象
	 */
	routeRE : /([\d\w_]+)/g,
	
	route: function(obj, path){
		obj = obj || {};
		path += '';
		var r = QZFL.object.routeRE, m;
		r.lastIndex = 0;
		while ((m = r.exec(path)) !== null) {
			obj = obj[m[0]];
			if (obj === undefined || obj === null) break;
		}
		return obj;
	},
	
	/**
	 * 将方法绑定在对象上，能够保护this指针不会“漂移”
	 *
	 * @param {Object} obj 母体对象
	 * @param {Object} fn 目标方法
	 * @example var e = QZFL.event.bind(objA,funB);
	 */
	bind : function(obj, fn) {
		var slice = Array.prototype.slice, args = slice.call(arguments, 2);
		return function(){
			obj = obj || this;
			fn = typeof fn == 'string' ? obj[fn] : fn;
			fn = typeof fn == 'function' ? fn : QZFL.emptyFn;
			return fn.apply(obj, args.concat(slice.call(arguments, 0)));
		}
	},
	/**
	 * 把指定命名空间下的方法 以短名的方式 映射到另一个命名空间
	 */
	ease : function(src, tar, rule){
		if (tar) {
			if (typeof(rule) != 'function') {
				rule = function(name){
					return '$' + name;
				}
			}
			QZFL.object.each(src, function(v, k){
				if (typeof(v) == 'function') {
					tar[rule[k]] = v;
				}
			});
		}
	}
};
/**
 * 把QZFL.object下的方式直接映射到QZFL命名空间下
 */
QZFL.object.map(QZFL.object, QZFL);

/**
 * qzfl 控制台，用于显示调试信息以及进行一些简单的脚本调试等操作
 *
 * @type Object
 * @namespace QZFL 控制台接口，用来显示程序输出的log信息。
 */
QZFL.console = function(expr){
	if (window.console) {
		if (console.assert) {
			console.assert.apply(null, arguments);
		} else {
			expr || console.log.apply(null, slice.call(arguments, 1));
		}
	}
};

/**
 * 在console里显示信息
 */
QZFL.console.print = function(msg, type){
	window.console && console.log((type == 4 ? (new Date() + ':') : '') + msg);
};

/**
 * QZFL调试引擎接口
 *
 * @type Object
 * @namespace QZFL 调试引擎接口，为调试提供接入的可能。
 */
QZFL.runTime = {
	isDebugMode : false,
	error : QZFL.emptyFn,
	warn : QZFL.emptyFn
};

QZFL.widget = {};
/**
 * @fileoverview QZFL全局配置文件
 * @version 1.$Rev: 1921 $
 * @author scorpionxu,QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */

/**
 * 配置表
 *
 * @namespace QZFL配置，用来存储QZFL一些组件需要的参数
 * @type Object
 */
QZFL.config = {
	/**
	 * 调试等级
	 */
	debugLevel : 0,
	/**
	 * 默认与后台交互的编码
	 *
	 * @type String
	 * @memberOf QZFL.config
	 */
	defaultDataCharacterSet : "GB2312",

	/**
	 * dataCenter中cookie存储的默认域名
	 *
	 * @type String
	 * @memberOf QZFL.config
	 */
	DCCookieDomain : "qzone.qq.com",

	/**
	 * 系统默认一级域名
	 *
	 * @type String
	 * @memberOf QZFL.config
	 */
	domainPrefix : "qq.com",

	/**
	 * XHR proxy的gbencoder dictionary路径(需要复写)
	 *
	 * @type String
	 * @memberOf QZFL.config
	 */
	gbEncoderPath : "http://imgcache.qq.com/qzone/v5/toolpages/",

	/**
	 * FormSender的helper page(需要复写)
	 *
	 * @type String
	 * @memberOf QZFL.config
	 */
	FSHelperPage : "http://imgcache.qq.com/qzone/v5/toolpages/fp_gbk.html",

	/**
	 * 默认flash ShareObject地址
	 * @type String
	 * @memberOf QZFL.config
	 */
	defaultShareObject : "http://imgcache.qq.com/qzone/v5/toolpages/getset.swf",
	
	/**
	 * 默认静态页的server地址
	 * @type String
	 * @member QZFL.config
	 */
	staticServer : "http://imgcache.qq.com/ac/qzone/qzfl/lc/"
};

/**
 * @fileoverview QZFL样式处理,提供多浏览器兼容的样式表处理
 * @version 1.$Rev: 1921 $
 * @author scorpionxu,QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */
/**
 * 备注: 直接通过样式表id号获取样式 取得样式表的寄主 IE 是 owningElement Safari 是 ownerNode Opera 否
 * ownerNode Firefox 否 ownerNode
 */
/**
 * 样式表处理类
 *
 * @namespace QZFL css 对象，给浏览器提供基本的样式处理接口
 */
QZFL.css = {
	//收集样式正则信息
	classNameCache: {},
	/**
	 * 收集className的规则
	 *
	 * @param {string} className 样式名称
	 * @private
	 * @ignore
	 * @deprecated
	 */
	getClassRegEx: function(className){
		var o = QZFL.css.classNameCache;
		return o[className] || (o[className] = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)'));
	},
	
	/**
	 * 把16进制的颜色转换成10进制颜色
	 * @param {String} color 十六进制颜色
	 * @example QZFL.css.convertHexColor("#ff00ff");
	 * @return 返回数组形式的10进制颜色
	 */
	convertHexColor: function(color){
		var p = '0x';
		color = (color || '').toString();
		color.charAt(0) == '#' && (color = color.substring(1));
		color.length == 3 && (color = color.replace(/([0-9a-f])/ig, '$1$1'));
		return color.length == 6 ? [p + color.substr(0, 2) - 0, p + color.substr(2, 2) - 0, p + color.substr(4, 2) - 0] : [0, 0, 0];
	},
	
	/**
	 * 缓存当前页面的样式表,备用
	 *
	 * @ignore
	 */
	styleSheets: {},
	
	/**
	 * 通过id号获取样式表
	 * @param {string|number} id 样式表的编号
	 * @example QZFL.css.getStyleSheetById("div_id");
	 * @return 返回样式表
	 */
	getStyleSheetById: function(id){
		var s;
		return (s = QZFL.dom.get(id)) && s.sheet || (s = document.styleSheets) && s[id];
	},
	
	/**
	 * 获取stylesheet的样式规则
	 * @param {string|number} id 样式表的编号
	 * @example QZFL.css.getRulesBySheet("css_id");
	 * @return 返回样式表规则
	 */
	getRulesBySheet: function(sheetId){
		var ss = typeof(sheetId) == "object" ? sheetId : QZFL.css.getStyleSheetById(sheetId), rs = {}, head, base;
		if (ss && !(rs = ss.cssRules || ss.rules)) {
			if (head = document.getElementsByTagName('head')[0]) {
				if (base = head.getElementsByTagName('base')[0]) {
					QZFL.dom.removeElement(base);
					rs = ss.cssRules;
					head.appendChild(base);
				}
			}
		}
		return rs;
//		var _self = QZFL.css.getRulesBySheet,
//			t,
//			ss = (typeof(sheetId) == "object") ?
//				sheetId
//					:
//				QZFL.css.getStyleSheetById(sheetId);
//		
//		if (ss) {
//			if ((QZFL.userAgent.firefox || QZFL.userAgent.chrome) && (_self.base != -1)) { //解决chrome上base和css模型冲突的问题
//				//alert(QZFL.userAgent.chrome);
//				if (!_self.head) {
//					//firstElementChild(), chrome only
//					_self.head = document.documentElement.firstElementChild;
//				}
//				if (!_self.base) {
//					t = _self.head.getElementsByTagName("base");
//					// -1表示页面上根本就没有用tag <base>
//					_self.base = (!t || !t.length) ? -1 : t[0];
//				}
//				if (_self.base && (_self.base != -1)) {
//					_self.head.removeChild(_self.base);
//					setTimeout(function(){ //sds 先用万金油法搞定，有问题再想办法用objclone
//						_self.head.appendChild(_self.base);
//					}, 0);
//				}
//				return ss.cssRules;
//			} else {
//				try {
//					//sds 这个问题一定要解决呢, firefox拿到上面去了，这里应该可以不用try catch了
//					//有可能firefox无法获取到 cssRules... 可能出现NS_ERROR_DOM_SECURITY_ERR的错误。如果出错就返回null
//					return ss.cssRules || ss.rules;
//				} catch (ign) {}
//				}
//			}
//		
//		return (new Object());
	},
	
	/**
	 * 根据选择器获得样式规则
	 * @param {string} sheetId id 样式表的编号
	 * @param {string} selector 选择器名称
	 * @example QZFL.css.getRuleBySelector("css_id","#");
	 * @return 返回样式表规则
	 */
	getRuleBySelector: function(sheetId, selector){
		var _ss = QZFL.css.getStyleSheetById(sheetId),
			_rs = QZFL.css.getRulesBySheet(_ss);
		
		if (!_rs) {
			return null;
		}
		selector = (selector + '').toLowerCase();
		!_ss.cacheSelector && (_ss.cacheSelector = {});
		var _cs = _ss.cacheSelector[selector];
		if (_cs && _rs[_cs] && selector == (_rs[_cs].selectorText + '').toLowerCase()) {
			return _rs[_cs];
		}
		for (var i = 0, len = _rs.length; i < len; i++) {
			if (selector == (_rs[i].selectorText + '').toLowerCase()) {
				_ss.cacheSelector[selector] = i;
				return _rs[i];
			}
		}
		return null;
	},
	
	/**
	 * 插入外链样式表
	 * @param {string} url 外部css地址
	 * @param {string} id link元素id
	 * @example QZFL.css.insertCSSLink("/css/style.css","linkin");
	 * @return 返回样式表对象
	 */
	insertCSSLink: function(url, id){
		var doc = document, cssLink = (cssLink = $(id)) && cssLink.nodeName == 'LINK' ? cssLink : null, head = doc.getElementsByTagName("head")[0];
		if (!cssLink) {
			cssLink = doc.createElement("link");
			id && (cssLink.id = id);
			cssLink.rel = "stylesheet";
			cssLink.rev = "stylesheet";
			cssLink.type = "text/css";
			cssLink.media = "screen";
			head.appendChild(cssLink);
		}
		url && (cssLink.href = url);
		return cssLink.sheet || cssLink;
	},
	
	/**
	 * 插入样式
	 * @param {string} sheetId 样式表的编号
	 * @example QZFL.css.insertStyleSheet("cssid");
	 * @return 返回样式表对象
	 */
	//这个没有使用，估计也是没什么用，可以干掉 ryan
	insertStyleSheet: function(sheetId, rules){
		var node = document.createElement("style");
		node.type = 'text/css';
		sheetId && (node.id = sheetId);
		document.getElementsByTagName("head")[0].appendChild(node);
		if (rules) {
			if (node.styleSheet) {
				node.styleSheet.cssText = rules;
			} else {
				node.appendChild(document.createTextNode(rules));
			}
		}
		return node.sheet || node;
	},
	
	/**
	 * 删除一份样式表，包含内部style和外部css
	 * @param {string|number} id 样式表的编号
	 * @example QZFL.css.removeStyleSheet("styleid");
	 */
	//这个没有使用，估计也是没什么用，可以干掉 ryan
	removeStyleSheet: function(id){
		var _ss = QZFL.css.getStyleSheetById(id);
		_ss && QZFL.dom.removeElement(_ss.owningElement || _ss.ownerNode);
	},
	/**
	 * 操作元素的className的核心方法，也可以直接调用，remove参数支持*通配符
	 * @param {Object} elem
	 * @param {Object} removeNames
	 * @param {Object} addNames
	 */
	updateClassName: function(elem, removeNames, addNames){
		if (!elem || elem.nodeType != 1) {
			return;
		}
		var oriName = elem.className;
		if (removeNames && typeof(removeNames) == 'string' || addNames && typeof(addNames) == 'string') {
			if (removeNames == '*') {
				oriName = '';
			} else {
				var ar = oriName.split(' '), i = 0, k, l = ar.length, n, b;
				oriName = {};
				for (; i < l; i++) {
					ar[i] && (oriName[ar[i]] = true);
				}
				if (addNames) {
					ar = addNames.split(' ');
					l = ar.length;
					for (i = 0; i < l; i++) {
						(n = ar[i]) && !oriName[n] && (b = oriName[n] = true);
					}
				}
				if (removeNames) {
					ar = removeNames.split(' ');
					l = ar.length;
					for (i = 0; i < l; i++) {
						(n = ar[i]) && oriName[n] && (b = true) && delete oriName[n];
					}
				}
				ar.length = 0;
				for (var k in oriName) {
					ar.push(k);
				}
				oriName = ar.join(' ');
			}
			if (b) {
				elem.className = oriName;
			}
		}
		return oriName;
	},
	
	/**
	 * 是否有指定的样式类名称
	 * @param {Object} elem 指定的HTML元素
	 * @param {String} cname 指定的类名称
	 * @example QZFL.css.hasClassName($("div_id"),"cname");
	 * @return Boolean
	 */
	hasClassName: function(elem, name){
		return elem && (elem = elem.className) && name && ((' ' + elem + ' ').indexOf(' ' + name + ' ') + 1);
	},
	
	/**
	 * 增加一个样式类名
	 * @param {Object} elem 指定的HTML元素
	 * @param {Object} cname 指定的类名称
	 * @example QZFL.css.addClassName($("ele"),"cname");
	 * @return Boolean
	 */
	addClassName: function(elem, names){
		QZFL.css.updateClassName(elem, null, names);
	},
	
	/**
	 * 除去一个样式类名
	 * @param {Object} elem 指定的HTML元素
	 * @param {String} cname 指定的类名称
	 * @example QZFL.css.removeClassName($("ele"),"cname");
	 * @return Boolean
	 */
	removeClassName: function(elem, names){
		QZFL.css.updateClassName(elem, names);
	},
	
	/**
	 * 替换两种样式类名
	 * @param {Object} elements 指定的HTML元素
	 * @param {String} sourceClass 指定的类名称
	 * @param {String} targetClass 指定的类名称
	 * @example QZFL.css.replaceClassName($("ele"),"sourceClass","targetClass");
	 */
	replaceClassName: function(elems, a, b){
		QZFL.css.swapClassName(elems, a, b, true);
	},
	
	/**
	 * 交换两种样式类名
	 * @param {Object} elements 指定的HTML元素
	 * @param {String} class1 指定的类名称
	 * @param {String} class2 指定的类名称
	 * @param {boolean} sg
	 * @example QZFL.css.swapClassName($("div_id"),"classone","classtwo");
	 */
	swapClassName: function(elems, a, b, _isRep){
		if (elems) {
			if (elems.constructor != Array) {
				elems = [elems];
			}
			for (var elem, i = 0, l = elems.length; i < l; i++) {
				if ((elem = elems[i]) && elem.nodeType == 1) {
					if (QZFL.css.hasClassName(elem, a)) {
						QZFL.css.updateClassName(elem, a, b);
					} else if (!_isRep && QZFL.css.hasClassName(elem, b)) {
						QZFL.css.updateClassName(elem, b, a);
					}
				}
			}
		}
	},
	
	/**
	 * 切换样式类名
	 * @param {Object} elem 指定的HTML元素
	 * @param {Object} cname 指定的类名称
	 * @example QZFL.css.toggleClassName($("ele"),"cname");
	 */
	toggleClassName: function(elem, name){
		if (!elem || elem.nodeType != 1) {
			return;
		}
		if (QZFL.css.hasClassName(elem, name)) {
			QZFL.css.updateClassName(elem, name);
		} else {
			QZFL.css.updateClassName(elem, null, name);
		}
	}	
};
/**
 * @fileoverview QZFL dom 对象，包含对浏览器dom的一些操作
 * @version 1.$Rev: 1921 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */
/**
 * dom 对象处理
 *
 * @namespace QZFL dom 接口封装对象。对浏览器常用的dom对象接口进行浏览器兼容封装
 */
QZFL.dom = {
	/**
	 * 根据id获取dom对象
	 *
	 * @param {string} id 对象ID号
	 *            @example
	 *            QZFL.dom.getById("div_id");
	 * @return Object
	 */
	getById : function(id) {
		return document.getElementById(id);
	},

	/**
	 * 根据name获取dom集合，有些标签例如li、span无法通过getElementsByName拿到，加上tagName指明就可以 &lt;li
	 * name="n1"&gt;node1&lt;/li&gt;&lt;span name="n1"&gt;node2&lt;/span&gt;
	 * ie只能获取到li，非ie下两者都可以
	 *
	 * @param {string} name 名称
	 * @param {string} tagName 标签名称,
	 *            @example
	 *            QZFL.dom.getByName("div_name");
	 * @return Array
	 */
	getByName : function(name, tagName, rt) {
		return QZFL.selector((tagName || "") + '[name="' + name + '"]', rt);
	},

	/**
	 * 获得对象
	 *
	 * @param {String|HTMLElement} e 包括id号，或则Html Element对象
	 *            @example
	 *            QZFL.dom.get("div_id");
	 * @return Object
	 */
	get : function(e) {
		return (typeof(e) == "string") ? document.getElementById(e) : e;
	},

	/**
	 * 获得对象
	 *
	 * @param {String|HTMLNode} e 包括id号，或则HTML Node对象
	 *            @example
	 *            QZFL.dom.getNode("div_id");
	 * @return Object
	 */
	getNode : function(e) {
		return (e && (e.nodeType || e.item)) ? e : ((typeof(e) == 'string') ? document.getElementById(e) : null);
	},
	/**
	 * 删除对象
	 *
	 * @param {String|HTMLElement} el HTML元素的id或者HTML元素
	 *            @example
	 *            QZFL.dom.removeElement("div_id");QZFL.dom.removeElement(QZFL.dom.get("div_id2"))
	 */
	removeElement : function(elem) {
		if (elem = QZFL.dom.get(elem)) {
			elem.removeNode ? elem.removeNode(true) : (elem.parentNode && elem.parentNode.removeChild(elem));
		}
		return elem = null;
	},
	/**
	 * 从以某元素elem开始的prop属性链查找num个满足条件func的节点
	 * @param	{String|HTMLElement} elem HTML元素的id或者HTML元素
	 * 			{String|} prop 构成链的元素属性
	 * 			{Function|} 检查函数
	 */
	searchChain : function(elem, prop, func){
		prop = prop || 'parentNode';
		while (elem) {
			if (!func || func.call(elem, elem)) {
				return elem;
			}
			elem = elem[prop];
		}
		return null;
	},
	/**
	 * 通过className来递归查询dom
	 *
	 * @param {String|HTMLElement} el 对象id或则dom
	 * @param {String} className css类名
	 * @see QZFL.dom.searchElementByClassName
	 * @deprecated 不建议使用了，请使用 {@link QZFl.element} 对象
	 *             @example
	 *             QZFL.dom.searchElementByClassName();
	 */
	searchElementByClassName : function(elem, className){
		elem = QZFL.dom.get(elem);
		return QZFL.dom.searchChain(elem, 'parentNode', function(el){
			return QZFL.css.hasClassName(el, className);
		});
	},
	/**
	 * 通过className来递归子节点查询dom
	 *
	 * @param {String} className
	 * @param {String} 结果的node tagname，没有就为‘×’，表示所有的节点均满足。
	 * @param {String|HTMLElement} root 对象id，dom。
	 * @deprecated 不建议使用了，请使用 {@link QZFl.element} 对象
	 *             @example
	 *             var nodes=QZFL.dom.getElementsByClassName("css_class_name");
	 * @return Array
	 */
	getElementsByClassName : function(className, tagName, context) {
		return QZFL.selector((tagName || '') + '.' + className, QZFL.dom.get(context));
	},
	/**
	 * 判断指定的节点是否是第二个节点的祖先
	 *
	 * @param {HTMLElement} node1 对象，父节点
	 * @param {HTMLElement} node2 对象，子孙节点
	 *            @example
	 *            QZFL.dom.isAncestor(QZFL.dom.get("div1"),QZFL.dom.get("div2"))
	 * @return Boolean
	 */
	isAncestor : function(a, b) {
		return a && b && a != b && QZFL.dom.contains(a, b);
	},
	/**
	 * 根据函数得到特定的父节点
	 *
	 * @param {HTMLElement} node 对象
	 * @param {String} method 创建对象的TagName
	 *            @example
	 *            var node=QZFL.dom.getAncestorBy($("div_id"),"div");
	 * @return Object
	 */
	getAncestorBy : function(elem, method){
		elem = QZFL.dom.get(elem);
		return QZFL.dom.searchChain(elem.parentNode, 'parentNode', function(el){
			return el.nodeType == 1 && (!method || method(el));
		});
	},
	/**
	 * 得到第一个子节点（element），firefox会得到到文本节点等。这里统一得到element。
	 *
	 * @param {HTMLElement} node 对象
	 *            @example
	 *            var element=QZFL.dom.getFirstChild(QZFL.dom.get("el_id"));
	 * @return HTMLElement
	 */
	getFirstChild : function(elem){
		elem = QZFL.dom.get(elem);
		return QZFL.dom.searchChain(elem && elem.firstChild, 'nextSibling', function(el){
			return el.nodeType == 1;
		});
	},
	/**
	 * 得到最后一个子节点（element），firefox会得到到文本节点等。这里统一得到element。
	 *
	 * @param {HTMLElement} node 对象
	 *            @example
	 *            var element=QZFL.dom.getFirstChild(QZFL.dom.get("el_id"));
	 * @return HTMLElement
	 */
	getLastChild : function(elem){
		elem = QZFL.dom.get(elem);
		return QZFL.dom.searchChain(elem && elem.lastChild, 'previousSibling', function(el){
			return el.nodeType == 1;
		});
	},
	/**
	 * 得到下一个兄弟节点（element），firefox会得到到文本节点等。这里统一得到element。
	 *
	 * @param {HTMLElement} node 对象
	 *            @example
	 *            QZFL.dom.getNextSibling(QZFL.dom.get("el_id"));
	 * @return HTMLElement
	 */
	getNextSibling : function(elem){
		elem = QZFL.dom.get(elem);
		return QZFL.dom.searchChain(elem && elem.nextSibling, 'nextSibling', function(el){
			return el.nodeType == 1;
		});
	},
	/**
	 * 得到上一个兄弟节点（element），firefox会得到到文本节点等。这里统一得到element。
	 *
	 * @param {HTMLElement} node 对象
	 *            @example
	 *            QZFL.dom.getPreviousSibling(QZFL.dom.get("el_id"));
	 * @return HTMLElement
	 */
	getPreviousSibling : function(elem){
		elem = QZFL.dom.get(elem);
		return QZFL.dom.searchChain(elem && elem.previousSibling, 'previousSibling', function(el){
			return el.nodeType == 1;
		});
	},

	/**
	 * 交换两个节点
	 *
	 * @param {HTMLElement} node1 node对象
	 * @param {HTMLElement} node2 node对象
	 *            @example
	 *            QZFL.dom.swapNode(QZFL.dom.get("el_one"),QZFL.dom.get("el_two"))
	 */
	swapNode : function(node1, node2) {
		// for ie
		if (node1.swapNode) {
			node1.swapNode(node2);
		} else {
			var prt = node2.parentNode,
				next = node2.nextSibling;

			if (next == node1) {
				prt.insertBefore(node1, node2);
			} else if (node2 == node1.nextSibling) {
				prt.insertBefore(node2, node1);
			} else {
				node1.parentNode.replaceChild(node2, node1);
				prt.insertBefore(node1, next);
			}
		}
	},
	/**
	 * 定点创建Dom对象
	 *
	 * @param {String} tagName 创建对象的TagName
	 * @param {String|HTMLElement} el 容器对象id或则dom
	 * @param {Boolean} insertFirst 是否插入容器的第一个位置
	 * @param {Object} attributes 对象属性列表，例如 {id:"newDom1",style:"color:#000"}
	 *            @example
	 *            QZFL.dom.createElementIn("div",document.body,false,{id:"newDom1",style:"color:#000"})
	 * @return 返回创建好的dom
	 */
	createElementIn : function(tagName, elem, insertFirst, attrs){
		var _e = (elem = QZFL.dom.get(elem) || document.body).ownerDocument.createElement(tagName || "div"), k;
		
		// 设置Element属性
		if (attrs) {
			for (k in attrs) {
				if (k == "class") {
					_e.className = attrs[k];
				} else if (k == "style") {
					_e.style.cssText = attrs[k];
				} else {
					_e[k] = attrs[k];
				}
			}
		}
		insertFirst ? elem.insertBefore(_e, elem.firstChild) : elem.appendChild(_e);
		return _e;
	},

	/**
	 * 获取对象渲染后的样式规则
	 *
	 * @param {String|HTMLElement} el 对象id或则dom
	 * @param {String} property 样式规则
	 *            @example
	 *            var width=QZFL.dom.getStyle("div_id","width");//width=163px;
	 * @return 样式值
	 */
	getStyle : function(el, property) {
		el = QZFL.dom.get(el);

		if (!el || el.nodeType == 9) {
			return null;
		}

		var w3cMode = document.defaultView && document.defaultView.getComputedStyle,
			computed = !w3cMode ? null : document.defaultView.getComputedStyle(el, ''),
			value = "";

		switch (property) {
			case "float" :
				property = w3cMode ? "cssFloat" : "styleFloat";
				break;
			case "opacity" :
				if (!w3cMode) { // IE Mode
					var val = 100;
					try {
						val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
					} catch (e) {
						try {
							val = el.filters('alpha').opacity;
						} catch (e) {}
					}
					return val / 100;
				}else{
					return parseFloat((computed || el.style)[property]);
				}
				break;
			case "backgroundPositionX" : // 只有ie和webkit浏览器支持
				// background-position-x
				if (w3cMode) {
					property = "backgroundPosition";
					return ((computed || el.style)[property]).split(" ")[0];
				}
				break;
			case "backgroundPositionY" : // 只有ie和webkit浏览器支持
				// background-position-y
				if (w3cMode) {
					property = "backgroundPosition";
					return ((computed || el.style)[property]).split(" ")[1];
				}
				break;
		}

		if (w3cMode) {
			return (computed || el.style)[property];
		} else {
			return (el.currentStyle[property] || el.style[property]);
		}
	},

	/**
	 * 设置样式规则
	 *
	 * @param {String|HTMLElement} el 对象id或则dom
	 * @param {String} property 样式规则
	 *            @example
	 *            QZFL.dom.setStyle("div_id","width","200px");
	 * @return 成功返回 true
	 */
	setStyle : function(el, properties, value) {
		if (!(el = QZFL.dom.get(el)) || el.nodeType != 1) {
			return false;
		}
		var tmp, bRtn = true, w3cMode = (tmp = document.defaultView) && tmp.getComputedStyle, rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
		if (typeof(properties) == 'string') {
			tmp = properties;
			properties = {};
			properties[tmp] = value;
		}
		
		for (var prop in properties) {
			value = properties[prop];
			if (prop == 'float') {
				prop = w3cMode ? "cssFloat" : "styleFloat";
			} else if (prop == 'opacity') {
				if (!w3cMode) { // for ie only
					prop = 'filter';
					value = value >= 1 ? '' : ('alpha(opacity=' + Math.round(value * 100) + ')');
				}
			} else if (prop == 'backgroundPositionX' || prop == 'backgroundPositionY') {
				tmp = prop.slice(-1) == 'X' ? 'Y' : 'X';
				if (w3cMode) {
					var v = QZFL.dom.getStyle(el, "backgroundPosition" + tmp);
					prop = 'backgroundPosition';
					typeof(value) == 'number' && (value = value + 'px');
					value = tmp == 'Y' ? (value + " " + (v || "top")) : ((v || 'left') + " " + value);
				}
			}
			if (typeof el.style[prop] != "undefined") {
				el.style[prop] = value + (typeof value === "number" && !rexclude.test(prop) ? 'px' : '');
				bRtn = bRtn && true;
			} else {
				bRtn = bRtn && false;
			}
		}
		return bRtn;
	},
	/**
	 * 建立有name属性的element
	 * 
	 * @param {String} type node的tagName
	 * @param {String} name name属性值
	 * @param {object} doc document
	 *            @example
	 *            QZFL.dom.createNamedElement("div","div_name",QZFL.dom.get("doc"));
	 * @return {Object} 结果element
	 */
	createNamedElement : function(type, name, doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document,
			element;

		try {
			element = _doc.createElement('<' + type + ' name="' + name + '">');
		} catch (ign) {}

		if (!element) {
			element = _doc.createElement(type);
		}

		if (!element.name) {
			element.name = name;
		}
		return element;
	},
	
	getRect : function(elem){
		if (elem = QZFL.dom.get(elem)) {
			var box = QZFL.object.extend({}, elem.getBoundingClientRect()), s;
			if (typeof box.width == 'undefined') {
				box.width = box.right - box.left;
				box.height = box.bottom - box.top;
			}
			return box;
		}
	},
	/**
	 * 获取对象坐标
	 *
	 * @param {HTMLElement} el
	 *            @example
	 *            var position=QZFL.dom.getPosition(QZFL.dom.get("div_id"));
	 * @return object 返回位置对象 {"top","left","width","height"};
	 */
	getPosition : function(elem){
		var box, s, doc;
		if (box = QZFL.dom.getRect(elem)) {
			if (s = QZFL.dom.getScrollLeft(doc = elem.ownerDocument)) {
				box.left += s, box.right += s;
			}
			if (s = QZFL.dom.getScrollTop(doc)) {
				box.top += s, box.bottom += s;
			}
			return box;
		}
	},
	/**
	 * 设置对象坐标
	 *
	 * @param {HTMLElement} el
	 * @param {object} pos
	 *            @example
	 *            QZFL.dom.setPosition(QZFL.dom.get("div_id"),{"100px","100px","400px","300px"});
	 */
	setPosition : function(el, pos) {
		QZFL.dom.setXY(el, pos['left'], pos['top']);
		QZFL.dom.setSize(el, pos['width'], pos['height']);
	},
	/**
	 * 获取对象坐标
	 *
	 * @param {HTMLElement} el
	 * @param {Document} doc 所需检查的页面document引用
	 * @return Array [top,left]
	 * @type Array
	 *       @example
	 *       var xy=QZFL.dom.getXY(QZFL.dom.get("div_id"));
	 * @return Array
	 */
	getXY : function(elem, doc){
		var box = QZFL.dom.getPosition(elem) ||
		{
			left: 0,
			top: 0
		};
		return [box.left, box.top];
	},

	/**
	 * 获取对象尺寸
	 *
	 * @param {HTMLElement} el
	 * @return Array [width,height]
	 * @type Array
	 *       @example
	 *       var size=QZFL.dom.getSize(QZFL.dom.get("div_id"));
	 * @return Array
	 */
	getSize : function(elem){
		var box = QZFL.dom.getPosition(elem) ||
		{
			width: -1,
			height: -1
		};
		return [box.width, box.height];
	},

	/**
	 * 设置dom坐标
	 *
	 * @param {HTMLElement} el
	 * @param {string|number} x 横坐标
	 * @param {string|number} y 纵坐标
	 *            @example
	 *            QZFL.dom.setXY(QZFL.dom.get("div_id"),400,200);
	 */
	setXY : function(elem, x, y){
		var _ml = parseInt(QZFL.dom.getStyle(elem, "marginLeft")) || 0, _mt = parseInt(QZFL.dom.getStyle(elem, "marginTop")) || 0;
		QZFL.dom.setStyle(elem, {
			left: (parseInt(x) || 0) - _ml + "px",
			top: (parseInt(y) || 0) - _mt + "px"
		});
	},

	/**
	 * 获取对象scrollLeft的值
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getScrollLeft(document);
	 * @return Number
	 */
	getScrollLeft : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return Math.max(_doc.documentElement.scrollLeft, _doc.body.scrollLeft);
	},

	/**
	 * 获取对象的scrollTop的值
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getScrollTop(document);
	 * @return Number
	 */
	getScrollTop : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return Math.max(_doc.documentElement.scrollTop, _doc.body.scrollTop);
	},

	/**
	 * 获取对象scrollHeight的值
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getScrollHeight(document);
	 * @return Number
	 */
	getScrollHeight : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return Math.max(_doc.documentElement.scrollHeight, _doc.body.scrollHeight);
	},

	/**
	 * 获取对象的scrollWidth的值
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getScrollWidht(document);
	 * @return Number
	 */
	getScrollWidth : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return Math.max(_doc.documentElement.scrollWidth, _doc.body.scrollWidth);
	},

	/**
	 * 设置对象scrollLeft的值
	 *
	 * @param {number} value scroll left的修改值
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.setScrollLeft(200,document);
	 */
	setScrollLeft : function(value, doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		_doc[_doc.compatMode == "CSS1Compat" && !QZFL.userAgent.webkit ? "documentElement" : "body"].scrollLeft = value;
	},

	/**
	 * 设置对象的scrollTop的值
	 *
	 * @param {number} value scroll top的修改值
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.setScrollTop(200,document);
	 */
	setScrollTop : function(value, doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		_doc[_doc.compatMode == "CSS1Compat" && !QZFL.userAgent.webkit ? "documentElement" : "body"].scrollTop = value;
	},

	/**
	 * 获取对象的可视区域高度
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getClientHeight();
	 */
	getClientHeight : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientHeight : _doc.body.clientHeight;
	},

	/**
	 * 获取对象的可视区域宽度
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getClientWidth();
	 */
	getClientWidth : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return _doc.compatMode == "CSS1Compat" ? _doc.documentElement.clientWidth : _doc.body.clientWidth;
	},
	

	/**
	 * @ignore
	 *
	 */
	_SET_SIZE_RE : /^\d+(?:\.\d*)?(px|%|em|in|cm|mm|pc|pt)?$/,

	/**
	 * 设置dom尺寸
	 *
	 * @param {HTMLElement} el
	 * @param {string|number} width 宽度
	 * @param {string|number} height 高度
	 *            @example
	 *            QZFL.dom.setSize();
	 */
	setSize : function(el,w,h){
		el = QZFL.dom.get(el);
		var _r = QZFL.dom._SET_SIZE_RE,
			m;

		QZFL.dom.setStyle(el, "width", (m=_r.exec(w)) ? (m[1] ? w : (parseInt(w,10)+'px')) : 'auto');
		QZFL.dom.setStyle(el, "height",(m=_r.exec(h)) ? (m[1] ? h : (parseInt(h,10)+'px')) : 'auto');
	},
	/**
	 * 获取document的window对象
	 *
	 * @param {Document} doc 所需检查的页面document引用
	 * @example QZFL.dom.getDocumentWindow();
	 * @return {Window} 返回window对象
	 */
	getDocumentWindow : function(doc) {
		/**
		 * @default document
		 */
		var _doc = doc || document;
		return _doc.parentWindow || _doc.defaultView;
	},

	/**
	 * 按Tagname获取指定命名空间的节点
	 *
	 * @param {Element/Document} node 所需遍历的根节点
	 * @param {string} ns 命名空间名
	 * @param {string} tgn 标签名
	 * @return QZFL.dom.getElementsByTagNameNS(document,"ns","div");
	 * @return Array
	 */
	getElementsByTagNameNS : function(node, ns, tgn) {
		var res = [];
		if (node) {
			if (node.getElementsByTagNameNS) {
				return node.getElementsByTagName(ns + ":" + tgn);
			} else if (node.getElementsByTagName) {
				var n = document.namespaces;
				if (n.length > 0) {
					var l = node.getElementsByTagName(tgn);
					for (var i = 0, len = l.length; i < len; ++i) {
						if (l[i].scopeName == ns) {
							res.push(l[i]);
						}
					}
				}
			}
		}
		return res;
	},

	/**
	 * Move to selector_engine.js
	 * 
	 * 将集合型转为数组
	 *
	 * @param {Object} coll 集合型
	 *            @example
	 *            QZFL.dom.collection2Array(coll);
	 * @return Array
	 * @ignore
	 * @deprecated
	collection2Array : function(coll) {
		if (QZFL.lang.isArray(coll)) {
			return coll;
		} else {
			var r = [];
			for (var i = 0, len = coll.length; i < len; ++i) {
				r.push(coll[i]);
			}
		}
		return r;
	},
	 */

	/**
	 * 向上寻找一个tagName相符的节点
	 *
	 * @param {Object} a
	 * @param {string} tn
	 *            @example
	 *            QZFL.dom.getElementByTagNameBubble(QZFL.dom.get("div_id"),"div");
	 * @return {object} result|null
	 */
	getElementByTagNameBubble : function(elem, tagName){
		var maxLv = 31;
		tagName = (tagName + '').toUpperCase();
		elem = QZFL.dom.searchChain(elem = QZFL.dom.get(elem), 'parentNode', function(el){
			return el.tagName == tagName || el.tagName == 'BODY' || (--maxLv) < 0;
		});
		return !elem || elem.tagName == 'BODY' || maxLv < 0 ? null : elem;
	},
	/**
	 * 在元素相邻的位置插入 html / text / element
	 * @param {Object} elem 元素id/引用
	 * @param {Object} where 取值0123，分别对应：beforeBegin, afterBegin, beforeEnd, afterEnd
	 * @param {Object} html html / text / element
	 * @param {Object} isText 当需要插入text时，用此参数区别于html
	 * @return {boolean} 操作是否成功
	 */
	insertAdjacent : function(elem, where, html, isText){
		var range, pos = ['beforeBegin', 'afterBegin', 'beforeEnd', 'afterEnd'], doc;
		if (QZFL.lang.isElement(elem) && pos[where] && (QZFL.lang.isString(html) || QZFL.lang.isElement(html))) {
			if (elem.insertAdjacentHTML) {
				elem['insertAdjacent' + (typeof(html) != 'string' ? 'Element' : isText ? 'Text' : 'HTML')](pos[where], html);
			} else {
				range = (doc = elem.ownerDocument).createRange();
				range[where == 1 || where == 2 ? 'selectNodeContents' : 'selectNode'](elem);
				range.collapse(where < 2);
				range.insertNode(typeof(html) != 'string' ? html : isText ? doc.createTextNode(html) : range.createContextualFragment(html));
			}
			return true;
		}
		return false;
	}
};
/**
 * @fileoverview QZFL 事件驱动器，给浏览器提供基本的事件驱动接口
 * @version 1.$Rev: 1921 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */

/**
 * 事件驱动对象，包含许多事件驱动以及绑定等方法,关键
 *
 * @namespace QZFL 事件驱动器，给浏览器提供基本的事件驱动接口
 */
QZFL.event = {
	/**
	 * 按键代码映射
	 *
	 * @namespace QZFL.event.KEYS 里面包含了对按键的映射
	 * @type Object
	 */
	KEYS : {
		/**
		 * 退格键
		 */
		BACKSPACE : 8,
		/**
		 * tab
		 */
		TAB : 9,
		RETURN : 13,
		ESC : 27,
		SPACE : 32,
		LEFT : 37,
		UP : 38,
		RIGHT : 39,
		DOWN : 40,
		DELETE : 46
	},
	//这个东东不需要了吧
	/**
	 * 扩展类型，这类事件在绑定的时候允许传参数，并且用来特殊处理一些特别的事件绑定
	 *
	 * @ignore
	 *
	extendType : /(click|mousedown|mouseover|mouseout|mouseup|mousemove|scroll|contextmenu|resize)/i,*/


	/**
	 * 全局事件树
	 * @ignore
	 */
	_eventListDictionary : {},

	/**
	 * @ignore
	 */
	_fnSeqUID : 0,

	/**
	 * @ignore
	 */
	_objSeqUID : 0,

	/**
	 * 事件绑定
	 *
	 * @param {DocumentElement} obj 需要添加事件的页面对象
	 * @param {String} eventType 需要添加的事件
	 * @param {Function} fn 事件需要绑定到的处理函数
	 * @param {Array} argArray 参数数组
	 * @type Boolean
	 * @version 1.1 memory leak optimise by scorr
	 * @author zishunchen
	 * @return 是否绑定成功(true为成功，false为失败)
	 * @example QZFL.event.addEvent(QZFL.dom.get('demo'),'click',hello);
	 */
	addEvent : function(obj, eventType, fn, argArray) {
		var cfn,
			res = false, l;

		if (!obj) {
			return res;
		}
		if (!obj.eventsListUID) {
			obj.eventsListUID = "e" + (++QZFL.event._objSeqUID);
		}

		if (!(l = QZFL.event._eventListDictionary[obj.eventsListUID])) {
			l = QZFL.event._eventListDictionary[obj.eventsListUID] = {};
		}

		if (!fn.__elUID) {
			fn.__elUID = "e" + (++QZFL.event._fnSeqUID) + obj.eventsListUID;
		}

		if (!l[eventType]) {
			l[eventType] = {};
		}

		if(typeof(l[eventType][fn.__elUID])=='function'){
			return false;
		}

		cfn = function(evt) {
				return fn.apply(obj, !argArray ? [QZFL.event.getEvent(evt)] : ([QZFL.event.getEvent(evt)]).concat(argArray));
			};

		if (obj.addEventListener) {
			obj.addEventListener(eventType, cfn, false);
			res = true;
		} else if (obj.attachEvent) {
			res = obj.attachEvent("on" + eventType, cfn);
		} else {
			res = false;
		}
		if (res) {
			l[eventType][fn.__elUID] = cfn;
		}
		return res;
	},

	/**
	 * 方法取消绑定
	 *
	 * @param {DocumentElement} obj 需要取消事件绑定的页面对象
	 * @param {String} eventType 需要取消绑定的事件
	 * @param {Function} fn 需要取消绑定的函数
	 * @return 是否成功取消(true为成功，false为失败)
	 * @type Boolean
	 * @version 1.1 memory leak optimise by scorr
	 * @author zishunchen
	 * @example QZFL.event.removeEvent(QZFL.dom.get('demo'),'click',hello);
	 */
	removeEvent : function(obj, eventType, fn) {
		var cfn = fn,
			res = false,
			l = QZFL.event._eventListDictionary,
			r;

		if (!obj) {
			return res;
		}
		if (!fn) {
			return QZFL.event.purgeEvent(obj, eventType);
		}

		if (obj.eventsListUID && l[obj.eventsListUID]) {
			l = l[obj.eventsListUID][eventType];
			if(l && l[fn.__elUID]){
				cfn = l[fn.__elUID];
				r = l;
			}
		}

		if (obj.removeEventListener) {
			obj.removeEventListener(eventType, cfn, false);
			res = true;
		} else if (obj.detachEvent) {
			obj.detachEvent("on" + eventType, cfn);
			res = true;
		} else {
			//rt.error("Error.!.");
			return false;
		}
		if (res && r && r[fn.__elUID]) {
			delete r[fn.__elUID];
		}
		return res;
	},

	/**
	 * 取消全部某类型的方法绑定
	 *
	 * @param {DocumentElement} obj 需要取消事件绑定的页面对象
	 * @param {String} eventType 需要取消绑定的事件
	 * @example QZFL.event.purgeEvent(QZFL.dom.get('demo'),'click');
	 * @return {Boolean} 是否成功取消(true为成功，false为失败)
	 */
	purgeEvent : function(obj, type) {
		var l;
		if (obj.eventsListUID && (l = QZFL.event._eventListDictionary[obj.eventsListUID]) && l[type]) {
			for (var k in l[type]) {
				if (obj.removeEventListener) {
					obj.removeEventListener(type, l[type][k], false);
				} else if (obj.detachEvent) {
					obj.detachEvent('on' + type, l[type][k]);
				}
			}
		}
		if (obj['on' + type]) {
			obj['on' + type] = null;
		}
		if (l) {
			l[type] = null;
			delete l[type];
		}
		return true;
	},

	/**
	 * 根据不同浏览器获取对应的Event对象
	 *
	 * @param {Event} evt
	 * @return 修正过的Event对象, 同时返回一个修正button的自定义属性;
	 * @type Event
	 * @example QZFL.event.getEvent();
	 * @return Event
	 */
	getEvent: function(evt) {
		var evt = window.event || evt,
			c,
			cnt;
		if(!evt && window.Event){
			c = arguments.callee;
			cnt = 0;
			while(c){
				if((evt = c.arguments[0]) && typeof(evt.srcElement) != "undefined"){
					break;
				}else if(cnt > 9){
					break;
				}
				c = c.caller;
				++cnt;
			}
		}
		return evt;
	},

	/**
	 * 获得鼠标按键
	 *
	 * @param {Object} evt
	 * @example QZFL.event.getButton(evt);
	 * @return {number} 鼠标按键 -1=无法获取event 0=左键 1= 中键 2= 右键
	 */
	getButton : function(evt) {
		var e = QZFL.event.getEvent(evt);
		if (!e) {
			return -1
		}

		if (QZFL.userAgent.ie) {
			return e.button - Math.ceil(e.button / 2);
		} else {
			return e.button;
		}
	},

	/**
	 * 返回事件触发的对象
	 *
	 * @param {Object} evt
	 * @example QZFL.event.getTarget(evt);
	 * @return {object}
	 */
	getTarget : function(evt) {
		var e = QZFL.event.getEvent(evt);
		if (e) {
			return e.srcElement || e.target;
		} else {
			return null;
		}
	},

	/**
	 * 返回获得焦点的对象
	 *
	 * @param {Object} evt
	 * @example QZFL.event.getCurrentTarget();
	 * @return {object}
	 */
	getCurrentTarget : function(evt) {
		var e = QZFL.event.getEvent(evt);
		if (e) {
		/**
		 * @default document.activeElement
		 */
			return  e.currentTarget || document.activeElement;
		} else {
			return null;
		}
	},

	/**
	 * 禁止事件冒泡传播
	 *
	 * @param {Event} evt 事件，非必要参数
	 * @example QZFL.event.cancelBubble();
	 */
	cancelBubble : function(evt) {
		evt = QZFL.event.getEvent(evt);
		if (!evt) {
			return false
		}
		if (evt.stopPropagation) {
			evt.stopPropagation();
		} else {
			if (!evt.cancelBubble) {
				evt.cancelBubble = true;
			}
		}
	},

	/**
	 * 取消浏览器的默认事件
	 *
	 * @param {Event} evt 事件，非必要参数
	 * @example QZFL.event.preventDefault();
	 */
	preventDefault : function(evt) {
		evt = QZFL.event.getEvent(evt);
		if (!evt) {
			return false
		}
		if (evt.preventDefault) {
			evt.preventDefault();
		} else {
			evt.returnValue = false;
		}
	},

	/**
	 * 获取事件触发时的鼠标位置x
	 *
	 * @param {Object} evt 事件对象引用
	 * @example QZFL.event.mouseX();
	 */
	mouseX : function(evt) {
		evt = QZFL.event.getEvent(evt);
		return evt.pageX || (evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
	},

	/**
	 * 获取事件触发时的鼠标位置y
	 *
	 * @param {Object} evt 事件对象引用
	 * @example QZFL.event.mouseX();
	 */
	mouseY : function(evt) {
		evt = QZFL.event.getEvent(evt);
		return evt.pageY || (evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
	},

	/**
	 * 获取事件RelatedTarget
	 * @param {Object} evt 事件对象引用
	 * @example QZFL.event.getRelatedTarget();
	 */
	getRelatedTarget: function(ev) {
		ev = QZFL.event.getEvent(ev);
		var t = ev.relatedTarget;
		if (!t) {
			if (ev.type == "mouseout") {
				t = ev.toElement;
			} else if (ev.type == "mouseover") {
				t = ev.fromElement;
			} else {

			}
		}
		return t;
	},

	/**
	 * 全局页面加载完成后的事件回调
	 * @param {function} fn 回调接口
	 */
	onDomReady:function(fn){
		QZFL.event.onDomReady._fn = function(){
				fn();
				QZFL.event.onDomReady._fn = null;
			};
		
		if (document.addEventListener) {
			if (QZFL.userAgent.safari<4) {
				var interval = setInterval(function() {
					if ((/loaded|complete/).test(document.readyState)) {
						QZFL.event.onDomReady._fn();
						clearInterval(interval);
					}
				}, 50);
			} else {
				document.addEventListener("DOMContentLoaded", QZFL.event.onDomReady._fn, true);
			}
		} else {
			var src = window.location.protocol == 'https:' ? '//:' : 'javascript:void(0)';
			document.write('<script onreadystatechange="if(this.readyState==\'complete\'){this.parentNode.removeChild(this);QZFL.event.onDomReady._fn();}" defer="defer" src="' + src + '"><\/script\>');
		}
	}
};

/**
 * 方法同 QZFL.event.addEvent
 *
 * @see QZFL.event.addEvent
 */
QZFL.event.on = QZFL.event.addEvent;

/**
 * 方法同 QZFL.object.bind
 *
 * @see QZFL.object.bind
 */
QZFL.event.bind = QZFL.object.bind;
/**
 * @fileoverview 增强脚本语言处理能力
 * @version 1.$Rev: 1597 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2009-11-30 21:51:19 +0800 (星期一, 30 十一月 2009) $
 */

 /**
 * 环境变量系统
 *
 * @namespace QZFL.lang
 */
QZFL.lang = {
	/**
	 * 是否字符串
	 *
	 * @param {Object} o 目标
	 * @example
	 * 			QZFL.lang.isString(obj);
	 * @return {Boolean} 结果
	 */
	isString : function(o) {
		return QZFL.object.getType(o) == "string";
	},
	/**
	 * 是否数组对象
	 *
	 * @param {Object} o 目标
	 * @example
	 *          QZFL.lang.isArray(obj);
	 * @return {Boolean} 结果
	 */
	isArray : function(o) {
		return QZFL.object.getType(o) == "array";
	},
	/**
	 * 是否函数对象
	 *
	 * @param {Object} o 目标
	 * @example
	 *          QZFL.lang.isArray(obj);
	 * @return {Boolean} 结果
	 */
	isFunction: function(o) {
		return QZFL.object.getType(o) == "function";
	},
	/**
	 * 是否哈希表结构
	 *
	 * @param {Object} o 目标
	 * @example
	 * 			QZFL.lang.isHashMap(obj);
	 * @return {Boolean} 结果
	 */
	isHashMap : function(o) {
		return QZFL.object.getType(o) == "object";
	},
	/**
	 * 是否DOM节点
	 *
	 * @param {Object} o 目标
	 * @example
	 * 			QZFL.lang.isNode(obj);
	 * @return {Boolean} 结果
	 */
	isNode : function(o) {
		if (typeof(Node) == 'undefined') {
			//这在IE下会无意中添加一个全局变量的呀。。。 ryan
			Node = null;
		}
		try {
			//Node != undefined。。。。这和上边的Node=null 对不上啊
			if (!o || !((Node != undefined && o instanceof Node) || o.nodeName)) {
				return false;
			}
		} catch (ignored) {
			return false;
		}
		return true;
	},
	/**
	 * 是否Element
	 *
	 * @param {Object} o 目标
	 * @example
	 * 			QZFL.lang.isElement(obj);
	 * @return {Boolean} 结果
	 */
	isElement : function(o) {
		 return o && o.nodeType == 1;
	}

};

;
(function () {
    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,
        done = 0,
        toString = Object.prototype.toString,
        hasDuplicate = false;
    var Sizzle = function (selector, context, results, seed) {
        results = results || [];
        var origContext = context = context || document;
        if (context.nodeType !== 1 && context.nodeType !== 9) {
            return [];
        }
        if (!selector || typeof selector !== "string") {
            return results;
        }
        var parts = [],
            m, set, checkSet, check, mode, extra, prune = true,
            contextXML = isXML(context);
        chunker.lastIndex = 0;
        while ((m = chunker.exec(selector)) !== null) {
            parts.push(m[1]);
            if (m[2]) {
                extra = RegExp.rightContext;
                break;
            }
        }
        if (parts.length > 1 && origPOS.exec(selector)) {
            if (parts.length === 2 && Expr.relative[parts[0]]) {
                set = posProcess(parts[0] + parts[1], context);
            } else {
                set = Expr.relative[parts[0]] ? [context] : Sizzle(parts.shift(), context);
                while (parts.length) {
                    selector = parts.shift();
                    if (Expr.relative[selector]) selector += parts.shift();
                    set = posProcess(selector, set);
                }
            }
        } else {
            if (!seed && parts.length > 1 && context.nodeType === 9 && !contextXML && Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1])) {
                var ret = Sizzle.find(parts.shift(), context, contextXML);
                context = ret.expr ? Sizzle.filter(ret.expr, ret.set)[0] : ret.set[0];
            }
            if (context) {
                var ret = seed ? {
                    expr: parts.pop(),
                    set: makeArray(seed)
                } : Sizzle.find(parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML);
                set = ret.expr ? Sizzle.filter(ret.expr, ret.set) : ret.set;
                if (parts.length > 0) {
                    checkSet = makeArray(set);
                } else {
                    prune = false;
                }
                while (parts.length) {
                    var cur = parts.pop(),
                        pop = cur;
                    if (!Expr.relative[cur]) {
                        cur = "";
                    } else {
                        pop = parts.pop();
                    }
                    if (pop == null) {
                        pop = context;
                    }
                    Expr.relative[cur](checkSet, pop, contextXML);
                }
            } else {
                checkSet = parts = [];
            }
        }
        if (!checkSet) {
            checkSet = set;
        }
        if (!checkSet) {
            throw "Syntax error, unrecognized expression: " + (cur || selector);
        }
        if (toString.call(checkSet) === "[object Array]") {
            if (!prune) {
                results.push.apply(results, checkSet);
            } else if (context && context.nodeType === 1) {
                for (var i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i]))) {
                        results.push(set[i]);
                    }
                }
            } else {
                for (var i = 0; checkSet[i] != null; i++) {
                    if (checkSet[i] && checkSet[i].nodeType === 1) {
                        results.push(set[i]);
                    }
                }
            }
        } else {
            makeArray(checkSet, results);
        }
        if (extra) {
            Sizzle(extra, origContext, results, seed);
            Sizzle.uniqueSort(results);
        }
        return results;
    };
    Sizzle.uniqueSort = function (results) {
        if (sortOrder) {
            hasDuplicate = false;
            results.sort(sortOrder);
            if (hasDuplicate) {
                for (var i = 1; i < results.length; i++) {
                    if (results[i] === results[i - 1]) {
                        results.splice(i--, 1);
                    }
                }
            }
        }
    };
    Sizzle.matches = function (expr, set) {
        return Sizzle(expr, null, null, set);
    };
    Sizzle.find = function (expr, context, isXML) {
        var set, match;
        if (!expr) {
            return [];
        }
        for (var i = 0, l = Expr.order.length; i < l; i++) {
            var type = Expr.order[i],
                match;
            if ((match = Expr.match[type].exec(expr))) {
                var left = RegExp.leftContext;
                if (left.substr(left.length - 1) !== "\\") {
                    match[1] = (match[1] || "").replace(/\\/g, "");
                    set = Expr.find[type](match, context, isXML);
                    if (set != null) {
                        expr = expr.replace(Expr.match[type], "");
                        break;
                    }
                }
            }
        }
        if (!set) {
            set = context.getElementsByTagName("*");
        }
        return {
            set: set,
            expr: expr
        };
    };
    Sizzle.filter = function (expr, set, inplace, not) {
        var old = expr,
            result = [],
            curLoop = set,
            match, anyFound, isXMLFilter = set && set[0] && isXML(set[0]);
        while (expr && set.length) {
            for (var type in Expr.filter) {
                if ((match = Expr.match[type].exec(expr)) != null) {
                    var filter = Expr.filter[type],
                        found, item;
                    anyFound = false;
                    if (curLoop == result) {
                        result = [];
                    }
                    if (Expr.preFilter[type]) {
                        match = Expr.preFilter[type](match, curLoop, inplace, result, not, isXMLFilter);
                        if (!match) {
                            anyFound = found = true;
                        } else if (match === true) {
                            continue;
                        }
                    }
                    if (match) {
                        for (var i = 0;
                        (item = curLoop[i]) != null; i++) {
                            if (item) {
                                found = filter(item, match, i, curLoop);
                                var pass = not ^ !! found;
                                if (inplace && found != null) {
                                    if (pass) {
                                        anyFound = true;
                                    } else {
                                        curLoop[i] = false;
                                    }
                                } else if (pass) {
                                    result.push(item);
                                    anyFound = true;
                                }
                            }
                        }
                    }
                    if (found !== undefined) {
                        if (!inplace) {
                            curLoop = result;
                        }
                        expr = expr.replace(Expr.match[type], "");
                        if (!anyFound) {
                            return [];
                        }
                        break;
                    }
                }
            }
            if (expr == old) {
                if (anyFound == null) {
                    throw "Syntax error, unrecognized expression: " + expr;
                } else {
                    break;
                }
            }
            old = expr;
        }
        return curLoop;
    };
    var Expr = Sizzle.selectors = {
        order: ["ID", "NAME", "TAG"],
        match: {
            ID: /#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
            CLASS: /\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,
            NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,
            ATTR: /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
            TAG: /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
            CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
            POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
            PSEUDO: /:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
        },
        attrMap: {
            "class": "className",
            "for": "htmlFor"
        },
        attrHandle: {
            href: function (elem) {
                return elem.getAttribute("href");
            }
        },
        relative: {
            "+": function (checkSet, part, isXML) {
                var isPartStr = typeof part === "string",
                    isTag = isPartStr && !/\W/.test(part),
                    isPartStrNotTag = isPartStr && !isTag;
                if (isTag && !isXML) {
                    part = part.toUpperCase();
                }
                for (var i = 0, l = checkSet.length, elem; i < l; i++) {
                    if ((elem = checkSet[i])) {
                        while ((elem = elem.previousSibling) && elem.nodeType !== 1) {}
                        checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ? elem || false : elem === part;
                    }
                }
                if (isPartStrNotTag) {
                    Sizzle.filter(part, checkSet, true);
                }
            },
            ">": function (checkSet, part, isXML) {
                var isPartStr = typeof part === "string";
                if (isPartStr && !/\W/.test(part)) {
                    part = isXML ? part : part.toUpperCase();
                    for (var i = 0, l = checkSet.length; i < l; i++) {
                        var elem = checkSet[i];
                        if (elem) {
                            var parent = elem.parentNode;
                            checkSet[i] = parent.nodeName === part ? parent : false;
                        }
                    }
                } else {
                    for (var i = 0, l = checkSet.length; i < l; i++) {
                        var elem = checkSet[i];
                        if (elem) {
                            checkSet[i] = isPartStr ? elem.parentNode : elem.parentNode === part;
                        }
                    }
                    if (isPartStr) {
                        Sizzle.filter(part, checkSet, true);
                    }
                }
            },
            "": function (checkSet, part, isXML) {
                var doneName = done++,
                    checkFn = dirCheck;
                if (!/\W/.test(part)) {
                    var nodeCheck = part = isXML ? part : part.toUpperCase();
                    checkFn = dirNodeCheck;
                }
                checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
            },
            "~": function (checkSet, part, isXML) {
                var doneName = done++,
                    checkFn = dirCheck;
                if (typeof part === "string" && !/\W/.test(part)) {
                    var nodeCheck = part = isXML ? part : part.toUpperCase();
                    checkFn = dirNodeCheck;
                }
                checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
            }
        },
        find: {
            ID: function (match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);
                    return m ? [m] : [];
                }
            },
            NAME: function (match, context, isXML) {
                if (typeof context.getElementsByName !== "undefined") {
                    var ret = [],
                        results = context.getElementsByName(match[1]);
                    for (var i = 0, l = results.length; i < l; i++) {
                        if (results[i].getAttribute("name") === match[1]) {
                            ret.push(results[i]);
                        }
                    }
                    return ret.length === 0 ? null : ret;
                }
            },
            TAG: function (match, context) {
                return context.getElementsByTagName(match[1]);
            }
        },
        preFilter: {
            CLASS: function (match, curLoop, inplace, result, not, isXML) {
                match = " " + match[1].replace(/\\/g, "") + " ";
                if (isXML) {
                    return match;
                }
                for (var i = 0, elem;
                (elem = curLoop[i]) != null; i++) {
                    if (elem) {
                        if (not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0)) {
                            if (!inplace) result.push(elem);
                        } else if (inplace) {
                            curLoop[i] = false;
                        }
                    }
                }
                return false;
            },
            ID: function (match) {
                return match[1].replace(/\\/g, "");
            },
            TAG: function (match, curLoop) {
                for (var i = 0; curLoop[i] === false; i++) {}
                return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
            },
            CHILD: function (match) {
                if (match[1] == "nth") {
                    var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" || !/\D/.test(match[2]) && "0n+" + match[2] || match[2]);
                    match[2] = (test[1] + (test[2] || 1)) - 0;
                    match[3] = test[3] - 0;
                }
                match[0] = done++;
                return match;
            },
            ATTR: function (match, curLoop, inplace, result, not, isXML) {
                var name = match[1].replace(/\\/g, "");
                if (!isXML && Expr.attrMap[name]) {
                    match[1] = Expr.attrMap[name];
                }
                if (match[2] === "~=") {
                    match[4] = " " + match[4] + " ";
                }
                return match;
            },
            PSEUDO: function (match, curLoop, inplace, result, not) {
                if (match[1] === "not") {
                    if (chunker.exec(match[3]).length > 1 || /^\w/.test(match[3])) {
                        match[3] = Sizzle(match[3], null, null, curLoop);
                    } else {
                        var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                        if (!inplace) {
                            result.push.apply(result, ret);
                        }
                        return false;
                    }
                } else if (Expr.match.POS.test(match[0]) || Expr.match.CHILD.test(match[0])) {
                    return true;
                }
                return match;
            },
            POS: function (match) {
                match.unshift(true);
                return match;
            }
        },
        filters: {
            enabled: function (elem) {
                return elem.disabled === false && elem.type !== "hidden";
            },
            disabled: function (elem) {
                return elem.disabled === true;
            },
            checked: function (elem) {
                return elem.checked === true;
            },
            selected: function (elem) {
                elem.parentNode.selectedIndex;
                return elem.selected === true;
            },
            parent: function (elem) {
                return !!elem.firstChild;
            },
            empty: function (elem) {
                return !elem.firstChild;
            },
            has: function (elem, i, match) {
                return !!Sizzle(match[3], elem).length;
            },
            header: function (elem) {
                return /h\d/i.test(elem.nodeName);
            },
            text: function (elem) {
                return "text" === elem.type;
            },
            radio: function (elem) {
                return "radio" === elem.type;
            },
            checkbox: function (elem) {
                return "checkbox" === elem.type;
            },
            file: function (elem) {
                return "file" === elem.type;
            },
            password: function (elem) {
                return "password" === elem.type;
            },
            submit: function (elem) {
                return "submit" === elem.type;
            },
            image: function (elem) {
                return "image" === elem.type;
            },
            reset: function (elem) {
                return "reset" === elem.type;
            },
            button: function (elem) {
                return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
            },
            input: function (elem) {
                return /input|select|textarea|button/i.test(elem.nodeName);
            }
        },
        setFilters: {
            first: function (elem, i) {
                return i === 0;
            },
            last: function (elem, i, match, array) {
                return i === array.length - 1;
            },
            even: function (elem, i) {
                return i % 2 === 0;
            },
            odd: function (elem, i) {
                return i % 2 === 1;
            },
            lt: function (elem, i, match) {
                return i < match[3] - 0;
            },
            gt: function (elem, i, match) {
                return i > match[3] - 0;
            },
            nth: function (elem, i, match) {
                return match[3] - 0 == i;
            },
            eq: function (elem, i, match) {
                return match[3] - 0 == i;
            }
        },
        filter: {
            PSEUDO: function (elem, match, i, array) {
                var name = match[1],
                    filter = Expr.filters[name];
                if (filter) {
                    return filter(elem, i, match, array);
                } else if (name === "contains") {
                    return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
                } else if (name === "not") {
                    var not = match[3];
                    for (i = 0, l = not.length; i < l; i++) {
                        if (not[i] === elem) {
                            return false;
                        }
                    }
                    return true;
                }
            },
            CHILD: function (elem, match) {
                var type = match[1],
                    node = elem;
                switch (type) {
                case 'only':
                case 'first':
                    while ((node = node.previousSibling)) {
                        if (node.nodeType === 1) {
                            return false;
                        }
                    }
                    if (type == 'first') {
                        return true;
                    }
                    node = elem;
                case 'last':
                    while ((node = node.nextSibling)) {
                        if (node.nodeType === 1) return false;
                    }
                    return true;
                case 'nth':
                    var first = match[2],
                        last = match[3];
                    if (first == 1 && last == 0) {
                        return true;
                    }
                    var doneName = match[0],
                        parent = elem.parentNode;
                    if (parent && (parent.sizcache !== doneName || !elem.nodeIndex)) {
                        var count = 0;
                        for (node = parent.firstChild; node; node = node.nextSibling) {
                            if (node.nodeType === 1) {
                                node.nodeIndex = ++count;
                            }
                        }
                        parent.sizcache = doneName;
                    }
                    var diff = elem.nodeIndex - last;
                    if (first == 0) {
                        return diff == 0;
                    } else {
                        return (diff % first == 0 && diff / first >= 0);
                    }
                }
            },
            ID: function (elem, match) {
                return elem.nodeType === 1 && elem.getAttribute("id") === match;
            },
            TAG: function (elem, match) {
                return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
            },
            CLASS: function (elem, match) {
                return (" " + (elem.className || elem.getAttribute("class")) + " ").indexOf(match) > -1;
            },
            ATTR: function (elem, match) {
                var name = match[1],
                    result = Expr.attrHandle[name] ? Expr.attrHandle[name](elem) : elem[name] != null ? elem[name] : elem.getAttribute(name),
                    value = result + "",
                    type = match[2],
                    check = match[4];
                return result == null ? type === "!=" : type === "=" ? value === check : type === "*=" ? value.indexOf(check) >= 0 : type === "~=" ? (" " + value + " ").indexOf(check) >= 0 : !check ? value && result !== false : type === "!=" ? value != check : type === "^=" ? value.indexOf(check) === 0 : type === "$=" ? value.substr(value.length - check.length) === check : type === "|=" ? value === check || value.substr(0, check.length + 1) === check + "-" : false;
            },
            POS: function (elem, match, i, array) {
                var name = match[2],
                    filter = Expr.setFilters[name];
                if (filter) {
                    return filter(elem, i, match, array);
                }
            }
        }
    };
    var origPOS = Expr.match.POS;
    for (var type in Expr.match) {
        Expr.match[type] = new RegExp(Expr.match[type].source + /(?![^\[]*\])(?![^\(]*\))/.source);
    }
    var makeArray = function (array, results) {
        array = Array.prototype.slice.call(array);
        if (results) {
            results.push.apply(results, array);
            return results;
        }
        return array;
    };
    try {
        Array.prototype.slice.call(document.documentElement.childNodes);
    } catch (e) {
        makeArray = function (array, results) {
            var ret = results || [];
            if (toString.call(array) === "[object Array]") {
                Array.prototype.push.apply(ret, array);
            } else {
                if (typeof array.length === "number") {
                    for (var i = 0, l = array.length; i < l; i++) {
                        ret.push(array[i]);
                    }
                } else {
                    for (var i = 0; array[i]; i++) {
                        ret.push(array[i]);
                    }
                }
            }
            return ret;
        };
    }
    var sortOrder;
    if (document.documentElement.compareDocumentPosition) {
        sortOrder = function (a, b) {
            var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
            if (ret === 0) {
                hasDuplicate = true;
            }
            return ret;
        };
    } else if ("sourceIndex" in document.documentElement) {
        sortOrder = function (a, b) {
            var ret = a.sourceIndex - b.sourceIndex;
            if (ret === 0) {
                hasDuplicate = true;
            }
            return ret;
        };
    } else if (document.createRange) {
        sortOrder = function (a, b) {
            var aRange = a.ownerDocument.createRange(),
                bRange = b.ownerDocument.createRange();
            aRange.selectNode(a);
            aRange.collapse(true);
            bRange.selectNode(b);
            bRange.collapse(true);
            var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
            if (ret === 0) {
                hasDuplicate = true;
            }
            return ret;
        };
    }(function () {
        var form = document.createElement("div"),
            id = "script" + (new Date).getTime();
        form.innerHTML = "<a name='" + id + "'/>";
        var root = document.documentElement;
        root.insertBefore(form, root.firstChild);
        if ( !! document.getElementById(id)) {
            Expr.find.ID = function (match, context, isXML) {
                if (typeof context.getElementById !== "undefined" && !isXML) {
                    var m = context.getElementById(match[1]);
                    return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
                }
            };
            Expr.filter.ID = function (elem, match) {
                var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                return elem.nodeType === 1 && node && node.nodeValue === match;
            };
        }
        root.removeChild(form);
        root = form = null;
    })();
    (function () {
        var div = document.createElement("div");
        div.appendChild(document.createComment(""));
        if (div.getElementsByTagName("*").length > 0) {
            Expr.find.TAG = function (match, context) {
                var results = context.getElementsByTagName(match[1]);
                if (match[1] === "*") {
                    var tmp = [];
                    for (var i = 0; results[i]; i++) {
                        if (results[i].nodeType === 1) {
                            tmp.push(results[i]);
                        }
                    }
                    results = tmp;
                }
                return results;
            };
        }
        div.innerHTML = "<a href='#'></a>";
        if (div.firstChild && typeof div.firstChild.getAttribute !== "undefined" && div.firstChild.getAttribute("href") !== "#") {
            Expr.attrHandle.href = function (elem) {
                return elem.getAttribute("href", 2);
            };
        }
        div = null;
    })();
    if (document.querySelectorAll)(function () {
        var oldSizzle = Sizzle,
            div = document.createElement("div");
        div.innerHTML = "<p class='TEST'></p>";
        if (div.querySelectorAll && div.querySelectorAll(".TEST").length === 0) {
            return;
        }
        Sizzle = function (query, context, extra, seed) {
            context = context || document;
            if (!seed && context.nodeType === 9 && !isXML(context)) {
                try {
                    return makeArray(context.querySelectorAll(query), extra);
                } catch (e) {}
            }
            return oldSizzle(query, context, extra, seed);
        };
        for (var prop in oldSizzle) {
            Sizzle[prop] = oldSizzle[prop];
        }
        div = null;
    })();
    if (document.getElementsByClassName && document.documentElement.getElementsByClassName)(function () {
        var div = document.createElement("div");
        div.innerHTML = "<div class='test e'></div><div class='test'></div>";
        if (div.getElementsByClassName("e").length === 0) return;
        div.lastChild.className = "e";
        if (div.getElementsByClassName("e").length === 1) return;
        Expr.order.splice(1, 0, "CLASS");
        Expr.find.CLASS = function (match, context, isXML) {
            if (typeof context.getElementsByClassName !== "undefined" && !isXML) {
                return context.getElementsByClassName(match[1]);
            }
        };
        div = null;
    })();

    function dirNodeCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        var sibDir = dir == "previousSibling" && !isXML;
        for (var i = 0, l = checkSet.length; i < l; i++) {
            var elem = checkSet[i];
            if (elem) {
                if (sibDir && elem.nodeType === 1) {
                    elem.sizcache = doneName;
                    elem.sizset = i;
                }
                elem = elem[dir];
                var match = false;
                while (elem) {
                    if (elem.sizcache === doneName) {
                        match = checkSet[elem.sizset];
                        break;
                    }
                    if (elem.nodeType === 1 && !isXML) {
                        elem.sizcache = doneName;
                        elem.sizset = i;
                    }
                    if (elem.nodeName === cur) {
                        match = elem;
                        break;
                    }
                    elem = elem[dir];
                }
                checkSet[i] = match;
            }
        }
    }
    function dirCheck(dir, cur, doneName, checkSet, nodeCheck, isXML) {
        var sibDir = dir == "previousSibling" && !isXML;
        for (var i = 0, l = checkSet.length; i < l; i++) {
            var elem = checkSet[i];
            if (elem) {
                if (sibDir && elem.nodeType === 1) {
                    elem.sizcache = doneName;
                    elem.sizset = i;
                }
                elem = elem[dir];
                var match = false;
                while (elem) {
                    if (elem.sizcache === doneName) {
                        match = checkSet[elem.sizset];
                        break;
                    }
                    if (elem.nodeType === 1) {
                        if (!isXML) {
                            elem.sizcache = doneName;
                            elem.sizset = i;
                        }
                        if (typeof cur !== "string") {
                            if (elem === cur) {
                                match = true;
                                break;
                            }
                        } else if (Sizzle.filter(cur, [elem]).length > 0) {
                            match = elem;
                            break;
                        }
                    }
                    elem = elem[dir];
                }
                checkSet[i] = match;
            }
        }
    }
    var contains = document.compareDocumentPosition ?
    function (a, b) {
        return a.compareDocumentPosition(b) & 16;
    } : function (a, b) {
        return a !== b && (a.contains ? a.contains(b) : true);
    };
    var isXML = function (elem) {
        return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" || !! elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
    };
    var posProcess = function (selector, context) {
        var tmpSet = [],
            later = "",
            match, root = context.nodeType ? [context] : context;
        while ((match = Expr.match.PSEUDO.exec(selector))) {
            later += match[0];
            selector = selector.replace(Expr.match.PSEUDO, "");
        }
        selector = Expr.relative[selector] ? selector + "*" : selector;
        for (var i = 0, l = root.length; i < l; i++) {
            Sizzle(selector, root[i], tmpSet);
        }
        return Sizzle.filter(later, tmpSet);
    };
    QZFL.selector = Sizzle;
    QZFL.object.makeArray = QZFL.dom.collection2Array = makeArray;
    QZFL.dom.uniqueSort = Sizzle.uniqueSort;
    QZFL.dom.contains = contains;
    //QZFL.lang.isValidXMLdom = isXML;
})();
/**
 * @fileoverview QZFL Element对象
 * @version 1.$Rev: 1921 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */

;
(function() {
	/**
	 * QZFL Element 控制器,通常不要请自传入非string参数
	 *
	 * @param {string|elements} selector selector查询语句,或则一组elements对象
	 * @param {element} context element查询位置
	 * @class QZFL Element 控制器,通常不要请自传入非string参数
	 * @constructor
	 */
	var _handler = QZFL.ElementHandler = function(selector, context){
		/**
		 * 查询到的对象数组
		 *
		 * @type array
		 */
		this.elements = null;
		
		/**
		 * 用来做一个标示区分
		 *
		 * @ignore
		 */
		this._isElementHandler = true;
		
		this._init(selector, context);
		
	};
	/** @lends QZFL.ElementHandler.prototype */
	_handler.prototype = {
		/**
		 * 初始化 elementHandler对象
		 * @private
		 * @param {Object} selector
		 * @param {Object} context
		 */
		_init: function(selector, context){
			if (QZFL.lang.isString(selector)) {
				this.elements = QZFL.selector(selector, context);
			} else if (selector instanceof QZFL.ElementHandler) {
				this.elements = selector.elements.slice();
			} else if (QZFL.lang.isArray(selector)) {
				this.elements = selector;
			} else if (selector && ((selector.nodeType && selector.nodeType !== 3 && selector.nodeType !== 8) || selector.setTimeout)) {
				this.elements = [selector];
			} else {
				this.elements = [];
			}
		},
		/**
		 * 查找 elements 对象
		 *
		 * @param {string} selector selector查询语法
		 *            @example
		 *            $e("div").findElements("li");
		 * @return {Array} elements 数组
		 */
		findElements: function(selector){
			var _pushstack = [],_s;
			this.each(function(el){
				_s = QZFL.selector(selector, el);
				if (_s.length > 0) {
					_pushstack = _pushstack.concat(_s);
				}
			});
			return _pushstack;
		},

		/**
		 * 查找 elements ,并且创建QZFL Elements 对象.
		 *
		 * @param {string} selector selector查询语法
		 *            @example
		 *            $e("div").find("li");
		 * @return {QZFL.ElementHandler}
		 */
		find: function(selector){
			return _el.get(this.findElements(selector));
		},
		filter: function(expr, elems, not){
			if (not) {
				expr = ":not(" + expr + ")";
			}
			return _el.get(QZFL.selector.matches(expr, elems||this.elements));
		},
		/**
		 * 循环执行elements对象
		 *
		 * @param {function} fn 批量执行的操作
		 *            @example
		 *            $e("div").each(function(n){alert("hello!" + n)});
		 */
		each: function(fn){
			QZFL.object.each(this.elements, fn);
			return this;
		},

		/**
		 * 和其他 Element Handler 或 elements Array 合并
		 *
		 * @param {QZFL.ElementHandler|Array} elements Element Handler对象或则
		 *            Element 数组集合
		 *            @example
		 *            $e("div").concat($e("p"))
		 * @return {QZFL.ElementHandler}
		 */
		concat: function(elements){
			return _el.get(this.elements.concat(!!elements._isElementHandler ? elements.elements : elements));
		},

		/**
		 * 通过 index 获取其中一个 Element Handler
		 *
		 * @param {number} index 索引
		 * @return {QZFL.ElementHandler}
		 */
		get: function(index){
			return _el.get(this.elements[index]);
		},
		/**
		 * 取index元素
		 */
		eq: function(index){
			return this.elements[index || 0];
		},
		/**
		 * 含意同Array.prorotype.slice
		 * @param {number} index 索引
		 * @return {QZFL.ElementHandler}
		 */
		slice: function(){
			return _el.get(Array.prototype.slice.apply(this.elements, arguments));
		}
	};
	/**
	 * QZFL Element对象.
	 *
	 * @namespace QZFL element 对象的前端控制器
	 * @requires QZFL.selector
	 * @type Object
	 */
	var _el = QZFL.element = {
		/**
		 * 获取 element 对象
		 *
		 * @param {string} selector selector查询语句
		 *            @example
		 *            QZFL.element.get("div")
		 * @param {element} context element查询位置
		 * @see QZFL.ElementHandler
		 * @return QZFL.ElementHandler
		 */
		get : function(selector, context) {
			return new _handler(selector, context);
		},

		/**
		 * 扩展 QZFL elements Handler 对象接口
		 *
		 * @param {object} object 扩展接口
		 *            @example
		 *            QZFL.element.extend({show:function(){}})
		 */
		extend : function(object) {
			QZFL.object.extend(_handler, object);
		},

		/**
		 * 扩展 QZFL elements Handler 构造函数接口
		 *
		 * @param {object} object 扩展接口
		 *            @example
		 *            QZFL.element.extendFn({show:function(){}})
		 */
		extendFn : function(object) {
			QZFL.object.extend(_handler.prototype, object);
		},

		/**
		 * 返回 QZFL Elements 对象的版本
		 *
		 * @return {string}
		 */
		getVersion : function() {
			return _handler.version;
		}
	}
})();


// 扩展 QZFL Element 接口
QZFL.element.extend(/** @lends QZFL.ElementHandler */
{
	/**
	 * QZFL Element 版本
	 *
	 * @type String

	 */
	version : "1.0"
});

// Extend Events
QZFL.element.extendFn(
/** @lends QZFL.ElementHandler.prototype */
{
	/**
	 * 绑定事件
	 *
	 * @param {string} evtType 事件类型
	 * @param {function} fn 触发函数
	 *            @example
	 *            $e("div.head").bind("click",function(){});
	 */
	bind : function(evtType, fn) {
		if(typeof(fn)!='function'){
			return false;
		}
		return this.each(function(el) {
			QZFL.event.addEvent(el, evtType, fn);
		});
	},

	/**
	 * 取消事件绑定
	 *
	 * @param {string} evtType 事件类型
	 * @param {function} fn 触发函数
	 *            @example
	 *            $e("div.head").unBind("click",function(){});
	 */
	unBind : function(evtType, fn) {
		return this.each(function(el) {
			QZFL.event[fn ? 'removeEvent' : 'purgeEvent'](el, evtType, fn);
		});
	},
	/**
	 * @param {} fn
	 */
	onHover : function(fnOver,fnOut) {
		this.onMouseOver( fnOver);
		return this.onMouseOut( fnOut);
	},
	onMouseEnter:function(fn){
		return this.bind('mouseover',function(evt){
			var rel = QZFL.event.getRelatedTarget(evt); // fromElement
			if(QZFL.lang.isFunction(fn) && !QZFL.dom.isAncestor(this,rel)){
				fn.call(this,evt);
			}
		});
	},
	onMouseLeave:function(fn){
		return this.bind('mouseout',function(evt){
			var rel = QZFL.event.getRelatedTarget(evt); // toElement
			if(QZFL.lang.isFunction(fn) && !QZFL.dom.isAncestor(this,rel)){
				fn.call(this,evt);
			}
		});
	}
});
QZFL.object.each(['onClick', 'onMouseDown', 'onMouseUp', 'onMouseOver', 'onMouseMove', 'onMouseOut', 'onFocus', 'onBlur', 'onKeyDown', 'onKeyPress', 'onKeyUp'], function(name, index){
	QZFL.ElementHandler.prototype[name] = function(fn){
		return this.bind(name.slice(2).toLowerCase(), fn);
	};
});
// Extend Dom
QZFL.element.extendFn(
/** @lends QZFL.ElementHandler.prototype */
{

	/**
	 * 设置 dom 的html代码
	 *
	 * @param {string} value
	 */
	setHtml : function(value) {
		return this.setAttr("innerHTML", value);
	},

	/**
	 * @param {} index
	 * @return {}
	 */
	getHtml : function(/* @default 0 */index) {
		var _e = this.elements[index || 0];
		return !!_e ? _e.innerHTML : null;
	},

	/**
	 * @param {string} value
	 */
	setVal : function(value) {
		if (QZFL.object.getType(value) == "array") {
			var _v = "\x00" + value.join("\x00") + "\x00";
			this.each(function(el) {
				if (/radio|checkbox/.test(el.type)) {
					el.checked = el.nodeType && ("\x00" + _v.indexOf(el.value.toString() + "\x00") > -1 || _v.indexOf("\x00" + el.name.toString() + "\x00") > -1);
				} else if (el.tagName == "SELECT") {
					//el.selectedIndex = -1;
					QZFL.object.each(el.options, function(e) {
						e.selected = e.nodeType == 1 && ("\x00" + _v.indexOf(e.value.toString() + "\x00") > -1 || _v.indexOf("\x00" + e.text.toString() + "\x00") > -1);
					});
				} else {
					el.value = value;
				}
			})

		} else {
			this.setAttr("value", value);
		}
		return this;
	},

	/**
	 * @param {} index
	 * @return {}
	 */
	getVal : function(/* @default 0 */index) {
		var _e = this.elements[index || 0],_v;

		if (_e) {
			if (_e.tagName == "SELECT"){
				_v = [];
				if (_e.selectedIndex<0) {
					return null;
				}

				//如果是单选框
				if (_e.type == "select-one") {
					_v.push(_e.value);
				}else{
					QZFL.object.each(_e.options,function(e){
						if (e.nodeType == 1 && e.selected) {
							_v.push(e.value);
						}
					});
				}
			}else{
				_v = _e.value;
			}
		} else {
			return null
		}
		return _v;
	},

	/**
	 * @param {} className
	 */
	hasClass : function(className) {
		if(this.elements && this.elements.length){
			return QZFL.css.hasClassName(this.elements[0], className);
		}
		return false;
	},

	/**
	 * @param {} className
	 */
	addClass : function(className) {
		return this.each(function(el) {
			QZFL.css.addClassName(el, className);
		})
	},

	/**
	 * @param {} className
	 */
	removeClass : function(className) {
		return this.each(function(el) {
			QZFL.css.removeClassName(el, className);
		})
	},

	/**
	 * @param {} className
	 */
	toggleClass : function(className) {
		return this.each(function(el) {
			QZFL.css.toggleClassName(el, className);
		})
	},

	/**
	 * @param {} index
	 * @return {}
	 */
	getSize : function(/* @default 0 */index) {
		var _e = this.elements[index || 0];
		return !!_e ? QZFL.dom.getSize(_e) : null;
	},

	/**
	 * @param {} index
	 * @return {}
	 */
	getXY : function(/* @default 0 */index) {
		var _e = this.elements[index || 0];
		return !!_e ? QZFL.dom.getXY(_e) : null;
	},

	/**
	 * @param {} width
	 * @param {} height
	 */
	setSize : function(width, height) {
		return this.each(function(el) {
			QZFL.dom.setSize(el, width, height);
		})
	},

	/**
	 * @param {} X
	 * @param {} Y
	 */
	setXY : function(X, Y) {
		return this.each(function(el) {
			QZFL.dom.setXY(el, X, Y);
		})
	},

	/**
	 *
	 */
	hide : function() {
		return this.each(function(el) {
			QZFL.dom.setStyle(el, "display", "none");
		})
	},

	/**
	 *
	 */
	show : function(isBlock) {
		return this.each(function(el) {
			QZFL.dom.setStyle(el, "display", isBlock?'block':'');
		})
	},

	/**
	 * @param {} key
	 * @return {}
	 */
	getStyle : function(key, index) {
		var _e = this.elements[index || 0];
		return !!_e ? QZFL.dom.getStyle(_e, key) : null;
	},

	/**
	 * @param {} key
	 * @param {} value
	 */
	setStyle : function(key, value) {
		return this.each(function(el) {
			QZFL.dom.setStyle(el, key, value);
		})
	},
	/**
	 * 设置dom的属性
	 *
	 * @param {string} key 属性名称
	 * @param {string} value 属性
	 */
	setAttr : function(key, value) {
		key = (key=="class"?"className":key);

		return this.each(function(el) {
			el[key] = value;
		});
	},

	/**
	 * 获取dom对象的属性
	 */
	getAttr : function(key, index) {
		key = key == "class" ? "className" : key;
		var node = this.elements[index || 0];
		return node ? (node[key] === undefined ? node.getAttribute(key) : node[key]) : null;
	}
});

// Extend Element relation
QZFL.element.extendFn(
/** @lends QZFL.ElementHandler.prototype */
{
	/**
	 * @return {}
	 */
	getPrev : function() {
		var _arr = [];
		this.each(function(el) {
			var _e = QZFL.dom.getPreviousSibling(el);
			//if (_e) {
				_arr.push(_e);
			//}
		});

		return QZFL.element.get(_arr);
	},

	/**
	 * @return {}
	 */
	getNext : function() {
		var _arr = [];
		this.each(function(el) {
			var _e = QZFL.dom.getNextSibling(el);
			//if (_e) {
				_arr.push(_e);
			//}
		});

		return QZFL.element.get(_arr);
	},

	/**
	 * @return {}
	 */
	getChildren : function() {
		var _arr = [];
		this.each(function(el) {
			var node = QZFL.dom.getFirstChild(el);
			while (node) {
				if (!!node && node.nodeType == 1) {
					_arr.push(node);
				}
				node = node.nextSibling;
			}
		});

		return QZFL.element.get(_arr);
	},

	/**
	 * @return {}
	 */
	getParent : function() {
		var _arr = [];
		this.each(function(el) {
			var _e = el.parentNode;
			//if (_e) {
				_arr.push(_e);
			//}
		});

		return QZFL.element.get(_arr);
	}
});

// Extend
QZFL.element.extendFn(
/** @lends QZFL.ElementHandler.prototype */
{

	/**
	 * @param {} tagName
	 * @param {} attributes
	 * @return {}
	 */
	create : function(tagName, attributes) {
		var _arr = [];
		this.each(function(el) {
			_arr.push(QZFL.dom.createElementIn(tagName, el, false, attributes));
		});
		return QZFL.element.get(_arr);
	},

	/**
	 * @param {} el
	 */
	appendTo : function(el) {
		var el = (el.elements && el.elements[0]) || QZFL.dom.get(el);
		return this.each(function(element) {
			el.appendChild(element)
		});
	},

	/**
	 * @param {} el
	 */
	insertAfter : function(el) {
		var el = (el.elements && el.elements[0]) || QZFL.dom.get(el), _ns = el.nextSibling, _p = el.parentNode;
		return this.each(function(element) {
			_p[!_ns ? "appendChild" : "insertBefore"](element, _ns);
		});

	},

	/**
	 * @param {} el
	 */
	insertBefore : function(el) {
		var el = (el.elements && el.elements[0]) || QZFL.dom.get(el), _p = el.parentNode;
		return this.each(function(element) {
			_p.insertBefore(element, el)
		});
	},

	/**
	 *
	 */
	remove : function() {
		return this.each(function(el) {
			QZFL.dom.removeElement(el);
		})
	}
});

/**
 * @fileoverview QZFL 函数队列系统，可以把一系列函数作为队列并且按顺序执行。在执行过程中函数出现的错误不会影响到下一个队列进程
 * @version 1.$Rev: 1921 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */

/**
 * 函数队列引擎
 *
 * @param {string} key 队列名称
 * @param {array} queue 队列函数数组
 * @example QZFL.queue("test",[function(){alert(d)},function(){alert(2)}]);
 * QZFL.queue.run("test");
 *
 * @namespace QZFL 队列引擎，给函数提供批量的队列执行方法
 * @return {Queue} 返回队列系统构造对象
 */
QZFL.queue = (function(){
	var _o = QZFL.object;
	var _queue = {};

	var _Queue = function(key,queue){
		if (this instanceof arguments.callee) {
			this._qz_queuekey = key;
			return this;
		}

		if (_o.getType(queue = queue || []) == "array"){
			_queue[key] = queue;
		}

		return new _Queue(key);
	};

	var _extend = /**@lends QZFL.queue*/{
		/**
		 * 往一个队列里插入一个新的函数
		 *
		 * @param {string|function} key 队列名称 当作为构造函数时则只需要直接传
		 * @param {function} fn 可执行的函数
		 * @example QZFL.queue("test");
		 * QZFL.queue.push("test",function(){alert("ok")});
		 * // 或者
		 * QZFL.queue("test").push(function(){alert("ok")});
		 */
		push : function(key,fn){
			fn = this._qz_queuekey?key:fn;
			_queue[this._qz_queuekey || key].push(fn);
		},

		/**
		 * 从队列里去除第一个函数，并且执行一次
		 *
		 * @param {string} key 队列名称
		 * @example	QZFL.queue("test",[function(){alert("ok")}]);
		 * QZFL.queue.shift("test");
		 * // 或者
		 * QZFL.queue("test",[function(){alert("ok")}]).shift();
		 * @return 返回第一个队列函数执行的结果
		 */
		shift : function(key) {
			var _q = _queue[this._qz_queuekey || key];
			if (_q) {
				return QZFL.queue._exec(_q.shift());
			}
		},

		/**
		 * 返回队列长度
		 * @param {string} key 队列名称
		 *
		 * @example QZFL.queue("test",[function(){alert("ok")}]);
		 * QZFL.queue.getLen("test");
		 *      // 或者
		 * QZFL.queue("test",[function(){alert("ok")}]).getLen();
		 *
		 * @return 返回第一个队列函数执行的结果
		 */
		getLen: function(key){
			return _queue[this._qz_queuekey || key].length;
		},

		/**
		 * 执行队列
		 *
		 * @param {string} key 队列名称
		 * @example QZFL.queue("test",[function(){alert("ok")}]);
		 * QZFL.queue.run("test");
		 * // 或者
		 * QZFL.queue("test",[function(){alert("ok")}]).run();
		 */
		run : function(key){
			var _q = _queue[this._qz_queuekey || key];
			if (_q) {
				_o.each(_q,QZFL.queue._exec);
			}
		},

		/**
		 * 分时执行队列
		 *
		 * @param {string} key 队列名称
		 * @param {object} conf 可选参数 默认值为{'run': 100, 'wait': 50};每次运行100ms,暂停50ms再继续运行队列,直至队列为空
		 * @example QZFL.queue("test",[function(){alert("1")},function(){alert("2")},function(){alert("3")}]);
		 * QZFL.queue.timedChunk("test", {'runTime': 1000, 'waitTime': 40, 'onRunEnd': function(){alert('allRuned');}, 'onWait': function(){alert('wait');}});
		 *
		 */
		timedChunk : function(key, conf){
			var _q = _queue[this._qz_queuekey || key], _conf;
			if (_q) {
				//合并用户传入的参数和默认参数
				_conf = QZFL.lang.propertieCopy(conf, QZFL.queue._tcCof, null, true);
				setTimeout(function(){
					var _start = +new Date();
					do {
						QZFL.queue.shift(key);
					} while (QZFL.queue.getLen(key) > 0 && (+new Date() - _start < _conf.runTime));

					if (QZFL.queue.getLen(key) > 0){
						setTimeout(arguments.callee, _conf.waitTime);
						_conf.onWait();
					} else {
						_conf.onRunEnd();
					}
				}, 0);
			}
		},

		/**
		 * 分时执行队列的默认参数
		 *
		 */
		_tcCof : {
				'runTime': 50, //每次队列运行时间
				'waitTime': 25, //暂停时间
				'onRunEnd': QZFL.emptyFn,//队列全部运行完毕触发的事件（只触发一次）
				'onWait': QZFL.emptyFn//每次暂停时触发的事件（触发多次，有可能为零次）
		},

		/**
		 *
		 */
		_exec : function(value,key,source){
			if (!value || _o.getType(value) != "function"){
				if (_o.getType(key) == "number") {
					source[key] = null;
				}
				return false;
			}

			try {
				return value();
			}catch(e){
				QZFL.console.print("QZFL Queue Got An Error: [" + e.name + "]  " + e.message,1)
			}
		}
	};

	_o.extend(_Queue.prototype,_extend);
	_o.extend(_Queue,_extend);

	return _Queue;
})();
/**
 * @fileoverview QZFL String 组件
 * @version 1.$Rev: 1392 $
 * @author QzoneWebGroup, ($LastChangedBy: zishunchen $)
 */
/**
 * @namespace QZFL String 封装接口。
 * @type
 */
QZFL.string = {
	RegExps: {
		trim: /^\s+|\s+$/g,
		ltrim: /^\s+/,
		rtrim: /\s+$/,
		nl2br: /\n/g,
		s2nb: /[\x20]{2}/g,
		URIencode: /[\x09\x0A\x0D\x20\x21-\x29\x2B\x2C\x2F\x3A-\x3F\x5B-\x5E\x60\x7B-\x7E]/g,
		escHTML: {
			re_amp: /&/g,
			re_lt : /</g,
			re_gt : />/g,
			re_apos : /\x27/g,
			re_quot : /\x22/g
		},
		
		escString: {
			bsls: /\\/g,
			nl: /\n/g,
			rt: /\r/g,
			tab: /\t/g
		},
		
		restXHTML: {
			re_amp: /&amp;/g,
			re_lt: /&lt;/g,
			re_gt: /&gt;/g,
			re_apos: /&(?:apos|#0?39);/g,
			re_quot: /&quot;/g
		},
		
		write: /\{(\d{1,2})(?:\:([xodQqb]))?\}/g,
		isURL : /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i,
		cut: /[\x00-\xFF]/,
		
		getRealLen: {
			r0: /[^\x00-\xFF]/g,
			r1: /[\x00-\xFF]/g
		},
		format: /\{([\d\w\.]+)\}/g
	},
	
	/**
	 * 通用替换
	 *
	 * @ignore
	 * @param {String} s 需要进行替换的字符串
	 * @param {String/RegExp} p 要替换的模式的 RegExp 对象
	 * @param {String} r 一个字符串值。规定了替换文本或生成替换文本的函数。
	 * @example
	 * 			QZFL.string.commonReplace(str + "", QZFL.string.RegExps.trim, '');
	 * @return {String} 处理结果
	 */
	commonReplace : function(s, p, r) {
		return s.replace(p, r);
	},
	
	/**
	 * 通用系列替换
	 *
	 * @ignore
	 * @param {String} s 需要进行替换的字符串
	 * @param {Object} l RegExp对象hashMap
	 * @example
	 * 			QZFL.string.listReplace(str,regHashmap);
	 * @return {String} 处理结果
	 */
	listReplace : function(s, l) {
		if (QZFL.lang.isHashMap(l)) {
			for (var i in l) {
				s = QZFL.string.commonReplace(s, l[i], i);
			}
			return s;
		} else {
			return s+'';
		}
	},
	
	/**
	 * 字符串前后去空格
	 *
	 * @param {String} str 目标字符串
	 * @example
	 * 			QZFL.string.trim(str);
	 * @return {String} 处理结果
	 */
	trim: function(str){
		return QZFL.string.commonReplace(str + "", QZFL.string.RegExps.trim, '');
	},
	
	/**
	 * 字符串前去空格
	 *
	 * @param {String} str 目标字符串
	 * @example
	 * 			QZFL.string.ltrim(str);
	 * @return {String} 处理结果
	 */
	ltrim: function(str){
		return QZFL.string.commonReplace(str + "", QZFL.string.RegExps.ltrim, '');
	},
	
	/**
	 * 字符串后去空格
	 *
	 * @param {String} str 目标字符串
	 * @example
	 * 			QZFL.string.rtrim(str);
	 * @return {String} 处理结果
	 */
	rtrim: function(str){
		return QZFL.string.commonReplace(str + "", QZFL.string.RegExps.rtrim, '');
	},
	
	/**
	 * 制造html中换行符
	 *
	 * @param {String} str 目标字符串
	 * @example
	 * 			QZFL.string.nl2br(str);
	 * @return {String} 结果
	 */
	nl2br: function(str){
		return QZFL.string.commonReplace(str + "", QZFL.string.RegExps.nl2br, '<br />');
	},
	
	/**
	 * 制造html中空格符，爽替换
	 *
	 * @param {String} str 目标字符串
	 * @example
	 * 			QZFL.string.s2nb(str);
	 * @return {String} 结果
	 */
	s2nb: function(str){
		return QZFL.string.commonReplace(str + "", QZFL.string.RegExps.s2nb, '&nbsp;&nbsp;');
	},
	
	/**
	 * 对非汉字做URIencode
	 *
	 * @param {String} str 目标字符串
	 * @example
	 * 			QZFL.string.URIencode(str);
	 * @return {String} 结果
	 */
	URIencode: function(str){
		var cc, ccc;
		return (str + "").replace(QZFL.string.RegExps.URIencode, function(a){
			if (a == "\x20") {
				return "+";
			} else if (a == "\x0D") {
				return "";
			}
			cc = a.charCodeAt(0);
			ccc = cc.toString(16);
			return "%" + ((cc < 16) ? ("0" + ccc) : ccc);
		});
	},
	
	/**
	 * htmlEscape
	 *
	 * @param {String} str 目标串
	 * @example
	 * 			QZFL.string.escHTML(str);
	 * @return {String} 结果
	 */
	escHTML: function(str){
		var t = QZFL.string.RegExps.escHTML;
		return QZFL.string.listReplace((str + ""), {
		/*
		 * '&' must be
		 * escape first
		 */
			'&amp;' : t.re_amp,
			'&lt;' : t.re_lt,
			'&gt;' : t.re_gt,
			'&#039;' : t.re_apos,
			'&quot;' : t.re_quot
		});
	},
	
	/**
	 * CstringEscape
	 *
	 * @param {String} str 目标串
	 * @return {String} 结果
	 */
	escString: function(str){
		var t = QZFL.string.RegExps.escString,
			h = QZFL.string.RegExps.escHTML;
		return QZFL.string.listReplace((str + ""), {
			/*
			 * '\' must be
			 * escape first
			 */
			'\\\\' : t.bsls,
			'\\n' : t.nl,
			'' : t.rt,
			'\\t' : t.tab,
			'\\\'' : h.re_apos,
			'\\"' : h.re_quot
		});
	},
	
	/**
	 * htmlEscape还原
	 *
	 * @param {String} str 目标串
	 * @return {String} 结果
	 */
	restHTML: function(str){
		if (!QZFL.string.restHTML.__utilDiv) {
			/**
			 * 工具DIV
			 *
			 * @ignore
			 */
			QZFL.string.restHTML.__utilDiv = document.createElement("div");
		}
		var t = QZFL.string.restHTML.__utilDiv;
		t.innerHTML = (str + "");
		if (typeof(t.innerText) != 'undefined') {
			return t.innerText;
		} else if (typeof(t.textContent) != 'undefined') {
			return t.textContent;
		} else if (typeof(t.text) != 'undefined') {
			return t.text;
		} else {
			return '';
		}
	},
	
	/**
	 * xhtmlEscape还原
	 *
	 * @param {String} str 目标串
	 * @return {String} 结果
	 */
	restXHTML: function(str){
		var t = QZFL.string.RegExps.restXHTML;
		return QZFL.string.listReplace((str + ""), {
			/*
			 * '&' must be
			 * escape last
			 */
			'<': t.re_lt,
			'>': t.re_gt,
			'\x27': t.re_apos,
			'\x22': t.re_quot,
			'&': t.re_amp
		});
	},
	
	/**
	 * 字符串格式输出工具
	 *
	 * @param {String} 输出模式
	 * @param {Arguments} Arguments... 可变参数，表示模式中占位符处实际要替换的值
	 * @return {String} 结果字符串
	 */
	write: function(strFormat, someArgs){
		if (arguments.length < 1 || !QZFL.lang.isString(strFormat)) {
			// rt.warn('No patern to write()');
			return '';
		}
		var rArr = QZFL.lang.arg2arr(arguments), result = rArr.shift(), tmp;
		
		return result.replace(QZFL.string.RegExps.write, function(a, b, c){
			b = parseInt(b, 10);
			if (b < 0 || (typeof rArr[b] == 'undefined')) {
				// rt.warn('write() wrong patern:{0:Q}', strFormat);
				return '(n/a)';
			} else {
				if (!c) {
					return rArr[b];
				} else {
					switch (c) {
						case 'x':
							return '0x' + rArr[b].toString(16);
						case 'o':
							return 'o' + rArr[b].toString(8);
						case 'd':
							return rArr[b].toString(10);
						case 'Q':
							return '\x22' + rArr[b].toString(16) + '\x22';
						case 'q':
							return '`' + rArr[b].toString(16) + '\x27';
						case 'b':
							return '<' + !!rArr[b] + '>';
					}
				}
			}
		});
	},
	
	/**
	 * 是否是一个可接受的URL串
	 *
	 * @param {String} s 目标串
	 * @return {Boolean} 结果
	 */
	isURL: function(s){
		return QZFL.string.RegExps.isURL.test(s);
	},
	
	/**
	 * 按指定编码重编字符串
	 *
	 * @param {String} s 源字符串
	 * @param {String} type 类型说明字
	 * @return {String} 结果字符串
	 */
	customEncode : function(s, type) {
		var r;
		if (typeof type == 'undefined') {
			type = '';
		}
		switch (type.toUpperCase()) {
			case "URICPT" :
				r = encodeURIComponent(s);
				break;
			default :
				r = encodeURIComponent(s);
		}
		return r;
	},
	
	/**
	 * 包装的escape函数
	 *
	 * @param {String} s 源字符串
	 * @return {String} 结果串
	 */
	escapeURI: function(s){
		if (window.encodeURIComponent) {
			return encodeURIComponent(s);
		}
		if (window.escape) {
			return escape(s);
		}
		return '';
	},
	
	/**
	 * 用指定字符补足需要的数字位数
	 *
	 * @param {String} s 源字符串
	 * @param {Number} l 长度
	 * @param {String} [ss="0"] 指定字符
	 * @param {Boolean} [isBack=false] 补足的方向: true 后方; false 前方;
	 * @return {String} 返回的结果串
	 */
	fillLength: function(source, length, ch, isRight){
		if ((source = String(source)).length < length) {
			var ar = new Array(length - source.length);
			ar[isRight ? 'unshift' : 'push'](source);
			source = ar.join(ch == undefined ? '0' : ch);
		}
		return source;
	},
	/**
	 * 用制定长度切割给定字符串
	 *
	 * @param {String} s 源字符串
	 * @param {Number} bl 期望长度(字节长度)
	 * @param {String} tails 增加在最后的修饰串,比如"..."
	 * @return {String} 结果串
	 */
	cut: function(str, bitLen, tails){
		str = String(str);
		bitLen -= 0;
		tails = tails || '';
		if (isNaN(bitLen)) {
			return str;
		}
		var len = str.length, i = Math.min(Math.floor(bitLen / 2), len), cnt = QZFL.string.getRealLen(str.slice(0, i));
		for (; i < len && cnt < bitLen; i++) {
			cnt += 1 + (str.charAt(i) > 255);
		}
		return str.slice(0, cnt > bitLen ? i - 1 : i) + (i < len ? tails : '');
	},
	
	/**
	 * 计算字符串的真实长度
	 *
	 * @param {String} s 源字符串
	 * @param {Boolean} [isUTF8=false] 标示是否是utf-8计算
	 * @return {Number} 结果长度
	 */
	getRealLen: function(s, isUTF8){
		if (typeof(s) != 'string') {
			return 0;
		}
		
		if (!isUTF8) {
			return s.replace(QZFL.string.RegExps.getRealLen.r0, "**").length;
		} else {
			var cc = s.replace(QZFL.string.RegExps.getRealLen.r1, "");
			return (s.length - cc.length) + (encodeURI(cc).length / 3);
		}
	},
	format: function(str){
		var args = Array.prototype.slice.call(arguments), v;
		str = args.shift() + '';
		if (args.length == 1 && typeof(args[0]) == 'object') {
			args = args[0];
		}
		QZFL.string.RegExps.format.lastIndex = 0;
		return str.replace(QZFL.string.RegExps.format, function(m, n){
			v = QZFL.object.route(args, n);
			return v === undefined ? m : v;
		});
	}
};


/**
 * @fileoverview QZFL 通用接口核心库
 * @version 1.$Rev: 1392 $
 * @author QzoneWebGroup, ($LastChangedBy: zishunchen $)
 * @lastUpdate $Date: 2009-08-05 16:26:13 +0800 (Wed, 05 Aug 2009) $
 */

/**
 * 通用扩展接口
 *
 * @namespace 通用扩展接口
 */
QZFL.util = {
	/**
	 * 使用一个uri串制作一个类似location的对象
	 *
	 * @param {String} s 所需字符串
	 *
	 * @return QZFL.util.URI
	 * @see QZFL.util.URI
	 */
	buildUri : function(s) {
		return new QZFL.util.URI(s);
	},

	/**
	 * 使用一个uri串制作一个类似location的对象
	 *
	 * @param {String} s 所需字符串
	 * @class URI 引擎，可以把一个uri字符串转换成类似location的对象
	 * @constructor
	 */
	URI : function(s) {
		/*
		if ('string' == typeof(s)) {
			var pn = location.pathname, tail, arr;
			if (s.indexOf("://") < 1) {
				s = this.href = [this.protocol = location.protocol, '//', this.host = location.host, tail = s.indexOf("/") == 0 ? "" : pn.substr(0, pn.lastIndexOf("/") + 1) + s].join('');
			} else {
				arr = (this.href = s).split("://");
				if (!/^[a-z]+$/i.test(arr[0])) {
					return null;
				}
				this.protocol = arr[0].toLowerCase();
				arr = arr[1].split("/");
				this.host = arr.shift();
				tail = '/' + arr.join('/');
			}
			arr = this.host.split(':');
			this.hostname = arr.length > 1 ? arr[0] : this.host;
			this.port = arr.length > 1 && arr[1] - 80 ? (arr[1] - 0) : '';
			arr = tail.split('#');
			this.hash = arr[1] ? ('#' + arr[1]) : '';
			arr = arr[0].split('?');
			this.search = arr[1] ? ('?' + arr[1]) : '';
			this.pathname = arr[0] || '/';
		}
		return null;
		*/
		
		if (!(QZFL.object.getType(s) == "string")) {
			return null;
		}
		if (s.indexOf("://") < 1) {
			s = location.protocol + "//" + location.host + (s.indexOf("/") == 0 ? "" : location.pathname.substr(0, location.pathname.lastIndexOf("/") + 1)) + s;
		}
		var depart = s.split("://");
		if (QZFL.object.getType(depart) == "array" && depart.length > 1 && (/^[a-zA-Z]+$/).test(depart[0])) {
			this.protocol = depart[0].toLowerCase();
			var h = depart[1].split("/");
			if (QZFL.object.getType(h) == "array") {
				this.host = h[0];
				this.pathname = "/" + h.slice(1).join("/").replace(/(\?|\#).+/i, ""); // 修正pathname的返回错误
				this.href = s;
				var se = depart[1].lastIndexOf("?"), ha = depart[1].lastIndexOf("#");
				this.search = (se >= 0) ? depart[1].substring(se) : "";
				this.hash = (ha >= 0) ? depart[1].substring(ha) : "";
				if (this.search.length > 0 && this.hash.length > 0) {
					if (ha < se) {
						this.search = "";
					} else {
						this.search = depart[1].substring(se, ha);
					}
				}
				return this;
			} else {
				return null;
			}
		} else {
			return null;
		}
	}
};
/**
 * @fileoverview Qzone TWEEN类，主要负责参数计算以实现动画效果
 * @version 1.$Rev: 1710 $
 * @author QzoneWebGroup, ($LastChangedBy: scorpionxu $)
 * @lastUpdate $Date: 2010-03-31 10:54:40 +0800 (周三, 31 三月 2010) $
 * @requires QZFL.css
 * @requires QZFL.transitions
 */

/**
 * Qzone TWEEN类，一般用于动画表现效果奇怪了
 * @namespace QZFL.Tween
 * @param {HTMLElement} el html
 * @param {string} property 对象的属性名
 * @param {function} func 算子函数
 * @param {string|number} startValue 初始值
 * @param {string|number} finishValue 结束值
 * @param {number} duration 动画存活时间, 秒单位
 * @constructor
 * @example
 * 			var tw = new QZFL.Tween(QZFL.dom.get("bar"),"width",null,"1px","300px",1);
 * 			tw.start();
 */
QZFL.Tween = function(el, property, func, startValue, finishValue, duration) {
	this._func = func || QZFL.transitions.simple;
	this._obj = QZFL.dom.get(el);

	// 判断是否是颜色值
	this.isColor = /^#/.test(startValue);

	this._prop = property;

	var reSuffix = /\d+([a-z%]+)/i.exec(startValue);

	this._suffix = reSuffix ? reSuffix[1] : "";

	this._startValue = this.isColor ? 0 : parseFloat(startValue);
	this._finishValue = this.isColor ? 100 : parseFloat(finishValue);

	// 颜色过渡处理
	if (this.isColor) {
		// 把16进制的颜色转换成10进制
		this._startColor = QZFL.css.convertHexColor(startValue);
		this._finishColor = QZFL.css.convertHexColor(finishValue);
	}

	this._duration = duration || 10;

	this._timeCount = 0;
	this._startTime = 0;

	this._changeValue = this._finishValue - this._startValue;
	this.currentValue = 0;

	/**
	 * 是否正在播放
	 */
	this.isPlayed = false;

	/**
	 * 是否循环
	 */
	this.isLoop = false;

	/**
	 * 动画开始
	 *
	 * @event 动画开始
	 */
	this.onMotionStart = QZFL.emptyFn;

	/**
	 * 动画执行中
	 *
	 * @param {object} obj 对象
	 * @param {string} prop 对象属性
	 * @param {string|number} value 结算结果
	 * @event 动画执行中
	 */
	this.onMotionChange = QZFL.emptyFn;

	/**
	 * 动画停止播放
	 *
	 * @event 动画停止播放
	 */
	this.onMotionStop = QZFL.emptyFn;
};

/**
 * 开始播放Tween类动画
 *
 * @param {bool} loop 是否循环
 * @return 空
 */
QZFL.Tween.prototype.start = function(loop) {
	this._reloadTimer();
	this.isPlayed = true;
	this._runTime();
	this.isLoop = loop ? true : false;
	this.onMotionStart.apply(this);
	return "d"
};

/**
 * 暂停动画
 */
QZFL.Tween.prototype.pause = function() {
	this.isPlayed = false;
};

/**
 * 停止动画
 */
QZFL.Tween.prototype.stop = function() {
	this.isPlayed = false;
	this._playTime(this._duration + 0.1);
};

/**
 * 初始化开始时间
 */
QZFL.Tween.prototype._reloadTimer = function() {
	this._startTime = new Date().getTime() - this._timeCount * 1000;
};

/**
 * 通过时间计算动画
 *
 * @param {time} time 时间参数
 */
QZFL.Tween.prototype._playTime = function(time) {
	var _isEnd = false;
	if (time > this._duration) {
		time = this._duration;
		_isEnd = true;
	}

	// 计算属性值
	var pValue = this._func(time, this._startValue, this._changeValue, this._duration);

	// 判断是否需要取整
	this.currentValue = /(opacity)|(zoom)/i.test(this._prop) ? pValue : ( /(transform)/i.test(this._prop) ? "scale("+pValue+")" : Math.round(pValue));

	// 是否需要处理颜色
	if (this.isColor) {
		this.currentValue = QZFL.Tween.getColor(this._startColor, this._finishColor, pValue);
	}

	var _try2setCSS = QZFL.dom.setStyle(this._obj, this._prop, this.currentValue + this._suffix);
	if (!_try2setCSS) {
		this._obj[this._prop] = this.currentValue + this._suffix;
	}

	this.onMotionChange.apply(this, [this._obj, this._prop, this.currentValue]);

	// 判断是否播放结束
	if (_isEnd) {
		this.isPlayed = false;
		// 循环播放
		if (this.isLoop) {
			this.isPlayed = true;
			this._reloadTimer();
		}
		this.onMotionStop.apply(this);

		// 播放完成强迫IE回收内存
		if (window.CollectGarbage){
			CollectGarbage();
		}
	}
};

/**
 * 开始计时
 */
QZFL.Tween.prototype._runTime = function() {
	var o = this;
	if (o.isPlayed) {
		o._playTime((new Date().getTime() - this._startTime) / 1000);
		setTimeout(function() {
			o._runTime.apply(o, [])
		}, 0);
	}
};

/**
 * 获得动画播放百分比
 *
 * @return 返回百分比数值
 */
QZFL.Tween.prototype.getPercent = function() {
	return (this.currentValue - this._startValue) / this._changeValue * 100;
};

/**
 * 交换初始值和结束值
 */
QZFL.Tween.prototype.swapValue = function() {
	if (this.isColor) {
		var tempValue = this._startColor.join(",");
		this._startColor = this._finishColor;
		this._finishColor = tempValue.split(",");
	} else {
		var tempValue = this._startValue;
		this._startValue = this._finishValue;
		this._finishValue = tempValue;
		this._changeValue = this._finishValue - this._startValue;
	}
};

/**
 * 根据百分比计算颜色过渡值
 *
 * @param {array|string} startColor 初始颜色值10进制 RGB 格式
 * @param {array|string} finishColor 目标颜色值10进制 RGB 格式
 * @param {number} percent 百分比
 * @return 返回16进制颜色
 */
QZFL.Tween.getColor = function(startColor, finishColor, percent) {
	var _sc = startColor,
		_fc = finishColor,
		_color = [];

	if (percent > 100) {
		percent = 100;
	}
	if (percent < 0) {
		percent = 0;
	}

	for (var i = 0; i < 3; i++) {
		_color[i] = Math.floor(_sc[i] * 1 + (percent / 100) * (_fc[i] - _sc[i])).toString(16);
		if (_color[i].length < 2) {
			_color[i] = "0" + _color[i];
		}
	}

	return "#" + _color.join("");
};

/**
 * 给tween类提供更多的动画算法
 *
 * @namespace QZFL.transitions
 */
QZFL.transitions = {
	/**
	 * 简单算子，作为默认算子
	 */
	simple : function(time, startValue, changeValue, duration) {
		return changeValue * time / duration + startValue;
	},

	/**
	 * 有规律地渐进效果
	 */
	regularEaseIn : function(t, b, c, d) {
		return c * (t /= d) * t + b;
	},
	/**
	 * 有规律地渐出效果
	 */
	regularEaseOut : function(t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},
	/**
	 * 有规律地渐进渐出效果
	 */
	regularEaseInOut : function(t, b, c, d) {
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	}
};

/**
 * @fileoverview 把tween类的接口封装到QZFL Elements
 * @version 1.$Rev: 1723 $
 * @author QzoneWebGroup
 * @lastUpdate $Date: 2010-04-08 19:26:57 +0800 (周四, 08 四月 2010) $
 */
;(function() {
	/**
	 * resize和move的算法
	 */
	var _easeAnimate = function(_t, a1, a2, ease) {
		var _s = QZFL.dom["get" + _t](this), _reset = typeof a1 != "number" && typeof a2 != "number";

		if (_t == "Size" && _reset) {
			QZFL.dom["set" + _t](this, a1, a2);
			var _s1 = QZFL.dom["get" + _t](this);
			a1 = _s1[0];
			a2 = _s1[1];
		}

		var _v1 = _s[0] - a1;
		var _v2 = _s[1] - a2;

		var n = new QZFL.Tween(this, "_p", QZFL.transitions[ease] || QZFL.transitions.regularEaseOut, 0, 100, 0.5);

		n.onMotionChange = QZFL.event.bind(this, function() {
			var _p = arguments[2];
			QZFL.dom["set" + _t](this, typeof a1 != "number" ? _s[0] : (_s[0] - _p / 100 * _v1), typeof a2 != "number" ? _s[1] : (_s[1] - _p / 100 * _v2));
		});

		// reset size to auto
		if (_t == "Size" && _reset) {
			n.onMotionStop = QZFL.event.bind(this, function() {

				QZFL.dom["set" + _t](this);

			});
		}

		n.start();
	};

	var _easeShowAnimate = function(_t, ease) {
		var n = new QZFL.Tween(this, "opacity", QZFL.transitions[ease] || QZFL.transitions.regularEaseOut, (_t ? 0 : 1), (_t ? 1 : 0), 0.5);
		n[_t ? "onMotionStart" : "onMotionStop"] = QZFL.event.bind(this, function() {
			this.style.display = _t ? "" : "none";
			QZFL.dom.setStyle(this, "opacity", 1);
		});
		n.start();
	};

	var _easeScroll = function(top, left, ease) {
		if (this.nodeType == 9) {
			var _stl = [
						QZFL.dom.getScrollTop(this),
						QZFL.dom.getScrollLeft(this)];
		} else {
			var _stl = [this.scrollTop, this.scrollLeft];
		}

		var _st = _stl[0] - top;
		var _sl = _stl[1] - left;

		var n = new QZFL.Tween(this, "_p", QZFL.transitions[ease] || QZFL.transitions.regularEaseOut, 0, 100, 0.5);
		n.onMotionChange = QZFL.event.bind(this, function() {
			var _p = arguments[2], _t = (_stl[0] - _p / 100 * _st), _l = (_stl[1] - _p / 100 * _sl);

			if (this.nodeType == 9) {
				QZFL.dom.setScrollTop(_t, this);
				QZFL.dom.setScrollLeft(_l, this);
			} else {
				this.scrollTop = _t;
				this.scrollLeft = _l;
			}
		});
		n.start();
	};

	QZFL.element.extendFn({
		tween : function(){
			
		},
		
		/**
		 * 渐变显示
		 * @param {string} effect 转换效果,目前只支持"resize"
		 * @param {string} ease 动画效果
		 * @example $e(document).effectShow();
		 */
		
		effectShow : function(effect, ease) {
			this.each(function(el) {
				_easeShowAnimate.apply(el, [true, ease])
			});
			if (effect == "resize") {
				this.each(function(el) {
					_easeAnimate.apply(el, ["Size", null, null, ease])
				});
			}
		},
		/**
		 * 渐变隐藏
		 * @param {string} effect 转换效果,目前只支持"resize"
		 * @param {string} ease 动画效果
		 * @example $e(document).effectHide();
		 */
		effectHide : function(effect, ease) {
			this.each(function(el) {
				_easeShowAnimate.apply(el, [false, ease])
			});
			if (effect == "resize") {
				this.each(function(el) {
					_easeAnimate.apply(el, ["Size", 0, 0, ease])
				});
			}
		},
		/**
		 * 改变尺寸
		 * @param {number} width 宽度
		 * @param {number} height 高度
		 * @param {string} ease 动画效果
		 * @example $e(document).effectResize(200,200);
		 */
		effectResize : function(width, height, ease) {
			this.each(function(el) {
				_easeAnimate.apply(el, ["Size", width, height, ease])
			});
		},
		/**
		 * 改变位置
		 * @param {number} x x坐标
		 * @param {number} y y坐标
		 * @param {string} ease 动画效果
		 * @example $e(document).effectMove(200,200);
		 */
		effectMove : function(x, y, ease) {
			this.each(function(el) {
				_easeAnimate.apply(el, ["XY", x, y, ease])
			});
		},
		/**
		 * 滚动条滑动
		 * @param {number} top 纵向距离
		 * @param {number} left 横向距离
		 * @param {string} ease 动画效果
		 * @example $e(document).effectScroll(200);
		 */
		effectScroll : function(top, left, ease) {
			this.each(function(el) {
				_easeScroll.apply(el, [top, left, ease])
			});
		}
		// ,
		//
		// effectNotify : function(ease) {
		// this.each(function() {
		// var _c = QZFL.dom.getStyle(this,"backgroundColor");
		// var n = new QZFL.Tween(this, "backgroundColor",
		// QZFL.transitions[ease] || QZFL.transitions.regularEaseOut, "#ffffff",
		// "#ffff00", 0.8);
		//
		// n.onMotionStop = QZFL.event.bind(this,function(){
		// var o = this;
		// setTimeout(function(){
		// var n = new QZFL.Tween(o, "backgroundColor", QZFL.transitions[ease]
		// || QZFL.transitions.regularEaseOut, "#ffff00", "#ffffff", 1);
		// n.onMotionStop = function(){
		// o.style.backgroundColor = "transparent";
		// }
		// n.start();
		// },1000)
		// });
		// n.start();
		// });
		// }
	})
})();
/**
 * @fileoverview QZFL AJAX类
 * @version 1.$Rev: 1924 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:52:16 +0800 (周二, 11 一月 2011) $
 */

/**
 * XMLHttpRequest通信器类
 *
 * @class QZFL.XHR
 * @constructor
 * @namespace QZFL.XHR
 * @param {String} actionURI 请求地址
 * @param {String} [cname] 对象实体的索引名，默认是"_xhrInstence_n"，n为序号
 * @param {String} [method] 发送方式，除非指明get，否则全部为post
 * @param {Object} [data] hashTable形式的字典
 * @param {Boolean} [isAsync] 是否异步，除非指明同步false,否则全部为异步true
 */
QZFL.XHR = function(actionURL, cname, method, data, isAsync, nocache) {
	/*if (!QZFL.string.isURL(actionURL)) {
		rt.error("error actionURL -> {0:Q} in QZFL.XHR construct!", actionURL);
		return null;
	}*/
	if (!cname) {
		cname = "_xhrInstence_" + (QZFL.XHR.counter + 1);
	}
	/**
	 * 辅助原型
	 *
	 * @type {QZFL.XHR}
	 */
	var prot;
	if (QZFL.XHR.instance[cname] instanceof QZFL.XHR) {
		prot = QZFL.XHR.instance[cname];
	} else {
		prot = (QZFL.XHR.instance[cname] = this);
		QZFL.XHR.counter++;
	}
	prot._name = cname;
	prot._nc = !!nocache;
	prot._method = (QZFL.object.getType(method) != "string" || method.toUpperCase() != "GET")
			? "POST"
			: (method = "GET");
	prot._isAsync = (!(isAsync === false)) ? true : isAsync;
	prot._uri = actionURL;
	prot._data = (QZFL.object.getType(data) == "object" || QZFL.object.getType(data) == 'string') ? data : {};
	prot._sender = null;
	prot._isHeaderSetted = false;
	prot._xmlQueue = QZFL.queue("xhr" + cname,[function() {
		return new XMLHttpRequest();
	}, function() {
		return new ActiveXObject("Msxml2.XMLHTTP");
	}, function() {
		return new ActiveXObject("Microsoft.XMLHTTP");
	}]);

	// 对外的接口
	/**
	 * 当成功回调时,跨域请求和同域请求返回的数据不一样
	 *
	 * @event
	 * @memberOf QZFL.XHR
	 */
	this.onSuccess = QZFL.emptyFn;

	/**
	 * 当错误回调时,跨域请求和同域请求返回的数据不一样
	 *
	 * @event
	 * @memberOf QZFL.XHR
	 */
	this.onError = QZFL.emptyFn;

	/**
	 * 使用的编码
	 *
	 * @memberOf QZFL.XHR
	 * @type string
	 */
	this.charset = "gb2312";

	/**
	 * 参数化proxy的路径
	 * @type string
	 */
	this.proxyPath = "";



	return prot;
};

QZFL.XHR.instance = {};
QZFL.XHR.counter = 0;
QZFL.XHR._errCodeMap = {
	400 : {
		msg : 'Bad Request'
	},
	401 : {
		msg : 'Unauthorized'
	},
	403 : {
		msg : 'Forbidden'
	},
	404 : {
		msg : 'Not Found'
	},
	999 : {
		msg : 'Proxy page error'
	},
	1000 : {
		msg : 'Bad Response'
	},
	1001 : {
		msg : 'No Network'
	},
	1002 : {
		msg : 'No Data'
	},
	1003 : {
		msg : 'Eval Error'
	}
};

/**
 * 跨域发送请求
 *
 * @private
 * @return {Boolean} 是否成功
 */
QZFL.XHR.xsend = function(o, uri) {
	if (!(o instanceof QZFL.XHR)) {
		return false;
	}

	if (QZFL.userAgent.firefox && QZFL.userAgent.firefox < 3) {
		//QZFL.runTime.error("can't surport xsite in firefox!");
		return false;
	}

	function clear(obj) {
		try {
			obj._sender = obj._sender.callback = obj._sender.errorCallback = obj._sender.onreadystatechange = null;
		} catch (ignore) {
		}

		if (QZFL.userAgent.safari || QZFL.userAgent.opera) {
			setTimeout('QZFL.dom.removeElement($("_xsend_frm_' + obj._name + '"))', 50);
		} else {
			QZFL.dom.removeElement($("_xsend_frm_" + obj._name));
		}
	}

	if (o._sender === null || o._sender === void(0)) {
		var sender = document.createElement("iframe");
		sender.id = "_xsend_frm_" + o._name;
		sender.style.width = sender.style.height = sender.style.borderWidth = "0";
		document.body.appendChild(sender);
		sender.callback = QZFL.event.bind(o, function(data) {
					o.onSuccess(data);
					clear(o);
				});
		sender.errorCallback = QZFL.event.bind(o, function(num) {
					o.onError(QZFL.XHR._errCodeMap[num]);
					clear(o);
				});

		o._sender = sender;
	}
	// 获取proxy页面中js库的位置
	var tmp = QZFL.config.gbEncoderPath;
	o.GBEncoderPath = tmp ? tmp : "";

	o._sender.src = uri.protocol + "://" + uri.host + (this.proxyPath
			? this.proxyPath
			: "/xhr_proxy_gbk.html");
	return true;
};


QZFL.XHR.genHttpParamString = function(o, cs){
	cs = (cs || "gb2312").toLowerCase();
	var r = [];

	for (var i in o) {
		r.push(i + "=" + ((cs == "utf-8") ? encodeURIComponent(o[i]) : QZFL.string.URIencode(o[i])));
	}

	return r.join("&");
};


/**
 * 发送请求
 *
 * @return {Boolean} 是否成功
 */
QZFL.XHR.prototype.send = function() {
	if (this._method == 'POST' && this._data == null) {
		//QZFL.runTime.warn("QZFL.XHR -> {0:q}, can't send data 'null'!", this._name);
		return false;
	}

	var u = new QZFL.util.URI(this._uri);
	if (u == null) {
		//QZFL.runTime.warn("QZFL.XHR -> {0:q}, bad url", this._name);
		return false;
	}

	this._uri = u.href;

	if(QZFL.object.getType(this._data)=="object"){
		this._data = QZFL.XHR.genHttpParamString(this._data, this.charset);
	}

	if(this._method == 'GET' && this._data){
		this._uri += (this._uri.indexOf("?") < 0 ? "?"  : "&") +  this._data;
	}

	//判断是否需要跨域请求数据
	if (u.host != location.host) {
		return QZFL.XHR.xsend(this, u);
	}

	if (this._sender === null || this._sender === void(0)) {

		var sender = (function (){
			if (!this._xmlQueue.getLen()) {
				return null;
			}

			var _xhr = this._xmlQueue.shift();
			if (_xhr) {
				return _xhr;
			}else{
				return arguments.callee.call(this);
			}
		}).call(this);

		if (!sender) {
			//QZFL.runTime.error("QZFL.XHR -> {0:q}, create xhr object faild!", this._name);
			return false;
		}
		this._sender = sender;
	}

	try {
		this._sender.open(this._method, this._uri, this._isAsync);
	} catch (err) {
		//QZFL.runTime.error("exception when opening connection to {0:q}:{1}", this._uri,err);
		return false;
	}

	if (this._method == 'POST' && !this._isHeaderSetted) {
		this._sender.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		this._isHeaderSetted = true;
	}

	if (this._nc) {
		this._sender.setRequestHeader('If-Modified-Since', 'Thu, 1 Jan 1970 00:00:00 GMT');
		this._sender.setRequestHeader('Cache-Control', 'no-cache');
	}

	this._sender.onreadystatechange = QZFL.event.bind(this, function() {
		try {
			if (this._sender.readyState == 4) {
				if (this._sender.status >= 200 && this._sender.status < 300) {
					this.onSuccess({
						text : this._sender.responseText,
						xmlDom : this._sender.responseXML
					});
				} else {
					if (QZFL.userAgent.safari && (QZFL.object.getType(this._sender.status) == 'undefined')) {
						this.onError(QZFL.XHR._errCodeMap[1002]);
					} else {
						this.onError(QZFL.XHR._errCodeMap[this._sender.status]);
					}
				}
				delete this._sender;
				this._sender = null;
			}
		} catch (err) {
			//QZFL.runTime.error("unknow exception in QZFL.XHR.prototype.send()");
		}
	});

	this._sender.send((this._method == 'POST' ? this._data : void(0)));
	return true;
};

/**
 * QZFL.XHR对象自毁方法，用法 ins=ins.destroy();
 *
 * @return {Object} null用来复写引用本身
 */
//这个消毁方法没有使用啊，幸好！ ryan
//QZFL.XHR.counter的使用有问题，如果是当ID来用的，就不能--，如果是计数来用的，就不能做为frame的id
//否则可能导致请求丢掉
QZFL.XHR.prototype.destroy = function() {
	var n = this._name;
	delete QZFL.XHR.instance[n]._sender;
	QZFL.XHR.instance[n]._sender = null;
	delete QZFL.XHR.instance[n];
	QZFL.XHR.counter--;
	return null;
};

/**
 * @fileoverview QZFL Form Submit Class
 * @version 1.$Rev: 1897 $
 * @author QzoneWebGroup, ($LastChangedBy: scorpionxu $)
 * @lastUpdate $Date: 2010-12-27 20:59:34 +0800 (周一, 27 十二月 2010) $
 */

/**
 * FormSender通信器类,建议写操作使用
 *
 * @param {String} actionURL 请求地址
 * @param {String} [method] 发送方式，除非指明get，否则全部为post
 * @param {Object} [data] hashTable形式的字典
 * @param {String} [charset="gb2312"] 于后台数据交互的字符集
 * @constructor
 * @namespace QZFL.FormSender
 *
 * cgi返回模板: <html><head><meta http-equiv="Content-Type" content="text/html;
 * charset=gb2312" /></head> <body><script type="text/javascript">
 * document.domain="qq.com"; frameElement.callback({JSON:"Data"}); </script></body></html>
 * @example
 * 		var fs = new QZFL.FormSender(APPLY_ENTRY_RIGHT,"post",{"hUin": getParameter("uin"),"vUin":checkLogin(),"msg":$("msg-area").value, "rd": Math.random()}, "utf-8");
 *		fs.onSuccess = function(re) {};
 *		fs.onError = function() {};
 *		fs.send();
 *
 */
QZFL.FormSender = function(actionURL, method, data, charset) {
/*	if (!QZFL.string.isURL(actionURL)) {
		rt.error("error actionURL -> {0:Q} in QZFL.FormSender construct!",
				actionURL);
		return null;
	}*/

	/**
	 * form的名称，默认为 _fpInstence_ + 计数
	 *
	 * @type string
	 */
	this.name = "_fpInstence_" + QZFL.FormSender.counter;
	QZFL.FormSender.instance[this.name] = this;
	QZFL.FormSender.counter++;

	/**
	 * 数据发送方式
	 *
	 * @type string
	 */
	this.method = method || "POST";

	/**
	 * 数据请求地址
	 *
	 * @type string
	 */
	this.uri = actionURL;

	/**
	 * 数据参数表
	 *
	 * @type object
	 */
	this.data = (typeof(data) == "object" || typeof(data) == 'string') ? data : null;
	this.proxyURL = (typeof(charset) == 'string' && charset.toUpperCase() == "UTF-8")
			? QZFL.config.FSHelperPage.replace(/_gbk/, "_utf8")
			: QZFL.config.FSHelperPage;

	this._sender = null;

	/**
	 * 服务器正确响应时的处理
	 *
	 * @event
	 */
	this.onSuccess = QZFL.emptyFn;

	/**
	 * 服务器无响应或预定的不正常响应处理
	 *
	 * @event
	 */
	this.onError = QZFL.emptyFn;
};

QZFL.FormSender.instance = {};
QZFL.FormSender.counter = 0;

QZFL.FormSender._errCodeMap = {
	999 : {
		msg : 'Connection or Server error'
	}
};



QZFL.FormSender.pluginsPool = {
	"formHandler" : []
};

QZFL.FormSender._pluginsRunner = function(pType, data){
	var _s = QZFL.FormSender,
		l = _s.pluginsPool[pType],
		t = data,
		len;

	if(l && (len = l.length)){
		for(var i = 0; i < len; ++i){
			if(typeof(l[i]) == "function"){
				t = l[i](t);
			}
		}
	}

	return t;
};



/**
 * 发送请求
 *
 * @return {Boolean} 是否成功
 */
QZFL.FormSender.prototype.send = function() {
	if (this.method == 'POST' && this.data == null) {
	//	rt.warn("QZFL.FormSender -> {0:q}, can't send data 'null'!", this.name);
		return false;
	}

	function clear(o) {
		o._sender = o._sender.callback = o._sender.errorCallback = o._sender.onreadystatechange = null;
		if (QZFL.userAgent.safari || QZFL.userAgent.opera) {
			setTimeout('QZFL.dom.removeElement(document.getElementById("_fp_frm_' + o.name + '"))', 50);
		} else {
			QZFL.dom.removeElement(document.getElementById("_fp_frm_" + o.name));
		}
	}

	if (this._sender === null || this._sender === void(0)) {
		var sender = document.createElement("iframe");
		sender.id = "_fp_frm_" + this.name;
		sender.style.cssText = "width:0;height:0;border-width:0;display:none;";
	//	sender.style.width = sender.style.height = sender.style.borderWidth = "0";
	//	sender.style.display = "none";
		document.body.appendChild(sender);

		sender.callback = QZFL.event.bind(this, function(o) {
					clearTimeout(timer);
					this.onSuccess(o);
					clear(this);
				});
		sender.errorCallback = QZFL.event.bind(this, function(o) {
					clearTimeout(timer);
					this.onError(o);
					clear(this);
				});

		if (typeof(sender.onreadystatechange) != 'undefined') {
			sender.onreadystatechange = QZFL.event.bind(this, function() {
				if (this._sender.readyState == 'complete' && this._sender.submited) {
					clear(this);
					this.onError(QZFL.FormSender._errCodeMap[999]);
				}
			});
		} else {
			var timer = setTimeout(QZFL.event.bind(this, function() {
					try {
						var _t = this._sender.contentWindow.location.href;
						if (_t.indexOf(this.uri) == 0) {
							clearTimeout(timer);
							clear(this);
							this.onError(QZFL.FormSender._errCodeMap[999]);
						}
					} catch (err) {
						clearTimeout(timer);
						clear(this);
						this.onError(QZFL.FormSender._errCodeMap[999]);
					}
				}), 200);
		}

		this._sender = sender;
	}

	this._sender.src = this.proxyURL;
	return true;
};

/**
 * QZFL.FormSender对象自毁方法，用法 ins=ins.destroy();
 *
 * @return {Object} null用来复写引用本身
 */
QZFL.FormSender.prototype.destroy = function() {
	var n = this.name;
	delete QZFL.FormSender.instance[n]._sender;
	QZFL.FormSender.instance[n]._sender = null;
	delete QZFL.FormSender.instance[n];
	QZFL.FormSender.counter--;
	return null;
};

/* by ryan
(function(){
	QZFL.FormSender = function(actionURL, method, data, charset){
		this.uri = actionURL;
		this.method = method || "POST";
		this.data = typeof(data) == "object" ? data : typeof(data) == 'string' ? QZFL.util.commonDictionarySplit(data, "&") : null;
		this.proxyURL = String(charset).toUpperCase() == "UTF-8" ? QZFL.config.FSHelperPage.replace(/_gbk/, "_utf8") : QZFL.config.FSHelperPage;
		this._sender = null;
		this.onSuccess = this.onError = QZFL.emptyFn;
	};
	QZFL.FormSender.prototype = {
		send: function(){
			if (this.method == 'POST' && this.data == null) {
				return false;
			}
			var sender = this.sender = new QZFL.SenderManager();
			sender.request(this.proxyURL, {
				callback: QZFL.event.bind(this, function(o){
					this.onSuccess(o);
					sender.free();
				}),
				errorCallback: QZFL.event.bind(this, function(o){
					this.onError(o);
					sender.free();
				}),
				onload: QZFL.event.bind(this, function(o){
					this.onError({
						msg: 'Connection or Server error'
					});
					sender.free();
				}),
				setting : this
			});
		},
		destroy: function(){
			this._sender = null;
			this.onSuccess = this.onError = QZFL.emptyFn;
		}
	};
})();
 */
/**
 * @fileoverview QZFL Javascript Loader
 * @version 1.$Rev: 1918 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 17:35:04 +0800 (周二, 11 一月 2011) $
 */

/**
 * Js Loader，js脚本异步加载
 *
 * @constructor
 * @example
 * 		var t=new QZFL.JsLoader();
 *		t.onload = function(){};
 *		t.load("/qzone/v5/tips_diamond.js", null, {"charset":"utf-8"});
 */
QZFL.JsLoader = function(isDebug) {
	//一个没用的属性 ryan
//	this.loaded = false;

	this.debug = isDebug || (QZFL.config.debugLevel > 1);

	/**
	 * 当js下载完成时
	 *
	 * @event
	 */
	this.onload = QZFL.emptyFn;

	/**
	 * 网络问题下载未完成时
	 *
	 * @event
	 */
	this.onerror = QZFL.emptyFn;

};
//这个ID还是没什么用，删除script元素时用的是元素的引用，和id没关系 ryan
//QZFL.JsLoader.scriptId = 1;

/**
 * 动态加载JS
 *
 * @param {string} src javascript文件地址
 * @param {Object} doc document
 * @param {string} [opt] 当为字符串时，指定charset
 * @param {object} [opt] 当为对象表时，指定<script>标签的各种属性
 *
 */
QZFL.JsLoader.prototype.load = function(src, doc, opt){

	var opts = {}, t = typeof(opt), o = this;

	if (t == "string") {
		opts.charset = opt;
	} else if (t == "object") {
		opts = opt;
	}
	opts.charset = opts.charset || "gb2312";

	//TO DO  一个防重加载优化
	setTimeout(function(){
		o._load.apply(o, [src, doc || document, opts]);
		o = null;
	}, 0);
};

/**
 * 异步加载js脚本
 *
 * @param {Object} sId
 * @param {Object} src
 * @param {Object} doc
 * @param {Object} opts
 * @ignore
 * @private
 */
QZFL.JsLoader.prototype._load = function(/*sId, */src, doc, opts){
	var _ie = QZFL.userAgent.ie, _js = doc.createElement("script"), o = this, _rm=QZFL.dom.removeElement, _ae=QZFL.event.addEvent, tmp, k;

	// 处理加载成功的回调
	_ae(_js, (_ie ? "readystatechange" : "load"), function(){
		//ie的处理逻辑
		if (!_js || _ie && !(/*_js.readyState=="complete" || */_js.readyState == 'loaded')) {
			return;
		}
		o.onload();

		if (!o.debug) {
			_rm(_js);
		}

		_js = _rm = _ae = o = null;

	});

	if (!_ie) {
		_ae(_js, 'error', function(){
			o.onerror();

			if (!o.debug) {
				_rm(_js);
			}

			_js = _rm = _ae = o = null;

		})
	}

	//	_js.id = "js_" + sId;
	for (k in opts) {
		if (typeof(tmp = opts[k]) == "string" && k.toLowerCase() != "src") {
			_js.setAttribute(k, tmp);
		}
	}

	doc.getElementsByTagName("head")[0].appendChild(_js);
	_js.src = src;
	opts = null;
};

/**
 * JsLoader的简写,避免被分析出来
 * @deprecated 不建议使用,只做兼容
 * @ignore
 */
QZFL["js"+"Loader"]=QZFL.JsLoader;

/**
 * @fileoverview QZFL JSON类
 * @version 1.$Rev: 1895 $
 * @author QzoneWebGroup, ($LastChangedBy: scorpionxu $)
 * @lastUpdate $Date: 2010-12-27 20:19:39 +0800 (周一, 27 十二月 2010) $
 */

/**
 * JSONGetter通信器类,建议使用进行读操作的时候使用
 *
 * @param {String} actionURI 请求地址
 * @param {String} cname 可选，对象实体的索引名，默认是"_jsonInstence_n"，n为序号
 * @param {Object} data 可选，hashTable形式的字典
 * @param {String} charset 所拉取数据的字符集
 * @param {Boolean} [junctionMode=false] 使用插入script标签的方式拉取
 * @constructor
 * @example
 * 		var _loader = new QZFL.JSONGetter(GET_QUESTIONS_URL, void (0), {"uin": getParameter("uin"), "rd": Math.random()}, "utf-8");
 *		_loader.onSuccess = function(re){};
 *		_loader.send("_Callback");
 *		_loader.onError = function(){};
 */
QZFL.JSONGetter = function(actionURL, cname, data, charset, junctionMode) {
	if (QZFL.object.getType(cname) != "string") {
		cname = "_jsonInstence_" + (QZFL.JSONGetter.counter + 1);
	}
	
	var prot = QZFL.JSONGetter.instance[cname];
	if (prot instanceof QZFL.JSONGetter) {
		//ignore
	} else {
		QZFL.JSONGetter.instance[cname] = prot = this;
		QZFL.JSONGetter.counter++;

		prot._name = cname;
		prot._sender = null;
		prot._timer = null;
		
		/**
		 * 回调成功执行
		 * 
		 * @event
		 */
		this.onSuccess = QZFL.emptyFn;

		/**
		 * 解释失败
		 * 
		 * @event
		 */
		this.onError = QZFL.emptyFn;
		
		/**
		 * 当数据超时的时候
		 * 
		 * @event
		 */
		this.onTimeout = QZFL.emptyFn;
		
		/**
		 * 超时设置,默认5秒钟
		 */
		this.timeout = 5000;
		
		/**
		 * 抛出清理接口
		 */
		this.clear = QZFL.emptyFn;

		this._baseClear = function(){
			this._waiting = false;
			this._squeue = [];
			this._equeue = [];
			this.onSuccess = this.onError = QZFL.emptyFn;
			this.clear = null;
		};
	}

	prot._uri = actionURL;
	prot._data = (data && (QZFL.object.getType(data) == "object" || QZFL.object.getType(data) == "string")) ? data : null;
	prot._charset = (QZFL.object.getType(charset) != 'string') ? QZFL.config.defaultDataCharacterSet : charset;
	prot._jMode = !!junctionMode;

	return prot;
};

QZFL.JSONGetter.instance = {};
QZFL.JSONGetter.counter = 0;

QZFL.JSONGetter._errCodeMap = {
	999 : {
		msg : 'Connection or Server error.'
	},
	998 : {
		msg : 'Connection to Server timeout.'
	}
};

QZFL.JSONGetter.genHttpParamString = function(o){
	var r = [];

	for (var i in o) {
		r.push(i + "=" + encodeURIComponent(o[i]));
	}

	return r.join("&");
};

/**
 * 添加一个成功回调函数
 * @param {Function} f
 */
QZFL.JSONGetter.prototype.addOnSuccess = function(f){
	if(typeof(f) == "function"){
		if(this._squeue && this._squeue.push){

		}else{
			this._squeue = [];
		}
		this._squeue.push(f);
	}
};


QZFL.JSONGetter._runFnQueue = function(q, resultArgs, th){
	var f;
	if(q && q.length){
		while(q.length > 0){
			f = q.shift();
			if(typeof(f) == "function"){
				f.apply(th ? th : null, resultArgs);
			}
		}
	}
};

/**
 * 添加一个失败回调函数
 * @param {Function} f
 */
QZFL.JSONGetter.prototype.addOnError = function(f){
	if(typeof(f) == "function"){
		if(this._equeue && this._equeue.push){

		}else{
			this._equeue = [];
		}
		this._equeue.push(f);
	}
};


QZFL.JSONGetter.pluginsPool = {
	"srcStringHandler" : []
};

QZFL.JSONGetter._pluginsRunner = function(pType, data){
	var _s = QZFL.JSONGetter,
		l = _s.pluginsPool[pType],
		t = data,
		len;

	if(l && (len = l.length)){
		for(var i = 0; i < len; ++i){
			if(typeof(l[i]) == "function"){
				t = l[i](t);
			}
		}
	}

	return t;
};


QZFL.JSONGetter.prototype.send = function(callbackFnName) {
	if(this._waiting){ //已经在请求中那么就不再发请求了
		return;
	}

	var cfn = (QZFL.object.getType(callbackFnName) != 'string') ? "callback" : callbackFnName,
		clear,
		da = this._uri;
		
	if(this._data){
		da += (da.indexOf("?") < 0 ? "?" : "&") + ((typeof(this._data) == "object") ? QZFL.JSONGetter.genHttpParamString(this._data) : this._data);
	}

	da = QZFL.JSONGetter._pluginsRunner("srcStringHandler", da); //sds 用插件来跑一下url做插接功能，如反CSRF组件
	
	//传说中的jMode... 欲知详情，请咨询哓哓同学
	if(this._jMode){
		window[cfn] = this.onSuccess;
		var _sd = new QZFL.JsLoader();
		_sd.onerror = this.onError;
		_sd.load(da,void(0),this._charset);
		return;
	}

	//设置超时点
	this._timer = setTimeout(
			(function(th){
				return function(){
						//QZFL.console.print("jsonGetter timeout", 3);
						//TODO timeout can't push in success or failed... zishunchen 
						th.onTimeout();
					};
				})(this),
			this.timeout
		);
	
	if (QZFL.userAgent.ie) { // IE8之前的方案.确定要平稳迁移么
		if (QZFL.userAgent.beta && navigator.appVersion.indexOf("Trident\/4.0") > -1) {//sds 真正的IE8 beta only
			var _hf = new ActiveXObject("htmlfile");
			//回调后清理
				this.clear = clear = function(o){
					clearTimeout(o._timer);
					if (o._sender) {
						o._sender.close();
						o._sender.parentWindow[cfn] = o._sender.parentWindow["errorCallback"] = null;
						o._sender = null;
					}
					o._baseClear();
				};

			this._sender = _hf;

			//成功回调
			var _cb = (function(th){
					return (function() {
					
						setTimeout(
						  (function(_o, _a){return (function(){
							th._waiting = false;
						  	_o.onSuccess.apply(_o, _a);
							QZFL.JSONGetter._runFnQueue(th._squeue, _a, th);
							clear(_o);
						  })})(th, arguments), 0);
						
					});
				})(this);

			//失败回调
			var _ecb = (function(th){
					return (function(){
						th._waiting = false;
						var _eo = QZFL.JSONGetter._errCodeMap[999];
						th.onError(_eo);
						QZFL.JSONGetter._runFnQueue(th._equeue, [_eo], th);
						clear(th);
					});
				})(this);


			_hf.open();
			_hf.parentWindow[cfn] = function() {// 修正ie8
				_cb.apply(null, arguments);
			};

			_hf.parentWindow["errorCallback"] = _ecb;
			
			this._waiting = true;
			_hf.write("<script src=\"" + da + "\" charset=\"" + this._charset + "\"><\/script><script defer>setTimeout(\"try{errorCallback();}catch(ign){}\",0)<\/script>");
			
		} else {
			var df = document.createDocumentFragment(), sender = (QZFL.userAgent.ie == 9 ? document : df).createElement("script");//sds 加个IE9兼容
			
			sender.charset = this._charset;
			
			this._senderDoc = df;
			this._sender = sender;
			
			//回调后清理
			this.clear = clear = function(o){
				clearTimeout(o._timer);
				if (o._sender) {
					o._sender.onreadystatechange = null;
				}
				df = o._senderDoc = o._sender = null;
				o._baseClear();
			};
			
			//成功回调
			df[cfn] = (function(th){
					return (function(){
						th._waiting = false;
						th.onSuccess.apply(th, arguments);
						QZFL.JSONGetter._runFnQueue(th._squeue, arguments, th);
						clear(th);
					});
				})(this);
			
			//用来模拟ie在加载失败的情况
			sender.onreadystatechange = (function(th){
					return (function(){
						if (th._sender && th._sender.readyState == "loaded") {
							try {
								th._waiting = false;
								var _eo = QZFL.JSONGetter._errCodeMap[999];
								th.onError(_eo);
								QZFL.JSONGetter._runFnQueue(th._equeue, [_eo], th);
								clear(th);
							} 
							catch (ignore) {}
						}
					});
				})(this);
				
			this._waiting = true;
			
			df.appendChild(sender);
			this._sender.src = da;
		}
	} else {

		//回调后清理
		this.clear = clear = function(o) {
			//QZFL.console.print(o._timer);
			clearTimeout(o._timer);
			if (o._sender) {
				o._sender.src = "about:blank";
				o._sender = o._sender.callback = o._sender.errorCallback = null;
			}
			
			if (QZFL.userAgent.safari || QZFL.userAgent.opera) {
				setTimeout('QZFL.dom.removeElement($("_JSON_frm_' + o._name + '"))', 50);
			} else {
				QZFL.dom.removeElement($("_JSON_frm_" + o._name));
			}
			o._baseClear();
		};
		
		//成功回调
		var _cb = (function(th){
				return (function() {
					th._waiting = false;
					th.onSuccess.apply(th, arguments);
					QZFL.JSONGetter._runFnQueue(th._squeue, arguments, th);
					clear(th);
				});
			})(this);
		
		//失败回调
		var _ecb = (function(th){
				return (function() {
					th._waiting = false;
					var _eo = QZFL.JSONGetter._errCodeMap[999];
					th.onError(_eo);
					QZFL.JSONGetter._runFnQueue(th._equeue, [_eo], th);
					clear(th);
				});
			})(this);
		
		//开始加载脚本数据
		var frm = document.createElement("iframe");
		frm.id = "_JSON_frm_" + this._name;
		frm.style.width = frm.style.height = frm.style.borderWidth = "0";
		this._sender = frm;

		//如果document.domain等于location.host一样则不进行host的修改，否则opera获取数据有问题
		var _dm = (document.domain == location.host)?'':'document.domain="' + document.domain + '";',
			dout = '<html><head><meta http-equiv="Content-type" content="text/html; charset=' + this._charset + '"/></head><body><script>'+_dm+';function ' + cfn + '(){frameElement.callback.apply(null, arguments);}<\/script><script charset="' + this._charset + '" src="' + da + '"><\/script><script>setTimeout(frameElement.errorCallback,50);<\/script></body></html>';

		frm.callback = _cb;
		frm.errorCallback = _ecb; 

		this._waiting = true;

		if (QZFL.userAgent.chrome || QZFL.userAgent.opera || QZFL.userAgent.firefox < 3) {
		    frm.src = "javascript:'" + encodeURIComponent(QZFL.string.escString(dout)) + "'";
		    document.body.appendChild(frm);
		} else {
		    document.body.appendChild(frm);
		    frm.contentWindow.document.open('text/html');
		    frm.contentWindow.document.write(dout);
		//	if(!QZFL.userAgent.chrome){ //chrome这里会访问不到contentWindow
			    frm.contentWindow.document.close();
		//	}
		}
	}
};

/**
 * QZFL.JSONGetter对象自毁方法，用法 ins=ins.destroy();
 * 
 * @return {Object} null用来复写引用本身
 */
QZFL.JSONGetter.prototype.destroy = function() {
	var n = this._name;
	//this.clear(this);
	delete QZFL.JSONGetter.instance[n]._sender;
	QZFL.JSONGetter.instance[n]._sender = null;
	delete QZFL.JSONGetter.instance[n];
	QZFL.JSONGetter.counter--;
	return null;
};

/***************************************** :) *****************************************************/
/**
 * 目前已经能完成数据请求功能，要注意，现在的调用方式和以前的不同
 * 未完成功能：
 * 	1. 对proxy cache里df或者frame进行延时清理，保持在一个或者两个就够了
 * 	2. 上报功能
 * 	3. addOnSuccess, addOnError
 * 	4. 对IE8 beta版进行提示，不再支持，现在是用frame实现的
 * /

QZFL.JSONGetterBeta = function(url){
	this.url = url;
	this.charset = QZFL.config.defaultDataCharacterSet;
	this.onTimeout = this.onSuccess = this.onError = QZFL.emptyFn;
};
QZFL.JSONGetterBeta.prototype.setCharset = function(charset){
	if (typeof(charset) == 'string') {
		this.charset = charset;
	}
};
QZFL.JSONGetterBeta.prototype.setQueryString = function(data){
	var type;
	if (data && ((type = typeof(data)) == 'object' || type == 'string')) {
		if (type == 'object') {
			var r = [];
			for (var k in data) {
				r.push(k + "=" + encodeURIComponent(data[k]));
			}
			data = r.join("&");
		}
		this.url += (this.url.indexOf("?") < 0 ? "?" : "&") + data;
	}
};
QZFL.JSONGetterBeta.prototype.send = function(cbFnName){
	cbFnName = cbFnName || 'callback';
	var me = this, proxy = QZFL.JSONGetterBeta.getProxy(), tmp;
	if (QZFL.JSONGetterBeta.isUseDF) {
		var scrpt = proxy.createElement("script");
		scrpt.charset = this.charset;
		proxy.appendChild(scrpt);
		
		proxy[cbFnName] = function(){
			proxy.requesting = false;
			me.onSuccess.apply(null, Array.prototype.slice.call(arguments));
			scrpt.removeNode(true);
			QZFL.console.print('request finish : ' + me.url);
			scrpt = scrpt.onreadystatechange = me = proxy = proxy[cbFnName] = null;
		};
		
		scrpt.onreadystatechange = function(){
			if (scrpt.readyState == "loaded") {
				proxy.requesting = false;
				me.onError({
					ret: 999,
					msg: 'Connection or Server error.'
				});
				scrpt.removeNode(true);
				QZFL.console.print('request Error : ' + me.url);
				scrpt = scrpt.onreadystatechange = me = proxy = proxy[cbFnName] = null;
			}
		};
		
		proxy.requesting = true;
		scrpt.src = this.url;
	} else {
		proxy.style.width = proxy.style.height = proxy.style.borderWidth = "0";
		
		proxy.callback = function(){
			proxy.requesting = false;
			me.onSuccess.apply(null, Array.prototype.slice.call(arguments));
			var win = proxy.contentWindow;
			clearTimeout(win.timer);
			var scrpts = win.document.getElementsByTagName('script');
			for (var i = 0, l = scrpts.length; i < l; i++) {
				QZFL.dom.removeElement(scrpts[i]);
			}
			QZFL.console.print('request finish : ' + me.url);
			me = proxy = proxy.callback = proxy.errorCallback = null;
		};
		proxy.errorCallback = function(){
			proxy.requesting = false;
			me.onError.apply(null, [{
				ret: 999,
				msg: 'Connection or Server error.'
			}]);
			var win = proxy.contentWindow;
			clearTimeout(win.timer);
			var scrpts = win.document.getElementsByTagName('script');
			for (var i = 0, l = scrpts.length; i < l; i++) {
				QZFL.dom.removeElement(scrpts[i]);
			}
			QZFL.console.print('request Error : ' + me.url);
			me = proxy = proxy.callback = proxy.errorCallback = null;
		};
		var dm = (document.domain == location.host) ? '' : 'document.domain="' + document.domain + '";', 
			html = '<html><head><meta http-equiv="Content-type" content="text/html; charset=' + this.charset + '"/></head><body><script>' + dm + ';function ' + cbFnName + '(){frameElement.callback.apply(null, arguments);}<\/script><script charset="' + this.charset + '" src="' + this.url + '"><\/script><script>timer=setTimeout(frameElement.errorCallback,50);<\/script></body></html>';
		
		proxy.requesting = true;
		if (QZFL.userAgent.opera || QZFL.userAgent.firefox < 3) {
			proxy.src = "javascript:'" + html + "'";
			document.body.appendChild(proxy);
		} else {
			document.body.appendChild(proxy);
			(tmp = proxy.contentWindow.document).open('text/html');
			tmp.write(html);
			tmp.close();
		}
	}
};
QZFL.JSONGetterBeta.getProxy = function(){
	for (var p, i = 0, len = QZFL.JSONGetterBeta.proxy.length; i < len; i++) {
		if ((p = QZFL.JSONGetterBeta.proxy[i]) && !p.requesting) {
			QZFL.console.print('找到第' + i + '个代理可用');
			return p;
		}
	}
	QZFL.console.print('没有可用的代理，创建一个新的');
	QZFL.JSONGetterBeta.proxy.push(p = QZFL.JSONGetterBeta.isUseDF ? document.createDocumentFragment() : document.createElement("iframe"));
	return p;
};
QZFL.JSONGetterBeta.proxy = [];
QZFL.JSONGetterBeta.isUseDF = QZFL.userAgent.ie && !QZFL.userAgent.beta;


//以下是几个测试用例
var jg = new QZFL.JSONGetterBeta('http://u.qzone.qq.com/cgi-bin/qzone_static_widget?fs=1&uin=20050606&timestamp=0');
jg.onSuccess = function(o){QZFL.console.print(o['_2_0']._uname_);};
jg.send('staticData_Callback');

var jg2 = new QZFL.JSONGetterBeta('http://g.qzone.qq.com/fcg-bin/cgi_emotion_list.fcg?uin=20050606&loginUin=0&s=820043');
jg2.onSuccess = function(o){QZFL.console.print(o.visitcount);};
jg2.send('visitCountCallBack');

var jg1 = new QZFL.JSONGetterBeta('http://n.qzone.qq.com/cgi-bin/pvuv/set_pvuv?uin=20050606&r=0.39620088664296915');
jg1.onSuccess = function(o){QZFL.console.print(o.todayPV);};
jg1.send('QZonePGVDataCallBack1');

var jg3 = new QZFL.JSONGetterBeta('http://u.qzone.qq.com/cgi-bin/qzone_static_widget?fs=1&uin=20050606&timestamp=0&r=' + Math.random());
jg3.onSuccess = function(o){QZFL.console.print(o['_2_0']._uname_);};
jg3.send('staticData_Callback');

var jg4 = new QZFL.JSONGetterBeta('http://n.qzone.qq.com/cgi-bin/pvuv/set_pvuv?uin=20050606&r=0.39620088664296915&r=' + Math.random());
jg4.onSuccess = function(o){QZFL.console.print(o.todayPV);};
jg4.send('QZonePGVDataCallBack1');

var jg5 = new QZFL.JSONGetterBeta('http://g.qzone.qq.com/fcg-bin/cgi_emotion_list.fcg?uin=20050606&loginUin=0&s=820043&r=' + Math.random());
jg5.onSuccess = function(o){QZFL.console.print(o.visitcount);};
jg5.send('visitCountCallBack');

 * 
 * 
 */
/**
 * @fileoverview QZFL cookie数据处理
 * @version 1.$Rev: 1921 $
 * @author QzoneWebGroup, ($LastChangedBy: ryanzhao $)
 * @lastUpdate $Date: 2011-01-11 18:46:01 +0800 (周二, 11 一月 2011) $
 */

/**
 * cookie类,cookie类可以让开发很轻松得控制cookie，我们可以随意增加修改和删除cookie，也可以轻易设置cookie的path, domain, expire等信息
 *
 * @namespace QZFL.cookie
 */
QZFL.cookie = {
	/**
	 * 设置一个cookie,还有一点需要注意的，在qq.com下是无法获取qzone.qq.com的cookie，反正qzone.qq.com下能获取到qq.com的所有cookie.
	 * 简单得说，子域可以获取根域下的cookie, 但是根域无法获取子域下的cookie.
	 * @param {String} name cookie名称
	 * @param {String} value cookie值
	 * @param {String} domain 所在域名
	 * @param {String} path 所在路径
	 * @param {Number} hour 存活时间，单位:小时
	 * @return {Boolean} 是否成功
	 * @example
	 *  QZFL.cookie.set('value1',QZFL.dom.get('t1').value,"qzone.qq.com","/v5",24); //设置cookie
	 */
	set : function(name, value, domain, path, hour) {
		if (hour) {
			var expire = new Date();
			expire.setTime(expire.getTime() + 3600000 * hour);
		}
		document.cookie = name + "=" + value + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + QZFL.config.domainPrefix + ";"));
		return true;
	},

	/**
	 * 获取指定名称的cookie值
	 *
	 * @param {String} name cookie名称
	 * @return {String} 获取到的cookie值
	 * @example
	 * 		QZFL.cookie.get('value1'); //获取cookie
	 */
	get : function(name) {
		//ryan
		//var s = ' ' + document.cookie + ';', pos;
		//return (pos = s.indexOf(' ' + name + '=')) > -1 ? s.slice(pos += name.length + 2, s.indexOf(';', pos)) : '';
		
		var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"), m = document.cookie.match(r);
		return (!m ? "" : m[1]);
	},

	/**
	 * 删除指定cookie,复写为过期
	 *
	 * @param {String} name cookie名称
	 * @param {String} domain 所在域
	 * @param {String} path 所在路径
	 * @example
	 * 		QZFL.cookie.del('value1'); //删除cookie
	 */
	del : function(name, domain, path) {
		document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + QZFL.config.domainPrefix + ";"));
	}
};

/**
 * 需要打开lang命名空间
 */
QZFL.object.map(QZFL.lang || {});
var ua = window.ua || QZFL.userAgent,
	$e = QZFL.element.get,
//	_CN = QZFL.dom.createNamedElement, 
	$ = QZFL.dom.get, 
	removeNode = QZFL.dom.removeElement,
	ENV = QZFL.enviroment,
	addEvent = QZFL.event.addEvent,
	removeEvent = QZFL.event.removeEvent,
	getEvent = QZFL.event.getEvent,
	insertFlash = QZFL.media.getFlashHtml;