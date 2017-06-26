/*
 * 城市选择jquer插件
 *
 * Licensed under the MIT license:
 * https://github.com/callmeJozo/kuCity
 *
 * Author: Naraku(http://segmentfault.com/u/naraku_)
 *
 * Version:  1.0.1  2016-01-14
 *
 */

(function($, sourceData) {
    var search_api_url = 'https://sjipiao.alitrip.com/city_search.do?_ksTS=1439362066383_11337&lines=10&_input_charset=utf-8&needProvince=true&q=';
    var city = {
        hot: {},
        ABCDEFGH: {},
        IJKLMNOP: {},
        QRSTUVWXYZ: {}
    };
    var sortCities = function(sourceData) {
        var regEx = /^([\u4E00-\u9FA5\uf900-\ufa2d]+)\|(\w+)\|(\w)\w*$/i, // 匹配汉字，拼音
            regExChiese = /([\u4E00-\u9FA5\uf900-\ufa2d]+)/, // 只匹配拼音
            reg_ah = /^[a-h]$/i, // 匹配首字母为 a-h
            reg_ip = /^[i-p]/i, // 匹配首字母为 i-p
            reg_qz = /^[q-z]/i; // 匹配首字母为 q-z

        for (var i = 0, len = sourceData.length; i < len; i++) {
            var part = regEx.exec(sourceData[i]),
                en = part[1], //中文名
                letter = part[2], //拼音
                spletter = part[3], //拼音简写
                first = letter[0].toUpperCase(), //拼音首字母
                ltPart; //当前字母下的城市

            if (reg_ah.test(first)) {
                ltPart = 'ABCDEFGH';
            } else if (reg_ip.test(first)) {
                ltPart = 'IJKLMNOP';
            } else if (reg_qz.test(first)) {
                ltPart = 'QRSTUVWXYZ';
            }

            city[ltPart][first] ? city[ltPart][first].push(en) : (city[ltPart][first] = [], city[ltPart][first].push(en));

            //设置前16个城市为热门城市
            if (i < 16) {
                city.hot['hot'] ? city.hot['hot'].push(part[1]) : (city.hot['hot'] = [], city.hot['hot'].push(part[1]));
            }
        }
    };

    sortCities(sourceData);

    var kucity = null;

    var KuCity = function(target) {
        this.target = target;
        this.container = null;
        this.resultContainer = null;
        this.init();
    };

    KuCity.prototype = {
        constructor: KuCity,
        //初始化
        init: function() {
            this.creatItem();
            this.tabChange();
            this.citySelect();
            this.inputSearch();
            this.stopPropagation();
        },
        //创建市列表
        creatItem: function() {
            var template = '<div class="kucity"><div class="citybox"><h3 class="kucity_header">热门城市(支持汉字/拼音搜索)</h3><ul class="kucity_nav"><li class="active">热门城市</li><li>ABCDEFGH</li><li>IJKLMNOP</li><li>QRSTUVWXYZ</li></ul><div class="kucity_body"></div></div><ul class="result"></ul></div>';
            $('body').append(template);

            this.container = $('.kucity');
            this.resultContainer = $('.result');

            for (var group in city) {
                var itemKey = [];

                for (var item in city[group]) {
                    itemKey.push(item);
                }
                itemKey.sort();
                var itembox = $('<div class="kucity_item">');
                itembox.addClass(group);

                for (var i = 0, iLen = itemKey.length; i < iLen; i++) {

                    var dl = $('<dl>'),
                        dt = '<dt>' + (itemKey[i] == 'hot' ? '' : itemKey[i]) + '</dt>',
                        dd = $('<dd>'),
                        str = '';

                    for (var j = 0, jLen = city[group][itemKey[i]].length; j < jLen; j++) {
                        str += '<span>' + city[group][itemKey[i]][j] + '</span>'
                    }

                    dd.append(str);
                    dl.append(dt).append(dd);
                    itembox.append(dl);
                }
                $('.kucity_body').append(itembox);
                this.container.find('.hot').addClass('active');
            }
        },
        //列表切换
        tabChange: function() {
            $('.kucity_nav').on('click', 'li', function(e) {
                var current = $(e.target),
                    index = current.index();
                current.addClass('active').siblings().removeClass('active');
                $('.kucity_item').eq(index).addClass('active').siblings().removeClass('active');
                $(' .kucity_body').scrollTop(0);

            })
        },
        //城市选择
        citySelect: function() {
            var self = this;
            $('.kucity_item dd').on('click', 'span', function(e) {
                self.target.val(($(e.target).text()));
                self.container.hide();
            })
        },
        //搜索
        inputSearch: function() {
            var self = this;
            this.target.on('keyup', function(e) {
                    self.throttle(search, this);
                })
                // 输入框搜索
            function search(e) {
                var container = self.container;
                self.triggleShow(false);
                var value = $(this).val();
                if (value) {
                    var url = search_api_url + value;
                    $.ajax({
                        url: url,
                        type: 'get',
                        dataType: 'jsonp'
                    }).done(function(re) {
                        creatResult(re);
                    })
                } else {
                    self.triggleShow(true);
                }

                function creatResult(re) {
                    var result = re.result,
                        len = result.length,
                        str = '';
                    if (!!len) {
                        for (var i = 0; i < len; i++) {
                            str += '<li><span class="name">' + result[i].cityName + '</span><span class="letter">' + result[i].py + '</span></li>'
                        }
                        container.find('.result').html('').html(str).find('li').eq(0).addClass('active');
                    } else {
                        container.find('.result').html('<li>没有找到<span class="noresult">' + value + '</span>相关信息</li>');
                    }
                }
            }
        },
        //列表，结果，整体 显示切换
        triggleShow: function(open) {
            var container = this.container;
            if (open === 'all') {
                container.hide()
            } else if (open) {
                container.find('.citybox').show().end().find('.result').hide();
            } else {
                container.find('.citybox').hide().end().find('.result').show();
            }
        },
        //函数节流
        throttle: function(fn, context) {
            clearTimeout(fn.tId);
            fn.tId = setTimeout(function() {
                fn.call(context);
            }, 100)
        },
        //阻止事件冒泡
        stopPropagation: function() {
            var self = this;
            //阻止事件冒泡
            this.container.on('click', stopPropagation)
            this.target.on('click', stopPropagation)
                //页面点击 隐藏
            $(document).on('click', function() {
                self.container.hide();
            })

            function stopPropagation(e) {
                e.stopPropagation();
            }
        }
    };

    $.fn.kuCity = function(options) {
        var target = $(this);

        target.on('focus', function(e) {
            var top = $(this).offset().top + $(this).outerHeight(),
                left = $(this).offset().left;

            kucity = kucity ? (kucity.container.show(), kucity) : new KuCity(target);
            kucity.container.offset({
                'top': top + 5,
                'left': left
            });

            kucity.target = $(e.target);

            kucity.triggleShow(true);

            kucity.resultContainer.on('click', 'li', function() {
                kucity.target.val($(this).find('.name').text());
                kucity.triggleShow('all');
            })
        })
        return this;
    };
})(jQuery, allCities)
