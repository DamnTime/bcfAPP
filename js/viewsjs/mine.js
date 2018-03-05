mui.init();

//获取用户信息
var userMsg = services.checkLogin();
var lock = null;
if(!userMsg.userId) {
	h('#isShowUserName').show();
	h('#quitArea').hide();
} else {
	h('#quitArea').show();
	h('#userName').html(userMsg.userName).show();
	mui.ajax(services.baseUrl + '/customer/authentication/ok', {
		data: services.Encrypt(JSON.stringify({
			userId: userMsg.userId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 10000,
		success: function(data) {
			var res = JSON.parse(services.Decrypt(data));
			//console.log(services.Decrypt(data));
			if(res.status == 200) {
				lock = parseInt(res.data.locked);
				switch(lock) {
					case 2:
						h('#auditPre').show();
						break;
					case 3:
						h('#auditSucc').show();
						break;
					case 4:
						h('#auditErr').show();
						break;
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.toast("系统繁忙请稍后重试");
		}
	});
};

h('#login').tap(function() {
	mui.openWindow({
		url: 'login.html',
		id: 'login.html',
		autoShow: true,
		waiting: {
			autoShow: true,
			title: '正在加载...'
		}
	})
});

//点击注册
h('#register').tap(function() {
	services.nativeJump('registerType.html', 'registerType.html', '欢迎注册');
});
//个人资料 
h('#account').tap(function() {
	if(!userMsg.userId) {
		mui.toast('您还没有登录,请先登录!');
	} else {
		if(lock == 1 || lock == 2) {
			services.nativeJump('account.html', 'account.html', '个人资料');
		} else if(lock == 4 || lock == 3) {
			services.nativeJump('editBuiltBusi.html', 'editBuiltBusi.html', '个人资料');
		}
	}
});

//脚部选项卡切换   
mui.plusReady(function() {
	//检查是否登录
	window.addEventListener('refresh', function(e) {
		var status = e.detail.loginStatus;
		if(status == 1 || status == 0) {
			location.reload();
		}
	});
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
	//页面跳转
	mui('#userHand').on('tap', '.aboutUser', function() {
		if(localStorage['userName']) {
			var url = h(this).attr('data-url');
			var txt = h(this).find('.jumpTxt').html();
			if(url && userMsg) {
				services.nativeJump(url, url, txt);
			}
		} else {
			mui.toast('您还没有登录,请先登录!');
		}
	});
	//联系我们
	h('#concatUs').tap(function() {
		var arry = ['取消', '立即拨打'];

		function callback(e) {
			if(e.index == 0) {
				plus.device.dial("028-81458117", false);
			} else {
				return;
			}
		};
		mui.confirm('028-81458117', '欢迎致电', ['立即拨打', '取消'], callback)
	});
//	h('#qiut').tap(function(){
//		localStorage.removeItem('lauchFlag');
//		plus.runtime.restart();
//	});
	
	
	//应用二维码
	function stopSlide(e) {
		e.preventDefault();
	}
	h('#erweima').tap(function() {
		h('#mark').show();
		h('#erweimaBox').show("pop-out");
		document.addEventListener('touchstart', stopSlide);
	});
	h('#mark').tap(function() {
		h('#erweimaBox').hide();
		h(this).hide();
		document.removeEventListener('touchstart', stopSlide);
	});

	//订单状态
	mui('#userHandleList').on('tap', 'a', function() {
		if(localStorage['userName']) {
			var typeId = h(this).attr('data-typeId');
			services.nativeJump('myOrder.html', 'myOrder.html', '我的订单', {
				typeId: typeId
			});
		} else {
			mui.toast('您还没有登录,请先登录!');
		}
	});
	//退出当前账号 
	h('#quitBtn').tap(function() {
		var btnArray = ['确认', '取消'];

		function callback(e) {
			if(e.index == 0) {
				localStorage.removeItem('userName');
				localStorage.removeItem('tokenId');
				//退出登录后刷新指定页面
				services.dirctRefresh(['home.html', 'ecoOrder.html', 'shopCart.html', 'mine.html'], 0);
				location.reload();
			} else {
				return;
			}
		};
		mui.confirm('确认退出?', '提示', btnArray, callback);
	});
	
	
	
})