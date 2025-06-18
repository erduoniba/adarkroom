/**
 * Module that registers the notification box and handles messages
 */
var Notifications = {
	
	init: function(options) {
		this.options = $.extend(
			this.options,
			options
		);
		
		// Create the notifications box
		elem = $('<div>').attr({
			id: 'notifications',
			className: 'notifications'
		});
		// Create the transparency gradient
		$('<div>').attr('id', 'notifyGradient').appendTo(elem);
		
		elem.appendTo('div#wrapper');
	},
	
	options: {}, // Nothing for now
	
	elem: null,
	
	notifyQueue: {},
	
	// Allow notification to the player
	notify: function(module, text, noQueue) {
		if(typeof text == 'undefined') return;
		if(text.slice(-1) != ".") text += ".";
		if(module != null && Engine.activeModule != module) {
			if(!noQueue) {
				if(typeof this.notifyQueue[module] == 'undefined') {
					this.notifyQueue[module] = [];
				}
				this.notifyQueue[module].push(text);
			}
		} else {
			Notifications.printMessage(text);
		}
		Engine.saveGame();
	},
	
	clearHidden: function() {
	
		// To fix some memory usage issues, we clear notifications that have been hidden.
		
		// We use position().top here, because we know that the parent will be the same, so the position will be the same.
		var bottom = $('#notifyGradient').position().top + $('#notifyGradient').outerHeight(true);
		
		$('.notification').each(function() {
		
			if($(this).position().top > bottom){
				$(this).remove();
			}
		
		});
		
	},
	
	printMessage: function(t) {
		var text = $('<div>').addClass('notification').css({
			'opacity': '0',
			'font-size': '0.9em'  // 减小字体大小
		}).text(t).prependTo('div#notifications');
		Notifications.showCenterToast(t);
		text.animate({opacity: 1}, 500, 'linear', function() {
			// Do this every time we add a new message, this way we never have a large backlog to iterate through. Keeps things faster.
			Notifications.clearHidden();
		});
	},
	
	// 存储当前显示的toast数量
	_toastCount: 0,
	
	// 用于存储和管理toast容器
	_initToastContainer: function() {
		var container = $('#centerToastContainer');
		if (container.length === 0) {
			container = $('<div>')
				.attr('id', 'centerToastContainer')
				.css({
					'position': 'fixed',
					'top': '70%',
					'left': '50%',
					'transform': 'translate(-50%, -50%)',
					'display': 'flex',
					'flex-direction': 'column',
					'align-items': 'center',
					'pointer-events': 'none', // 防止toast阻挡点击
					'z-index': '100'
				})
				.appendTo('body');
		}
		return container;
	},
	
	showCenterToast: function(t) {
		var self = this;
		var container = this._initToastContainer();
		
		// 创建toast元素
		var toast = $('<div>')
			.addClass('centerToast')
			.css({
				'background-color': 'rgba(0, 0, 0, 0.5)',
				'color': 'white',
				'font-size': '0.9em',
				'padding': '10px 10px',
				'border-radius': '5px',
				'opacity': '0',
				'text-align': 'center',
				'max-width': '100vw', // 最大宽度为视口宽度的100%
				'word-wrap': 'break-word', // 允许长文本换行
				'white-space': 'pre-wrap', // 保留换行符和空格
				'margin-bottom': '5px' // 添加底部间距
			})
			.text(t)
			.appendTo(container);
		
		// 增加计数
		this._toastCount++;
		
		// 动画效果
		toast.animate({opacity: 1}, 500, 'linear')  // 淡入动画
			.delay(5000)  // 显示5秒
			.animate({opacity: 0}, 500, 'linear', function() {  // 淡出动画
				$(this).remove();  // 移除元素
				self._toastCount--;
				
				// 如果没有更多的toast，移除容器
				if (self._toastCount === 0) {
					container.remove();
				}
			});
	},
	
	printQueue: function(module) {
		if(typeof this.notifyQueue[module] != 'undefined') {
			while(this.notifyQueue[module].length > 0) {
				Notifications.printMessage(this.notifyQueue[module].shift());
			}
		}
	}
};