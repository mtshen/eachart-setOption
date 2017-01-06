/*
    setoption 函数接受3个值
    1. eChart 原始的 echarts 对象,如果是dom对象则会将其转换成 echarts
    2. option 更新的配置文件,只接受 echarts 配置项
    3. config 函数设置, 可以额外设置一些功能
    存储数据, 需要存储 eachart对象,color数组,legend数组,option,config,element,legendDom
        config 参数
        - color     color数组 能够自动获取
        - legend    legend的data参数   能够自动获取
        - type      可以手动设置图表的类型 能够自动获取
        - nostack   可以设置是否有stack属性,该参数对bar型图例至关重要 能够自动获取
        - lineNum   设置每行显示的数量,默认为 12
        - append    是否为追加内容,相当于echarts.setOption 的第二个参数
        - width     设置宽度 默认 100px
        - switchFreely 是否自动切换到上侧或左侧 默认 true
        - title     { auto | none | show | function }
                    auto : 自动检查文字长度,做出提示 (默认)
                    none : 不提示
                    show : 始终提示
                    function : function的返回值如果为空则不提示,如果返回dom或文本,则提示
*/
var $setOption = (function ($, echarts) {
    // 检查echarts
    if (!($ + echarts)) return !console.info('%c without introducing echarts or jQuery!', 'color:#eb4f38;');

    /*
        存储数据说明
            eChart : 存储的eachart对象
            color : 存储的color数组
            legend : 存储的legend数组
            option : eachart的option参数(会改变)
            config : 传入参数
            element : eachart对象对应元素
            __option : 原始eacharts参数
            legendDom : 图例元素
    */
    var setOptFn = {
        chart: [{
            type: 'bar',
            fn: function (obj) {
                if (obj.config.nostack) {
                    obj.option.series[0].stack = '$$setOption_m000001$$';
                    $.each(obj.option.legend.data, function (i) {
                        obj.option.series.push({
                            type: 'bar',
                            stack: '$$setOption_m000001$$',
                            name: obj.config.legend[i]
                        });
                    });
                }
            }
        }, {
            type: 'all',
            fn: function (obj) {
                obj.option.legend.top = '-1000%';
                // 	grid 参数设置
                if (obj.option.grid) {
                    obj.option.grid.show = false;
                    obj.option.grid.right = obj.config.width;
                } else {
                    obj.option.grid = {
                        show: false,
                        right: obj.config.width
                    }
                }
            }
        }]
    };

    // 国际惯例,设置存储参数
    var data = [];
    // 获取参数 getData(dom)[0].option
    function getData(elem) {
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].elem === elem) return [data[i], i];
        }
        return null;
    };
    // 设置参数
    function setData(elem, opt) {
        var _rtn = getData(elem);
        if (!_rtn) {
            data.push({
                elem: elem,
                option: opt
            });
        } else {
            data[_rtn[1]] = {
                elem: elem,
                option: opt
            }
        };
    };

    // 初始化配置文件
    function initConf(_option, _conf) {
        var conf = $.extend(true, {}, _conf),
            option = $.extend(true, {}, _option);

        // 取type
        if (!conf.type)
            conf.type =
                option.series && option.series[0] && option.series[0].type
                    ? option.series[0].type
                    : 'scatter';

        // 取legend
        if (!conf.legend)
            conf.legend =
                option.legend && option.legend.data
                    ? option.legend.data
                    : undefined;

        // 取color
        if (!conf.color)
            conf.color =
                option.color ? option.color :
                    [
                        '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                        '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0',
                        '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700',
                        '#6699FF', '#ff6666', '#3cb371', '#b8860b', '#30e0e0'
                    ]

        // 取nostack
        if (conf.nostack === undefined)
            conf.nostack =
                option.series && option.series[0] && option.series[0].stack
                    ? false : true;

        // 其他
        conf.lineNum = conf.lineNum || 12;
        conf.append = !!conf.append;
        conf.width = parseInt(conf.width) || 100;
        if (conf.switchFreely === undefined)
            conf.switchFreely = true;
        return conf;
    };
    // 绘制窗口
    function drawLegend(dom) {
        // 获取参数
        var DATA = getData(dom)[0].option,
            LEGEND = DATA.config.legend,
            COLOR = DATA.config.color;
        var clength = COLOR.length;
        var lineNum = DATA.config.lineNum;
        var w = DATA.config.width;
        DATA.legendDom = $(DATA.element).children().eq(0).
            append('<div class="echarts_legend_main"></div>').children('.echarts_legend_main')[0];
        $(DATA.legendDom).css('width', w);
        var legendInt = Math.ceil(LEGEND.length / DATA.config.lineNum),
            l_Percentage = 100 / legendInt,
            legendHtml = '<div class="echarts_legend clear-fix" data-max="' + legendInt + '" data-index="1" data-Percentage="' + l_Percentage + '" style="width:' + legendInt + '00%">';
        var _w = w - 30;
        for (var i = 0; i < legendInt; i++) {
            legendHtml += '<ul class="echarts_legend_line clear-fix" style="width : ' + l_Percentage + '%;">'
            for (var n = 0, m = lineNum; n < m; n++) {
                var index = i * lineNum + n;
                if (LEGEND[index]) {
                    var c = COLOR[index % clength], t = LEGEND[index];
                    legendHtml += '<li class="echarts_legend_lines on" data-color="' + c + '" data-text="' + t + '" data-index="' + index + '">' +
                        '<i class="echarts_legend_icon" style="background:' + c + '"></i>' +
                        '<span class="echarts_legend_text" style="color:' + c + ';width:' + _w + 'px">' + t + '</span></li>'
                } else {
                    break;
                }
            }
            legendHtml += '<li class="echarts_legend_left glyphicon glyphicon-chevron-left ' + (i === 0 ? 'echarts_legend_dis' : '') + '"></li><li class="echarts_legend_right glyphicon glyphicon-chevron-right ' + (i === legendInt - 1 ? 'echarts_legend_dis' : '') + '"></li></ul>'
        }
        legendHtml += '</div>';
        DATA.legendDom.innerHTML = legendHtml;
    };
    // bar 兼容
    function drawBarCharts(option) {
        // 取所有可绘制区参数
        var legendDom = $(option.legendDom);
        var lines = legendDom.find('.echarts_legend_lines.on');
        var onarr = [];
        var newData = $.extend(true, {}, option.__option);
        
        lines.each(function () {
            onarr.push(this.getAttribute('data-text'));
        });

        // 重新赋值参数
        var dataArr = [];
        $.each(option.__option.series[0].data, function () {
            onarr.indexOf(this.name) >= 0 && dataArr.push(this);
        });

        delete newData.grid;
        newData.series[0].data = dataArr;
        option.eChart.setOption(newData);
    };
    // 检查文本是否溢出
    function isEllipsis(dom) {
        var checkDom = dom.cloneNode(), parent, flag;
        checkDom.style.width = dom.offsetWidth + 'px';
        checkDom.style.height = dom.offsetHeight + 'px';
        checkDom.style.overflow = 'auto';
        checkDom.style.position = 'absolute';
        checkDom.style.zIndex = -1;
        checkDom.style.opacity = 0;
        checkDom.style.whiteSpace = "nowrap";
        checkDom.innerHTML = dom.innerHTML;

        parent = dom.parentNode;
        parent.appendChild(checkDom);
        flag = checkDom.scrollWidth > checkDom.offsetWidth;
        parent.removeChild(checkDom);
        return flag;
    };
    // 翻页函数单独提出
    function switchFreely() {
        var w = this.offsetWidth,
            h = this.offsetHeight;
        var DATA = getData(this)[0].option,
            legendDom = $(DATA.legendDom),
            eChart = DATA.eChart,
            config = DATA.config,
            line = config.lineNum,
            wid = config.width;
        if (w < h) { // 左右翻页
            var ww = parseInt(legendDom.parent().css('width'));
            var l = line / parseInt(ww / wid); // 行数
            var h = (l + 1) * 20; // 高度
            var _w = line * wid / l; // 宽度 
            legendDom.addClass('portrait').removeClass('transverse');
            legendDom.css({
                width: _w,
                height: h
            });
            eChart.setOption({
                grid: {
                    right: 20,
                    top: h + 5
                }
            });
        } else if (legendDom.hasClass('portrait')) { // 上下翻页
            legendDom.addClass('transverse').removeClass('portrait');
            legendDom.css({
                width: config.width,
                height: 'auto'
            });
            eChart.setOption({
                grid: {
                    right: config.width + 10,
                    top: 20
                }
            });
        }
    }


    // 设置事件
    function onEvent(dom) {
        var DATA = getData(dom)[0].option,
            legendDom = DATA.legendDom;
        $(legendDom).on('click', '.echarts_legend_lines', function (e) {    // 图例开关
            var $this = $(this);
            var option = getData($this.parents('.echarts_legend_main').parents()[1])[0].option;
            var flag = option.config.nostack && option.config.type === 'bar';
            if ($this.hasClass('on')) {
                $this.removeClass('on').addClass('off');
                $this.children('.echarts_legend_icon').css('background', '#ccc');
                $this.children('.echarts_legend_text').css('color', '#ccc');
            } else {
                $this.removeClass('off').addClass('on');
                $this.children('.echarts_legend_icon').css('background', $this.attr('data-color'));
                $this.children('.echarts_legend_text').css('color', $this.attr('data-color'));
            }
            flag ? drawBarCharts(option) : DATA.eChart.dispatchAction({
                type: 'legendToggleSelect',
                // 图例名称
                name: $this.attr('data-text')
            });
        }).on('mouseenter', '.echarts_legend_lines', function () {  // 图例高亮
            var $this = $(this);
            var option = getData($this.parents('.echarts_legend_main').parents()[1])[0].option;
            var flag = option.config.nostack && option.config.type === 'bar';

            var tdom = $this.find('.echarts_legend_text');
            var text = tdom.text();

            if (isEllipsis(tdom[0])) {
                $this.append('<span class="echarts_legend_title">' + text + '</span>');
                // $this.children('.echarts_legend_title').css({
                //     color: $this.attr('data-color')
                // });
            }
            DATA.eChart.dispatchAction({
                type: 'highlight',
                // 图例名称
                seriesName: $this.attr('data-text')
            })
        }).on('mouseleave', '.echarts_legend_lines', function () {  // 图例高亮
            var $this = $(this);
            var option = getData($this.parents('.echarts_legend_main').parents()[1])[0].option;
            var flag = option.config.nostack && option.config.type === 'bar';
            $this.find('.echarts_legend_title').remove();
            DATA.eChart.dispatchAction({
                type: 'downplay',
                // 图例名称
                seriesName: $this.attr('data-text')
            })
        }).on('click', '.echarts_legend_right', function () {  // 左翻页
            var $this = $(this);
            var $par = $this.parents('.echarts_legend');
            var data_index = parseInt($par.attr('data-index'));
            var index = data_index - parseInt($par.attr('data-max'));
            switch (index) {
                case 0:
                    break;
                case 1:
                    $this.addClass('off');
                default:
                    data_index++;
                    $par.attr('data-index', data_index).css({
                        left: -(data_index - 1) * parseInt($this.parent().css('width'))
                    }).find('.echarts_legend_right').removeClass('off');
                    break;
            }
        }).on('click', '.echarts_legend_left', function () {  // 右翻页
            var $this = $(this);
            var $par = $this.parents('.echarts_legend');
            var data_index = parseInt($par.attr('data-index'));
            switch (data_index) {
                case 1:
                    break;
                case 2:
                    $this.addClass('off');
                default:
                    data_index--;
                    $par.attr('data-index', data_index).css({
                        left: -(data_index - 1) * parseInt($this.parent().css('width'))
                    }).find('.echarts_legend_left').removeClass('off');
                    break;
            }
        }).on('mouseenter', '.echarts_legend_title', function () {
            $(this).remove();
        });
        DATA.config.switchFreely && addresize(DATA.element, switchFreely);
    };

    // 初始化或更新代码
    function init(eChart, option, config) {
        config = initConf(option, config || {}); // 初始化配置

        // 放弃条件
        if (!config.type || !config.color || !config.legend) return false;
        var dom = eChart.getDom(), fn;

        /* 
            1. 查看 config 中的type,如果为bar 则为 legend 额外进行优化
            2. 渲染 echarts
            3. 记录数据 
            4. 渲染
        */
        $.each(setOptFn.chart, function () {   // 1. 额外的legend优化
            if (this.type === config.type || this.type === 'all')
                this.fn({
                    eChart: eChart,
                    option: option,
                    config: config
                });
        });

        eChart.setOption(option, config.append);  // 2. 渲染 echarts
        setData(dom, { // 3. 记录数据 eachart对象,color数组,legend数组,option,config,element,legendDom
            eChart: eChart,
            color: config.color,
            legend: config.legend,
            option: option,
            config: config,
            element: dom,
            __option: $.extend(true, {}, option),
            legendDom: null
        });

        // 4. 渲染
        drawLegend(dom);

        // 5. 绑定事件
        onEvent(dom);

        config.switchFreely && switchFreely.call(dom);
        return eChart;
    };
    // 添加resize 事件
    function addresize(dom, fn) {
        var w = dom.offsetWidth,
            h = dom.offsetHeight,
            oldfn = window.onresize;
        if (oldfn) {
            window.onresize = function () {
                oldfn.call(window);
                if (dom.offsetWidth != w || dom.offsetHeight != h) {
                    w = dom.offsetWidth;
                    h = dom.offsetHeight;
                    fn.call(dom);
                }
            }
        } else {
            window.onresize = function () {
                if (dom.offsetWidth != w || dom.offsetHeight != h) {
                    w = dom.offsetWidth;
                    h = dom.offsetHeight;
                    fn.call(dom);
                }
            }
        }
    }
    // 入口文件
    function main(eChart, option, config) {
        /*
            为 delete 则是删除
            删除或刷新会返回 true 或 false
            初始化或更新会返回 echarts 对象
         */
        if (option === 'delete') {
            // 删除dom,解除元素事件绑定,还原初始option
            $(eChart.getDom()).find('').remove();
            return true;
        }
        var rtn = init(eChart, option, config);
        if (!rtn) {
            eChart.setOption(option);
        } else {
            return rtn;
        }
    };

    $.extend({ // 绑定插件
        setOption: main
    });

    return main;
})(jQuery || 0, echarts || 0);