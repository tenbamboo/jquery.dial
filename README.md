# jquery.dial
转盘抽奖 兼容手机端

# 参数

item 值(num),对应数组下标

restaraunts 转盘文字描述（array）

colors 转盘文字背景颜色（array）

callback 成功执行完的回调(item)回调中返回item值


## 完整Demo

	$(dom).dial({

	  restaraunts:['奖品1','奖品2','奖品3'],

	  colors:['#fff','#000','#fff'],

	  item:1,

	  callback:function(item){console.log(item)},

	});

# 方法

	$(dom).dial('start') or  $(dom).dial('start',itemValue); //开启轮盘转动

	$(dom).dial('setItem',itemValue); //单纯设置值

	$(dom).dial('enabled'); //设置为可转动状态

	$(dom).dial('disabled'); //设置为不可转动状态
