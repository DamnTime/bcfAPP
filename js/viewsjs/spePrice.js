mui.init();
itemClass('');
//封装分类接口
var imgLazyloadApi = null;
mui.plusReady(function() {
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
	mui('#spePriceList').on('tap', '.jumpProDetail', function() {
		var speId = h(this).attr('data-speId');
		mui.openWindow({
			url: "proDetail.html",
			id: "proDetail.html",
			waiting: {
				autoShow: true,
				title: '正在加载...'
			},
			extras: {
				proId: speId
			}
		})
	});

	//侧滑容器父节点
	var offCanvasWrapper = mui('#offCanvasWrapper');
	//主界面容器
	var offCanvasInner = offCanvasWrapper[0].querySelector('.mui-inner-wrap');
	//菜单容器
	//主界面‘显示侧滑菜单’按钮的点击事件
	document.getElementById('offCanvasShow').addEventListener('tap', function() {
		offCanvasWrapper.offCanvas('show');
	});
	//主界面‘显示侧滑菜单’按钮的点击事件
	mui('#programClassfiyList').on('tap', 'a', function() {
		offCanvasWrapper.offCanvas('close');
		h(this).parent().addClass('itemActive').siblings().removeClass('itemActive');
		var id = h(this).attr('data-typeId');
		itemClass(id);
	});
	//实现ios平台原生侧滑关闭页面；
	if(mui.os.plus && mui.os.ios) {
		plus.webview.currentWebview().setStyle({
			'popGesture': 'none'
		});
	}
	//获取banner图
	var typeId = plus.webview.currentWebview().type;
	mui.ajax(services.baseUrl + '/theme/app/banner', {
		data: services.Encrypt(JSON.stringify(typeId)),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status == 200) {
				//banner图
				h('#speBanner').html(template('speBannerBox', {
					model: result.data
				}));
				//分类
				h('#programClassfiyList').html(template('programClassfiyBox', {
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
})

function itemClass(id) {
	mui.ajax(services.baseUrl + '/theme/app/spe', {
		data: services.Encrypt(JSON.stringify({
			itemId: id
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			console.log(result);
			if(result.status == 200) {
				//渲染产品
				h('#spePriceList').html(template('spePriceBox', {
					model: result.data
				}));
				if(imgLazyloadApi != null) imgLazyloadApi.destroy();
				imgLazyloadApi = mui("#spePriceList").imageLazyload({
					autoDestroy: false,
					placeholder: '../images/img_loading.png'
				});
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