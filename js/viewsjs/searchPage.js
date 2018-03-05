mui.init();

//历史搜索列表
var historyList = localStorage['historyWordArr'];
if(historyList) {
	historyList = JSON.parse(historyList);
	h('#historySearchList').html(template('historySearchBox', {
		model: historyList
	}));
} else {
	historyList = [];
	h('.historySearch').hide();
	h('.delete').hide();
}
mui.plusReady(function() {
	//执行刷新
	window.addEventListener('refresh', function(e) { 
		location.reload();
	});
	//点击商品跳转至商品详情
	mui('#hotSearch').on('tap', 'a', function() {
		var html = h(this).html();
		if(historyList.length < 10) {
			historyList.unshift(html);
			//数组去重
			historyList = services.arrayUnique(historyList);
			localStorage['historyWordArr'] = JSON.stringify(historyList);
		}
		jumpSearchList(html);
	});
	//监听search框的输入
	document.getElementById("searchBtn").addEventListener("submit", function(e) {
		e.preventDefault(); // 阻止默认事件
		var searchDefault = h("#searchWord").attr('data-default');
		var searchWord = h("#searchWord").val();
		if(searchWord) {
			//本地存储历史搜索
			if(historyList.length < 10) {
				historyList.unshift(searchWord);
				//数组去重
				historyList = services.arrayUnique(historyList);
				localStorage['historyWordArr'] = JSON.stringify(historyList);
			}
			jumpSearchList(searchWord);
		} else {
			jumpSearchList(searchDefault);
		}
	});
	//点击历史搜索跳转
	mui('#historySearchList').on('tap', 'a', function() {
		var key = h(this).find('.lf').html();
		jumpSearchList(key);
	});
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

//获取热搜关键字
mui.ajax(services.baseUrl + '/common/hotword/list', {
	data: '',
	beforeSend: function(request) {
		services.beforeHeader(request);
	},
	type: 'post',
	timeout: 20000,
	success: function(data) {
		var result = JSON.parse(services.Decrypt(data));
		//				//console.log(JSON.stringify(result));
		if(result.status === 200) {
			h('#hotSearch').html(template('hotSearchBox', {
				model: result.data
			}));
			//设置搜索默认关键字
			h('#searchWord').attr('data-default', result.data[0]);
		}
	},
	error: function(xhr, type, errorThrown) {
		h('#loadingFailArea').show();
	},
	complete: function() {
		h('.loadingImg').hide();
	}
});

mui('#historySearchList').on('tap', '.icon-cha1', function() {
	var len = h(this).parent().parent().siblings('li');
	var val = h(this).siblings('span').html();
	var index = '';
	for(var i = 0; i < historyList.length; i++) {
		if(val == historyList[i]) {
			index = i;
			break;
		}
	}
	//删除对应的值 
	historyList.splice(index, 1);
	localStorage['historyWordArr'] = JSON.stringify(historyList);
	if(len.length > 0) {
		h(this).parent().parent().remove();
	} else {
		h('.historySearch').hide();
		h('.delete').hide();
		localStorage.removeItem('historyWordArr');
	}
});
h('#cancelAll').tap(function() {
	h('.historySearch').hide();
	h('.delete').hide();
	localStorage.removeItem('historyWordArr');
});