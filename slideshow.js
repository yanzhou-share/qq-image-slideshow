/**
 * 
 * TT  V5 幻灯片
 * 
 * 如果创建单个对象，自己判断实例 
 * examples:
 * 
 * var slider = new TT.component.Slideshow();
 * var o = {'gid':'当前圈子id', 'rid':'当前图片rid', 'url':'中间键url', 'mid':'此条消息的mid'};
 * slider.init(o);
 * 
 * sandyz
 * 
 * 2013-4-12
 * 
 * version 5.0
 */


;(function($){
  
	var settings = TT.Settings,
	
		urls     = settings.URLS,
		
		tmplHelpers = TT.Util.TmplHelpers,
		
		//environment = "develop";
		environment = "product",
		
		screenHeight = parseInt($(window).height()),
		
		screenWidth = parseInt($(window).width()+16);
	
	TT.define('TT.component.Slideshow',{
		
		extend : 'TT.Component',
		
		className : 'po-black-masker',
		
		tmplNode : '#slideshow_tmpl',
		
		attributes : {
            style : 'display:none;'
        },
		
		tmplHelpers : tmplHelpers,
		
		options : {
        	width : (screenWidth - 300) > 500 ? (screenWidth - 300) : 500,
        	
        	height : (screenHeight - 41) > 400 ? (screenHeight - 41) : 400,
        	
        	thumbW : 112,
        	
        	thumbH : 112,
        	
        	proloadSize : 5,
        	
        	isRid : true, //如果传入rid  如果传入url  false
        	
        	url : ''
        },
		
		events : {
        	'click div[node-type="v5-close-slideshow"]' : "hide",
        	'click div[node-type="v5-prev-btn"]' 		: "prev",
        	'click div[node-type="v5-next-btn"]' 		: "next",
        	'click span[node-type="v5-check-original"]' : "changeScaleMode",
        	'click span[node-type="v5-rotate-image"]'	: "rotate"
        },
        
        oriFlag : false,
        
        rotateTime : 0,
        
        rid : '',
        
        gid : '',
        
        mid : '',
        
        arrayImagesRids : [],
        
        arrayImagesDetails : [],
        
        hasAlreadyLoad : [],
        
		loaderConfig : {
            locale : '/assets/js/libs/tt_library_0.0.1/src/locale/zh_CN/index.json'
		},
		
		initialize : function(options){
			this.options = TT.$.extend({}, this.options, options);
			
			this.$el.appendTo('body');
			
        	this.rander();
        	this.addEvents();
		},
		
		addEvents : function(){
			var el = this.$el, _this = this;
			
			document.onkeydown = function(e){
				var theEvent = e || window.event, code = theEvent.keyCode || theEvent.which;
				
				if(code == 27)
				{
					_this.hide();
				}
				else if(code==37 || code==38)
				{
					el.find('div[node-type="v5-prev-btn"]').trigger("click");
				}
				else if(code==39 || code==40)
				{
					el.find('div[node-type="v5-next-btn"]').trigger("click");
				}	
			}
			
			$(window).bind('resize',function(){
				screenHeight = parseInt($(window).height());
				screenWidth = parseInt($(window).width()+16);
				
				_this.options.width = (screenWidth - 300) > 500 ? (screenWidth - 300) : 500;
				_this.options.height= (screenHeight - 41)  > 400 ? (screenHeight - 41)  : 400;
				
				_this.setMaskParams();
			});
			
			el.delegate('span[node-type="v5-download-image"]',"click",function(){
				window.location = settings.DOWNLOAP_IMAGE_URL+_this.rid;
//				el.find('span[node-type="v5-download-image"] a').attr("href",settings.DOWNLOAP_IMAGE_URL+this.rid);
			});
		},
		/**
		 * 下一张图片
		 */
		next : function(){
			var el = this.$el;
			//查看原图过程中点击下一张
			if (this.oriFlag)
			{
				el.find('span[node-type="v5-check-original"]').trigger("click");
				el.find('img[node-type="v5-original-image"]').css({left:''});
			}	
			
			el.find('span[node-type="v5-check-original"]').css({"visibility":"visible"});
			
			this.getPreOrNext(1);
			this.show();
		},
		/**
		 * 上一张图片
		 */
		prev : function(){
			var el = this.$el;
			//查看原图过程中点击下一张
			if (this.oriFlag)
			{
				el.find('span[node-type="v5-check-original"]').trigger("click");
				el.find('img[node-type="v5-original-image"]').css({left:''});
			}
			
			el.find('span[node-type="v5-check-original"]').css({"visibility":"visible"});
			
			this.getPreOrNext(2);
			this.show();
		},
		/**
		 * 获取下一张或者上一张
		 */
		getPreOrNext : function(type){
			if(this.arrayImagesRids.length<2)	return false;
			
			this.rotateTime = 0;//重置旋转的次数
			var index = $.inArray(this.rid, this.arrayImagesRids), len = this.arrayImagesRids.length;
			//如果下一张
			if(type == 1)
			{
				if((index+1)>=len){
					return false;
				}
				
				this.rid = this.arrayImagesRids[index+1];
			}
			//上一张
			else if(type == 2)
			{
				
				if((index-1)<0){
					return false;
				} 
				this.rid = this.arrayImagesRids[index-1];
			}	
		},
		/**
		 * 隐藏左右按钮
		 */
		hideOrShowNextPrevBtn : function(direction, b){
			var el = this.$el, _nextBtn = el.find('div[node-type="v5-next-btn"]'), _prevBtn = el.find('div[node-type="v5-prev-btn"]'); 
			
			if(b && direction=="prev")
			{
				_prevBtn.show();
			}
			else if(!b && direction=="prev")
			{
				_prevBtn.hide();
			}
			
			if(b && direction=="next")
			{
				_nextBtn.show();
			}
			else if(!b && direction=="next")
			{
				_nextBtn.hide();
			}	
		},
		/**
		 * 隐藏旋转按钮
		 */
		hideOrShowRotateBtn : function(b){
			var el = this.$el;
			if(b)
			{
				el.find('span[node-type="v5-rotate-image"]').show();
			}
			else
			{
				el.find('span[node-type="v5-rotate-image"]').hide();
			}	
		},
		/**
		 * 左右上下箭头
		 */
		btnControll : function(){
			var index = $.inArray(this.rid, this.arrayImagesRids), len = this.arrayImagesRids.length;
			if(index==len-1)
			{
				this.hideOrShowNextPrevBtn("next", false);
			}
			else
			{
				this.hideOrShowNextPrevBtn("next", true);
			}	
			if(index == 0)
			{
				this.hideOrShowNextPrevBtn("prev", false);
			}
			else
			{
				this.hideOrShowNextPrevBtn("prev", true);
			}
		},
		/**
		 * 显示图片
		 * 
		 */
		show : function(){
			var index = $.inArray(this.rid, this.arrayImagesRids), len = this.arrayImagesRids.length;
			this.setDataToTmpl(this.arrayImagesDetails[index]);
		},
		
		rander : function(){
			var tmpl = this.randerTmpl();
			
			this.$el.append(tmpl);
			
			this.addEvents();
		},
		/**
		 * 暴露接口
		 */
		init : function(param){
			var el = this.$el;
			
			var bTop = $(document).scrollTop();
			
			$('div[node-type="v5-doc"]').attr("style","position:fixed;").css({top: -bTop});
			$("body").css({position:"fixed"});
			
			el.show();
			
			if(this.options.isRid && !!param)
			{
				this.rid = param.rid;
				this.gid = param.gid;
				this.mid = param.mid;
				this.options.url = param.url;
				
				this.getDataByRid();
			}	
			
		},
		/**
		 * 将层隐藏
		 */
		hide : function(){
			var el = this.$el;
			
			el.hide();
			
			this.reset();
		},
		/**
		 * 显示loading
		 */
		prelayerLoading : function(b){
			var el = this.$el, loadNode = el.find('div[node-type="loadNode"]'), left = (this.options.width-60)/2, top = 21 + (this.options.height - 60)/2;
			
			if(b) loadNode.css({left:left+"px",top:top+"px",opacity:1}).show();
			
			else  loadNode.fadeOut(200);
		},
		/**
		 * 图片信息的显示
		 * 等待第一张图片显示出来之后去预加载其他图片
		 */
		setDataToTmpl : function(data){
			var _sw = parseInt(data.imgw) == 0 ? 510 : parseInt(data.imgw) ,
				_sh = parseInt(data.imgh) == 0 ? 510 : parseInt(data.imgh) ,
				comments = data.comments || {},
				op = this.options,
				el = this.$el,
				_this = this,
				_btn = el.find('span[node-type="v5-check-original"]'),
				currentImage = el.find('img[node-type="v5-current-img"]');
			
			currentImage.attr("src","/assets/img/blank.gif").show().css({opacity:1});
			el.find('span[node-type="v5-check-original"]').removeClass("narrow").addClass("enlarge");
			_this.setMaskParams();
			_this.ajustPosition();
			_this.prelayerLoading(true);
			_this.btnControll();
			
			(_sw<op.width&&_sh<op.height) ? _btn.hide() : _btn.show();	
			_this.setBottomBtnPosition();
			
			var img = new Image();
			
			$(img).bind("load",function(){
				_this.prelayerLoading(false);
				if(_this.isGif(_this.rid))
				{
					currentImage.attr("src",_this.tmplHelpers.getImageOriUrl(_this.rid));
				}
				else
				{
					currentImage.attr("src",_this.tmplHelpers.getImageUrl(_this.rid, op.width, op.height, 1));
				}	
				_this.preload(_this.arrayImagesDetails);
			});
			
			if(_this.isGif(_this.rid))
			{
				img.src = _this.tmplHelpers.getImageOriUrl(_this.rid);
			}
			else
			{
				img.src = _this.tmplHelpers.getImageUrl(_this.rid, op.width, op.height, 1);
			}	
			
		},
		
		/**
		 * 调整位置
		 */
		ajustPosition : function(){
			var index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), marginTop = 200, top = 41,
				el = this.$el;
			
			var position = this.zoomImage(ow, oh);	
			
			el.find('div[node-type="v5-photo-item"]').css({"padding-top":position.paddingTop});	
		},
		/**
		 * 鼠标滚轮滚动
		 */
		wheel : function(){
			var el = this.$el, _this = this, oriImage = el.find('img[node-type="v5-original-image"]');
			var index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), maxTop = 0;
			
			if(oh<this.options.height)
			{
				return;
			}	
			else
			{
				maxTop = this.options.height - oh;
			}	
			
			el.mousewheel(function(event,delta,deltaX,deltaY){
				var top = oriImage.css('top');
				
				if(top=="auto") top = 0;
				
				top = parseInt(top);
				
				_t = top+(delta*40);
				
				if(Math.abs(_t)<=Math.abs(maxTop) && _t<=0)
				{
					oriImage.css({top:_t+"px"});
					_this.dragImageAjustThumb();
				}
			});
		},
		
		/**
		 * 拖动大图片改变右下角的位置
		 */
		dragImageAjustThumb : function (){
			var el = this.$el, oriImage = el.find('img[node-type="v5-original-image"]'), top, left,
				visibleArea = el.find('div[node-type="v5-visible_area"]'),
				index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), type,
				thumbP = this.getThumbParams();
			
			top = oriImage.css('top')=="auto" ? 0 : Math.abs(parseInt(oriImage.css('top')));
			left = oriImage.css('left')=="auto" ? 0 : Math.abs(parseInt(oriImage.css('left')));
			
			type = this.checkCurrentPic();
			
			if(type == 2)
			{
				var percent = top/oh;
				visibleArea.css({position:"absolute",top:(percent*100+"%")});
			}
			else if(type == 1)
			{
				var percent = left/ow
				el.find('div[node-type="v5-visible_area"]').css({position:"absolute",left:(percent*100+"%")});
			}	
			else 
			{
				var p1 = top/oh, p2 = left/ow;
				el.find('div[node-type="v5-visible_area"]').css({position:"absolute",left:(p2*100+"%"),top:(p1*thumbP.height+(this.options.thumbH-thumbP.height)/2+"px")});
			}	
			
		},
		
		/**
		 * 显示或者隐藏拇指图
		 */
		showThumb : function(_f){
			var _this = this,el = this.$el, thumb = el.find('div[node-type="v5-thumb"]'), op = this.options,
				pW = op.width, pH = op.height,
				index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh),
				visible_area = el.find('div[node-type="v5-visible_area"]');
			
			if(_f)
			{
				thumb.show();
				
				var img = new Image();
				
				$(img).bind("load",function(){
					var width = this.width, height = this.height, left = 0, top = 0, type = _this.checkCurrentPic(),
						thumbP = _this.getThumbParams();
					//当是非常高的图时
					if(type == 2)
					{
						var _w = width, _h = width*op.height/ow, _lf = (op.thumbW - _w)/2;
						visible_area.css({top:0});
					}
					else if(type == 1)//非常宽图
					{
						var _h = height, _w = height*op.width/oh, _top = (op.thumbH - _h)/2; 
						visible_area.css({top:_top});
					}
					else//即高又宽
					{
						var _p = ow/thumbP.width, _h = op.height/_p, _w = op.width/_p,
							top = (op.thumbH-thumbP.height)/2;
						visible_area.css({top:top,left:0});
					}	
					left = (op.thumbW-width)/2;
					top  = (op.thumbH-height)/2;
					
					visible_area.css({width:_w,height:_h,left:_lf});
					el.find('img[node-type="v5-thumb-pic"]').attr("src",_this.tmplHelpers.getImageUrl(_this.rid, op.thumbW, op.thumbH,1)).css({position:"absolute",top:top,left:left}).attr("width",width).attr("height",height);
				});
				
				img.src = _this.tmplHelpers.getImageUrl(_this.rid, op.thumbW, op.thumbH,1);
			}	
			else
			{
				thumb.hide();
			}	
		},
		/**
		 * 获取右下角拖动区域方块的高宽
		 */
		getDragAreaParams : function(){
			var index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), type, params, op = this.options;
			
			type = this.checkCurrentPic();
			params = this.getThumbParams();
			
			if(type == 1)
			{
				var _h = params.height, _w = _h*op.width/oh; 
			}
			else if(type == 2)
			{
				var _w = params.width, _h = _w*op.height/ow;
			}
			else
			{
				var thumbP = this.getThumbParams(), _p = ow/thumbP.width, _h = op.height/_p, _w = op.width/_p;
			}	
			
			return {"width":_w,"height":_h};
		},
		
		/**
		 * 预加载图片
		 */
		preload : function(datas){
			var _this = this, op = _this.options;
			
			if(datas.length>0)
			{
				for(var i=0;i<datas.length;i++)
				{
					var _data = datas[i];
					if(jQuery.inArray(_data.rid, this.hasAlreadyLoad) == -1)
					{
						var img = new Image(), width = _data.imgw, height = _data.imgh;
						
						$(img).bind('load',function(){
							_this.hasAlreadyLoad.push(_data.rid);
						});
						
						img.src = this.tmplHelpers.getImageUrl(_data.rid, op.width, op.height);
					}	
				}	
				
			}	
		},
		/**
		 * 根据显示的最大宽高缩放图片
		 */
		zoomImage : function(ow, oh){
			var op = this.options, o = {}, w = op.width, h = op.height;
			
			if(ow<w && oh<h)
			{
				o.width = ow;
				o.height = oh;
				o.paddingTop = (op.height - o.height)/2;
			}
			else if(ow>=w && oh>=h)
			{
				if(ow/oh>op.width/op.height)
				{
					o.width = op.width;
					o.height = op.width*oh/ow;
					o.paddingTop = (op.height-o.height)/2;
				}
				else
				{
					o.height = op.height;
					o.width = op.height*ow/oh;
					o.paddingTop = (op.height-o.height)/2;
				}	
			}
			else if(ow>w && oh<h)
			{
				o.width = op.width;
				o.height = oh*op.width/ow;
				o.paddingTop = (op.height-o.height)/2;
			}	
			else if(ow<w && oh>h)
			{
				o.height = op.height;
				o.width = ow*op.height/oh;
				o.paddingTop = (op.height-o.height)/2;
			}	
			
			return o;
		},
		
		/**
		 * 根据rid获取对应信息
		 * data.list为rid的数组对应顺序
		 * data.detail为所有rid对应图片的所有信息包括赞、评论
		 */
		getDataByRid : function(){
			var _this = this;
			
			if(environment == 'develop')
			{
				_this.arrayImagesRids = ['group2M00027CwKgzDlFruUMEAAAAAAAAAPXwecM900_M00_jpg','group1M00366AwKgzC1Fru58EAAAAAAAAAIAv0AA319_M00_jpg','group2M00027CwKgzDlFruUMEAAAAAAAAABNR-jw609_M00_jpg','group1M00366AwKgzC1Fru6IEAAAAAAAAADnuQ2E840_M00_jpg','group2M00027CwKgzDlFruUYEAAAAAAAAAP-tpjM763_M00_jpg'];
				_this.arrayImagesDetails = [{'rid':'group2M00027CwKgzDlFruUMEAAAAAAAAAPXwecM900_M00_jpg','width':500,'height':600},{'rid':'group1M00366AwKgzC1Fru58EAAAAAAAAAIAv0AA319_M00_jpg','width':800,'height':600},{'rid':'group2M00027CwKgzDlFruUMEAAAAAAAAABNR-jw609_M00_jpg','width':400,'height':600},{'rid':'group1M00366AwKgzC1Fru6IEAAAAAAAAADnuQ2E840_M00_jpg','width':1000,'height':600},{'rid':'group2M00027CwKgzDlFruUYEAAAAAAAAAP-tpjM763_M00_jpg','width':700,'height':500}];
				_this.setDataToTmpl({'rid':_this.rid,'width':'500','height':'500','comments':{}});
			}
			else
			{
				TT.$.ajax({
					url  : this.options.url,
					data : {rid: _this.rid, gid: _this.gid, mid: _this.mid},
					type : 'POST',
					success : function (data) {
						var _data;
						
						if(!!data.code)
						{
							_data = data.data.slideShow;
							_this.arrayImagesDetails = _data.ImagesDetails;//当前mid下对应图片的信息
							_this.arrayImagesRids = _data.ImagesRids;//当前mid下rid数组
							//首次判断图片数量
							if(_data.ImagesRids.length==1)
							{
								_this.hideOrShowNextPrevBtn("next", false);
								_this.hideOrShowNextPrevBtn("prev", false);
							}
							else
							{
								_this.hideOrShowNextPrevBtn("next", true);
								_this.hideOrShowNextPrevBtn("prev", true);
							}	
							_this.setDataToTmpl(_data.current);//当前点击图片信息
						}
						else
						{
							TT.Util.alert('获取图片信息出错！');
						}	
					},
					error : function(code){
						TT.Util.alert('出错了，请刷新页面！');
					}
				});
			}	
		},
		/**
		 * 旋转图片
		 */
		rotate : function(){
			var el = this.$el, _this = this, op = _this.options,
				currentImage = el.find('img[node-type="v5-current-img"]'),
				checkBtn = el.find('span[node-type="v5-check-original"]');
			
			_this.rotateTime++;
			_this.prelayerLoading(true);
			currentImage.attr("src","/assets/img/blank.gif").hide();
			
			if(_this.rotateTime%4==0)
			{
				_this.rotateTime = 0;
			}
			
			if(_this.rotateTime>0)
			{
				checkBtn.css({"visibility":"hidden"});
			}
			else
			{
				checkBtn.css({"visibility":"visible"});
			}	
			
			var index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), marginTop = 200;
			
			var img = new Image();
			
			$(img).bind("load",function(){
				if(_this.oriFlag)
				{
					el.find('img[node-type="v5-original-image"]').css("display","none");
					currentImage.show().css({opacity:.9});
					el.find('span[node-type="v5-check-original"]').removeClass("narrow").addClass("enlarge");
					_this.showThumb(false);
					_this.oriFlag = false;
				}	
				if(_this.rotateTime%4==1 || _this.rotateTime%4==3)
				{
					
					var position = _this.zoomImage(oh, ow);
					
					el.find('div[node-type="v5-photo-item"]').css({"padding-top":position.paddingTop});
				}
				else
				{
					var position = _this.zoomImage(ow, oh);
					
					el.find('div[node-type="v5-photo-item"]').css({"padding-top":position.paddingTop});
				}
				currentImage.attr("src", _this.tmplHelpers.getImageUrl(_this.rid, op.width, op.height, 1)+"&rotate="+_this.rotateTime*90).fadeIn(500);
				_this.prelayerLoading(false);
			})
			
			img.src = _this.tmplHelpers.getImageUrl(_this.rid, op.width, op.height, 1)+"&rotate="+this.rotateTime*90;
		},
		/**
		 * 查看原图点击
		 */
		changeScaleMode : function(){
			var tmp = new Image(), _this = this, el = this.$el,
				photoDeatil = el.find('div[node-type="v5-poma-detail"]'),
				$img = el.find('img[node-type="v5-original-image"]'), 
				$currentImage = el.find('img[node-type="v5-current-img"]'),
				checkBtn = el.find('span[node-type="v5-check-original"]'),
				$visibleArea = el.find('div[node-type="v5-visible_area"]'),
				$thumbArea = el.find('div[node-type="v5-thumb"]'),
				$pic = el.find('img[node-type="v5-thumb-pic"]'),
				photoItem = el.find('div[node-type="v5-photo-item"]'),
				index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh);
			
			
			if(this.oriFlag)
			{
				this.oriFlag = false;
				_this.showThumb(false);
				_this.prelayerLoading(false);
				this.hideOrShowRotateBtn(true);
				$img.css({opacity:0,display:"none",cursor:"move",top:3,left:"none"})
				$currentImage.css({opacity:.9}).show();
				checkBtn.removeClass("narrow").addClass("enlarge");
				return;
			}	
			
			this.prelayerLoading(true);
			this.hideOrShowRotateBtn(false);
			checkBtn.addClass("narrow");
//			photoItem.css({"padding-top":0});
			$currentImage.css({opacity:0}).hide();
			
			$(tmp).bind("load",function(){
				_this.prelayerLoading(false);
				_this.wheel();
				_this.showThumb(true);
				_this.oriFlag = true;
				photoDeatil.css({'overflow':'hidden'});
				
				$img.attr("src", _this.tmplHelpers.getImageOriUrl(_this.rid)).css({opacity:.9}).show();
				
				
				var containment = _this.getDragArea(), visibleContainment,
					thumbParams = _this.getThumbParams(),
					dragAreaParams = _this.getDragAreaParams();
				
				var _offset = $thumbArea.offset();
				
				if(_this.checkCurrentPic() == 2)
				{
					
					var startX = parseInt(_offset.left)+_this.options.thumbW/2-thumbParams.width/2-3,
						startY = _this.options.height+21-_this.options.thumbH-1,
						endX   = parseInt(_offset.left)+_this.options.thumbW/2-thumbParams.width/2+3,
						endY   = _this.options.height+21-dragAreaParams.height;
					
					visibleContainment = [startX,startY,endX,endY];
				}
				else if(_this.checkCurrentPic() == 1)
				{
					var startX = parseInt(_offset.left),
						startY = parseInt(_offset.top)+_this.options.thumbH/2-dragAreaParams.height/2-3,
						endX   = parseInt(_offset.left)+_this.options.thumbW-dragAreaParams.width,
						endY   = parseInt(_offset.top)+_this.options.thumbH/2-dragAreaParams.height/2+3;
					
					visibleContainment = [startX,startY,endX,endY];
				}
				else
				{
					var startX = parseInt(_offset.left+(_this.options.thumbW-thumbParams.width)/2)+2,
						startY = parseInt(_offset.top+(_this.options.thumbH-thumbParams.height)/2),
						endX   = parseInt(_offset.left+_this.options.thumbW-dragAreaParams.width),
						endY   = parseInt(_offset.top+(_this.options.thumbH-thumbParams.height)/2+(thumbParams.height-dragAreaParams.height))
					
					visibleContainment = [startX,startY,endX,endY];
				}	
				
				$img.draggable({
                    axis: false,
                    cursor : "move",
                    insideParent: true,
                    ghosting: true,
                    drag : function(){
						_this.dragImageAjustThumb();
					},
                    bradius: false,
                    containment: containment
                });
				
				$visibleArea.draggable({
                    axis: false,
                    cursor : "move",
                    insideParent: true,
                    ghosting: true,
                    drag : function(){
						var _w = $pic.attr("width"), _h = $pic.attr("height"), _t = 0, _lf = 0, type, 
							_top = $visibleArea.css("top")=="auto" ? 0 : $visibleArea.css("top"),
							_left = $visibleArea.css("left")=="auto" ? 0 : parseInt($visibleArea.css("left"));
						
						type = _this.checkCurrentPic();
						
						if(type == 2)
						{
							_t = parseInt(_top)*oh/_h;
							
							$img.css({top:-_t+"px"});
						}
						else if(type == 1)
						{
							_lf = parseInt(_left)*ow/_w;
							$img.css({left:-_lf+"px"});
						}
						else
						{
							_t = (parseInt(_top)-(_this.options.thumbH-thumbParams.height)/2)*oh/_h;
							_lf = parseInt(_left)*ow/_w;
							$img.css({left:-_lf+"px",top:-_t+"px"});
						}	
					},
                    bradius: false,
                    containment: visibleContainment
				});
			});
			
			tmp.src =  _this.tmplHelpers.getImageOriUrl(_this.rid);
		},
		/**
		 * 获取拇指图的宽高
		 */
		getThumbParams : function(){
			var index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), o = {};
			
			if(ow>=oh)
			{
				o.width = 112;
				o.height = this.options.thumbW*oh/ow;
			}
			else
			{
				o.height = 112;
				o.width = o.height*ow/oh;
			}
			
			return o;
		},
		/**
		 * 获取拖动大图片的区域
		 */
		getDragArea : function(){
			var el = this.$el, _this = this, op = _this.options, containment;
			
			var index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh);
			
			var offset = el.find('div[node-type="v5-po-ma-bd-wrapClear"]').offset();
			
			if(ow>op.width && oh<op.height)
			{
				containment = [offset.left-ow+op.width, offset.top, offset.left, (offset.top+op.height-oh)]; 
			}
			else if(ow<op.width && oh>op.height)
			{
				containment = [offset.left, offset.top-oh+op.height, offset.left+op.width-ow, offset.top];
			}
			else if(ow>op.width && oh>op.height)
			{
				containment = [offset.left-ow+op.width,offset.top-oh+op.height,offset.left,offset.top]
			}	
			
			return containment;
		},
		/**
		 * 设置黑色背景层的宽高
		 */
		setMaskParams : function(){
			var el = this.$el, pomabd = el.find('div[node-type="v5-po-ma-bd-wrapClear"]'),
				pomadetail = el.find('div[node-type="v5-poma-detail"]'), op = this.options;
			
			el.find(".masker").css({width:screenWidth+"px",height:screenHeight+"px"});
			pomabd.css({width:op.width+"px"});
			pomadetail.css({width:op.width+"px",height:op.height+"px"});
		},
		/**
		 * 设置bottom按钮位置
		 */
		setBottomBtnPosition : function(){
			var el = this.$el, bottom = el.find('div[node-type="v5-bottom-btn"]'), op = this.options,
				bottomW = parseInt(bottom.css("width")), bottomH = parseInt(bottom.css("height")), left = 0;
			
			left = (op.width - bottomW)/2;
			
			el.find('div[node-type="v5-bottom-btn"]').css({left:left+"px"});
		},
		/**
		 * 检查当前图片类型
		 * 1 宽
		 * 2 高
		 * 3 即高又宽
		 */
		checkCurrentPic : function(){
			var op = this.options,index = $.inArray(this.rid, this.arrayImagesRids), datas = this.arrayImagesDetails[index],
				ow = parseInt(datas.imgw), oh = parseInt(datas.imgh), type;
			
			if(ow>=op.width && oh<op.height)
			{
				type = 1;
			}
			else if(ow<op.width && oh>=op.height)
			{
				type = 2;
			}
			else
			{
				type = 3;
			}	
			
			return type;
		},
		/**
		 * 检测是否是gif图片
		 */
		isGif : function(str){
			if(!str)	return;
			
			return str.substring(str.length - 3,str.length).toUpperCase() == "GIF" ? true : false;
		},
		/**
		 * 重置所有数据
		 */
		reset : function(){
			if(this.oriFlag)
			{
				this.changeScaleMode();
			}	
			this.hasAlreadyLoad = [];
			this.arrayImagesDetails = [];
			this.arrayImagesRids = [];
			this.oriFlag = false;
			this.rotateTime = 0;
			this.gid = '';
			this.mid = '';
			this.rid = '';
			
			var bTop = $('div[node-type="v5-doc"]').offset().top;
			
			$('div[node-type="v5-doc"]').attr("style","");
			$("body").css({position:""});
			
			$(document).scrollTop(-bTop);
		}
		
	});
	
    var Slider;
    
    TT.Slider = function () {
    	Slider = Slider || new TT.component.Slideshow;
        return Slider;
    }
})(window.jQuery);
