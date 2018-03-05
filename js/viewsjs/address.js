mui.init();
mui.plusReady(function() {
	//接受isComm
	var isComm = plus.webview.currentWebview().isComm;
	//重写back函数
	var old_back = mui.back;
	mui.back = function() {
		var orderOrder = null;
		orderOrder = plus.webview.currentWebview().opener();
		if(orderOrder) {
			mui.fire(orderOrder, 'addMsg', {
				chooseAdd: selectAddress(),
				isComm: isComm
			})
		};
		//继续当前页面原有返回逻辑
		old_back();
	}

	//新增按钮
	h('#jumpAdd').tap(function() {
		services.nativeJump('delAddress.html', 'delAddress.html', '新增收货地址');

	});
	//编辑按钮
	mui('#addList').on('tap', '.jumpPro', function() {
		var id = this.getAttribute('data-proid');
		services.nativeJump('delAddress.html', 'delAddress.html', '编辑收货地址', {
			addressId: id
		});
	});
	//编辑新增地址的返回刷新
	window.addEventListener('addressRefresh', function(event) {
		var i=event.detail.isBackRefresh;
		if(i){
			plus.webview.currentWebview().reload();
		}
	});

})
//数据请求
var userId = services.checkLogin().userId;
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
		if(result.status == 200) {
			//地址列表
			h('#addList').html(template('userMsg', {
				model: result.data
			}));

		}
	},
	error: function(xhr, type, errorThrown) {
		h('#loadingFailArea').show();
	},
	complete: function() {

	}
});

function selectAddress() {
	var addressList = document.getElementsByTagName('input');
	var choose = {};
	//	//console.log(addressList);
	for(var i = 0, len = addressList.length; i < len; i++) {
		if(addressList[i].checked) {
			choose = {
				addressId: addressList[i].value,
				userName: addressList[i].getAttribute('data-uname'),
				userPhone: addressList[i].getAttribute('data-uPhone'),
				userAddress: addressList[i].getAttribute('data-uAddress')
			}
			break;
		}
	}
	return choose;
}
//删除地址
(function($) {
	var btnArray = ['确认', '取消'];
	$('#addList').on('slideleft', '.mui-table-view-cell', function(event) {
		var elem = this;
		mui.confirm('确认删除该条地址？', '温馨提示', btnArray, function(e) {
			if(e.index == 0) {
				var id = elem.getAttribute('data-addressid');
				mui.ajax(services.baseUrl + '/orderinfo/address/delete', {
					data: services.Encrypt(JSON.stringify({id:id})),
					beforeSend: function(request) {
						services.beforeHeader(request);
					},
					type: 'post',
					timeout: 20000,
					success: function(data) {
						var result = JSON.parse(services.Decrypt(data));
						if(result.status == 200) {
							elem.parentNode.removeChild(elem);
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
				setTimeout(function() {
					$.swipeoutClose(elem);
				}, 0);
			}
		});
	});
})(mui)