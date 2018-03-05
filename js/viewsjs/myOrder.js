mui.init();
(function($) {
	$.ready(function() {
		var userMsg = services.checkLogin();
		var userId = userMsg.userId;
		var curNavIndex;
		var mescrollArr = new Array(4);
		mui.plusReady(function() {
			plus.webview.currentWebview().setStyle({
				scrollIndicator: 'none'
			});
			//获取typeID
			var self = plus.webview.currentWebview();
			var typeId = parseInt(self.typeId)-1;
			curNavIndex=typeId;
			h('#userHandleList').find('li').eq(typeId).addClass('typeActive');
			h('#allOrderDetail' + (typeId)).show();
			//初始化
			mescrollArr[typeId] = initMescroll("allOrderDetail" + typeId,typeId);
			//点击切换
			mui('#userHandleList').on('tap', 'a', function() {
				var id = h(this).attr('data-typeId');
				if(curNavIndex != id) {
					h(this).parent('li').addClass('typeActive').siblings().removeClass('typeActive');
					h('#allOrderDetail' + id).show().siblings().hide();
					mescrollArr[curNavIndex].hideTopBtn();
					//如果当前mesrcoll没被初始换
					if(mescrollArr[id] == null) {
						mescrollArr[id] = initMescroll("allOrderDetail" + id,id);
					} else {
						//检查是否需要显示回到到顶按钮
						var curMescroll = mescrollArr[id];
						var curScrollTop = curMescroll.getScrollTop();
						if(curScrollTop >= curMescroll.optUp.toTop.offset) {
							curMescroll.showTopBtn();
						} else {
							curMescroll.hideTopBtn();
						}
					}
					//更新标记
					curNavIndex = id;
				}
			})
			/*创建MeScroll对象*/
			function initMescroll(mescrollId,type) {
				var mescroll = new MeScroll(mescrollId, {
					up: {
						callback: function(page){
							commonAjax(page,type);
						},
						page: {
							num: 0,
							size: 8,
						},
						isBounce: false,
						noMoreSize: 1,
						empty: {
							tip: "暂无相关数据~",
						},
						toTop: { //配置回到顶部按钮
							src: "images/mescroll-totop.png",
							offset: 3000
						}
					}
				});
				return mescroll;
			}
			//获取后台数据
			function commonAjax(page,type) {
				var status = null;
				switch(parseInt(type)) {
					case 0:
						status = ''
						break;
					case 1:
						status = 0
						break;
					case 2:
						status = 1
						break;
					case 3:
						status = 4
						break;
				}
				setTimeout(function() {
					mui.ajax(services.baseUrl + '/orderinfo/orders/list', {
						data: services.Encrypt(JSON.stringify({
							userId: userId,
							status: status,
							pageNum: page.num,
							pageSize: page.size
						})),
						beforeSend: function(request) {
							services.beforeHeader(request);
						},
						type: 'post',
						timeout: 20000,
						success: function(data) {
							var result = JSON.parse(services.Decrypt(data));
							if(result.status == 200) {
								var html = template('typeOrderDetail' + type, {
										model: result.data
									}),
									innerBox = document.getElementById('dataList' + type);
								if(page.num == 1) { //第一页
									innerBox.innerHTML = html;
								} else {
									innerBox.innerHTML += html;
								}
								mescrollArr[type].endBySize(!result.data.orders.rows ? 0 : result.data.orders.rows.length, !result.data.orders.total ? 0 : result.data.orders.total);
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
		})
	});
	//是否显示去评价按钮
	template.defaults.imports.isShowBtn = function(checkData) {
		for(var i = 0; i < checkData.length; i++) {
			if(checkData[i].isEvaluate == 1) {
				return true;
				break;
			} else {
				return false;
				break;
			}
		}
	};

	// 判断订单状态
	function checkStatus(orderId, who) {
		mui.ajax(services.baseUrl + '/orderinfo/orders/invalid', {
			data: services.Encrypt(JSON.stringify({
				orderId: orderId
			})),
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			type: 'post',
			timeout: 20000,
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				if(result.status === 200) {
					if(who === 2) {
						services.nativeJump("evaluateList.html", "evaluateList.html", '评价', {
							orderId: orderId,
							commodityId: ''
						});
					} else if(who === 3) {
						mui.openWindow({
							url: "pay.html",
							id: "pay.html",
							waiting: {
								autoShow: true,
								title: '正在加载...'
							},
							extras: {
								payment: 1,
								orderId: orderId
							}
						})
					}
				} else if(result.status === 201) {
					mui.toast('该订单已失效!');
					setTimeout(function() {
						location.reload();
					}, 1500);
				}
			},
			error: function(xhr, type, errorThrown) {
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});
	}

	//操作订单
	function handleOrder(url, orderId, msg) {
		$.ajax({
			type: "POST",
			url: services.baseUrl + url,
			data: services.Encrypt(JSON.stringify({
				orderId: orderId
			})),
			timeout: 30000,
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				if(result.status === 200) {
					mui.toast(msg);
					setTimeout(function() {
						location.reload();
					}, 1000);
				}
			},
			error: function() {
				layer.alert('服务器繁忙,请稍后重试!');
			}
		});
	}

	//删除订单
	mui('#orderArea').on('tap', '.deleteOrder', function() {
		var id = h(this).attr('data-orderid');

		function callback(e) {
			if(e.index == 0) {
				handleOrder('/orderinfo/delete', id, '删除成功')
			} else {
				return;
			}
		};
		mui.confirm('', '确认删除?', ['确认', '取消'], callback, 'div')
	});

	//取消订单
	mui('#orderArea').on('tap', '.cancelBtn', function() {
		var id = h(this).attr('data-orderid');

		function callback(e) {
			if(e.index == 0) {
				handleOrder('/orderinfo/cancel', id, '取消成功')
			} else {
				return;
			}
		};
		mui.confirm('', '确认取消?', ['确认', '取消'], callback, 'div')
	});

	//确认收货
	mui('#orderArea').on('tap', '.comfirmGoods', function() {
		var id = h(this).attr('data-orderid');
		handleOrder('/orderinfo/sign/for', id, '确认成功');
	});

	//去评价
	mui('#orderArea').on('tap', '.goEva', function() {
		var orderId = h(this).attr('data-payOrderId');
		var status = parseInt(h(this).attr('data-orderSatus'));
		if(status === 3) {
			checkStatus(orderId, 2);
		}
	});

	//去支付
	mui('#orderArea').on('tap', '.goPay', function() {
		var orderId = h(this).attr('data-payOrderId');
		var status = parseInt(h(this).attr('data-orderSatus'));
		if(status === 0) {
			checkStatus(orderId, 3);
		}
	});
	//跳转至商品详情
	mui('#orderArea').on('tap', '.orderDetailImg', function() {
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

})(mui);