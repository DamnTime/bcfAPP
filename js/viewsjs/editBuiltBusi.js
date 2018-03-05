mui.init();
var userMsg=services.checkLogin();
var userId = userMsg.userId;
var userName=userMsg.userName;
var lock = '';
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

	//查询用户信息
	mui.ajax(services.baseUrl + '/customer/authentication/ok', {
		data: services.Encrypt(JSON.stringify({
			userId: userId
		})),
		beforeSend: function(request) {
			services.beforeHeader(request);
			plus.nativeUI.showWaiting();
		},
		type: 'post',
		timeout: 20000,
		success: function(data) {
			var result = JSON.parse(services.Decrypt(data));
			//console.log(services.Decrypt(data));
			if(result.status == 200) {
				lock = parseInt(result.data.locked);
				switch(lock) {
					case 3:
						changeType(parseInt(result.data.port), 3, result.data.threeOne, result.data.yingyezhizhao, result.data.shuiwudengji, result.data.zuzhijigou);
						break;
					case 4:
						changeType(parseInt(result.data.port), 4, result.data.threeOne, result.data.yingyezhizhao, result.data.shuiwudengji, result.data.zuzhijigou);
						break;
				}
				h('#errMsg').html(result.data.returnInfo);
				h('#companyName').val(result.data.companyName);
				h('#legalPerson').val(result.data.legalPerson);
				h('#registerAddress').val(result.data.registerAddress);
				h('#companyAddress').val(result.data.companyAddress);
				h('#companyTle').val(result.data.companyTle);
				h('#bankName').val(result.data.bankName);
				h('#openBank').val(result.data.openBank);
				h('#port').val(result.data.port);
			}
		},
		error: function(xhr, type, errorThrown) {
			h('#loadingFailArea').show();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
		}
	});

});

function changeType(three, type, img1, img2, img3, img4) {
	type == 3 ? h('#succRiges').show() : h('#errRiges').show();
	if(three == 1) { //三证
		var html = '<img src=' + img1 + '>';
		h('#threeOne').show().siblings().hide();
		h('#insertImg3').html(html);
		h('#loadImg3').val(img1);
	} else if(three == 2) {
		var html2 = '<img src=' + img2 + '>';
		var html3 = '<img src=' + img3 + '>';
		var html4 = '<img src=' + img4 + '>';
		h('#MoreCer').show().siblings().hide();
		h('#insertImg0').html(html2);
		h('#insertImg1').html(html3);
		h('#insertImg2').html(html4);
		h('#loadImg0').val(img2);
		h('#loadImg1').val(img3);
		h('#loadImg2').val(img4);
	}
}

document.getElementById('newBuiltBtn').addEventListener('tap', function(event) {
	event.preventDefault();
	if(lock == 3) {
		mui.confirm('提交后将会重新认证,确认继续提交?', '温馨提示', ['确认', '取消'], submit, 'div');
	} else {
		submit({
			index: 0
		});
	}
});
//封装后台请求
function submit(e) {
	if(e.index == 0) {
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
							var newUerMsg=userId+':'+userName+':'+'0';
							//改变本地存储
							localStorage['userName'] = services.Encrypt(JSON.stringify(newUerMsg));
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
	} else {
		return;
	}
}

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
			mui.toast("上传失败请检查图片格式或换一张图片");
			plus.nativeUI.closeWaiting();
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