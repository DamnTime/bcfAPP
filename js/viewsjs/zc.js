mui.init();
mui('#rankClass').on('tap', 'li', function() {
	var index = h(this).attr('data-index');
	h(this).addClass('brandRankActive').siblings().removeClass('brandRankActive');
	h('#classifyBox').find('div').eq(index - 1).show().siblings().hide();
});
itemClass('');
//封装分类接口
var imgLazyloadApi = null;
mui.plusReady(function() {
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});

	//预加载众筹详情页
	mui('#zcProList').on('tap', '.jumpZcDetail', function() {
		var zcId = this.getAttribute('data-zcId');
//		console.log(zcId);
		mui.openWindow({
			url: "zcDetail.html",
			id: "zcDetail.html",
			waiting: {
				autoShow: true,
				title: '正在加载...'
			},
			extras: {
				proId: zcId
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
		//ajax请求后
		//二级分类显示
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
				h('#zcBanner').html(template('zcBannerBox', {
					model: result.data
				}));
				//排名
				h('#brandRankBox').html(template('brandRankoList', {
					model: result.data
				}));
				//支持排名
				h('#supportRankBox').html(template('supportRankList', {
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
	mui.ajax(services.baseUrl + '/theme/app/cro', {
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
			if(result.status == 200) {
				//渲染产品
				h('#zcProList').html(template('zcProBox', {
					model: result.data
				}));
				if(imgLazyloadApi != null) imgLazyloadApi.destroy();
				imgLazyloadApi = mui("#zcProList").imageLazyload({
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