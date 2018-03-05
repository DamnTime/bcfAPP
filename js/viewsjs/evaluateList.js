mui.init();
mui.plusReady(function() {
	mui('#evaluateList').on('tap', '.jumpProDetail', function() {
		mui.openWindow({
			url: "proDetail.html",
			id: "proDetail.html",
			waiting: {
				autoShow: true,
				title: '正在加载...'
			}
		})
	});
	//获取该订单下商品列表
	var self = plus.webview.currentWebview();
	var orderId = self.orderId;
	mui.ajax(services.baseUrl + '/msg/goto', {
		data: services.Encrypt(JSON.stringify({
			orderId: orderId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//console.log(services.Decrypt(data));
			if(result.status === 200) {
				h('#evaluateList').html(template('evaluateBox',{model:result.data}));
			}
		},
		error: function(xhr, type, errorThrown) {
			h('#loadingFailArea').show();
		},
		complete: function() {
			h('.loadingImg').hide();
		}
	});

	mui('#evaluateList').on('tap', '.jumpEvaluate', function() {
		var id = this.getAttribute('data-id');
		var proId=this.getAttribute('data-proId');
		services.nativeJump("evaluate.html","evaluate.html",'评价',{index: id,orderId: orderId,proId:proId});
	});
});