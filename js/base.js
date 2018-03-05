(function() {
	//表单json
	HTMLFormElement.prototype.serialize = function() {
		var form = this;
		// 表单数据
		var arrFormData = [],
			objFormData = {};
		[].slice.call(form.elements).forEach(function(ele) {
			// 元素类型和状态
			var type = ele.type,
				disabled = ele.disabled;
			// 元素的键值
			var name = ele.name,
				value = ele.value;
			// name参数必须，元素非disabled态，一些类型忽略
			if(!name || disabled || !type || (/^reset|submit|image$/i.test(type)) || (/^checkbox|radio$/i.test(type) && !ele.checked)) {
				return;
			}
			type = type.toLowerCase();
			if(type !== 'select-multiple') {
				if(objFormData[name]) {
					objFormData[name].push(value);
				} else {
					objFormData[name] = [value];
				}
			} else {
				[].slice.call(ele.querySelectorAll('option')).forEach(function(option) {
					var optionValue = option.value;
					if(option.selected) {
						if(objFormData[name]) {
							objFormData[name].push(optionValue);
						} else {
							objFormData[name] = [optionValue];
						}
					}
				});
			}
		});
		for(var key in objFormData) {
			arrFormData.push(key + '=' + objFormData[key].join());
		}
		arrFormData = arrFormData.join('&').replace(/&/g, "\",\"").replace(/=/g, "\":\"");
		arrFormData = "{\"" + arrFormData + "\"}";
		return arrFormData;
	};

	services = {
		//		https://www.ba256.com/yd
		//      http://192.168.0.117:8082
		baseUrl: 'https://www.ba256.com/yd',
		//加密 
		Encrypt: function(word) {
			var key = CryptoJS.enc.Utf8.parse("@8256com20171016");
			var srcs = CryptoJS.enc.Utf8.parse(word);
			var encrypted = CryptoJS.AES.encrypt(srcs, key, {
				mode: CryptoJS.mode.ECB,
				padding: CryptoJS.pad.Pkcs7
			});
			return encrypted.toString();
		},
		//解密
		Decrypt: function(word) {
			var key = CryptoJS.enc.Utf8.parse("@8256com20171016");

			var decrypt = CryptoJS.AES.decrypt(word, key, {
				mode: CryptoJS.mode.ECB,
				padding: CryptoJS.pad.Pkcs7
			});
			return CryptoJS.enc.Utf8.stringify(decrypt).toString();
		},
		//    beforSend
		before: function(btn, msg) {
			h(btn).val(msg).attr('disabled', 'disabled');
		},
		completed: function(btn, msg) {
			h(btn).removeAttr('disabled').val(msg);
		},
		//    设置header头
		beforeHeader: function(res) {
			res.setRequestHeader("Content-type", "Application/JSON; charset=utf-8");
			res.setRequestHeader("uuid", "phone");
			var tokenId = localStorage['tokenId'];
			if(tokenId) {
				res.setRequestHeader("Authorization", tokenId);
			}
		},
		//    表单序列成json
		serializeObject: function(id) {
			var o = {};
			var a = id.serializeArray();
			$.each(a, function(e, q) {
				if(o[q.name] !== undefined) {
					if(!o[q.name].push) {
						o[q.name] = [o[q.name]];
					}
					o[q.name].push(q.value || '');
				} else {
					o[q.name] = q.value || '';
				}
			});
			return o;
		},
		//loading样式
		loading: "<div class='loadingImg'><img src='images/loading.gif'/></div>",

		//alert 弹窗

		//页面跳转
		jumpTo: function(url, typeId) {
			mui.openWindow({
				url: url,
				id: url,
				waiting: {
					autoShow: true,
					title: '正在加载...'
				},
				extras: {
					type: typeId
				}
			})
		},
		//再按一次退出应用
		againQuite: function() {
			var first = null;
			mui.back = function() {
				if(!first) {
					first = new Date().getTime();
					mui.toast('再按一次退出应用');
					setTimeout(function() {
						first = null;
					}, 1000);
				} else {
					if(new Date().getTime() - first < 1000) {
						plus.runtime.quit();
					}
				}
			};
		},
		//指定页面刷新  参数说明:登录:1;未登录为0
		dirctRefresh: function(arr, status) {
			for(var i = 0; i < arr.length; i++) {
				var view = plus.webview.getWebviewById(arr[i]);
				mui.fire(view, 'refresh', {
					loginStatus: status
				});
			}
		},
		//  时间戳转换为倒计时
		getCountDown: function(time, htmlId) {
			var timer = setInterval(function() {
				var nowTime = new Date();
				var endTime = new Date(time);
				var t = endTime.getTime() - nowTime.getTime();
				if(t > 0) {
					var d = Math.floor(t / 1000 / 60 / 60 / 24);
					var hour = Math.floor(t / 1000 / 60 / 60 % 24);
					var min = Math.floor(t / 1000 / 60 % 60);
					var sec = Math.floor(t / 1000 % 60);
					if(hour < 10) {
						hour = "0" + hour;
					}
					if(min < 10) {
						min = "0" + min;
					}
					if(sec < 10) {
						sec = "0" + sec;
					}
					var countDownTime = d + "天" + hour + "时" + min + "分" + sec + '秒';
					h(htmlId).html(countDownTime);
				} else {
					alert('进了');
					clearInterval(timer);
				}
			}, 1000);
		},
		//  数组去重
		arrayUnique: function(arr) {
			var res = [];
			var json = {};
			for(var i = 0; i < arr.length; i++) {
				if(!json[arr[i]]) {
					res.push(arr[i]);
					json[arr[i]] = 1;
				}
			}
			return res;
		},
		//去除前后空格
		trim: function(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		},
		//转JSON
		jsonChange: function(str) {
			return JSON.parse(str);
		},
		//检查用户是否登录
		checkLogin: function() {
			var userMsg = {};
			if(localStorage['userName']) {
				var userName = JSON.parse(services.Decrypt(localStorage['userName']));
				userMsg = {
					userRole: userName.split(':')[2],
					userId: userName.split(':')[0],
					userName: userName.split(':')[1]
				}
			} else {
				userMsg = {
					userRole: 0,
					userId: '',
					userName: ''
				}
			}
			return userMsg
		},
		//判断是否含有class
		myHasClass: function(element, cls) {
			return(' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
		},
		//时间戳转化
		dataformat: function(date, format) {
			date = new Date(date);
			var map = {
				"M": date.getMonth() + 1, //月份
				"d": date.getDate(), //日
				"h": date.getHours(), //小时
				"m": date.getMinutes(), //分
				"s": date.getSeconds(), //秒
				"q": Math.floor((date.getMonth() + 3) / 3), //季度
				"S": date.getMilliseconds() //毫秒
			};

			format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
				var v = map[t];
				if(v !== undefined) {
					if(all.length > 1) {
						v = '0' + v;
						v = v.substr(v.length - 2);
					}
					return v;
				} else if(t === 'y') {
					return(date.getFullYear() + '').substr(4 - all.length);
				}
				return all;
			});
			return format;
		},
		//表单验证
		serializeObject: function(inputs) {
			var inputList = document.getElementsByClassName(inputs);
			var len = inputList.length;
			var success = 0;
			for(var i = 0; i < len; i++) {
				if(inputList[i].type != 'submit' && inputList[i].type != 'hidden' && !inputList[i].disabled) {
					if(inputList[i].value) {
						var rule = new RegExp(inputList[i].getAttribute("data-rule-" + inputList[i].name).split("'")[0].slice(2, -2));
						if(rule.test(inputList[i].value)) {
							inputList[i].className = inputs;
							success++;
						} else {
							var msg = inputList[i].getAttribute("data-rule-" + inputList[i].id).split("'")[1];
							mui.toast(msg);
							inputList[i].className += " validationErr";
							break;
						}
					} else if(inputList[i].getAttribute('data-rule').indexOf('required') > -1) {
						mui.toast('不能为空');
						inputList[i].className += " validationErr";
						break;
					}
				}
			}
			if(len == success) {
				return true;
			}
		},
		//带原生顶部的页面跳转
		nativeJump: function(url, id, txt, extraData) {
			mui.openWindow({
				url: url,
				id: id,
				waiting: {
					autoShow: true,
					title: '正在加载...'
				},
				styles: {
					titleNView: {
						titleText: txt,
						titleColor: '#FFFFFF',
						titleSize: '19px',
						backgroundColor: '#FF3D00',
						progress: {
							color: 'transprent',
							height: '0'
						},
						splitLine: {
							color: 'transprent',
							height: '0'
						},
						autoBackButton: true
					}
				},
				extras: extraData
			})
		},
		//跳转至首页
		returnHome: function(showMain, showSlef) {
			var allWv = plus.webview.all();
			var self = plus.webview.currentWebview();
			for(var i = 0, len = allWv.length; i < len; i++) {
				if(allWv[i].id == self.id) {
					continue;
				} else {
					allWv[i].close('none');
				}
			}
			var creatMain = plus.webview.create('main.html', 'main.html');
			setTimeout(function() {
				creatMain.show(showMain);
				self.close(showSlef);
			}, 300);
		}
	}
})();