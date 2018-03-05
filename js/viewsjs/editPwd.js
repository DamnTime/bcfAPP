mui.init();
mui.plusReady(function() {

});
//验证码  
var codeKey = null;
h('#getCode').tap(function(event) {
	event.preventDefault();
	var temp = h('#tel').val();
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
				//console.log('比较号码' + services.Decrypt(data));
				if(res.status == 400) {
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
								//console.log('获取codekey' + services.Decrypt(data));
								codeKey = res.data;
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
//点击提交
h('#sureBtn').tap(function(event) {
	event.preventDefault();
	//验证码
	var valiCode = JSON.stringify({
		code: h('#code').val(),
		key: codeKey
	});
	if(h('#password').val() != h('#passwordAgain').val()) {
		mui.toast('两次输入的密码不一致!');
	} else if(!h('#code').val()) {
		mui.toast('请输入验证码!');
	} else {
		if(services.serializeObject('editPwd')) {
			var formData = document.getElementById('editForm').serialize();
			//console.log(formData);
			mui.ajax(services.baseUrl + '/user/compare', {
				data: services.Encrypt(valiCode),
				beforeSend: function(request) {
					services.beforeHeader(request);
					services.before('#sureBtn', '提交中...');
				},
				type: 'post',
				timeout: 10000,
				success: function(data) {
					var res = JSON.parse(services.Decrypt(data));
					if(res.status == 200) {
						//获取验证码			
						mui.ajax(services.baseUrl + '/customer/updatepw', {
							data: services.Encrypt(formData),
							beforeSend: function(request) {
								services.beforeHeader(request);
							},
							type: 'post',
							timeout: 10000,
							success: function(data) {
								var res = JSON.parse(services.Decrypt(data));
								if(res.status == 200) {
									mui.toast('修改成功!');
									mui.later(function() {
										mui.openWindow({
											url: 'login.html',
											id: 'login.html',
											waiting: {
												autoShow: true,
												title: '正在加载...'
											},
											extras: {
												isRegister: true
											}
										})
									}, 1500);
								}
							},
							error: function(xhr, type, errorThrown) {
								mui.toast("系统繁忙请稍后重试");
							},
							complete: function() {
								services.completed('#sureBtn', '确认');
							}
						});
					}
				},
				error: function(xhr, type, errorThrown) {
					mui.toast("系统繁忙请稍后重试");
				}
			});
		}
	}

});