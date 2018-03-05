mui.init();
var imgLength = '';
var imgCompare = '';
var imgArr = [];
var grade = '';
//初始化页面执行操作  
mui.plusReady(function() {
	var self = plus.webview.currentWebview();
	var orderId = self.orderId;
	var index = self.index;
	var proId = self.proId;
	//请求商品数据
	mui.ajax(services.baseUrl + '/msg/goto', {
		data: services.Encrypt(JSON.stringify({
			orderId: orderId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			if(result.status === 200) {
				h('#evaProBox').html(template('evaProList', {
					model: result.data.goods[index]
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

	h('#F_CKJLB').tap(function() {
		//检查已经有的图片
		var existImg = h('#imageList').find('img').length;
		if(mui.os.plus) {
			var a = [{
				title: "拍照"
			}, {
				title: "从手机相册选择"
			}];
			plus.nativeUI.actionSheet({
				title: "上传证件",
				cancel: "取消",
				buttons: a
			}, function(b) { /*actionSheet 按钮点击事件*/
				switch(b.index) {
					case 0:
						break;
					case 1:
						clickCamera(); /*拍照*/
						break;
					case 2:
						clickGallery(existImg); /*打开相册*/
						break;
					default:
						break;
				}
			})
		}
	});

	mui('#imageList').on('tap', 'img', function() {
		plus.nativeUI.previewImage(this.src, {
			current: 1,
			loop: false,
			indicator: 'none'
		});
	});

	h('#uploadimge').tap(function(e) {
		var userMsg = services.checkLogin();
		e.preventDefault();
		if(!grade) {
			mui.toast('请选择商品满意度!');
			return;
		} else {
			//console.log(JSON.stringify({
//				orderId: orderId,
//				commodityId: proId,
//				username: userMsg.userName,
//				userId: userMsg.userId,
//				msg: h('#evaTxt').val(),
//				grade: grade,
//				imgUrl: imgArr
//			}));
			mui.ajax(services.baseUrl + '/msg/addone', {
				data: services.Encrypt(JSON.stringify({
					orderId: orderId,
					commodityId: proId,
					username: userMsg.userName,
					userId: userMsg.userId,
					msg: h('#evaTxt').val(),
					grade: grade,
					imgUrl: imgArr
				})),
				beforeSend: function(request) {
					services.beforeHeader(request);
				},
				type: 'post',
				timeout: 20000,
				success: function(data) {
					var result = JSON.parse(services.Decrypt(data));
					//console.log(services.Decrypt(data));
					if(result.status === 200) {
						mui.openWindow({
							url: "evaSucc.html",
							id: "evaSucc.html",
							waiting: {
								autoShow: true,
								title: '正在加载...'
							},
							extras: {
								orderId: orderId
							}
						})
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
})

// 拍照添加文件
function clickCamera() {
	imgLength = '';
	imgCompare = '';
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(path) {
		plus.io.resolveLocalFileSystemURL(path, function(entry) {
			var localUrl = entry.toLocalURL();
			//创建图片预览
			imgLength++;
			creatPreview(localUrl);
		});
	}, function(err) {
		console.error("拍照失败：" + err.message);
	}, {
		index: 1
	});
};
// 从相册添加文件
function clickGallery(j) {
	imgLength = '';
	imgCompare = '';
	// 从相册中选择图片  
	plus.gallery.pick(function(e) {
		for(var i in e.files) {
			var fileSrc = e.files[i]
			creatPreview(fileSrc);
		}
		imgLength = e.files.length;
	}, function(e) {
		mui.toast("取消选择图片");
	}, {
		filter: "image",
		multiple: true,
		maximum: 5 - j,
		system: false,
		onmaxed: function() {
			plus.nativeUI.alert('最多只能选择' + (5 - j) + '张图片');
		}
	});
};
//创建图片预览
function creatPreview(path) {
	var img = '<img src=' + path + '/>';
	var imgHtml = '<div class="image-item"><p><img src=' + path + ' /></p><em class="del">×</em><span class="clickDel"></span></div>';
	document.getElementById('imageList').innerHTML += imgHtml;
	//调压缩图片方法
	compresson(path);
}
//压缩图片
function compresson(path) {
	plus.zip.compressImage({
		src: path,
		dst: "_doc/chat/camera/" + path,
		quality: 20,
		overwrite: true
	}, function(e) {
		//调上传方法
		upload(e);
	}, function(err) {
		//console.log("压缩失败：  " + err.message);
	});
}
//上传
function upload(event) {
	plus.nativeUI.showWaiting();
	//服务端接口路径
	var server = services.baseUrl + '/re/onload';
	var task = plus.uploader.createUpload(server, {
		method: "post"
	}, function(t, status) {
		if(status == 200) {
			//console.log("上传成功：" + services.Decrypt(t.responseText));
			imgArr.push(JSON.parse(services.Decrypt(t.responseText)).data.join(''));
			imgCompare++;
			if(imgLength == imgCompare) {
				plus.nativeUI.closeWaiting();
			}
			if(h('#imageList').find('img').length >= 5) {
				h('#F_CKJLB').hide();
			}
		} else {
			mui.toast("上传失败：" + status);
		}
	});
	task.addFile(event.target, {});
	//添加其他参数
	task.addData("name", "test");
	task.start();
}
//删除图片
mui('#imageList').on('tap', '.clickDel', function() {
	var index = [].indexOf.call(this.parentNode.parentNode.querySelectorAll(this.tagName), this);
	imgArr.splice(index, 1);
	h(this).parent().remove();
	h('#F_CKJLB').show();
	//console.log(index);
	//console.log(imgArr);
});

//星级评价
mui('#starEva').on('tap', 'span', function() {
	var index = h(this).attr('data-index');
	var arr = h('#starEva').find('span');
	for(var i = 0; i < index; i++) {
		if(!h(this).hasClass('startActive')) {
			arr.eq(i).addClass('startActive');
		}
		for(var j = i + 1; j <= 4; j++) {
			if(h(this).hasClass('startActive')) {
				arr.eq(j).removeClass('startActive');
			}
		}
	}
	grade = index;
});
//跳转至商品详情
mui('#evaProBox').on('tap', '.jumpDetail', function() {
	var id = h(this).attr('data-id');
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