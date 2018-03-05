mui.init({
	beforeback: function() {
		var list = plus.webview.currentWebview().opener();
		//如果是详情页过来的
		var proId = plus.webview.currentWebview().proId;
		if(proId) {
			mui.fire(list, 'proId', {
				proId: proId,
				checkLogin: true
			});
		}
		mui.fire(list, 'backRefresh');
		return true;
	}
});
mui.plusReady(function() {
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
	//点击登录标题栏的×
	h('#close').tap(function() {
		var isRegister = plus.webview.currentWebview().isRegister;
		if(isRegister) { //证明是从注册跳过来的
			//回到首页
			services.returnHome('slide-in-left', 'slide-out-right');
		} else {
			mui.back();
		}
	});

	//注册
	h('#immRegister').tap(function() {
		services.nativeJump('registerType.html', 'registerType.html', '欢迎注册');
	});
	//忘记密码 
	h('#forgetPwd').tap(function() {
		services.nativeJump('editPwd.html', 'editPwd.html', '修改密码');
	});
	//点击登录
	h('#loginBtn').tap(function() {
		tel = h('#uPhone').val();
		password = h('#uPwd').val();
		if(/^[1][34578]\d{9}$/.test(tel)) {
			mui.ajax(services.baseUrl + '/customer/login', {
				data: services.Encrypt(JSON.stringify({
					tel: tel,
					password: password
				})),
				beforeSend: function(request) {
					services.beforeHeader(request);
					services.before('#loginBtn', '登录中...');
				},
				type: 'post',
				timeout: 10000,
				success: function(data) {
					var res = JSON.parse(services.Decrypt(data));
//					console.log(services.Decrypt(data));
					if(res.status == 200) {
						services.completed('#loginBtn', '登录');
						var tokenId = res.data;
						var userName = res.msg;
						localStorage['userName'] = services.Encrypt(JSON.stringify(userName));
						localStorage['tokenId'] = services.Encrypt(JSON.stringify(tokenId));
						//登录成功后刷新指定页面
						services.dirctRefresh(['home.html', 'shopCart.html', 'mine.html'], 1);
						var self = plus.webview.currentWebview();
						if(self.isRegister) {
							//证明是注册页过来的
							services.returnHome('slide-in-left', 'slide-out-right');
						} else {
							mui.back();
						}
					} else {
						services.completed('#loginBtn', '登录');
						mui.alert("用户名或密码不正确");
					}
				},
				error: function(xhr, type, errorThrown) {
					services.completed('#loginBtn', '登录');
					mui.toast("系统繁忙请稍后重试");
				}
			});
		} else {
			alert("请输入正确的手机号码");
		}
	});

})
//监听input框输入
var inputPhone = false;
var inputPwd = false;
var tel = null;
var password = null;
document.getElementById("uPhone").addEventListener('input', function() {
	if(this.value.length > 0) {
		inputPhone = true;
		if(inputPhone && inputPwd) {
			h('#loginBtn').removeAttr('disabled').removeClass('errActive').addClass('sucActive')
		}
	} else {
		inputPhone = false;
		if(inputPhone || inputPwd) {
			h('#loginBtn').attr('disabled', 'true').removeClass('sucActive').addClass('errActive')
		}
	}
});
document.getElementById("uPwd").addEventListener('input', function() {
	if(this.value.length > 0) {
		inputPwd = true;
		if(inputPhone && inputPwd) {
			h('#loginBtn').removeAttr('disabled').removeClass('errActive').addClass('sucActive')
		}
	} else {
		inputPwd = false;
		if(inputPhone || inputPwd) {
			h('#loginBtn').attr('disabled', 'true').removeClass('sucActive').addClass('errActive')
		}
	}
});