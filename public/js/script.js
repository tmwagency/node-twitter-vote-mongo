var TMW = window.TMW || {};

TMW.TwitterPoll = {
	socket : null,


	init : function () {

		this.makeSocketConnection();

	},

	makeSocketConnection : function () {

		var connectionURL = window.location.hostname;

		this.socket = io.connect(connectionURL);

	},


	setupScreen : function (state) {

		TMW.TwitterPoll.EventListeners.onTweet();

	},

	EventListeners : {
		onTweet : function () {

			//this handles the tweets we receive from our server
			TMW.TwitterPoll.socket.on('tweet', function(tweet) {

				log(tweet);

				$('#last-update').innerHTML = new Date().toTimeString();

			});

		}
	},

	updateWall : function (tweet) {



	},

	makeVotesReadable : function (votes) {

		return addCommas(votes);

	},

};


/**
 * Add commas to
 * @param {[type]} nStr [description]
 */
		function addCommas(nStr){
		  nStr += '';
		  x = nStr.split('.');
		  x1 = x[0];
		  x2 = x.length > 1 ? '.' + x[1] : '';
		  var rgx = /(\d+)(\d{3})/;
		  while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		  }
		  return x1 + x2;
		}


//  ================
//  === EASY LOG ===
//  ================
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
		window.log = function f() {
				log.history = log.history || [];
				log.history.push(arguments);
				if (this.console) {
						var args = arguments,
								newarr;
						try {
								args.callee = f.caller;
						} catch (e) {}
						newarr = [].slice.call(args);
						if (typeof console.log === 'object')  {
							log.apply.call(console.log, console, newarr);
						} else {
							console.log.apply(console, newarr);
						}
				}
		};

//  ===========================
//  === Allow bind for IE9< ===
//  ===========================
		if(!function(){}.bind){
		  Function.prototype.bind = function(){
			var me = this
			, shift = [].shift
			, he = shift.apply(arguments)
			, ar = arguments
			return function(){
			  return me.apply(he, ar);
			}
		  }
		}

//  ============================================
//  === getElementsByClassName for everyone! ===
//  ============================================
		if (typeof document.getElementsByClassName!='function') {
			document.getElementsByClassName = function() {
				var elms = document.getElementsByTagName('*');
				var ei = new Array();
				for (i=0;i<elms.length;i++) {
					if (elms[i].getAttribute('class')) {
						ecl = elms[i].getAttribute('class').split(' ');
						for (j=0;j<ecl.length;j++) {
							if (ecl[j].toLowerCase() == arguments[0].toLowerCase()) {
								ei.push(elms[i]);
							}
						}
					} else if (elms[i].className) {
						ecl = elms[i].className.split(' ');
						for (j=0;j<ecl.length;j++) {
							if (ecl[j].toLowerCase() == arguments[0].toLowerCase()) {
								ei.push(elms[i]);
							}
						}
					}
				}
				return ei;
			}
		}


/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */

	window.matchMedia || (window.matchMedia = function() {
		"use strict";

		// For browsers that support matchMedium api such as IE 9 and webkit
		var styleMedia = (window.styleMedia || window.media);

		// For those that don't support matchMedium
		if (!styleMedia) {
			var style       = document.createElement('style'),
				script      = document.getElementsByTagName('script')[0],
				info        = null;

			style.type  = 'text/css';
			style.id    = 'matchmediajs-test';

			script.parentNode.insertBefore(style, script);

			// 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
			info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

			styleMedia = {
				matchMedium: function(media) {
					var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

					// 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
					if (style.styleSheet) {
						style.styleSheet.cssText = text;
					} else {
						style.textContent = text;
					}

					// Test if media query is true or false
					return info.width === '1px';
				}
			};
		}

		return function(media) {
			return {
				matches: styleMedia.matchMedium(media || 'all'),
				media: media || 'all'
			};
		};
	}());

//  ===========================================
//  === globals Element:true, NodeList:true ===
//  ===========================================

		$ = (function (document, $) {
			var element = Element.prototype,
				nodeList = NodeList.prototype,
				forEach = 'forEach',
				trigger = 'trigger',
				each = [][forEach],

				dummyEl = document.createElement('div');

			nodeList[forEach] = each;

			element.on = function (event, fn) {
				this.addEventListener(event, fn, false);
				return this;
			};

			nodeList.on = function (event, fn) {
				each.call(this, function (el) {
					el.on(event, fn);
				});
				return this;
			};

			element.trigger = function (type, data) {
				var event = document.createEvent('HTMLEvents');
				event.initEvent(type, true, true);
				event.data = data || {};
				event.eventName = type;
				event.target = this;
				this.dispatchEvent(event);
				return this;
			};

			nodeList.trigger = function (event) {
				each.call(this, function (el) {
					el[trigger](event);
				});
				return this;
			};

			$ = function (s) {
				var r = document.querySelectorAll(s || '☺'),
					length = r.length;
				return length == 1 ? r[0] : !length ? nodeList : r;
			};

			$.on = element.on.bind(dummyEl);
			$.trigger = element[trigger].bind(dummyEl);

			return $;
		})(document);



TMW.TwitterPoll.init();