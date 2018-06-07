var noName = {
	giftList:[
		{
			id:'300000001',
			color: "#FFF4D6",
			name:'星巴克100元',
		},
		{
			id:'-1',
			color: "#FFFFFF",
			name:'谢谢参与1',
		},
		{
			id:'300000002',
			color: "#FFF4D6",
			name:'星巴克200元'
		},
		{
			id:'-1',
			color: "#FFFFFF",
			name:'谢谢参与2',
		},
		{
			id:'300000003',
			color: "#FFF4D6",
			name:'星巴克500元'
		},
		{
			id:'-1',
			color: "#FFFFFF",
			name:'谢谢参与3',
		},
		
	],
	emptyIndex:[1,3,5], //空奖的下标
	isClicked:false,
	init : function() {
		noName.getBaseInfo()
		noName.initDialCom()
		noName.initEvent()
		noName.getBingoData()
	},
	initEvent : function() {
		$(".dialogOverlay,#iKow").click(function() {
			noName.hideDialog()
			$("#dial").dial('disabled')
		})
	},
	// 获取body请求方式参数
    customAjax : function(config) {
		$.ajax({
			type : 'post',
			cache : false,
			processData : false,
			dataType : 'json',
			data:JSON.stringify(config.data || {}),
			url:jkx.context+config.url,
			success:config.success||function(){},
			contentType : 'application/json;charset=UTF-8',
		})
	},
	// 初始化转盘信息
	initDialCom : function() {
		var turnplate = {};
		var tempList = []
		turnplate.items=noName.giftList
// turnplate.item = 8;
		turnplate.callback = function(item) {
			noName.showInfo(item)
		};
		turnplate.startClick = function() {
			noName.getLotteryInfo()
		};
		$("#dial").dial(turnplate);
	},
	// 获取历史抽奖信息
	getBaseInfo(){
		 // 获取历史抽奖信息
		noName.customAjax({
			url:'lm/getOnceLotterySeqPage',
			data:{
				lotteryUserId:jkx.id,
			},
			success:function(data){
				if(data.l.length != 0){
					console.log('准备重定向')
				}
			}
		})
	},
	// 显示中奖信息
	showInfo(item){
		if(item.id == '-1'){
			noName.showSorryDialog()
		}else{
			noName.claimPrize(item.id)
			noName.showBingoDialog()
		}
		
	},
	// 获取中奖信息
	getLotteryInfo:function(){
		if(noName.isClicked){
			return false
		}
		noName.isClicked = true
		noName.customAjax({
			url:'lm/getLotteryInfo',
			data:{
				 openid:jkx.id,
			},
			success:function(data){
				var item =noName.emptyIndex[0]
				if(data.result.prizeId != '-1'){
					item= noName.giftList.findIndex(function(item){
						return item.id == data.result.prizeId
					})
					
				}else{
					item =noName.emptyIndex[ Math.floor(Math.random()*3)]
					
				}
				$("#dial").dial('setItem',item)
				$("#dial").dial('start')
			}
		})
		
	},
	// 显示中奖dilaog
	showBingoDialog : function() {
		$("#bingo").show()
		$("#sorry").hide()
		$("#tipDialog").show()
	},
	// 显示未中奖dialog
	showSorryDialog : function() {
		$("#bingo").hide()
		$("#sorry").show()
		$("#tipDialog").show()
	},
	// 隐藏dialog
	hideDialog : function() {
		$("#tipDialog").hide()
	},
	// 初始化轮播
	initMarquee : function(height, second) {

		var style = document.createElement('style');
		style.type = 'text/css';
		var keyFrames = '\
	            @-webkit-keyframes rowup {\
	                0% {\
	                    -webkit-transform: translate3d(0, 0, 0);\
	                    transform: translate3d(0, 0, 0);\
	                }\
	                100% {\
	                    -webkit-transform: translate3d(0, A_DYNAMIC_VALUE, 0);\
	                    transform: translate3d(0, A_DYNAMIC_VALUE, 0);\
	                }\
	            }\
	            @keyframes rowup {\
	                0% {\
	                    -webkit-transform: translate3d(0, 0, 0);\
	                    transform: translate3d(0, 0, 0);\
	                }\
	                100% {\
	                    -webkit-transform: translate3d(0, A_DYNAMIC_VALUE, 0);\
	                    transform: translate3d(0, A_DYNAMIC_VALUE, 0);\
	                }\
	            }\
	            .rowup {-webkit-animation:'
				+ second + ' rowup infinite linear;}\''
		style.innerHTML = keyFrames.replace(/A_DYNAMIC_VALUE/g, height);

		document.getElementsByTagName('head')[0].appendChild(style);
	},
	// 获取中奖纪录信息
	getBingoData : function() {
		var list = []
		
		noName.customAjax({
			url:'lm/getOnceLotterySeqPage',
			data:{
				lotteryFlag:'1'
			},
			success:function(data){
					var list = data.l
					var html = ''
						if(list.length != 0){
							
							
							for ( var i in list) {
								html += '<li>' + '<img src="' + list[i].lotteryUserHead + '" />' + '<div>'
										+ '<p class="nickName">' + list[i].lotteryUserName + '</p>'
										+ '<p class="gift">' + list[i].prizeName + '</p>' + '</div>'
										+ '</li>'
							}
							
							// 如果
							if(list.length >3){
								for ( var i in list) {
									html += '<li>' + '<img src="' + list[i].lotteryUserHead + '" />' + '<div>'
											+ '<p class="nickName">' + list[i].lotteryUserName + '</p>'
											+ '<p class="gift">' + list[i].prizeName + '</p>' + '</div>'
											+ '</li>'
								}
							}
							
							
							$(".noData").hide()
							$('.userList').html(html)
							
							if(list.length >3){
								var height = document.querySelector('.userList').offsetHeight;
								noName.initMarquee('-' + height + 'px', parseInt(height / 30) + 's');
								document.querySelector('.userList').className += ' rowup';
							}
						}else{
							
						}
			}
		})
	
	},
	//领奖
	claimPrize(prizeId){
		noName.customAjax({
			url:'lm/claimPrize',
			data:{
				prizeId:prizeId,
				openid:jkx.id,
			},
			success:function(data){
			}
		})
		
	}
}
$(document).ready(function() {
	noName.init()

});