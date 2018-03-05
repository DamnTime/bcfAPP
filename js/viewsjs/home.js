//初始化上拉加载
mui.init();
var wgtVer = null;
var appVer = null;
var system = null;
var num = 0;

if(localStorage['userName']) {
	var userMsg = JSON.parse(services.Decrypt(localStorage['userName']));
	var userRole = userMsg.split(':')[2];
} else {
	var userRole = 0;
}
(function($) {
	$.ready(function() {
		var mescroll = new MeScroll("mescroll", {
			up: {
				page: {
					num: 0,
					size: 8,
				},
				loadFull: {
					use: false,
					delay: 500
				},
				callback: getListByPage,
				isBounce: false,
				toTop: { //配置回到顶部按钮
					src: "images/mescroll-totop.png",
					offset: 3000
				}
			}
		});
		//上拉加载更多 
		function getListByPage(page) {
			mui.later(function() {
				mui.ajax(services.baseUrl + '/app/index/goods', {
					data: services.Encrypt(JSON.stringify({
						pageNum: page.num,
						pageSize: page.size
					})),
					beforeSend: function(request) {
						services.beforeHeader(request);
					},
					type: 'post',
					timeout: 20000,
					success: function(data) {
						//				//console.log(services.Decrypt(data));
						//console.log(services.Decrypt(data));
						var result = JSON.parse(services.Decrypt(data));

						if(result.status == 200) {
							//精品推荐
							var html = template('proBox', {
									model: result.data.rows,
									userRole: userRole
								}),
								innerBox = document.getElementById("proList");
							if(page.num == 1) { //第一页
								innerBox.innerHTML = html;
							} else {
								innerBox.innerHTML += html;
							}
							page++;
							mescroll.endBySize(result.data.rows.length, result.data.total);
							//					mescroll.endSuccess(result.data.total);
						}
					},
					error: function(xhr, type, errorThrown) {
						h('#loadingFailArea').show();
						mescroll.endErr();
					},
					complete: function() {
						h('.loadingImg').hide();
					}
				});
			}, 1000);
		}
		mui.plusReady(function() {
			//检查是否登录
			window.addEventListener('refresh', function(e) {
				var status = e.detail.loginStatus;
				if(status == 1 || status == 0) {
					location.reload();
				}
			});
			plus.webview.currentWebview().setStyle({
				scrollIndicator: 'none'
			});
			//获取本地应用资源版本号  
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				wgtVer = inf.version.substr(inf.version.length - 1, inf.version.length);
				appVer = inf.version.substr(0, inf.version.length - 2);
			});
			var network = plus.networkinfo.getCurrentType();
			if(network == 3 || network == 2) {
				if(mui.os.android) {
					system = 'ANDROID';
				} else {
					system = 'IOS';
				}

				//APP更新
				var wgtWaiting = null;
				mui.ajax(services.baseUrl + '/appdw/datum', {
					data: services.Encrypt(system),
					beforeSend: function(request) {
						services.beforeHeader(request);
					},
					type: 'post',
					timeout: 20000,
					success: function(data) {
						var result = JSON.parse(services.Decrypt(data));
						if(result.status == 200) {
							if(result.data.varsion == appVer) {

								mui.ajax(services.baseUrl + '/appdw/wgt', {
									data: services.Encrypt(wgtVer),
									beforeSend: function(request) {
										services.beforeHeader(request);
									},
									type: 'post',
									timeout: 20000,
									success: function(data) {
										var result = JSON.parse(services.Decrypt(data));
										if(result.data.length == 0) {

											return;
										} else {

											downApp(result.data[0].appUrl);

										}

									},
									error: function(xhr, type, errorThrown) {
										h('#loadingFailArea').show();

									},
									complete: function() {
										h('.loadingImg').hide();
									}
								});
							} else {
								mui.confirm(result.data.updateContext.replace(/<p>/g, '').replace(/<\/p>/g, ''), '发现新版本Wifi环境', ['立即更新', '下次再说'], function(e) {
									if(e.index == 0) {
										if(system == 'ANDROID') {
											downApp(result.data.appUrl);
										} else {
											plus.runtime.openURL(result.data.appUrl.appUrl);
										}

									} else {
										return;
									}
								})
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
				//更新wgt
				function downWgt(wgtUrl, num) {
					plus.downloader.createDownload(wgtUrl, {
						filename: "_doc/update/"
					}, function(d, status) {

						if(status == 200) {
							plus.runtime.install(d.filename, {}, function(wgtinfo) {
								if(num == 0) {
									mui.alert("已在wifi环境下完善APP，须重启应用！", function() {
										plus.runtime.restart();
									});
								}
							});

						} else {
							plus.nativeUI.alert("应用升级失败");
							wgtWaiting.close();
						}

					}).start();
				}

				//更新APP
				function downApp(wgtUrl) {

					wgtWaiting = plus.nativeUI.showWaiting("开始下载");
					var task = plus.downloader.createDownload(wgtUrl, {
						filename: "_doc/update/"
					}, function(d, status) {
						if(status == 200) {
							wgtWaiting.setTitle("开始安装");
							installWgt(d.filename); // 安装wgt包
						} else {
							plus.nativeUI.alert("应用升级失败");
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

				function installWgt(wgtpath) {
					plus.runtime.install(wgtpath, {}, function(wgtinfo) {

						mui.alert("已在wifi环境下完善APP，须重启应用！", function() {
							plus.runtime.restart();
						});
					}, function(error) {

						mui.alert("应用更新失败！\n" + error.message);
					});
				};
			}

			//再按一次退出应用
			services.againQuite();
			//检查是否登录 
			window.addEventListener('refresh', function(e) {
				var status = e.detail.loginStatus;
				if(status == 1 || status == 0) {
					location.reload();
				}
			});
			//跳转至方案页面
			h('#jumpProgram').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url);
				}
			});
			//跳转至众筹页面
			h('#jumpZc').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url, 6);
				}
			});
			//跳转至弱电计算器
			h('#jumpEcoCounter').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url);
				}
			});
			//跳转至品牌
			h('#jumpBrand').tap(function() {
				var url = h(this).attr('data-url');
				services.nativeJump('brand.html', 'brand.html', '品牌馆');
			});
			//跳转至新品页面
			h('#jumpNewPro').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url, 8);
				}
			});
			//跳转至特价区
			h('#jumpSpePrice').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url, 7);
				}
			});
			//跳转至电子配单
			h('#jumpEcoOrder').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url);
				}
			});
			//跳转至搜索
			h('#search').tap(function() {
				var url = h(this).attr('data-url');
				if(url) {
					services.jumpTo(url);
				}
			});
			//点击商品跳转至商品详情
			mui('#jumpComProDetail').on('tap', '.jumpPro', function() {
				var id = this.getAttribute('data-proid');
				mui.openWindow({
					url: 'proDetail.html',
					id: 'proDetail.html',
					waiting: {
						autoShow: true,
						title: '正在加载...'
					},
					extras: {
						proId: id
					}
				})
			});
			//点击众筹商品跳转至众筹商品详情
			mui('#jumpZcDetail').on('tap', '.jumpZcPro', function() {
				var id = this.getAttribute('data-zcProid');
				//console.log('首页' + id);
				mui.openWindow({
					url: 'zcDetail.html',
					id: 'zcDetail.html',
					waiting: {
						autoShow: true,
						title: '正在加载...'
					},
					extras: {
						proId: id
					}
				});
			});

		})
		var page = 1;
		//获取后台数据  
		mui.ajax(services.baseUrl + '/app/index/other', {
			data: '',
			beforeSend: function(request) {
				services.beforeHeader(request);
			},
			type: 'post',
			timeout: 20000,
			success: function(data) {
				var result = JSON.parse(services.Decrypt(data));
				//console.log(result);
				if(result.status == 200) {
					//轮播图
					h('#sliderBox').html(template('getSliderBox', {
						model: result.data
					})); //图
					h('#point').html(template('pointBox', {
						model: result.data
					})); //点
					var gallery = mui('.mui-slider');
					gallery.slider({
						interval: 5000
					});
					//众筹专区上
					h('#zcShangBox').html(template('zcShangList', {
						model: result.data
					}));
					//众筹专区下
					h('#zcXiaBox').html(template('zcXiaList', {
						model: result.data
					}));
					//新品
					h('#newProBox').html(template('newProList', {
						model: result.data
					}));
					//限时特价
					h('#timePriceBox').html(template('timePriceList', {
						model: result.data
					}));
					//热销
					h('#hotSaleBox').html(template('hotSaleList', {
						model: result.data
					}));
					//视频监控
					h('#vedioBox').html(template('vedioList', {
						model: result.data,
						userRole: userRole
					}));
					//网络产品
					h('#netProBox').html(template('netProList', {
						model: result.data,
						userRole: userRole
					}));
					//线缆布控 
					h('#lineProBox').html(template('lineProList', {
						model: result.data,
						userRole: userRole
					}));

				}
			},
			error: function(xhr, type, errorThrown) {
				//			mui.toast("系统繁忙请稍后重试");
				h('#loadingFailArea').show();
			},
			complete: function() {
				h('.loadingImg').hide();
			}
		});
		//加载失败
		h('#againLine').tap(function() {
			location.reload();
		});
		//轮播跳转
		mui('#sliderBox').on('tap', 'a', function() {
			var url = h(this).attr('data-url');
			//console.log(url.split('//')[1].split('?')[0]);
			url = url.split('//')[1].split('?')[0];
			if(url == 'registerType.html') {
				var tip = null;
				switch(url) {
					case 'registerType.html':
						tip = '欢迎注册'
						break;
					default:
						break;
				}
				services.nativeJump(url, url, tip);
			} else {
				mui.openWindow({
					url: url,
					id: url,
					waiting: {
						autoShow: true,
						title: '正在加载...'
					}
				})
			}
		});

	});
})(mui);