mui.init({
	swipeBack: false
});
mui.plusReady(function() {
	var parentWs = plus.webview.getWebviewById('pay.html'),
		payment = parentWs.payment,
		orderId = parentWs.orderId,
		userId = services.checkLogin().userId;
	parentWs.setStyle({
		'popGesture': 'none'
	});
	//再按一次退出应用
	services.againQuite();
	if(payment == 1) { //线上支付
		h('#inlinePay').show();
	} else if(payment == 3) { //线下支付
		h('#outlinePay').show();
	}
	//console.log(orderId);
	//请求该订单下的商品数据
	mui.ajax(services.baseUrl + '/orderinfo/orders/thisorder', {
		data: services.Encrypt(JSON.stringify({
			userId: userId,
			orderId: orderId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status == 200) {
				//产品列表
				h('#orderBox').html(template('orderList', {
					model: result.data.info
				}));
			}
		},
		error: function(xhr, type, errorThrown) {
			h('#loadingFailArea').show();
		},
		complete: function() {
			h('.loadingImg').hide();
		}
	});
	// 获取支付通道  
	//	plus.payment.getChannels(function(channels) {
	//		for(var i in channels) {
	//			if(channels[i].id == "wxpay") {
	//				wxChannel = channels[i];
	//			} else {
	//				aliChannel = channels[i]; 
	//			}
	//		}
	//	}, function(e) {
	//		mui.alert("获取支付通道失败：" + e.message);
	//	});
	//支付宝支付
	h('#alipay').tap(function() {
		plus.nativeUI.showWaiting();
		//通知父级页面选择的是那种支付方式
		mui.fire(parentWs, 'payType', {
			type: 0
		});
		mui.ajax(services.baseUrl + '/goto/payfor/app/' + orderId, {
			data: '',
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			type: 'get',
			timeout: 20000,
			success: function(data) {
				plus.nativeUI.closeWaiting();
				var div = document.createElement('div');
				div.innerHTML = data;
				document.body.appendChild(div);
				document.forms[0].submit();
			},
			error: function(xhr, type, errorThrown) {
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});
	});
	//微信支付
	h('#weixinPay').tap(function() {
		plus.nativeUI.showWaiting();
		if(plus.runtime.isApplicationExist({
				pname: 'com.tencent.mm',
				action: 'weixin://'
			})) {
			var data = '';
			if(mui.os.android) {
				data = services.Encrypt(JSON.stringify({
					orderId: orderId,
					type: "Android"
				}))
			} else {
				data = services.Encrypt(JSON.stringify({
					orderId: orderId,
					type: "IOS"
				}))
			}
			mui.fire(parentWs, 'payType', {
				type: 1
			});
			mui.ajax(services.baseUrl + '/wx/pay/forWX/app', {
				data: data,
				beforeSend: function(request) {
					services.beforeHeader(request);
				},
				type: 'post',
				timeout: 20000,
				success: function(data) {
					var res = JSON.parse(services.Decrypt(data));
					if(res.data) {
						//console.log(res.data);
						plus.nativeUI.closeWaiting();
						//						if(mui.os.ios) {
						//							
						//						} else {
						////							mui.openWindow({
						////								url: "https://www.ba256.com/views/wxpay.html?" + window.btoa(res.data),
						////								id: 'https://www.ba256.com/views/wxpay.html',
						////								waiting: {
						////									autoShow: true,
						////									title: '正在加载...'
						////								}
						////							})

						//
						//						location.href = "https://www.ba256.com/views/wxpay.html?" + window.btoa(res.data);
						
						//判断手机类型
						var phoneType = '';
						if(mui.os.ios) {
							phoneType = 0;
						} else {
							phoneType = 1;
						}
						//跳转至外网
						document.location.href = "https://www.ba256.com/views/payInterFace.html?dd=" + window.btoa(res.data) + "&phoneType=" + phoneType;

					} else {
						plus.nativeUI.closeWaiting();
						mui.alert('订单已失效，请重新提交或联系客服!', '温馨提示', '回到首页', returnHome);
					}
				},
				error: function(xhr, type, errorThrown) {
					h('#loadingFailArea').show();
				},
				complete: function() {
					h('.loadingImg').hide();
				}
			});
		} else {
			mui.alert("微信应用未安装");
		}
	});
	//失效订单回到首页
	function returnHome() {
		services.returnHome('slide-in-left', 'slide-out-right');
	}
});
//跳转至商品详情
mui('#orderBox').on('tap', '.orderImg', function() {
	var id = h(this).attr('data-id');
	mui.openWindow({
		url: "proDetail.html",
		id: "proDetail.html",
		waiting: {
			autoShow: true,
			title: '正在加载...'
		},
		extras: {
			proId: id
		}
	})
});
