/**
 * @ngdoc Service
 * @name nh_commonUtil
 *
 * 工具类服务
 */
(function() {
	'use strict';

	angular
		.module('newhope')
		.factory('nhCommonUtil', nhCommonUtil);

	nhCommonUtil.$inject = ['$sessionStorage', '$q', 'restService']

	function nhCommonUtil() {
		var base = 2;

		function mul(a, b) {
			var aStr = a.toString(),
				bStr = b.toString(),
				n = 0;

			try {
				n += aStr.split('.')[1].length;
			} catch (e) {}

			try {
				n += bStr.split('.')[1].length;
			} catch (e) {}

			return Number(aStr.replace('.', '')) * Number(bStr.replace('.', '')) / Math.pow(10, n);
		}

		function precise(a, p) {
			var n = p >= 0 ? p : base;
			return Math.round(a * Math.pow(10, n)) / Math.pow(10, n);
		}

		return {
			mul: function (a, b, p) {
				var y = mul(a, b);
				return precise(y, p);
			},
			div: function (a, b, p) {
				var aStr = a.toString(),
					bStr = b.toString(),
					m = Number(aStr.replace('.', '')) / Number(bStr.replace('.', '')),
					n1 = 0,
					n2 = 0,
					y;

				try {
					n1 = aStr.split('.')[1].length;
				} catch (e) {}

				try {
					n2 = bStr.split('.')[1].length;
				} catch (e) {}

				y = mul(m, Math.pow(10, n2 - n1));
				return precise(y, p);
			},
			add: function (a, b, p) {
				var n1 = 0,
					n2 = 0,
					power, y;

				try {
					n1 = aStr.split('.')[1].length;
				} catch (e) {}

				try {
					n2 = bStr.split('.')[1].length;
				} catch (e) {}

				power = Math.pow(10, Math.max(n1, n2));

				y = (mul(a, power) + mul(b, power)) / power;
				return precise(y, p);
			},
			sub: function (a, b, p) {
				var n1 = 0,
					n2 = 0,
					power, y;

				try {
					n1 = aStr.split('.')[1].length;
				} catch (e) {}

				try {
					n2 = bStr.split('.')[1].length;
				} catch (e) {}

				power = Math.pow(10, Math.max(n1, n2));

				y = (mul(a, power) - mul(b, power)) / power;
				return precise(y, p);
			},
			offsetMon: function (offset) {
				var cur = moment().add(offset, 'months');
				return moment([cur.year(), cur.month(), 1]).format('YYYY-MM-DD');
				
			},
			offsetDay: function (date, offset) {
				return moment(date).add(offset, 'days').format('YYYY-MM-DD');
			}
		}
	}

})();