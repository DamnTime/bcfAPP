mui.init({
	swipeBack: false
});
var code = null;
var username = null;
var tel = null;
var codeKey = null;
var preData = {};
mui.plusReady(function() {
	//获取是从哪个页面跳过来的
	var type = plus.webview.currentWebview().type;
	if(type == 1) { //证明是企业注册
		preData = JSON.parse(plus.webview.currentWebview().constructor);
		plus.webview.currentWebview().setStyle({
			'popGesture': 'none'
		});
	}
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
	h('#nextStatusBtn').tap(function() {
		if(!codeKey) {
			mui.alert("温馨提示", "请先获取验证码");
			return;
		} else if(!/^[^! @#$%^&*()?/]{2,15}$/.test(h('#nickName').val())) {
			mui.alert("温馨提示", "用户名格式不正确,请输入5到20位字符,不包含特殊字符!");
			return false;
		} else {
			username = h('#nickName').val();
			code = h('#voliCode').val();
			tel = h('#phoneNum').val();
			mui.ajax(services.baseUrl + '/user/compare', {
				data: services.Encrypt(JSON.stringify({
					key: codeKey,
					code: code
				})),
				beforeSend: function(request) {
					services.beforeHeader(request);
				},
				type: 'post',
				timeout: 10000,
				success: function(data) {
					var res = JSON.parse(services.Decrypt(data));
					if(res.status == 200) {
						//						var detailPage = null;
						//						if(!detailPage) {
						//							detailPage = plus.webview.getWebviewById('registerSatusTwo.html');
						//						}
						//						//触发详情页面的newsId事件
						//						mui.fire(detailPage, 'proId', {
						//							proId: {
						//								code: code,
						//								username: username,
						//								tel: tel
						//							}
						//						});
						//						mui.openWindow({
						//							id: 'registerSatusTwo.html'
						//						});
						preData.username = username;
						preData.tel = tel;
						//跳转至第二步
//						services.nativeJump('registerSatusTwo.html', 'registerSatusTwo.html', '设置密码', {
//							type: type,
//							constructor: JSON.stringify(preData)
//						});
						mui.openWindow({
							url: 'registerSatusTwo.html',
							id: 'registerSatusTwo.html',
							waiting: {
								autoShow: true,
								title: '正在加载...'
							},
							styles: {
								titleNView: {
									titleText: '设置密码',
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
									}
								}
							},
							extras: {
								type: type,
								constructor: JSON.stringify(preData)
							}
						})
					} else {
						mui.alert(res.msg);
					}
				},
				error: function(xhr, type, errorThrown) {
					mui.alert("系统繁忙请稍后重试");
				}
			});
		}

	});

})
//监听input框输入
var inputNick = false;
var inputPhone = false;
var inputCode = false;
document.getElementById("nickName").addEventListener('input', function() {
	if(this.value.length > 0) {
		inputNick = true;
		if(inputNick && inputPhone && inputCode) {
			h('#nextStatusBtn').removeAttr('disabled').removeClass('errNext').addClass('sucNext')
		}
	} else {
		inputNick = false;
		if(inputNick || inputPhone || inputCode) {
			h('#nextStatusBtn').attr('disabled', 'true').removeClass('sucNext').addClass('errNext')
		}
	}
});
document.getElementById("phoneNum").addEventListener('input', function() {

	if(this.value.length > 0) {
		inputPhone = true;
		if(inputNick && inputPhone && inputCode) {
			h('#nextStatusBtn').removeAttr('disabled').removeClass('errNext').addClass('sucNext')
		}
	} else {
		inputPhone = false;
		if(inputNick || inputPhone || inputCode) {
			h('#nextStatusBtn').attr('disabled', 'true').removeClass('sucNext').addClass('errNext')
		}
	}
});
document.getElementById("voliCode").addEventListener('input', function() {
	if(this.value.length > 0) {
		inputCode = true;
		if(inputNick && inputPhone && inputCode) {
			h('#nextStatusBtn').removeAttr('disabled').removeClass('errNext').addClass('sucNext')
		}
	} else {
		inputCode = false;
		if(inputNick || inputPhone || inputCode) {
			h('#nextStatusBtn').attr('disabled', 'true').removeClass('sucNext').addClass('errNext')
		}
	}
});

//验证码  
h('#getCode').tap(function() {
	var temp = h('#phoneNum').val();
	var time = 60;
	var self = this;
	if(!temp) {
		mui.alert('请先输入手机号!');
		return false;
	} else if(/^[1][34578]\d{9}$/.test(temp)) {
		h(self).addClass('noUseCode').attr('disabled', 'true').val(time + 's后重新发送');
		var timer = setInterval(function() {
			if(time > 0) {
				time--;
				h(self).addClass('noUseCode').attr('disabled', 'true').val(time + 's后重新发送');
			} else {
				clearInterval(timer);
				h(self).removeClass('noUseCode').val('获取验证码').removeAttr('disabled');
			}
		}, 1000);
		//验证手机号
		mui.ajax(services.baseUrl + '/customer/phone', {
			data: services.Encrypt(JSON.stringify({
				tel: temp
			})),
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			type: 'post',
			timeout: 10000,
			success: function(data) {
				var res = JSON.parse(services.Decrypt(data));
				//console.log('比较号码'+services.Decrypt(data));
				if(res.status == 200) {
					//获取验证码			
					mui.ajax(services.baseUrl + '/user/code', {
						data: services.Encrypt(JSON.stringify({
							tel: temp
						})),
						beforeSend: function(request) {
							services.beforeHeader(request);
						},
						type: 'post',
						timeout: 10000,
						success: function(data) {
							var res = JSON.parse(services.Decrypt(data));
							if(res.status == 200) {
								//console.log('获取codekey'+services.Decrypt(data));
								codeKey = res.data;
								//点击下一步     
							} else {
								mui.alert(res.msg);
								h(self).removeClass('noUseCode').val('获取验证码').removeAttr('disabled');
							}

						},
						error: function(xhr, type, errorThrown) {
							mui.toast("系统繁忙请稍后重试");
							h(self).removeClass('noUseCode').val('获取验证码').removeAttr('disabled');
						}
					});
				} else {
					mui.alert(res.msg);
					h(self).removeClass('noUseCode').val('获取验证码').removeAttr('disabled');
				}

			},
			error: function(xhr, type, errorThrown) {
				mui.toast("系统繁忙请稍后重试");
				h(self).removeClass('noUseCode').val('获取验证码').removeAttr('disabled');
			}
		});
	} else {
		mui.alert("请输入正确的电话号码", "温馨提示");
		h(self).removeClass('noUseCode').val('获取验证码').removeAttr('disabled');
	}
});