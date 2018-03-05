mui.init({
	swipeBack: false
});
var userMsg = services.checkLogin();
var proId = null;
var count = true;
var isAddCart = true;
mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	self.setStyle({
		'popGesture': 'none',
		scrollIndicator: 'none'
	});
	proId = self.proId;
	//	console.log(proId);
	commAjax(proId, userMsg.userRole);

	//触发自定义事件
	window.addEventListener('proId', function(event) {
		if(event.detail.checkLogin) {
			location.reload();
		}
	});
});
//tab切换
mui('#tabL').on('tap', 'li', function() {
	h(this).addClass('active').siblings().removeClass('active');
	var html = h(this).html();
	switch(html) {
		case '商品':
			h('#proIn').addClass('isShow').siblings().removeClass('isShow');
			h("#handle").show();
			break;
		case '详情':
			h('#proM').addClass('isShow').siblings().removeClass('isShow');
			h("#handle").show();
			break;
		case '评价':
			h('#proRe').addClass('isShow').siblings().removeClass('isShow');
			h("#handle").hide();
			changeRecom();
			break;
		default:
			break;
	}
});

function changeRecom() {
	if(count) {
		var mescroll = new MeScroll("mescroll", {
			down: {
				use: false
			},
			up: {
				page: {
					num: 0,
					size: 20,
				},
				loadFull: {
					use: false,
					delay: 500
				},
				noMoreSize: 1,
				empty: {
					tip: '暂无相关数据'
				},
				callback: recomAjax,
				isBounce: false
			}
		});
	}
	//封装评论列表
	function recomAjax(page) {
		setTimeout(function() {
			mui.ajax(services.baseUrl + '/msg/getall', {
				data: services.Encrypt(JSON.stringify({
					pageNum: page.num,
					pageSize: page.size,
					commodityId: proId
				})),
				beforeSend: function(request) {
					services.beforeHeader(request);
				},
				type: 'post',
				timeout: 20000,
				success: function(data) {
					var result = JSON.parse(services.Decrypt(data));
					//console.log('评论' + JSON.stringify(result));
					if(result.status == 200) {
						count = false;
						var html = template('proReBox', {
								model: result.data
							}),
							innerBox = document.getElementById('proReList');
						innerBox.innerHTML += html;
						mescroll.endBySize(result.data.rows.length, result.data.total);
					}
				},
				error: function(xhr, type, errorThrown) {
					h('#loadingFailArea').show();
				},
				complete: function() {
					h('.loadingImg').hide();
				}
			});
		}, 1000);
	}
}

//去众筹
mui('#proIn').on('tap', '#goZc', function() {
	var proId = h(this).attr('data-proid');
	mui.openWindow({
		url: "zcDetail.html",
		id: "zcDetail.html",
		waiting: {
			autoShow: true,
			title: '正在加载...'
		},
		extras: {
			proId: proId
		}
	})
});
h('#goZc').tap(function() {
	mui.openWindow({
		url: 'zcDetail.html',
		id: 'zcDetail.html',
		waiting: {
			autoShow: true,
			title: '正在加载...'
		}
	})
});

//封装ajax请求
function commAjax(id, userRole) {
	mui.ajax(services.baseUrl + '/goodsdet/pc/common', {
		type: "POST",
		data: services.Encrypt(JSON.stringify({
			commodityId: id
		})),
		timeout: 20000,
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status === 200) {
				h('#proIn').html(template('proInBox', {
					model: result.data,
					userRole: userRole,
					brand: result.data.manufacturers
				}));
				//详情页
				h('#proM').html(template('proMBox', {
					model: result.data
				}));
				//设置默认priceid
				h('#priceId').val(result.data.pojos[0].id);
				//设置commtyid
				h('#commtyid').val(result.data.id);
				var gallery = mui('.mui-slider');
				gallery.slider({
					interval: 0
				});
				document.querySelector('.mui-slider').addEventListener('slide', function(event) {
					h('#currentIndex').html(event.detail.slideNumber + 1);
				});
				//图片预览
				var images = document.querySelectorAll('.mui-content-padded img');
				var urls = [];
				for(var i = 0; i < images.length; i++) {
					urls.push(images[i].src);
				}
				// 监听图片的点击
				mui('.mui-content-padded').on('tap', 'img', function() {
					var index = [].slice.call(images).indexOf(this);
					plus.nativeUI.previewImage(urls, {
						current: index,
						loop: true,
						indicator: 'number'
					});
				});
				//倒计时
				if((result.data.overTime - result.data.nowTime) > 0) {
					var timer = setInterval(function() {
						var nowTime = new Date();
						var endTime = new Date(result.data.overTime);
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
				};
				//参数选择
				mui('#proIn').on('tap', '.chooseParam', function() {
					//变换class
					h(this).addClass('paramActive').siblings().removeClass('paramActive');
					var child = h(this).find('span');
					//设置对应的priceid
					h('#priceId').val(child.attr('data-priceid'));
					if(userRole == 0) { //普通人
						h('#marketPrice').html('¥' + child.attr('data-price'));
						h('#spePrice').html('¥' + child.attr('data-price'));
						h('#originalPrice').html('¥' + child.attr('data-spePrice'));
						h('#zcPrice').html('¥' + child.attr('data-price'));
					} else if(userRole == 1) { //工程商
						h('#marketPrice').html('¥' + child.attr('data-price'));
						h('#businessPrice').html('¥' + child.attr('data-companyPrice'));
						h('#spePrice').html('¥' + child.attr('data-price'));
						h('#comPanySpePrice').html('¥' + child.attr('data-companyPrice'));
						h('#oriComSpePrice').html('¥' + child.attr('data-speCompanyPrice'));
						h('#zcPrice').html('¥' + child.attr('data-price'));
						h('#zcCompanyPrice').html('¥' + child.attr('data-companyPrice'));

					}
				});
				//如果价格为零,不可加入购物车
				if(result.data.pojos[0].price / 100 == 0) {
					isAddCart = false;
				}
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

//更多服务
h('#more').tap(function() {
	h('#moreSe').show();
	h('#mark').show();
});
h('#mark').tap(function() {
	h('#moreSe').hide();
	h(this).hide();
});
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

//评价页面颜色切换
mui('#recomList').on('tap', 'li', function() {
	h(this).addClass('recomActive').siblings().removeClass('recomActive');
})

//查看更多评价
h('#seeMoreRecom').tap(function() {
	h('#tabL').find('li').eq(2).addClass('active').siblings().removeClass('active');
	h('#proRe').addClass('isShow').siblings().removeClass('isShow');
	h("#handle").hide();
});
//json转换
template.defaults.imports.jsonChange = services.jsonChange;

//数量的减
mui('#proIn').on('tap', '.minus', function() {
	var num = h(this).siblings('input').val();
	if((/^\+?[1-9]\d*$/.test(num)) && num < 10000 && num > 1) {
		num--;
		h(this).siblings('input').val(num);
		h('#changeCount').html('x' + num);
	} else {
		h(this).siblings('input').val(1);
		h('#changeCount').html('x' + 1);
	}
});
//数量的加
mui('#proIn').on('tap', '.add', function() {
	var num = h(this).siblings('input').val();
	if((/^\+?[1-9]\d*$/.test(num)) && num < 10000) {
		num++;
		h(this).siblings('input').val(num);
		h('#changeCount').html('x' + num);
	} else {
		h(this).siblings('input').val(1);
		h('#changeCount').html('x' + 1);
	}
});
//加入购物车
h('#addShopcart').tap(function() {
	if(localStorage['userName']) {
		if(!isAddCart) {
			mui.toast('该商品价格面议,请与客服联系!');
			return false;
		} else if(!((/^\+?[1-9]\d*$/.test(h('#selectNumber').val())) && h('#selectNumber').val() <= 10000)) {
			mui.toast('请输入正确的数量!');
			h('#selectNumber').val(1)
		} else {
			var insertData = {
				userId: services.checkLogin().userId,
				commodityId: h('#commtyid').val(),
				number: h('#selectNumber').val(),
				priceId: h('#priceId').val()
			};
			mui.ajax(services.baseUrl + '/cart/insert', {
				type: "POST",
				data: services.Encrypt(JSON.stringify(insertData)),
				timeout: 20000,
				beforeSend: function(request) {
					services.beforeHeader(request);
				},
				success: function(data) {
					var result = JSON.parse(services.Decrypt(data));
					//console.log(JSON.stringify(result));
					if(result.status === 200) {
						mui.toast('加入购物车成功!');
						var curenView = plus.webview.getWebviewById('shopCart.html');
						mui.fire(curenView, 'refresh', {
							loginStatus: 1
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
});