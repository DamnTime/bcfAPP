mui.init();
var imgLazyloadApi = null;
mui.plusReady(function() {
	var id = plus.webview.currentWebview().brandId;
	var name = plus.webview.currentWebview().name;
	var length = plus.webview.currentWebview().length;
	h('#brandName').html(name);
	h('#brandNum').html(length);
	//查看分类全部 
	brandClass('/brand/choice',id);
});

//封装品牌分类 
function brandClass(url, classId, letter) {
	mui.ajax(services.baseUrl + url, {
		data: services.Encrypt(JSON.stringify({
			id: classId,
			py: letter
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status == 200) {
				//渲染按分类
				h('#brandMoreBox').html(template('brandMoreList', {
					model: result.data
				}));
				if(imgLazyloadApi != null) imgLazyloadApi.destroy();
				imgLazyloadApi = mui(".allClassify").imageLazyload({
					autoDestroy: false,
					placeholder: '../images/img_loading.png'
				});
			}
		},
		error: function(xhr, type, errorThrown) {
			h('#loadingFailArea').show();
		},
		complete: function() {

		}
	});
}