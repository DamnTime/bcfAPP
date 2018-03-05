mui.init({
	swipeBack: false,
	beforeback: function() {
		clearInterval(timer);
	}
});
var proId = null;
var timer;
mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	self.setStyle({
		'popGesture': 'none',
		scrollIndicator: 'none'
	});
	proId = self.proId;
//	console.log(self.proId);
	commAjax(self.proId);
	//触发自定义事件
	window.addEventListener('proId', function(event) {
		if(event.detail.checkLogin) {
			location.reload();
		}
	});
	//回到首页
	h('#returnHome').tap(function() {
		services.returnHome('slide-in-left', 'slide-out-right');
	});

})
//获取后台数据
function commAjax(id) {
	mui.ajax(services.baseUrl + '/goodsdet/app/cro/det', {
		type: "POST",
		data: services.Encrypt(JSON.stringify({
			commodityId: id
		})),
		timeout: 20000,
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		success: function(data) {
			//console.log(services.Decrypt(data));
			var result = JSON.parse(services.Decrypt(data));
			if(result.status === 200) {
				//产品信息
				h('#proIntroBox').html(template('proIntroList', {
					model: result.data,
					//众筹是否已过期
					isTime: result.data.det.endTime - result.data.det.nowTime,
					//当前进度
					nowPrecess: parseInt(((result.data.det.number == 'null' ? result.data.det.number = 0 : result.data.det.number) / result.data.det.firstNum).toFixed(2) * 100)
				}));
				//设置商品默认priceid
				h('#buyMsg').val(result.data.goods[0].priceId);
				//产品参数	
				h('#proParam').html(template('proParamList', {
					model: result.data.goods[0],
					proNum: result.data
				}));
				//详情图
				h('#zcProgramDetBox').html(template('zcProgramDetList', {
					model: result.data
				}));
				//设置项目进度的activeId
				h('#tabList').find('li').eq(1).attr('data-activeId', result.data.det.activeId);
				//设置公司排名的activeId
				h('#tabList').find('li').eq(2).attr('data-activeId', result.data.det.activeId);
				//倒计时 
				if((result.data.det.endTime - result.data.det.nowTime) > 0) {
					timer = setInterval(function() {
						var nowTime = new Date();
						var endTime = new Date(result.data.det.endTime);
						var t = endTime.getTime() - nowTime.getTime();
						var d = Math.floor(t / 1000 / 60 / 60 / 24);
						var hour = Math.floor(t / 1000 / 60 / 60 % 24);
						var min = Math.floor(t / 1000 / 60 % 60);
						var sec = Math.floor(t / 1000 % 60);
						if(hour < 10) {
							hour = "0" + hour;
						}
						if(min < 10) {
							min = "0" + min;
						}
						if(sec < 10) {
							sec = "0" + sec;
						}
						var countDownTime = d + "天" + hour + "时" + min + "分" + sec + '秒';
						h('#timer').html(countDownTime);
					}, 1000);
				} else {
					h('#subBuy').addClass('subBuyDisablied');
				}
				//参数选择
				mui('#choosePartyId').on('tap', 'a', function() {
					h(this).parent().addClass('chooseActive').siblings().removeClass('chooseActive');
					var paramId = h(this).attr('data-paramId');
					var priceId = h(this).attr('data-priceId');
					//设置商品priceid
					h('#buyMsg').val(priceId);
					//重新渲染产品参数
					h('#proParam').html(template('proParamList', {
						model: result.data.goods[paramId],
						proNum: result.data
					}));
				});
			}
		},
		error: function() {
			h('#loadingFailArea').show();
		},
		complete: function() {
			h('.loadingImg').hide();
		}
	});
}
//tab切换
mui('#tabList').on('tap', 'li', function() {
	var index = parseInt(h(this).attr('data-zcid'));
	var that = h(this);
	switch(index) {
		case 2:
			precess(that);
			break;
		case 3:
			companyRank(that);
			break;
		default:
			break;
	}
	h(this).addClass('zcTabActive').siblings().removeClass('zcTabActive');
	h('#zcProgramBox').find('.comzc').eq(index - 1).show().siblings().hide();
});
//时间戳过滤
template.defaults.imports.dateFormat = services.dataformat;
//请求项目进度
var isPrecess = true;

function precess(that) {
	var activeId = that.attr('data-activeId');
	if(isPrecess) {
		mui.ajax(services.baseUrl + '/goodsdet/process', {
			type: "POST",
			data: services.Encrypt(JSON.stringify({
				activeId: activeId
			})),
			timeout: 20000,
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			success: function(data) {
				isPrecess = false;
				//console.log('项目进展' + services.Decrypt(data));
				var result = JSON.parse(services.Decrypt(data));
				if(result.status === 200) {
					//渲染数据
					h('#programProcessBox').html(template('programProcessList', {
						model: result.data
					}));
				}
			},
			error: function() {
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});
	}
};
//请求公司排名
var isCompanyRank = true;

function companyRank(that) {
	var commId = that.attr('data-activeId');
	if(isCompanyRank) {
		mui.ajax(services.baseUrl + '/goodsdet/app/cro/users', {
			type: "POST",
			data: services.Encrypt(JSON.stringify({
				activeId: commId
			})),
			timeout: 20000,
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			success: function(data) {
				isCompanyRank = false;
				var result = JSON.parse(services.Decrypt(data));
				if(result.status === 200) {
					//渲染数据
					h('#companyRankBox').html(template('companyRankList', {
						model: result.data
					}));
				}
			},
			error: function() {
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});
	}
}
//数量的减
mui('#numberList').on('tap', '.minus', function() {
	var num = h(this).siblings('input').val();
	if((/^\+?[1-9]\d*$/.test(num)) && num < 10000 && num > 1) {
		num--;
		h(this).siblings('input').val(num);
		h('#currentNum').html('×' + num);
	} else {
		h(this).siblings('input').val(1);
		h('#currentNum').html('×' + 1);
	}
});
//数量的加
mui('#numberList').on('tap', '.add', function() {
	var num = h(this).siblings('input').val();
	if((/^\+?[1-9]\d*$/.test(num)) && num < 10000) {
		num++;
		h(this).siblings('input').val(num);
		h('#currentNum').html('×' + num);
	} else {
		h(this).siblings('input').val(1);
		h('#currentNum').html('×' + 1);
	}
});
//普通购买
h('#immBuy').tap(function() {
	mui.openWindow({
		url: 'proDetail.html',
		id: 'proDetail.html',
		waiting: {
			autoShow: true,
			title: '正在加载...'
		},
		extras: {
			proId: proId
		}
	})
})
//众筹购买
h('#subBuy').tap(function() {
	var isBuy = h(this).hasClass('subBuyDisablied');
	//console.log(this.className);
	if(isBuy) {
		mui.toast('众筹活动已结束!');
	} else {
		//判断是否登录
		if(localStorage['userName']) {
			if(!((/^\+?[1-9]\d*$/.test(h('#selectNumber').val())) && h('#selectNumber').val() <= 10000)) {
				layer.msg('请输入正确的数量!', {
					icon: 5,
					time: 2000
				});
			} else {
				var proNum = h('#selectNumber').val();
				var priceId = new Array;
				priceId.push(h('#buyMsg').val());
				//				mui.openWindow({
				//					url: 'referOrder.html',
				//					id: 'referOrder.html',
				//					aniShow: 'none',
				//					waiting: {
				//						autoShow: true,
				//						title: '正在加载...'
				//					},
				//					extras: {
				//						priceIds: priceId,
				//						proNum: proNum
				//					}
				//				})
				services.nativeJump('referOrder.html', 'referOrder.html', '提交订单', {
					priceIds: priceId,
					proNum: proNum
				});
			}
		} else {
			mui.openWindow({
				url: 'login.html',
				id: 'login.html',
				waiting: {
					autoShow: true,
					title: '正在加载...'
				},
				extras: {
					proId: proId
				}
			})
		}
	}
	//	mui.toast('预约成功!');
	//	setTimeout(function() {
	//		mui.openWindow({
	//			url: 'referOrder.html',
	//			id: 'referOrder.html',
	//			waiting: {
	//				autoShow: true,
	//				title: '正在加载...'
	//			}
	//		})
	//	}, 2000)
})
//更多服务
h('#more').tap(function() {
	h('#moreSe').show();
	h('#mark').show();
});
h('#mark').tap(function() {
	h('#moreSe').hide();
	h(this).hide();
})
mui('#severiceList').on('tap', 'li', function() {
	var index = parseInt(h(this).attr('data-index'));
	switch(index) {
		case 0:
			returnHome()
			break;
		case 2:
			service()
			break;
		default:
			break;
	}
});
//首页
function returnHome() {
	services.returnHome('slide-in-left', 'slide-out-right');
}
//客服
function service() {
	var arry = ['取消', '立即拨打'];

	function callback(e) {
		if(e.index == 0) {
			plus.device.dial("028-81458117", false);
		} else {
			return;
		}
	};
	mui.confirm('028-81458117', '欢迎致电', ['立即拨打', '取消'], callback)
}