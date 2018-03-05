var isBackRefresh = false;
mui.init({
	beforeback: function() {
		var list = plus.webview.currentWebview().opener();
		mui.fire(list, 'addressRefresh', {
			isBackRefresh: isBackRefresh
		});
		return true;
	}
});
mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var addressId = self.addressId;
	var userId = services.checkLogin().userId;
	//如果有地址id填充数据
	if(addressId) {
		mui.ajax(services.baseUrl + '/orderinfo/address/findone', {
			data: services.Encrypt(JSON.stringify({
				addressId: addressId
			})),
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			type: 'post',
			timeout: 20000,
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				if(result.status == 200) {
					if(result.data.isDefault) { //是否显示默认的
						h('#defaultAddress').hide();
					}
					h('#username').val(result.data.username);
					h('#tel').val(result.data.tel);
					h('#state').html(result.data.state);
					h('#city').html(result.data.city);
					h('#district').html(result.data.district);
					h('#address').val(result.data.address);
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

	//点击保存收货地址
	h('#saveAddress').tap(function(event) {
		event.preventDefault();
		if(services.serializeObject('addressPage')) {
			var formData = JSON.parse(document.getElementById('addressBox').serialize());
			if(addressId) { //证明是编辑地址
				formData.state = h('#state').html();
				formData.city = h('#city').html();
				formData.district = h('#district').html();
				formData.id = addressId;
				formData.userId = userId;
				//后台请求
				changeAddress(formData, "/orderinfo/address/updateone");
			} else {
				formData.state = h('#state').html();
				formData.city = h('#city').html();
				formData.district = h('#district').html();
				formData.userId = userId;
				//后台请求
				changeAddress(formData, "/orderinfo/address/addone");
			}
		}
	});
	//设为默认
	h('#setDefualt').tap(function(e) {
		e.preventDefault();
		mui.ajax(services.baseUrl + '/orderinfo/address/default', {
			data: services.Encrypt(JSON.stringify({
				id:addressId
			})),
			beforeSend: function(request) {
				services.beforeHeader(request);
				services.before('#setDefualt', '请稍后...');
			},
			type: 'post',
			timeout: 20000,
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				//console.log(services.Decrypt(data));
				if(result.status == 200) {
					mui.toast('成功设为默认地址!');
					isBackRefresh=true;
					h('#defaultAddress').remove();
				}
			},
			error: function(xhr, type, errorThrown) {
				services.completed('#setDefualt', '确认');
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});
	});
});
h('#areaBox').tap(function() {
	var picker = new mui.PopPicker({
		layer: 3
	});
	picker.setData(cityData3);
	picker.show(function(SelectedItem) {
		h('#state').html(SelectedItem[0].text); //省
		h('#city').html(SelectedItem[0].children[0].text); //市
		h('#district').html(SelectedItem[0].children[0].children[0].text); //区
	});
});

//封装后台请求
function changeAddress(data, url) {
	mui.ajax(services.baseUrl + url, {
		data: services.Encrypt(JSON.stringify(data)),
		beforeSend: function(request) {
			services.beforeHeader(request);
			services.before('#saveAddress', '提交中...');
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status == 200) {
				isBackRefresh = true;
				mui.toast('提交成功!');
				services.completed('#saveAddress', '保存地址');
				mui.later(function() {
					mui.back();
				}, 1500);
			}
		},
		error: function(xhr, type, errorThrown) {
			services.completed('#saveAddress', '保存地址');
			h('#loadingFailArea').show();
		},
		complete: function() {
			h('.loadingImg').hide();
		}
	});
}