mui.init();
mui.plusReady(function() {
	mui('#loadImgList').on('tap', '.loadBtn', function() {
		var i = h(this).attr('data-index');
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
						clickCamera(i); /*拍照*/
						break;
					case 2:
						clickGallery(i); /*打开相册*/
						break;
					default:
						break;
				}
			})
		}
	});

});
var userId = services.checkLogin().userId;
document.getElementById('newBuiltBtn').addEventListener('tap', function(event) {
	event.preventDefault();
	//	//console.log(h('#loadImg3').val());
	if(services.serializeObject('registerVali')) {
		if(!h('#port').val()) {
			mui.toast('请上传完整的图片信息!');
			return;
		} else {
			var formData = JSON.parse(document.getElementById('conForm').serialize());
			formData.tel = userId;
			//console.log(JSON.stringify(formData));
			mui.ajax(services.baseUrl + '/customer/apply/goto', {
				data: services.Encrypt(JSON.stringify(formData)),
				beforeSend: function(request) {
					services.beforeHeader(request);
					services.before('#newBuiltBtn', '提交中...');
				},
				type: 'post',
				timeout: 20000,
				success: function(data) {
					var result = JSON.parse(services.Decrypt(data));
					//console.log(services.Decrypt(data));
					if(result.status == 200) {
						mui.openWindow({
							url: "businessSucc.html",
							id: "businessSucc.html",
							styles: {
								titleNView: {
									titleText: "提交成功",
									titleColor: "#FFFFFF",
									titleSize: "19px",
									backgroundColor: "#FF3D00",
									progress: {
										color: 'transprent',
										height: '0'
									},
									splitLine: {
										color: 'transprent',
										height: '0'
									},
									autoBackButton: false
								}
							}
						});
					}
				},
				error: function(xhr, type, errorThrown) {
					h('#loadingFailArea').show();
				},
				complete: function() {
					services.completed('#newBuiltBtn', '提交');
				}
			});
		}
	}
});
// 拍照添加文件
function clickCamera(o) {
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(path) {
		plus.io.resolveLocalFileSystemURL(path, function(entry) {
			var localUrl = entry.toLocalURL();
			//创建图片预览
			creatPreview(o, localUrl);
		});
	}, function(err) {
		console.error("拍照失败：" + err.message);
	}, {
		index: 1
	});
};
// 从相册添加文件
function clickGallery(o) {
	plus.gallery.pick(function(path) {
		//创建图片预览
		creatPreview(o, path);
	}, function(err) {});
};
//创建图片预览
function creatPreview(ele, path) {
	var img = '<img src=' + path + '/>';
	document.getElementById('insertImg' + ele).innerHTML = img;
	document.getElementById('insertImg' + ele).firstChild.onload = function() {
		h('#insertImg' + ele).find('img').tap(function() {
			plus.nativeUI.previewImage(this.src, {
				current: 1,
				loop: false,
				indicator: 'none'
			});
		});
		//调压缩图片方法
		compresson(ele, path);
	};
}
//压缩图片
function compresson(ele, path) {
	plus.zip.compressImage({
		src: path,
		dst: "_doc/chat/camera/" + path,
		quality: 20,
		overwrite: true
	}, function(e) {
		//调上传方法
		upload(ele, e);
	}, function(err) {
		//console.log("压缩失败：  " + err.message);
	});
}
//上传
function upload(ele, event) {
	plus.nativeUI.showWaiting();
	//服务端接口路径
	var server = services.baseUrl + '/re/onload';
	var task = plus.uploader.createUpload(server, {
		method: "post"
	}, function(t, status) {
		if(status == 200) {
			plus.nativeUI.closeWaiting();
			//console.log("上传成功：" + services.Decrypt(t.responseText));
			var res = JSON.parse(services.Decrypt(t.responseText));
			h('#loadImg' + ele).val(res.data[0]);
			if(h('#loadImg3').val()) {
				h('#port').val(1);
			} else if(h('#loadImg0').val() && h('#loadImg1').val() && h('#loadImg2').val()) {
				h('#port').val(2);
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

//popover弹出层 
h('#chooseType').tap(function() {
	h('.bakcDrop').addClass('bakcDropActive');
	h('.choosePoper').addClass('choosePoperActive');
});
h('.bakcDrop').tap(function() {
	h('.bakcDrop').removeClass('bakcDropActive');
	h('.choosePoper').removeClass('choosePoperActive');
});
mui('#chooseType').on('tap', 'a', function(event) {
	event.preventDefault();
	h('.bakcDrop').removeClass('bakcDropActive');
	h('.choosePoper').removeClass('choosePoperActive');
	var href = h(this).attr('href');
	h(href).show().siblings().hide();
});