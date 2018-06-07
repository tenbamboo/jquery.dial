//routate lib start
(function($) {
var supportedCSS,styles=document.getElementsByTagName("head")[0].style,toCheck="transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
for (var a=0;a<toCheck.length;a++) if (styles[toCheck[a]] !== undefined) supportedCSS = toCheck[a];
// Bad eval to preven google closure to remove it from code o_O
// After compresion replace it back to var IE = 'v' == '\v'
var IE = eval('"v"=="\v"');

jQuery.fn.extend({
    rotate:function(parameters)
    {
        if (this.length===0||typeof parameters=="undefined") return;
            if (typeof parameters=="number") parameters={angle:parameters};
        var returned=[];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {

                    var paramClone = $.extend(true, {}, parameters); 
                    var newRotObject = new Wilq32.PhotoEffect(element,paramClone)._rootObj;

                    returned.push($(newRotObject));
                }
                else {
                    element.Wilq32.PhotoEffect._handleRotation(parameters);
                }
            }
            return returned;
    },
    getRotateAngle: function(){
        var ret = [];
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    ret[i] = element.Wilq32.PhotoEffect._angle;
                }
            }
            return ret;
    },
    stopRotate: function(){
        for (var i=0,i0=this.length;i<i0;i++)
            {
                var element=this.get(i);	
                if (element.Wilq32 && element.Wilq32.PhotoEffect) {
                    clearTimeout(element.Wilq32.PhotoEffect._timer);
                }
            }
    }
});

// Library agnostic interface

Wilq32=window.Wilq32||{};
Wilq32.PhotoEffect=(function(){

	if (supportedCSS) {
		return function(img,parameters){
			img.Wilq32 = {
				PhotoEffect: this
			};
            
            this._img = this._rootObj = this._eventObj = img;
            this._handleRotation(parameters);
		}
	} else {
		return function(img,parameters) {
			// Make sure that class and id are also copied - just in case you
			// would like to refeer to an newly created object
            this._img = img;

			this._rootObj=document.createElement('span');
			this._rootObj.style.display="inDial-block";
			this._rootObj.Wilq32 = 
				{
					PhotoEffect: this
				};
			img.parentNode.insertBefore(this._rootObj,img);
			
			if (img.complete) {
				this._Loader(parameters);
			} else {
				var self=this;
				// TODO: Remove jQuery dependency
				jQuery(this._img).bind("load", function()
				{
					self._Loader(parameters);
				});
			}
		}
	}
})();

Wilq32.PhotoEffect.prototype={
    _setupParameters : function (parameters){
		this._parameters = this._parameters || {};
        if (typeof this._angle !== "number") this._angle = 0 ;
        if (typeof parameters.angle==="number") this._angle = parameters.angle;
        this._parameters.animateTo = (typeof parameters.animateTo==="number") ? (parameters.animateTo) : (this._angle); 

        this._parameters.step = parameters.step || this._parameters.step || null;
		this._parameters.easing = parameters.easing || this._parameters.easing || function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b; }
		this._parameters.duration = parameters.duration || this._parameters.duration || 1000;
        this._parameters.callback = parameters.callback || this._parameters.callback || function(){};
        if (parameters.bind && parameters.bind != this._parameters.bind) this._BindEvents(parameters.bind); 
	},
	_handleRotation : function(parameters){
          this._setupParameters(parameters);
          if (this._angle==this._parameters.animateTo) {
              this._rotate(this._angle);
          }
          else { 
              this._animateStart();          
          }
	},

	_BindEvents:function(events){
		if (events && this._eventObj) 
		{
            // Unbinding previous Events
            if (this._parameters.bind){
                var oldEvents = this._parameters.bind;
                for (var a in oldEvents) if (oldEvents.hasOwnProperty(a)) 
                        // TODO: Remove jQuery dependency
                        jQuery(this._eventObj).unbind(a,oldEvents[a]);
            }

            this._parameters.bind = events;
			for (var a in events) if (events.hasOwnProperty(a)) 
				// TODO: Remove jQuery dependency
					jQuery(this._eventObj).bind(a,events[a]);
		}
	},

	_Loader:(function()
	{
		if (IE)
		return function(parameters)
		{
			var width=this._img.width;
			var height=this._img.height;
			this._img.parentNode.removeChild(this._img);
							
			this._vimage = this.createVMLNode('image');
			this._vimage.src=this._img.src;
			this._vimage.style.height=height+"px";
			this._vimage.style.width=width+"px";
			this._vimage.style.position="absolute"; // FIXES IE PROBLEM - its
													// only rendered if its on
													// absolute position!
			this._vimage.style.top = "0px";
			this._vimage.style.left = "0px";

			/*
			 * Group minifying a small 1px precision problem when rotating
			 * object
			 */
			this._container =  this.createVMLNode('group');
			this._container.style.width=width;
			this._container.style.height=height;
			this._container.style.position="absolute";
			this._container.setAttribute('coordsize',width-1+','+(height-1)); // This
																				// -1,
																				// -1
																				// trying
																				// to
																				// fix
																				// ugly
																				// problem
																				// with
																				// small
																				// displacement
																				// on
																				// IE
			this._container.appendChild(this._vimage);
			
			this._rootObj.appendChild(this._container);
			this._rootObj.style.position="relative"; // FIXES IE PROBLEM
			this._rootObj.style.width=width+"px";
			this._rootObj.style.height=height+"px";
			this._rootObj.setAttribute('id',this._img.getAttribute('id'));
			this._rootObj.className=this._img.className;			
		    this._eventObj = this._rootObj;	
		    this._handleRotation(parameters);	
		}
		else
		return function (parameters)
		{
			this._rootObj.setAttribute('id',this._img.getAttribute('id'));
			this._rootObj.className=this._img.className;
			
			this._width=this._img.width;
			this._height=this._img.height;
			this._widthHalf=this._width/2; // used for optimisation
			this._heightHalf=this._height/2;// used for optimisation
			
			var _widthMax=Math.sqrt((this._height)*(this._height) + (this._width) * (this._width));

			this._widthAdd = _widthMax - this._width;
			this._heightAdd = _widthMax - this._height;	// widthMax because
														// maxWidth=maxHeight
			this._widthAddHalf=this._widthAdd/2; // used for optimisation
			this._heightAddHalf=this._heightAdd/2;// used for optimisation
			
			this._img.parentNode.removeChild(this._img);	
			
			this._aspectW = ((parseInt(this._img.style.width,10)) || this._width)/this._img.width;
			this._aspectH = ((parseInt(this._img.style.height,10)) || this._height)/this._img.height;
			
			this._canvas=document.createElement('canvas');
			this._canvas.setAttribute('width',this._width);
			this._canvas.style.position="relative";
			this._canvas.style.left = -this._widthAddHalf + "px";
			this._canvas.style.top = -this._heightAddHalf + "px";
			this._canvas.Wilq32 = this._rootObj.Wilq32;
			
			this._rootObj.appendChild(this._canvas);
			this._rootObj.style.width=this._width+"px";
			this._rootObj.style.height=this._height+"px";
            this._eventObj = this._canvas;
			
			this._cnv=this._canvas.getContext('2d');
            this._handleRotation(parameters);
		}
	})(),

	_animateStart:function()
	{	
		if (this._timer) {
			clearTimeout(this._timer);
		}
		this._animateStartTime = +new Date;
		this._animateStartAngle = this._angle;
		this._animate();
	},
    _animate:function()
    {
         var actualTime = +new Date;
         var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;

         // TODO: Bug for animatedGif for static rotation ? (to test)
         if (checkEnd && !this._parameters.animatedGif) 
         {
             clearTimeout(this._timer);
         }
         else 
         {
             if (this._canvas||this._vimage||this._img) {
                 var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
                 this._rotate((~~(angle*10))/10);
             }
             if (this._parameters.step) {
                this._parameters.step(this._angle);
             }
             var self = this;
             this._timer = setTimeout(function()
                     {
                     self._animate.call(self);
                     }, 10);
         }

         // To fix Bug that prevents using recursive function in callback I
			// moved this function to back
         if (this._parameters.callback && checkEnd){
             this._angle = this._parameters.animateTo;
             this._rotate(this._angle);
             this._parameters.callback.call(this._rootObj);
         }
     },

	_rotate : (function()
	{
		var rad = Math.PI/180;
		if (IE)
		return function(angle)
		{
            this._angle = angle;
			this._container.style.rotation=(angle%360)+"deg";
		}
		else if (supportedCSS)
		return function(angle){
            this._angle = angle;
			this._img.style[supportedCSS]="rotate("+(angle%360)+"deg)";
		}
		else 
		return function(angle)
		{
            this._angle = angle;
			angle=(angle%360)* rad;
			// clear canvas
			this._canvas.width = this._width+this._widthAdd;
			this._canvas.height = this._height+this._heightAdd;
						
			// REMEMBER: all drawings are read from backwards.. so first
			// function is translate, then rotate, then translate, translate..
			this._cnv.translate(this._widthAddHalf,this._heightAddHalf);	// at
																			// least
																			// center
																			// image
																			// on
																			// screen
			this._cnv.translate(this._widthHalf,this._heightHalf);			// we
																			// move
																			// image
																			// back
																			// to
																			// its
																			// orginal
			this._cnv.rotate(angle);										// rotate
																			// image
			this._cnv.translate(-this._widthHalf,-this._heightHalf);		// move
																			// image
																			// to
																			// its
																			// center,
																			// so
																			// we
																			// can
																			// rotate
																			// around
																			// its
																			// center
			this._cnv.scale(this._aspectW,this._aspectH); // SCALE - if needed
															// ;)
			this._cnv.drawImage(this._img, 0, 0);							// First
																			// - we
																			// draw
																			// image
		}

	})()
}

if (IE)
{
Wilq32.PhotoEffect.prototype.createVMLNode=(function(){
document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
		try {
			!document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
			return function (tagName) {
				return document.createElement('<rvml:' + tagName + ' class="rvml">');
			};
		} catch (e) {
			return function (tagName) {
				return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
			};
		}		
})();
}
})(jQuery);
// routate lib end





/**
 * @todo Dial
 * @namespace Dial
 * @author haze.liu
 * @since 2017年04月13日 11:05:22
 */
(function($) {


// option
// item 值(num),对应数组下标
// restaraunts 转盘文字描述（array）
// colors 转盘文字背景颜色（array）
// callback 成功执行完的回调(item)回调中返回item值

// 完整Demo
// $(dom).dial({
	// restaraunts:['奖品1','奖品2','奖品3'],
	// colors:['#fff','#000','#fff'],
	// item:1,
	// callback:function(item){console.log(item)},
// })

// method
// $(dom).dial('start') or $(dom).dial('start',itemValue); //开启轮盘转动
// $(dom).dial('setItem',itemValue); //单纯设置值
// $(dom).dial('enabled'); //设置为可转动状态
// $(dom).dial('disabled'); //设置为不可转动状态

var Dial= function (element, options) {
	this.element = $(element);
	this.turnplate={
		item:options.item || 0,  // 中奖值
		items:options.items || [],
// restaraunts:options.restaraunts || [], //大转盘奖品名称
// colors:options.colors || [], //大转盘奖品区块对应背景颜色
		outsideRadius:192,			// 大转盘外圆的半径
		textRadius:155,				// 大转盘奖品位置距离圆心的距离
		insideRadius:68,			// 大转盘内圆的半径
		startAngle:0,				// 开始角度
		bRotate:false,				// false:停止;ture:旋转
		callback:options.callback || function(){}, // 回调
		startClick:options.startClick, // 点击开始的时候回调
	};
// this.param={}
// this.param.click =
	this._init();
}
Dial.prototype ={
	constructor: Dial,
	_init:function(){
		this._initHTML();
		this._initCanvas();
		this._initEvent();
	},
	/**
	 * @public
	 * @function
	 * @todo 设置转动轮盘
	 * @memberof Dial
	 */	
	setItem:function(item){
		var turnplate=this.turnplate;
		if(item > turnplate.items.length + 1 ){
			return;
		}
		this.turnplate.item=item;
	},
	/**
	 * @public
	 * @function
	 * @todo 不可用转动轮盘
	 * @memberof Dial
	 */	
	disabled:function(){
		this.turnplate.bRotate = !this.turnplate.bRotate;
	},
	/**
	 * @public
	 * @function
	 * @todo 可用转动轮盘
	 * @memberof Dial
	 */	
	enabled:function(){
		this.turnplate.bRotate = !this.turnplate.bRotate;
	},
	/**
	 * @public
	 * @function
	 * @todo 开始转动轮盘
	 * @param {Num}
	 *            item - 奖品队列中中奖位置(数组下标)
	 * @param {Fun}
	 *            callback - 完成回调
	 * @memberof Dial
	 */	
	start:function(item){
		var turnplate=this.turnplate;
		if(item){
			this.setItem(item);
		}

		if(turnplate.bRotate){
			return;
		}
		turnplate.bRotate = !turnplate.bRotate;
		// 获取随机数(奖品个数范围内)
		this._rotateFn(turnplate.item,turnplate.callback);
	},
	/**
	 * @private
	 * @function
	 * @todo 转动轮盘
	 * @param {Num}
	 *            item - 奖品队列中中奖位置(数组下标)
	 * @param {Fun}
	 *            callback - 完成回调
	 * @memberof Dial
	 */	
	_rotateFn : function (item, callback){
		var turnplate=this.turnplate;
		var angles = (item+1) * (360 / turnplate.items.length) - (360 / (turnplate.items.length*2));
		if(angles<270){
			angles = 270 - angles; 
		}else{
			angles = 360 - angles + 270;
		}
		$('#dial_wheelcanvas').stopRotate();
		$('#dial_wheelcanvas').rotate({
			angle:0,
			animateTo:angles+1800,
			duration:8000,
			callback:function (){
				turnplate.bRotate = !turnplate.bRotate;
				if(callback){
					callback(turnplate.items[item]);
				}
			}
		});
	},
	/**
	 * @private
	 * @function
	 * @todo 初始化事件
	 * @memberof Dial
	 */	
	_initEvent:function(){
		var that=this;
		$('.dial .pointer').click(function (){
			that.clickStart()
		});
	},
	clickStart:function(){
		if(this.turnplate.startClick){
			this.turnplate.startClick()
		}else{
			this.start();
		}
	},
	/**
	 * @private
	 * @function
	 * @todo 初始化HTML
	 * @memberof Dial
	 */	
	_initHTML:function(){
		var e=this.element;
		e.addClass('dial');
		var html='<div class="turnplate" >'
					+'<canvas class="item" id="dial_wheelcanvas" width="422px" height="422px" ></canvas>'
					+'<img class="pointer" src="images/turnplate-pointer.png"/>'
				+'</div>';
		e.append(html);
	},
	/**
	 * @private
	 * @function
	 * @todo 画Canvas
	 * @memberof Dial
	 */	
	_initCanvas:function(){ 
		var turnplate =this.turnplate;
		var canvas = document.getElementById("dial_wheelcanvas");   
	  	if (canvas.getContext) {
		  // 根据奖品个数计算圆周角度
		  var arc = Math.PI / (turnplate.items.length/2);
		  var ctx = canvas.getContext("2d");
		  // 在给定矩形内清空一个矩形
		  ctx.clearRect(0,0,422,422);
		  // strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式
		  ctx.strokeStyle = "#FFBE04";
		  // font 属性设置或返回画布上文本内容的当前字体属性
		  ctx.font = '16px Microsoft YaHei';      
		  for(var i = 0; i < turnplate.items.length; i++) {       
			  var angle = turnplate.startAngle + i * arc;
			  ctx.fillStyle = turnplate.items[i].color;
			  ctx.beginPath();
			  // arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
			  ctx.arc(211, 211, turnplate.outsideRadius, angle, angle + arc, false);    
			  ctx.arc(211, 211, turnplate.insideRadius, angle + arc, angle, true);
			  ctx.stroke();  
			  ctx.fill();
			  // 锁画布(为了保存之前的画布状态)
			  ctx.save();   
			  
			  // ----绘制奖品开始----
			  ctx.fillStyle = "#E5302F";
			  var text = turnplate.items[i].name;
			  var line_height = 17;
			  // translate方法重新映射画布上的 (0,0) 位置
			  ctx.translate(211 + Math.cos(angle + arc / 2) * turnplate.textRadius, 211 + Math.sin(angle + arc / 2) * turnplate.textRadius);
			  
			  // rotate方法旋转当前的绘图
			  ctx.rotate(angle + arc / 2 + Math.PI / 2);
			  
			  /** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) * */
			  if(text.indexOf("M")>0){// 流量包
				  var texts = text.split("M");
				  for(var j = 0; j<texts.length; j++){
					  ctx.font = j == 0?'bold 20px Microsoft YaHei':'16px Microsoft YaHei';
					  if(j == 0){
						  ctx.fillText(texts[j]+"M", -ctx.measureText(texts[j]+"M").width / 2, j * line_height);
					  }else{
						  ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
					  }
				  }
			  }else if(text.indexOf("M") == -1 && text.length>6){// 奖品名称长度超过一定范围
				  text = text.substring(0,6)+"||"+text.substring(6);
				  var texts = text.split("||");
				  for(var j = 0; j<texts.length; j++){
					  ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
				  }
			  }else{
				  // 在画布上绘制填色的文本。文本的默认颜色是黑色
				  // measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
				  ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
			  }
			  
			  // 添加对应图标
// if(text.indexOf("闪币")>0){
// var img= document.getElementById("shan-img");
// img.onload=function(){
// ctx.drawImage(img,-15,10);
// };
// ctx.drawImage(img,-15,10);
// }else if(text.indexOf("谢谢参与")>=0){
// var img= document.getElementById("sorry-img");
// img.onload=function(){
// ctx.drawImage(img,-15,10);
// };
// ctx.drawImage(img,-15,10);
// }
			  // 把当前画布返回（调整）到上一个save()状态之前
			  ctx.restore();
			  // ----绘制奖品结束----
		  }     
	  } 
	},
}





$.fn.dial = function(option) {
	var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function () {
			var $this = $(this),
				data = $this.data('dial'),
				options = typeof option == 'object' && option;
			if (!data) {
				$this.data('dial', (data = new Dial(this, $.extend({}, $.fn.dial.defaults, options))));
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined) {
					return false;
				}
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
};
$.fn.dial.defaults = {};
})(jQuery);

