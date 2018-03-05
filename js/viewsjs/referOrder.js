mui.init({
	preloadPages: [{
		url: 'takerMsg.html',
		id: 'takerMsg.html'
	}]
});
var userId = services.checkLogin().userId;
var receiveMsg = '';
mui.plusReady(function() {
	var priceArray = plus.webview.currentWebview().priceIds,
		number = plus.webview.currentWebview().proNum;
	//用户地址
	userAddress();
	//执行产品信息
	referOrder(priceArray, number);
	//监听选择收货地址的自定义事件刷新页面
	window.addEventListener('addMsg', function(event) {
		var backAddress = event.detail.chooseAdd;
		var isComm = event.detail.isComm;
		//根据返回的isComm决定更改哪里的地址数据;
		if(isComm) { //收货地址
			h('#addressId').val(backAddress.addressId);
			h('#profile').html(backAddress.userAddress);
			h('#tel').val(backAddress.userPhone);
			h('#addUserName').html(backAddress.userName);
			h('#addUserId').html(backAddress.userPhone);
		} else { //发票地址
			h('#invoiceAddress').val(backAddress.addressId);
			h('#setTakerAddress').html(backAddress.userAddress);
		}
	});
	//监听takerMsg页面信息
	window.addEventListener('takerMsg', function(event) {
		var takerMsg = event.detail.takerMsg;
		if(takerMsg) { //如果开了发票
			receiveMsg = JSON.parse(takerMsg); //赋值
			//更改是否开票状态
			h('#invoiceType').val(receiveMsg.invoiceType);
			if(receiveMsg.invoiceType == 2) { //将发票地址显示出来
				h('#takerAddressBox').show();
			} else {
				h('#takerAddressBox').hide();
			}
			//改变开票状态
			switch(receiveMsg.invoiceType) {
				case '0':
					h('#isBillBox').html('不开发票');
					break;
				case '1':
					h('#isBillBox').html('普通发票');
					break;
				case '2':
					h('#isBillBox').html('增值发票');
					break;
				default:
					break;
			}
		}
	});
	//点击提交按钮
	h('#referBtn').tap(function() {
		//判断是否填写了地址 
		var isSelectAdd = h('#addressId').val();
		//后台数据
		var referData = {
			priceIds: priceArray,
			addressId: isSelectAdd,
			addition: h('#action').val(),
			tel: h("#tel").val(),
			invoiceAddress: h('#invoiceAddress').val(),
			invoiceType: h('#invoiceType').val(),
			userId: userId,
			payment: h('#payStyleHtml').attr('data-payId'), //支付方式
		};
		if(!isSelectAdd) {
			mui.toast('请先选择地址!');
			return false;
		} else {
			if(number) { //证明是众筹页跳转过来的
				referData.isActive = '1';
				referData.num = number;
			} else {
				referData.isActive = '0';
			}

		}
		if(receiveMsg != '') {
			for(var key in receiveMsg) {
				referData[key] = receiveMsg[key]
			}
		}
		//判断开票类型
		//console.log(JSON.stringify(referData));
		mui.ajax(services.baseUrl + '/orderinfo/submit', {
			data: services.Encrypt(JSON.stringify(referData)),
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			type: 'post',
			timeout: 20000,
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				//console.log(services.Decrypt(data));
				if(result.status == 200) {
					mui.openWindow({
						url: "pay.html",
						id: "pay.html",
						waiting: {
							autoShow: true,
							title: '正在加载...'
						},
						extras: {
							payment: h('#payStyleHtml').attr('data-payId'),
							orderId: result.data
						}
					})
				}
			},
			error: function(xhr, type, errorThrown) {
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});

	});
	//开票与不开票
	h('#isBill').tap(function() {
		//获得开票页面
		var taker = null;
		if(!taker) {
			taker = plus.webview.getWebviewById('takerMsg.html');
		}
		//触发详情页面的newsId事件
		mui.fire(taker, 'stutas', {
			paymentId: h('#payStyleHtml').attr('data-payId'),
			invoiceType: h('#invoiceType').val()
		});
		mui.openWindow({
			url: 'takerMsg.html',
			id: 'takerMsg.html'
		})
	});
	//点击发票地址
	h('#takerAddressBox').tap(function() {
		services.nativeJump("address.html", "address.html", '选择地址', {
			isComm: false
		});
	});

});
//封装产品信息后台请求
function referOrder(priceArray, number) {
	var orderData = '';
	if(number) {
		orderData = {
			userId: userId,
			priceIds: priceArray,
			num: number,
			isActive: 1
		};
	} else {
		orderData = {
			userId: userId,
			priceIds: priceArray,
			isActive: 0
		}
	}
	//	//console.log(JSON.stringify(orderData));
	mui.ajax(services.baseUrl + '/orderinfo/goods/list', {
		data: services.Encrypt(JSON.stringify(orderData)),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//			//console.log(JSON.stringify(result));
			if(result.status == 200) {
				//渲染产品数据
				h('#proPromaterBox').html(template('proPromaterList', {
					model: result.data
				}));
				setTotal(result.data.postage / 100);
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
//用户地址信息
function userAddress() {
	mui.ajax(services.baseUrl + '/orderinfo/address/list', {
		data: services.Encrypt(JSON.stringify({
			userId: userId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//console.log(JSON.stringify(result));
			if(result.status == 200) {
				//渲染地址信息
				h('#addressBox').html(template('addressList', {
					model: result.data,
					userMsg: services.checkLogin()
				}));
				//设置默认的发票地址
				if(result.data.length > 0) {
					for(var i = 0, len = result.data.length; i < len; i++) {
						if(result.data[i].isDefault) {
							h('#setTakerAddress').html(result.data[i].addressInfo);
							h('#invoiceAddress').val(result.data[i].id);
							break;
						}
					}
				};
				//选择更多地址
				h('#moreAddress').tap(function() {
					services.nativeJump("address.html", "address.html", '选择地址', {
						isComm: true
					});
				});
				//请新增地址
				h('#jumpChooseAddress').tap(function() {
					services.nativeJump("address.html", "address.html", '选择地址', {
						isComm: true
					});
				});
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
//封装计算总价方法
function setTotal(postage) {
	var countNum = 0;
	var sum = 0;
	mui('#proPromaterBox .proMsg').each(function() {
		var num = parseInt(h(this).find('.orderProNum').html());
		var price = parseFloat(h(this).find('.orderProPrice').html());
		sum += num * price;
		countNum += num;
	});
	//总价
	h('#totlePrice').html('¥' + sum.toFixed(2));
	//运费
	h('#freighPrice').html('¥' + postage.toFixed(2));
	//应付金额
	var needPrice = sum + parseFloat(postage);
	h('#mustPrice').html('¥' + needPrice.toFixed(2));
}

//选择支付方式
h('#payStyle').tap(function() {
	var picker = new mui.PopPicker();
	picker.setData([{
			value: '1',
			text: '在线支付'
		},
		{
			value: '3',
			text: '对公账号'
		}
	]);
	picker.show(function(selectItems) {
		h('#payStyleHtml').html(selectItems[0].text);
		h('#payStyleHtml').attr('data-payId', selectItems[0].value);
	});
});
//跳转至商品详情
mui('#proPromaterBox').on('tap', '.orderImg', function() {
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