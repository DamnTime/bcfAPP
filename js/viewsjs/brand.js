mui.init();
var imgLazyloadApi = null;
mui.plusReady(function() {

});
//tab切换
mui('#chooseType').on('tap', 'a', function() {
	h(this).addClass('classActive').siblings().removeClass('classActive');
	var html = h(this).find('span').html();
	if(html == '按分类') {
		//		brandClass('/brand/total', '');
		h('.allClassify').find('.chooseDetail').eq(0).show().siblings().hide();
		h('.letterbox').hide();
	} else if(html == '按字母') {
		if(h('#brandName').find('.acdBrand').length<=0){
			brandClass('/brand/choice', '', ['A', 'B', 'C']);
		}
		h('.allClassify').find('.chooseDetail').eq(1).show().siblings().hide();
		h('.letterbox').show();
	}
});

//查看分类全部
brandClass('/brand/total', '');
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
				if(!letter) {
					h('#classify').html(template('classifyList', {
						model: result.data
					}));
				}
				if(imgLazyloadApi != null) imgLazyloadApi.destroy();
				imgLazyloadApi = mui("#classify").imageLazyload({
					autoDestroy: false,
					placeholder: '../images/img_loading.png'
				});
				if(letter) {
					//渲染按字母分类
					h('#brandName').html(template('brandNameList', {
						brandModel: result.data
					}));
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			h('#loadingFailArea').show();
		},
		complete: function() {

		}
	});
}
//点击字母
mui('#letterList').on('tap', 'a', function() {
	h(this).parent().addClass('letterActive').siblings().removeClass('letterActive');
	var key = h(this).attr('data-letter').split('');
	brandClass('/brand/choice', '', key);
});
//点击查看更多
mui('#classify').on('tap','.checkMore',function(){
	var id=h(this).attr('data-id');
	var name=h(this).attr('data-name');
	var length=h(this).attr('data-length');
	services.nativeJump('brandMore.html','brandMore.html','查看更多品牌',{brandId:id,name:name,length:length});
});
//封装跳转搜索页
function jumpSearchList(val) {
	document.activeElement.blur();
	//本地存储搜索关键字
	localStorage['searchHotKey']=val;
	//打开详情页面          
	mui.openWindow({
		url: 'searchList.html',
		id: 'searchList.html',
	});
}
mui('#classify').on('tap','.jumpSearch',function(){
	var html=h(this).attr('data-search');
	jumpSearchList(html);
});






