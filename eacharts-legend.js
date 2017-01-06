/*
    setoption ��������3��ֵ
    1. eChart ԭʼ�� echarts ����,�����dom������Ὣ��ת���� echarts
    2. option ���µ������ļ�,ֻ���� echarts ������
    3. config ��������, ���Զ�������һЩ����
    �洢����, ��Ҫ�洢 eachart����,color����,legend����,option,config,element,legendDom
        config ����
        - color     color���� �ܹ��Զ���ȡ
        - legend    legend��data����   �ܹ��Զ���ȡ
        - type      �����ֶ�����ͼ������� �ܹ��Զ���ȡ
        - nostack   ���������Ƿ���stack����,�ò�����bar��ͼ��������Ҫ �ܹ��Զ���ȡ
        - lineNum   ����ÿ����ʾ������,Ĭ��Ϊ 12
        - append    �Ƿ�Ϊ׷������,�൱��echarts.setOption �ĵڶ�������
        - width     ���ÿ�� Ĭ�� 100px
        - switchFreely �Ƿ��Զ��л����ϲ����� Ĭ�� true
        - title     { auto | none | show | function }
                    auto : �Զ�������ֳ���,������ʾ (Ĭ��)
                    none : ����ʾ
                    show : ʼ����ʾ
                    function : function�ķ���ֵ���Ϊ������ʾ,�������dom���ı�,����ʾ
 */
var $setOption = (function ($, echarts) {
    // ���echarts
    if (!($ + echarts)) return !console.info('%c without introducing echarts or jQuery!', 'color:#eb4f38;');

    /*
        �洢����˵��
            eChart : �洢��eachart����
            color : �洢��color����
            legend : �洢��legend����
            option : eachart��option����(��ı�)
            config : �������
            element : eachart�����ӦԪ��
            __option : ԭʼeacharts����
            legendDom : ͼ��Ԫ��
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
                // 	grid ��������
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

    // ���ʹ���,���ô洢����
    var data = [];
    // ��ȡ���� getData(dom)[0].option
    function getData(elem) {
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].elem === elem) return [data[i], i];
        }
        return null;
    };
    // ���ò���
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

    // ��ʼ�������ļ�
    function initConf(_option, _conf) {
        var conf = $.extend(true, {}, _conf),
            option = $.extend(true, {}, _option);

        // ȡtype
        if (!conf.type)
            conf.type =
                option.series && option.series[0] && option.series[0].type
                    ? option.series[0].type
                    : 'scatter';

        // ȡlegend
        if (!conf.legend)
            conf.legend =
                option.legend && option.legend.data
                    ? option.legend.data
                    : undefined;

        // ȡcolor
        if (!conf.color)
            conf.color =
                option.color ? option.color :
                    [
                        '#ff7f50', '#87cefa', '#da70d6', '#32cd32', '#6495ed',
                        '#ff69b4', '#ba55d3', '#cd5c5c', '#ffa500', '#40e0d0',
                        '#1e90ff', '#ff6347', '#7b68ee', '#00fa9a', '#ffd700',
                        '#6699FF', '#ff6666', '#3cb371', '#b8860b', '#30e0e0'
                    ]

        // ȡnostack
        if (conf.nostack === undefined)
            conf.nostack =
                option.series && option.series[0] && option.series[0].stack
                    ? false : true;

        // ����
        conf.lineNum = conf.lineNum || 12;
        conf.append = !!conf.append;
        conf.width = parseInt(conf.width) || 100;
        if (conf.switchFreely === undefined)
            conf.switchFreely = true;
        return conf;
    };
    // ���ƴ���
    function drawLegend(dom) {
        // ��ȡ����
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
    // bar ����
    function drawBarCharts(option) {
        // ȡ���пɻ���������
        var legendDom = $(option.legendDom);
        var lines = legendDom.find('.echarts_legend_lines.on');
        var onarr = [];
        var newData = $.extend(true, {}, option.__option);
        
        lines.each(function () {
            onarr.push(this.getAttribute('data-text'));
        });

        // ���¸�ֵ����
        var dataArr = [];
        $.each(option.__option.series[0].data, function () {
            onarr.indexOf(this.name) >= 0 && dataArr.push(this);
        });

        delete newData.grid;
        newData.series[0].data = dataArr;
        option.eChart.setOption(newData);
    };
    // ����ı��Ƿ����
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
    // ��ҳ�����������
    function switchFreely() {
        var w = this.offsetWidth,
            h = this.offsetHeight;
        var DATA = getData(this)[0].option,
            legendDom = $(DATA.legendDom),
            eChart = DATA.eChart,
            config = DATA.config,
            line = config.lineNum,
            wid = config.width;
        if (w < h) { // ���ҷ�ҳ
            var ww = parseInt(legendDom.parent().css('width'));
            var l = line / parseInt(ww / wid); // ����
            var h = (l + 1) * 20; // �߶�
            var _w = line * wid / l; // ��� 
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
        } else if (legendDom.hasClass('portrait')) { // ���·�ҳ
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


    // �����¼�
    function onEvent(dom) {
        var DATA = getData(dom)[0].option,
            legendDom = DATA.legendDom;
        $(legendDom).on('click', '.echarts_legend_lines', function (e) {    // ͼ������
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
                // ͼ������
                name: $this.attr('data-text')
            });
        }).on('mouseenter', '.echarts_legend_lines', function () {  // ͼ������
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
                // ͼ������
                seriesName: $this.attr('data-text')
            })
        }).on('mouseleave', '.echarts_legend_lines', function () {  // ͼ������
            var $this = $(this);
            var option = getData($this.parents('.echarts_legend_main').parents()[1])[0].option;
            var flag = option.config.nostack && option.config.type === 'bar';
            $this.find('.echarts_legend_title').remove();
            DATA.eChart.dispatchAction({
                type: 'downplay',
                // ͼ������
                seriesName: $this.attr('data-text')
            })
        }).on('click', '.echarts_legend_right', function () {  // ��ҳ
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
        }).on('click', '.echarts_legend_left', function () {  // �ҷ�ҳ
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

    // ��ʼ������´���
    function init(eChart, option, config) {
        config = initConf(option, config || {}); // ��ʼ������

        // ��������
        if (!config.type || !config.color || !config.legend) return false;
        var dom = eChart.getDom(), fn;

        /* 
            1. �鿴 config �е�type,���Ϊbar ��Ϊ legend ��������Ż�
            2. ��Ⱦ echarts
            3. ��¼���� 
            4. ��Ⱦ
        */
        $.each(setOptFn.chart, function () {   // 1. �����legend�Ż�
            if (this.type === config.type || this.type === 'all')
                this.fn({
                    eChart: eChart,
                    option: option,
                    config: config
                });
        });

        eChart.setOption(option, config.append);  // 2. ��Ⱦ echarts
        setData(dom, { // 3. ��¼���� eachart����,color����,legend����,option,config,element,legendDom
            eChart: eChart,
            color: config.color,
            legend: config.legend,
            option: option,
            config: config,
            element: dom,
            __option: $.extend(true, {}, option),
            legendDom: null
        });

        // 4. ��Ⱦ
        drawLegend(dom);

        // 5. ���¼�
        onEvent(dom);

        config.switchFreely && switchFreely.call(dom);
        return eChart;
    };
    // ���resize �¼�
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
    // ����ļ�
    function main(eChart, option, config) {
        /*
            Ϊ delete ����ɾ��
            ɾ����ˢ�»᷵�� true �� false
            ��ʼ������»᷵�� echarts ����
         */
        if (option === 'delete') {
            // ɾ��dom,���Ԫ���¼���,��ԭ��ʼoption
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

    $.extend({ // �󶨲��
        setOption: main
    });

    return main;
})(jQuery || 0, echarts || 0);