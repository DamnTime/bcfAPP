//启用相对路径
fis.hook('relative');
// 配置配置文件，注意，清空所有的配置，只留下以下代码即可  ----资源定位。
fis.match('*.{png,js,css}', {
  release: '/$0',
  useHash: false
});

 fis.match('*.js', {
 	 release: '/$0',
   optimizer: fis.plugin('uglify-js')
 });

 fis.match('*.css', {
   useSprite: true,
   release: '/$0',
   optimizer: fis.plugin('clean-css')
 });

 fis.match('*.png', {
 	release: '/$0',
   optimizer: fis.plugin('png-compressor')
 });
 //全局相对路径
fis.match('**', { relative: true })