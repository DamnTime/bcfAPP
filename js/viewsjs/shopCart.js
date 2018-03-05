mui.init();
var userId = services.checkLogin().userId;
//脚部选项卡切换
mui.plusReady(function() {
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
	//检查是否登录
	window.addEventListener('refresh', function(e) {
		var status = e.detail.loginStatus;
		if(status == 1 || status == 0) {
			location.reload();
		}
	}); 
	//获取购物车信息 
	if(userId){
		getShopList(userId);
	}else{
		h('#noRigester').show().siblings().hide();
	}
	//跳转至提交订单页面
	h('#jumpRefer').tap(function() {
		var priceArray = whoChecked();
		if(priceArray.length <= 0) {
			mui.toast('请至少选择一件商品!');
		} else {
			mui.openWindow({
				url: 'referOrder.html',
				id: 'referOrder.html',
				aniShow: 'none',
				waiting: {
					autoShow: true,
					title: '正在加载...'
				},
				extras: {
					priceIds: priceArray
				},
				styles: {
					titleNView: {
						titleText: '填写订单',
						titleColor: '#FFFFFF',
						titleSize: '19px',
						backgroundColor: '#FF3D00',
						progress: {
							color: 'transprent',
							height: '0'
						},
						splitLine: {
							color: 'transprent',
							height: '0'
						},
						autoBackButton: true
					}
				}
			})
		}
	});

	function jumpTo(url, priceIds) {
		mui.openWindow({
			url: url,
			id: url,
			aniShow: 'none',
			waiting: {
				autoShow: true,
				title: '正在加载...'
			},
			extras: {
				priceIds: priceIds
			}
		})
	};

	//点击删除
	h('#deleteBtn').tap(function() {
		var btnArray = ['取消', '确定'];
		mui.confirm('真的要删除吗？', '温馨提示', new Array('否', '是'), function(e) {
			if(e.index == 1) {
				var priceArray = whoChecked();
				var userId = services.checkLogin().userId;
				if(priceArray.length <= 0) {
					mui.toast('请至少选择一件商品!');
				} else {
					//删除接口
					mui.ajax(services.baseUrl + '/cart/delete', {
						data: services.Encrypt(JSON.stringify({
							userId: userId,
							priceIds: priceArray
						})),
						beforeSend: function(request) {
							services.beforeHeader(request);
							plus.nativeUI.showWaiting();
						},
						type: 'post',
						timeout: 20000,
						success: function(data) {
							var result = JSON.parse(services.Decrypt(data));
							//console.log(JSON.stringify(result));
							if(result.status == 200) {
								//重新触发当前页面
								var curenView = plus.webview.currentWebview();
								mui.fire(curenView, 'refresh', {
									loginStatus: 1
								});
							}
						},
						error: function(xhr, type, errorThrown) {
							h('#loadingFailArea').show();
						},
						complete: function() {
							plus.nativeUI.closeWaiting();
						}
					});
				}
			} else {

			}
		});
	});
})
//封装购物车列表
function getShopList(userid) {
	//设置全选按钮为选中
	document.getElementById('isTick').setAttribute('checked', 'checked');
	document.getElementById('isTick').checked = true;
	mui.ajax(services.baseUrl + '/cart/selectall', {
		data: services.Encrypt(JSON.stringify({
			userId: userid
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
			//			plus.nativeUI.showWaiting();
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
//			console.log(JSON.stringify(result));
			if(result.status == 200) {
				if(result.data.outlines.length <= 0) {
					h('#nullShopCart').show().siblings().hide();
				} else {
					h('#comContent').show().siblings().hide();
					// 列表
					h('#shopCartBox').html(template('shopCartList', {
						model: result.data
					}));
					//统计总价格
					setTotal();
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			h('#loadingFailArea').show();
		},
		complete: function() {
			//			plus.nativeUI.closeWaiting();
		}
	});
}
//封装计算总价方法
function setTotal() {
	var sum = 0;
	mui("#shopCartBox li").each(function() {
		if(h(this).find('input').attr('checked')) {
			var num = parseInt(h(this).find('.selectCount').val());
			var price = parseFloat(h(this).find('.singlePrice').html());
			sum += num * price;
		}
	});
	//总价
	h("#totalPrice").html('¥' + sum.toFixed(2));
}

//点击每个checkbox 
mui('#shopCartBox').on('change', '.singleInput', function() {
	if(!this.checked) {
		h(this).removeAttr('checked');
		document.getElementById('isTick').checked = false;
		setTotal();
	} else {
		var count = 0;
		h(this).attr('checked', true);
		mui("#shopCartBox li").each(function() {
			if(h(this).find('input').attr('checked')) {
				count++
			}
		});
		if(count == mui("#shopCartBox li").length) {
			document.getElementById('isTick').checked = true;
		}
		setTotal();
	}
});
//全选
mui('.settleMent').on('change', '#isTick', function() {
	var that = this;
	var s = document.getElementsByClassName('singleInput');
	if(that.checked) {
		for(var i = 0, len = s.length; i < len; i++) {
			s[i].setAttribute('checked', 'checked');
			s[i].checked = true;
		}
		setTotal();
	} else {
		for(var i = 0, len = s.length; i < len; i++) {
			s[i].removeAttribute('checked');
			s[i].checked = false;
		}
		h('#totalPrice').html('');
	}

});
//数量的减
mui('#shopCartBox').on('tap', '.icon-jian', function() {
	var self = this,
		nowseletor = h(this).siblings('.selectCount'),
		nowNum = nowseletor.val();
	if((/^\+?[1-9]\d*$/.test(nowseletor.val())) && nowseletor.val() < 10000) {
		nowNum--;
		if(nowNum >= 1) {
			nowseletor.val(nowNum);
			var addData = JSON.stringify({
				userId: services.checkLogin().userId,
				commodityId: parseInt(h(this).siblings('.selectCount').attr('data-commodityId')),
				number: parseInt(h(this).siblings('.selectCount').val()),
				priceId: parseInt(h(this).siblings('.selectCount').attr('data-priceId'))
			});
			updataNum(self, addData);
		}
	} else {
		mui.toast('请输入正确的数字且不大于10000');
	}
});

//数量的加
mui('#shopCartBox').on('tap', '.icon-jia', function() {
	var self = this,
		nowseletor = h(this).siblings('.selectCount'),
		nowNum = nowseletor.val();
	if((/^\+?[1-9]\d*$/.test(nowseletor.val())) && nowseletor.val() < 10000) {
		nowNum++;
		nowseletor.val(nowNum);
		var addData = JSON.stringify({
			userId: services.checkLogin().userId,
			commodityId: parseInt(h(this).siblings('.selectCount').attr('data-commodityId')),
			number: parseInt(h(this).siblings('.selectCount').val()),
			priceId: parseInt(h(this).siblings('.selectCount').attr('data-priceId'))
		});
		updataNum(self, addData);
	} else {
		mui.toast('请输入正确的数字且不大于10000');
	}
});

//监听input框的输入
mui('#shopCartBox').on('input', '.selectCount', function() {
	var self = this,
		inputNum = h(this).val();
	if(!IsNum(inputNum)) {
		h(this).val(1);
	} else {
		var addData = JSON.stringify({
			userId: services.checkLogin().userId,
			commodityId: parseInt(h(this).attr('data-commodityId')),
			number: parseInt(h(this).val()),
			priceId: parseInt(h(this).attr('data-priceId'))
		});
		updataNum(self, addData);
	}
});

//是否是数字
function IsNum(num) {
	var reNum = /^\+?[1-9]\d*$/;
	return(reNum.test(num) && num <= 10000);
}

//封装数量的加减
function updataNum(self, addData) {
	var isSelect = self.parentElement.parentElement.parentElement.previousElementSibling.previousElementSibling.firstElementChild;
	if(!isSelect.checked) {
		isSelect.setAttribute('checked', 'checked');
		isSelect.checked = true;
		var s = document.getElementsByClassName('singleInput');
		var c = 0;
		for(var i = 0, len = s.length; i < len; i++) {
			if(s[i].checked) {
				c++;
			}
		}
		if(c == s.length) {
			document.getElementById('isTick').setAttribute('checked', 'checked');
			document.getElementById('isTick').checked = true;
		}
	}
	//console.log(isSelect.checked);
	//后台请求
	mui.ajax(services.baseUrl + '/cart/update', {
		data: services.Encrypt(addData),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//console.log(JSON.stringify(result));
			if(result.status == 200) {
				setTotal();
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

//查询被选中的方法
function whoChecked() {
	var s = document.getElementsByClassName('singleInput');
	var priceIds = [];
	for(var i = 0, len = s.length; i < len; i++) {
		if(s[i].checked) {
			priceIds.push(s[i].value);
		}
	}
	return priceIds;
}
//跳转至商品详情页
mui('#shopCartBox').on('tap', '.proImg', function() {
	var id = h(this).attr('data-url');
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