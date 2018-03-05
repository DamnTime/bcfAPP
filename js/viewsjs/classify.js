mui.init();
var isAjax = false;
var imgLazyloadApi = null;
//脚部选项卡切换   
mui.plusReady(function() {
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
//	window.addEventListener('refresh', function(e) {
//		var status = e.detail.loginStatus;
//		if(isAjax) {
//			listAjax();
//			classifyAjax('');
//		}
//	});
})
listAjax();
//悬浮栏切换
mui('#classify').on('tap', 'a', function() {
	h(this).parent().addClass('classifyActive').siblings().removeClass('classifyActive');
	var typeId = h(this).attr('data-typeId');
	classifyAjax(typeId);
});
//点击产品跳转至搜索页
mui('#proArea').on('tap', 'a', function() {
	var searchKey = h(this).attr('data-searchKey');
	//本地存储搜索关键字
	localStorage['searchHotKey'] = searchKey;
	//打开详情页面          
	mui.openWindow({
		url: 'searchList.html',
		id: 'searchList.html',
	});
});

//封装分类请求方法
function listAjax() {
	mui.ajax(services.baseUrl + '/app/item/parentnode', {
		type: "POST",
		data: '',
		timeout: 20000,
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//			//console.log(result);
			if(result.status === 200) {
				classifyAjax(result.data.node[0].id);
				//渲染banner
				h('#classImgBox').html(template('classImgList', {
					model: result.data
				}));
				//渲染分类
				h('#classifyBox').html(template('classifyList', {
					model: result.data
				}));
			}
		},
		error: function() {
			h('#loadingFailArea').show();
		},
		complete: function() {
			h('.loadingImg').hide();
		}
	});
}
//封装请求产品方法
function classifyAjax(type) {
	mui.ajax(services.baseUrl + '/app/item/subnode', {
		type: "POST",
		data: services.Encrypt(JSON.stringify({
			pamet: type
		})),
		timeout: 20000,
		beforeSend: function(request) {
			services.beforeHeader(request);
			if(isAjax){
				plus.nativeUI.showWaiting();
			}
		},
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//			//console.log(result);
			if(result.status === 200) {
				isAjax = true;
				//渲染产品
				h('#proArea').html(template('proAreaList', {
					model: result.data
				}));
				if(imgLazyloadApi != null) imgLazyloadApi.destroy();
				imgLazyloadApi = mui("#proArea").imageLazyload({
					autoDestroy: false,
					placeholder: '../images/img_loading.png'
				});
			}
		},
		error: function() {
			h('#loadingFailArea').show();
		},
		complete: function() {
			h('.loadingImg').hide();
			plus.nativeUI.closeWaiting();
		}
	});
}