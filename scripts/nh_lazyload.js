/**
 * @name lazyload
 *
 * 懒加载方式异步加载模块
 */

(function() {
	'use strict';
	angular
	  .module('newhope')
	  .constant('MODULE_CONFIG', [
	  	  {
	  	  	name: 'mgcrea.ngStrap',
	        module: true,
	        serie: true,
	        files: [
	            'assets/angular-motion/dist/angular-motion.min.css',
	            'assets/bootstrap-additions/dist/bootstrap-additions.min.css',
                'libs/angular/angular-strap/dist/angular-strap.js',
	            'libs/angular/angular-strap/dist/angular-strap.tpl.js'
	        ]
	  	  },
	  	  {
	  	  	name: 'datatables',
	  	  	module: true,
	  	  	serie: true,
	  	  	files: [
	  	  		'libs/jquery/datatables/media/js/jquery.dataTables.min.js',
	  	  		'assets/datatables/media/css/jquery.dataTables.min.css',
	  	  		'libs/angular/angular-datatables/dist/angular-datatables.min.js',
	  	  		'assets/angular-datatables/dist/css/angular-datatables.min.css'
	  	  	]
	  	  },
          {
              name: 'ui.select',
              module: true,
              serie: true,
              files: [
                  'libs/angular/angular-ui-select/dist/select.min.js'
              ]
          },
          {
              name: 'ui.bootstrap',
              module: true,
              files: [
                  'libs/angular/angular-bootstrap/ui-bootstrap-tpls.min.js'
              ]
          },
		  {
			  name: 'moment',
			  module: false,
			  files: [
				  'libs/js/moment/moment.js'
			  ]
		  },
		  {
			  name: 'ui.ztree',
			  module: false,
			  files: [
				  'libs/ztree/js/jquery.ztree.all.min.js',
				  'libs/ztree/css/metroStyle/metroStyle.css'
			  ]
		  },
		  {
		  	name: 'xeditable',
          	module: true,
	        files: [
	            'libs/angular/angular-xeditable/dist/js/xeditable.min.js',
	            'libs/angular/angular-xeditable/dist/css/xeditable.css'
	        ]
		  },
  		  {
              name: 'angularFileUpload',
              module: true,
              files: [
                  'libs/angular/angular-file-upload/angular-file-upload.js'
              ]
          }
		]
	  )
	  .config(['$ocLazyLoadProvider', 'MODULE_CONFIG', function($ocLazyLoadProvider, MODULE_CONFIG) {
	  	  $ocLazyLoadProvider.config({
	  	  	  debug: false,
              events: false,
              modules: MODULE_CONFIG
	  	  });
	  }]);
})();