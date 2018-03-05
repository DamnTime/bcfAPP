mui.init();
var userId = services.checkLogin().userId;
mui.plusReady(function() {
	//获取上一页状态
	window.addEventListener('stutas', function(event) {
		//支付方式
		h('#paymentId').val(event.detail.paymentId);
		//开票与不开票的隐藏
		if(parseInt(event.detail.invoiceType) != 0) {
			h('#noTaker').show();
		}
	});

	//重写back函数
	var old_back = mui.back;
	mui.back = function() {
		var orderOrder = null;
		orderOrder = plus.webview.currentWebview().opener();
		if(orderOrder) {
			mui.fire(orderOrder, 'takerMsg', {
				takerMsg: h('#backMsg').val()
			})
		};
		//		继续当前页面原有返回逻辑
		old_back();
	}
});
//获取发票信息
mui.ajax(services.baseUrl + '/customer/get/invoice', {
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
		//console.log(services.Decrypt(data));
		if(result.status == 200) {
			if(result.data) {
				//填充表单数据 
				h("#companyName").val(result.data.name);
				h("#taxNum").val(result.data.taxNumber);
				h("#address").val(result.data.address);
				h("#bankName").val(result.data.bankName);
				h("#bankNumber").val(result.data.bankNumber);
				h("#name").val(result.data.name);
				h("#taxNumber").val(result.data.taxNumber);
			}
		}
	},
	error: function(xhr, type, errorThrown) {
		h('#loadingFailArea').show();
	},
	complete: function() {
		h('.loadingImg').hide();
	}
});

//选择普通发票
mui('#choose').on('tap', 'a', function() {
	var txt = h(this).html();
	var self = h(this);
	switch(txt) {
		case '普通发票':
			changeType(self, '#commTaker', '#addTakerMsg', 1);
			break;
		case '增值税发票':
			changeType(self, '#addTakerMsg', '#commTaker', 2);
			break;
		case '不开票':
			changeType(self, '#addTakerMsg', '#commTaker', 0);
			break;
		default:
			break;
	}
});
//选择个人单位
mui('.beautyCheck').on('tap', 'label', function() {
	var index = parseInt(h(this).attr('data-id'));
	//	switch(index) {
	//		case 0:
	//			h('#companyForm').hide();
	//			break;
	//		case 1:
	//			h('#companyForm').show();
	//			break;
	//		default:
	//			break;
	//	}
	if(index == 0) {
		h('#companyForm').find('.invoiceTitle').attr('disabled', 'disabled').removeClass('validationErr');
		h('#companyForm').hide();
	} else {
		h('#companyForm').find('.invoiceTitle').removeAttr('disabled');
		h('#companyForm').show();
	}
});
//普通发票的确定按钮
h('#commTakerBtn').tap(function(event) {
	event.preventDefault();
	if(services.serializeObject('invoiceTitle')) {
		var formData = JSON.parse(document.getElementById('takerForm').serialize());
		var backMsg = JSON.stringify({
			address: '',
			bankName: '',
			bankNumber: '',
			invoiceAddress: '',
			invoiceType: h('#invoiceType').val(), //发票类型
			name: formData.name || '',
			openingType: formData.openingType || '',
			taxNumber: formData.taxNumber || ''
		});
		h('#backMsg').val(backMsg);
		//返回一页
		mui.back();
	}
});
//增值税发票的确定按钮
h('#addTakerBtn').tap(function(event) {
	event.preventDefault();
	if(services.serializeObject('addTaker')) {
		var formData = JSON.parse(document.getElementById('addTakerForm').serialize());
		var backMsg = JSON.stringify({
			address: formData.address || '',
			bankName: formData.bankName || '',
			bankNumber: formData.bankNumber || '',
			invoiceType: h('#invoiceType').val(), //发票类型
			name: formData.name || '',
			openingType: '2',
			taxNumber: formData.taxNumber || ''
		});

		h('#backMsg').val(backMsg);
		//返回一页
		mui.back();
	}
});
//不开发票的确定按钮
h('#notakerBtn').tap(function(event) {
	event.preventDefault();
	var backMsg = JSON.stringify({
		invoiceType: h('#invoiceType').val()
	});
	h('#backMsg').val(backMsg);
	//返回一页
	mui.back();
});

function changeType(self, showTxt, hideTxt, who) {
	var paymentId = parseInt(h('#paymentId').val());
	if(paymentId == 1 && who == 2) {
		mui.toast('请选择支付方式为对公账号!');
	} else {
		var invoiceType = parseInt(self.attr('data-invoiceType'));
		//设置发票类型
		h('#invoiceType').val(invoiceType);
		self.parent().addClass('chooseTypeActive').siblings().removeClass('chooseTypeActive');
		if(who == 0) {
			h(showTxt).hide();
			h(hideTxt).hide();
			h('#notakerBox').show();
		} else {
			h(showTxt).show();
			h(hideTxt).hide();
			h('#notakerBox').hide();
		}
	}
}