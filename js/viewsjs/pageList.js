mui.init({
	beforeback: function() {
		var list = plus.webview.currentWebview().opener();
		mui.fire(list, 'refresh');
		return true;
	},
	swipeBack: false
});
var isPrice = false; //默认向下
var historyList = localStorage['historyWordArr'];
var imgLazyloadApi = null;
//搜索类型
var type = '';
//搜索顺序
var order = true;
//是否重置dom
var isChange = true;
//搜索品牌
var firms = '';
//初始页码
(function($) {
	$.ready(function() {
		mui.plusReady(function() {
			//			plus.webview.currentWebview().setStyle({
			//				scrollIndicator: 'none'
			//			});
			plus.webview.currentWebview().setStyle({
				'popGesture': 'none'
			});
			var searchKey = localStorage['searchHotKey'];
			//设置搜索关键字
			h('#searchWord').val(searchKey);
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
					document.activeElement.blur();
					localStorage['searchHotKey'] = searchWord;
					setTimeout(function() {
						location.reload();
					}, 200);
				} else {
					document.activeElement.blur();
					localStorage['searchHotKey'] = searchDefault;
					setTimeout(function() {
						location.reload();
					}, 200);
				}
			});
			var mescroll = initMescroll();
			function initMescroll() {
				var mescroll = new MeScroll("mescroll", {
					up: {
						callback: commonAjax,
						page: {
							num: 0,
							size: 20,
						},
						clearEmptyId: "typeList",
						isBounce: false,
						noMoreSize: 1,
						empty: {
							tip: "暂无相关数据~",
						},
						toTop: { //配置回到顶部按钮
							src: "images/mescroll-totop.png",
							offset: 3000
						}
					}
				});
				return mescroll;
			}

			//封装请求方法
			function commonAjax(page) {
				var sendData = {
					pageNum: page.num,
					pageSize: page.size,
					queryString: searchKey,
					sortObject: type,
					firms: firms,
					order: order
				};
				setTimeout(function() {
					mui.ajax(services.baseUrl + '/search/app', {
						data: services.Encrypt(JSON.stringify(sendData)),
						beforeSend: function(request) {
							services.beforeHeader(request);
						},
						type: 'post',
						timeout: 20000,
						success: function(data) {
							var result = JSON.parse(services.Decrypt(data));
							if(result.status == 200) {
								mescroll.endBySize(result.data.search.itemList.length, result.data.search.recordCount);
								var list = document.getElementById("typeList");
								list.appendChild(createFragment(result.data));
								//品牌下拉框
								if(h('#brand').find('li').length <= 0) {
									h('#brand').html(template('brandList', {
										model: JSON.parse(result.data.firms)
									}));
								}
								//懒加载
								if(imgLazyloadApi != null) imgLazyloadApi.destroy();
								imgLazyloadApi = mui("#typeList").imageLazyload({
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
							//							plus.nativeUI.closeWaiting();
						}
					});
				}, 1000);
			}

			//如果点击综合
			function posite() {
				h('.loadingImg').show();
				isPrice = false;
				type = '';
				order = true;
				isChange = true;
				firms = '';
				h('#priceIcon').removeClass('icon-xiangshangjiantou').addClass('icon-xiangxiajiantou');
				var whereLi = h('#searchClass').find('li').eq(0);
				if(!whereLi.hasClass('searchActive')) {
					//重置列表数据
					mescroll.resetUpScroll();
				}
				whereLi.addClass('searchActive').siblings().removeClass('searchActive');
			}
			//如果点击销量
			function sale() {
				h('.loadingImg').show();
				isPrice = false;
				type = 'sells';
				order = true;
				isChange = true;
				firms = '';
				h('#priceIcon').removeClass('icon-xiangshangjiantou').addClass('icon-xiangxiajiantou');
				var whereLi = h('#searchClass').find('li').eq(1);
				if(!whereLi.hasClass('searchActive')) {
					//重置列表数据
					mescroll.resetUpScroll();
				}
				whereLi.addClass('searchActive').siblings().removeClass('searchActive');
			}
			//如果点击品牌并重置为综合搜索
			function brand() {
				isPrice = false;
				h('#priceIcon').removeClass('icon-xiangshangjiantou').addClass('icon-xiangxiajiantou');
				var whereLi = h('#searchClass').find('li').eq(2);
				whereLi.addClass('searchActive').siblings().removeClass('searchActive');
				h('#showBrand').show();
				h('#isMark').show();
			}
			//如果点击价格
			function price() {
				h('.loadingImg').show();
				var pricePage = h('#typeList3').attr('data-page');
				var whereLi = h('#searchClass').find('li').eq(3);
				whereLi.addClass('searchActive').siblings().removeClass('searchActive');
				if(isPrice) {
					h('#priceIcon').removeClass('icon-xiangxiajiantou').addClass('icon-xiangshangjiantou');
					isPrice = false;
					type = 'price';
					order = true;
					isChange = true;
					firms = '';
					//重置列表数据
					mescroll.resetUpScroll();
				} else {
					h('#priceIcon').removeClass('icon-xiangshangjiantou').addClass('icon-xiangxiajiantou');
					isPrice = true;
					type = 'price';
					order = false;
					isChange = true;
					firms = '';
					//重置列表数据
					mescroll.resetUpScroll();
				}
			}
			//字符串拼接方法
			var createFragment = function(data) {
				var fragment = document.createDocumentFragment();
				var li;
				var pd = data.search.itemList;
				for(var i = 0, len = pd.length; i < len; i++) {
					li = document.createElement('li');
					li.innerHTML = '<a href="javascript:void(0)" class="clearFloat" data-proid=' + pd[i].id + '><p class="lf searchImg"><img src="images/img_loading.png" data-lazyload=' + pd[i].appImage + ' /></p><div class="rf searchPro"><p>' + pd[i].title + '</p><p>¥' + (pd[i].price / 100).toFixed(2) + '</p></div></a>';
					fragment.appendChild(li);
				}
				return fragment;
			};
			//分类tab切换
			mui('#searchClass').on('tap', 'li', function() {
				var id = parseInt(h(this).attr('data-searchId'));
				h('#showBrand').hide();
				h('#isMark').hide();
				//隐藏回到顶部按钮
				mescroll.hideTopBtn();
				switch(id) {
					case 1:
						posite();
						break;
					case 2:
						sale();
						break;
					case 3:
						brand();
						break;
					case 4:
						price();
						break;
					default:
						break;
				}
			});
			//点击品牌分类 
			mui('#brand').on('tap', 'li', brandCallBack);
			//品牌回调
			function brandCallBack() {
				h('.loadingImg').show();
				setTimeout(function() {
					h('#showBrand').hide();
					h('#isMark').hide();
				}, 200)
				//重置品牌页码  
				var val = h(this).find('a').html();
				val = services.trim(val);
				firms = val;
				isPrice = false;
				type = '';
				order = true;
				isChange = true;
				//重置列表数据
				mescroll.resetUpScroll();
				//切换class
				h(this).addClass('brandCheck').siblings().removeClass('brandCheck');
			}

			//点击遮罩层
			h('#isMark').tap(function() {
				h('#showBrand').hide();
				h(this).hide();
			});

			//重置与取消
			h('#cancel').tap(function() {
				h('#showBrand').hide();
				h('#isMark').hide();
			});
			h('#reset').tap(function() {
				location.reload();
			});

		})
		//禁止遮罩层滚动 
		document.getElementById('isMark').addEventListener('touchstart,touchmove', function(e) {
			e.preventDefault();
		})
		//返回首页
		h('#returnHome').tap(function() {
			services.returnHome('slide-in-left', 'slide-out-right');
		});
		//跳转至商品详情
		mui('#typeList').on('tap', 'li', function() {
			var id = h(this).find('a').attr('data-proid');
			mui.openWindow({
				url: "proDetail.html",
				id: "proDetail.html",
				waiting: {
					autoShow: true,
					title: '正在加载...'
				},
				extras: {
					proId: id
				}
			})
		});
	})
})(mui);