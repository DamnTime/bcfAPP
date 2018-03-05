mui.init();
mui.plusReady(function() {
	h('#goIndex').tap(function() {
		services.returnHome('slide-in-left', 'slide-out-right');
	});

	var self = plus.webview.currentWebview();
	mui.ajax(services.baseUrl + '/msg/goto', {
		data: services.Encrypt(JSON.stringify({
			orderId: self.orderId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status === 200) {
				h('#continuEvaBox').html(template('continuEvaList', {
					model: result.data
				}));
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