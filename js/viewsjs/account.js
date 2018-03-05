mui.init();
mui.plusReady(function() {

});
var userId = services.checkLogin().userId;
//获取用户信息
mui.ajax(services.baseUrl + '/customer/my/info', {
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
			//填充表单数据
			var sex = result.data.sex;
			switch(sex) {
				case 1:
					sex = '男';
					break;
				case 2:
					sex = '女';
					break;
				case null:
					sex = '保密';
					break;
				case 3:
					sex = '保密';
					break;
			}
			h('#userName').val(result.data.userId);
			h('#uName').val(result.data.username);
			h('#sex').html(sex);
			if(result.data.birthday) {
				h('#birth').html(changeTime(result.data.birthday));
			} else {
				h('#birth').html('1980-08-08');
			}
		}
	},
	error: function(xhr, type, errorThrown) {
		h('#loadingFailArea').show();
	},
	complete: function() {

	}
});
//获取工程商信息
mui.ajax(services.baseUrl + '/customer/authentication/ok', {
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
			switch(result.data.locked) {
				case 1:
					h('#contractor').html('未提交审核');
					break;
				case 2:
					h('#contractor').html('审核中');
					break;
				case 3:
					h('#contractor').html('审核通过');
					break;
				case 4:
					h('#contractor').html('审核失败');
					break;
			}
		}
		//设置企业认证的状态
		h('#contractor').attr('data-lock', result.data.locked);
	},
	error: function(xhr, type, errorThrown) {
		h('#loadingFailArea').show();
	},
	complete: function() {

	}
});

//时间戳转换
function changeTime(time) {
	var timer = new Date(time);
	var month = timer.getMonth() + 1;
	var day = timer.getDate();
	return timer.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
}

h("#sexArea").tap(function() {
	var picker = new mui.PopPicker();
	picker.setData([{
			value: '0',
			text: '保密'
		},
		{
			value: '1',
			text: '男'
		},
		{
			value: '2',
			text: '女'
		}
	]);
	picker.show(function(items) {
		h("#sex").html(items[0].text);
	});
});
h("#birthArea").tap(function() {
	var dtPicker = new mui.DtPicker({
		type: 'date',
		beginYear: '1970'
	});
	dtPicker.show(function(items) {
		//				//console.log(items);
		//				var html = items.y.text+'-'+items.m.text+'-'+items.d.text;
		//				h("#birth").html(html);
		h("#birth").html(items.text);
	})
});

//点击工程商注册
h('#contractorArea').tap(function() {
	var lock = h('#contractor').attr('data-lock');
	if(lock == 1) { //未提交审核
		services.nativeJump('newBuiltBusi.html', 'newBuiltBusi.html', '升级企业用户', {
			lock: 1
		});
	} else if(lock==2){
		services.nativeJump('progressBussi.html', 'progressBussi.html', '账户信息', {
			lock: 2
		});
	}else{
		services.nativeJump('editBuiltBusi.html', 'editBuiltBusi.html', '账户信息', {
			lock: false
		});
	}
});

//提交按钮
h('#AccSubmit').tap(function(e) {
	e.preventDefault();
	var nikeName = h('#uName').val();
	if(!nikeName) {
		mui.toast('请输入昵称!');
	} else if(/^[^! @#$%^&*()?/]$/.test(nikeName)) {
		mui.toast('请输入正确格式的昵称!');
	} else {
		var sex = h('#sex').html();
		switch(sex) {
			case '男':
				sex = 1;
				break;
			case '女':
				sex = 2;
				break;
			case '保密':
				sex = 3;
				break;
		}
		var accData = JSON.stringify({
			id: userId,
			sex: sex,
			birthday: h('#birth').html(),
			username: h('#uName').val()
		});
		//console.log(accData);
		mui.ajax(services.baseUrl + '/customer/updateinfo', {
			data: services.Encrypt(accData),
			beforeSend: function(request) {
				services.beforeHeader(request);
				services.before('#AccSubmit', '提交中...');
			},
			type: 'post',
			timeout: 20000,
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				//console.log(services.Decrypt(data));
				if(result.status == 200) {
					mui.toast('提交成功!');
					mui.later(function() {
						location.reload();
					}, 1000);
				}
			},
			error: function(xhr, type, errorThrown) {
				h('#loadingFailArea').show();
			},
			complete: function() {
				services.completed('#AccSubmit', '提交');
			}
		});
	}
});