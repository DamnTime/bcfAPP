mui.init();
mui.plusReady(function() {
	plus.webview.currentWebview().setStyle({
		scrollIndicator: 'none'
	});
	//实现ios平台原生侧滑关闭页面；
	if(mui.os.plus && mui.os.ios) {
		plus.webview.currentWebview().setStyle({
			'popGesture': 'none'
		});
	}
})
//是否是首次加载
var isFirst = true;
//参数说明:点击:0,搜索:1
var comParam = '';
//二级分类的id
var lastId = '';
var imgLazyloadApi = null;
(function($) {
	$.ready(function() {
		var mescroll = new MeScroll("mescroll", {
			down:{
				use:false
			},
			up: {
				page: {
					num: 0,
					size: 10,
				},
				noMoreSize: 1,
				callback: getListData,
				isBounce: false
			}
		});

		function getListData(page) {
			//联网加载数据
			getListDataFromNet(comParam, page.num, page.size, function(curPageData) {
				mescroll.endBySize(curPageData.data.list.rows.length, curPageData.data.list.total);
				//console.log(curPageData.data.list.rows.length, curPageData.data.list.total);
			}, function() {
				//联网失败的回调,隐藏上拉加载的状态
				mescroll.endErr();
			});
		}

		function getListDataFromNet(pdType, pageNum, pageSize, successCallback, errorCallback) {
			var url = '';
			var sendData = '';
			//		//console.log(pdType == 0);
			if(pdType === 0) { //点击
				url = '/scheme/byClass';
				sendData = JSON.stringify({
					page: pageNum,
					rows: pageSize,
					id: lastId
				})
			} else if(pdType === 1) { //搜索
				url = '/scheme/groom';
				if(h('#searchWord').val()) {
					sendData = JSON.stringify({
						page: pageNum,
						rows: pageSize,
						query: h('#searchWord').val()
					})
				} else {
					url = '/scheme/groom';
					sendData = JSON.stringify({
						page: pageNum,
						rows: pageSize,
						query: h('#searchWord').attr('data-default')
					})
				}
			} else {
				url = '/scheme';
				sendData = JSON.stringify({
					page: pageNum,
					rows: pageSize
				})
			}
			//console.log(sendData);
			//延时一秒,模拟联网
			setTimeout(function() {
				mui.ajax(services.baseUrl + url, {
					data: services.Encrypt(sendData),
					beforeSend: function(request) {
						services.beforeHeader(request);
					},
					type: 'post',
					timeout: 20000,
					success: function(data) {
						var result = JSON.parse(services.Decrypt(data));
						//						console.log(services.Decrypt(data));
						if(result.status == 200) {
							//渲染列表页
							if(isFirst) {
								h('#pagenationList').html(template('innerList', {
									model: result.data
								}));
								isFirst = false;
							} else {
								var html = template('innerList', {
										model: result.data
									}),
									innerBox = document.getElementById('pagenationList');
								if(pageNum == 1) {
									innerBox.innerHTML = html;
								} else {
									innerBox.innerHTML += html;
								}

							}
							//banner图
							if(h('#banner').find('img').length == 0) {
								h('#banner').html(template('bannerBox', {
									model: result.data
								}));
							}
							//渲染分类
							if(h('#programClassfiyList').find('li').length <= 0) {
								h('#programClassfiyList').html(template('programClassfiyBox', {
									model: result.data
								}));
							}
							if(imgLazyloadApi != null) imgLazyloadApi.destroy();
							imgLazyloadApi = mui("#pagenationList").imageLazyload({
								autoDestroy: false,
								placeholder: '../images/img_loading.png'
							});
							successCallback(result);
							//banner
							//				if(h('#banner').find('img').length<=0){
							//					h('#programClassfiyList').html(template('programClassfiyBox', {
							//						model: result.data
							//					}));
							//				}
						}
					},
					error: errorCallback,
					complete: function() {
						h('.loadingImg').hide();
					}
				});
			}, 1000)
		}
		//二级菜单分类
		mui('#nextClassify').on('tap', 'a', function() {
			isFirst = true;
			comParam = 0;
			var html = h(this).html();
			h('#pagenationList').find('li').remove();
			h('#hotProg').html(html + ' ' + '热门方案');
			//切换颜色 
			h(this).parent('li').addClass('nextClassfiyActive').siblings().removeClass('nextClassfiyActive');
			lastId = h(this).attr('data-id');
			//重置列表数据
			mescroll.resetUpScroll();
		});
		//监听search框的输入
		document.getElementById("searchBtn").addEventListener("submit", function(e) {
			e.preventDefault(); // 阻止默认事件
			h('#pagenationList').find('li').remove();
			isFirst = true;
			comParam = 1;
			//重置列表数据
			mescroll.resetUpScroll();
		});
		//主界面‘显示侧滑菜单’按钮的点击事件
		mui('#programClassfiyList').on('tap', 'li', function() {
			h(this).addClass('itemActive').siblings().removeClass('itemActive');
			offCanvasWrapper.offCanvas('close');
			//二级菜单显示
			h('#nextClassify').show();
			//ajax请求后
			//二级分类显示
			var classId = h(this).attr('data-classId');
			nextClass(classId);
		});
		//封装一级分类
		function nextClass(id) {
			mui.ajax(services.baseUrl + '/scheme/son', {
				data: services.Encrypt(id),
				beforeSend: function(request) {
					services.beforeHeader(request);
				},
				type: 'post',
				timeout: 20000,
				success: function(data) {
					var result = JSON.parse(services.Decrypt(data));
					//			//console.log(JSON.stringify(result));
					if(result.status == 200) {
						h('#nextClassBox').html(template('nextClassList', {
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
		}
	});
})(mui);
//侧滑容器父节点
var offCanvasWrapper = mui('#offCanvasWrapper');
//主界面容器
var offCanvasInner = offCanvasWrapper[0].querySelector('.mui-inner-wrap');
var backdrop = document.querySelector(".mui-off-canvas-backdrop");
//菜单容器
//主界面‘显示侧滑菜单’按钮的点击事件
document.getElementById('offCanvasShow').addEventListener('tap', function() {
	offCanvasWrapper.offCanvas('show');
});
if(backdrop) {
	backdrop.addEventListener("touchstart", function(e) {
		e.preventDefault()
	});
	backdrop.addEventListener("touchmove", function(e) {
		e.preventDefault()
	})
};
mui('#pagenationList').on('tap', 'li', function() {
	var pdfUrl = h(this).attr('data-pdfUrl');
	pdfUrl = pdfUrl.split(',')[0];
	//console.log(pdfUrl);
	launchApp(pdfUrl);
});

//pdf文件的预览
function launchApp(url) {
	//console.log("进了")
	if(mui.os.android) {
		//console.log("andoird");
		downPdf(url);
	} else if(mui.os.ios) {
		//console.log("ios")
		plus.runtime.launchApplication({
			action: url
		}, function(e) {
			alert("Open system default browser failed: " + e.message);
		});
	}
}
//andoird pdf的下载
var wgtWaiting = null;

function downPdf(wgtUrl) {

	wgtWaiting = plus.nativeUI.showWaiting("开始下载");
	//console.log('pdfUrl' + wgtUrl);
	var task = plus.downloader.createDownload(wgtUrl, {
		filename: "_doc/pdf/"
	}, function(d, status) {

		//console.log('status' + status);
		if(status == 200) {
			//console.log("下载成功：" + d.filename);
			wgtWaiting.setTitle("准备打开");
			plus.runtime.openFile(d.filename, {}, function(e) { //调用第三方应用打开文件  
				alert('打开失败');
			});
		} else {
			//console.log("下载失败！");
			plus.nativeUI.alert("下载失败");
			wgtWaiting.close();
		}

	});
	task.addEventListener("statechanged", function(download, status) {
		switch(download.state) {
			case 2:
				wgtWaiting.setTitle("已连接到服务器");
				break;
			case 3:
				var percent = download.downloadedSize / download.totalSize * 100;
				wgtWaiting.setTitle("已下载 " + parseInt(percent) + "%");
				break;
			case 4:
				wgtWaiting.setTitle("下载完成");
				wgtWaiting.close();
				break;
		}
	});
	task.start();
};