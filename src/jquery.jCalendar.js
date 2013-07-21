/*
 * 一个简单的适配手机的日历插件
 * 目前只是为了公司项目而作的插件
 * 开发者:zwhu
 * 邮箱:afd.zwhu@gmail.com    
 * 
 */

!(function ($, window, undefined) {

    var
    // 日历中有待办事项的日期
        markArray = [],
    // 日历中所有按钮的统一回调函数
        _calendarCallBack = {},
    // 入口函数
        _init = function (that) {
            _createCalendar(that);
            _addEvents();
        },

    // 创建日历挂件页面
    // TODO:生成的日历从2013年7月11日开始，到打开日历当天的后一年之间
    // 例如打开此日历的时间是 2014年1月1日，那么日历就是从2013年7月11日
    // 到2015年1月1日
        _createCalendar = function (that) {
            var _html = "", date = new Date(),
            // 在某个月份页面下所有天数的集合
                totalDays = _getDaysInMonthPage(date.getFullYear(), date.getMonth() + 1);
            _html += '<div class="afd-calendar"><div class="afd-cal-header"><div class="afd-cal-btnc">';
            _html += '<div class="afd-cal-btnw afd-cal-btn-year"><div class="afd-cal-prev afd-cal-btn">';
            _html += '<div class="afd-cal-btn-txt">向前</div></div><span class="afd-cal-year">'
                + date.getFullYear() + '年</span>';
            _html += '<div class="afd-cal-next afd-cal-btn"><div class="afd-cal-btn-txt">向后</div>';
            _html += '</div></div><div class="afd-cal-btnw afd-cal-btn-month"><div class="afd-cal-prev afd-cal-btn">';
            _html += '<div class="afd-cal-btn-txt">向前</div></div><span class="afd-cal-month">'
                + (date.getMonth() + 1) + '月</span>';
            _html += '<div class="afd-cal-next afd-cal-btn"><div class="afd-cal-btn-txt">向后</div></div>';
            _html += '</div></div><div class="afd-cal-weekdays"><table cellpadding="0" callsapcing="0">';
            _html += '<tbody><tr><th>周日</th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th>';
            _html += '<th>周六</th></tr></tbody></table></div></div>';
            _html += '<div class="afd-cal-content">';
            _html += _createCalendarContent(totalDays);
            _html += '</div></div>';
            that.html(_html);
        },

    // 生成日期天数区域的html，返回字符串
        _createCalendarContent = function (totalDays) {
            var i, html = '<div class="afd-cal-table">', date = new Date(), year = date
                .getFullYear(), month = (date.getMonth() + 1), $month = $('.afd-cal-month'), $year = $('.afd-cal-year');
            if ($month.length !== 0) {
                month = parseInt($month.text().match(/\d+/)[0]);
                year = parseInt($year.text().match(/\d+/)[0]);
            }
            for (i = 0; i < totalDays.length; i += 1) {
                if (i % 7 === 0 && i !== 0) {
                    html += '</div>';
                }
                if (i % 7 === 0) {
                    html += '<div class="afd-cal-row">';
                }
                html += '<div class="afd-cal-day"';
                html += '><div class="afd-cal-i';
                // 分别给这个月份页面中不属于本月份的其他天数增加不同的class
                if (totalDays[i][1] === "prev") {
                    html += ' afd-cal-diff afd-cal-f-prev';
                } else if (totalDays[i][1] === "next") {
                    html += ' afd-cal-diff afd-cal-f-next';
                } else {
                    if (totalDays[i][0] === date.getDate()
                        && year === date.getFullYear()
                        && month === (date.getMonth() + 1)) {
                        html += '" style="background:#636363';
                    }
                    html += '" id="afd-cal-date-';
                    html += year + "-" + month + "-" + totalDays[i][0];

                }
                html += '"><div class="afd-cal-day-f">';
                html += totalDays[i][0];
                html += '</div></div></div>';
            }
            html += '</div>';
            return html;
        },

    // 得到某年某个月份的天数
        _getDaysInMonth = function (year, month) {
            return new Date(year, month, 0).getDate();
        },

    // 得到某年某月份中第一天是星期几
        _getWeekDayInMonth = function (year, month) {
            return new Date(year, month - 1, 1).getDay();
        },

    // 得到某月页面的所有日期
    // 不同的月份的日期对应不同的数组
        _getDaysInMonthPage = function (year, month) {
            var i,
            // 上一月的日期在当前月份页面的数组
                prevArray = [],
            // 当前月份的日期在当前月份页面的数组
                nowArray = [],
            // 下一个月份的日期在当前月份页面的数组
                nextArray = [];
            for (i = 1; i < 43; i++) {
                // 当前月份页面中上个月的天数是上个月的总天数减去本月第一天在一周中的日子
                if (i <= _getWeekDayInMonth(year, month)) {
                    prevArray.push([ _getDaysInMonth(year, month - 1) - i + 1,
                        "prev" ]);
                }
                // 当前月份页面中本月的日子为从本月一号加上本月所有的天数
                else if (i > _getWeekDayInMonth(year, month)
                    && i <= _getWeekDayInMonth(year, month)
                    + _getDaysInMonth(year, month)) {
                    nowArray
                        .push([ i - _getWeekDayInMonth(year, month), "current" ]);
                }
                // 剩下的为下个月的天数
                else {
                    nextArray.push([
                        i - _getWeekDayInMonth(year, month)
                            - _getDaysInMonth(year, month), "next" ]);
                }
            }
            return prevArray.concat(nowArray, nextArray);
        },

    // 改变月份
        _click_Month_Btn_Hanler = function (control) {
            var month = '', year = '', $month = $('.afd-cal-month'), $year = $('.afd-cal-year');
            month = $month.text().match(/\d+/)[0];
            year = $year.text().match(/\d+/)[0];
            if (control === "next") {
                if (month === '12') {
                    month = 1;
                    year = parseInt(year) + 1;
                    $year.text(year + "年");
                } else {
                    month = parseInt(month) + 1;
                }
            } else {
                if (month === '1') {
                    month = 12;
                    year = parseInt(year) - 1;
                    $year.text(year + "年");
                } else {
                    month = parseInt(month) - 1;
                }
            }
            $month.text(month + "月");
            _setNewCalenderPage(year, month);
        },

        _click_Year_Btn_Handler = function (control) {
            var year, month, $month = $('.afd-cal-month'), $year = $('.afd-cal-year');
            month = $month.text().match(/\d+/)[0];
            year = $year.text().match(/\d+/)[0];
            if (control === "next") {
                year = parseInt(year) + 1;
            } else {
                year = parseInt(year) - 1;
            }
            $year.text(year + "年");
            _setNewCalenderPage(year, month);
        },

    // 设置改变日期之后的table页面
        _setNewCalenderPage = function (year, month) {
            var _html = _createCalendarContent(_getDaysInMonthPage(year, month));
            $('.afd-cal-table').remove();
            $('.afd-cal-content').html(_html);
        },

    // 显示Mark
        _displayMarks = function () {
            $(markArray.join(",")).each(function () {
                $(this).append('<div class="afd-cal-day-m"></div>');
            });
        },

    // 添加事件监听
        _addEvents = function () {
            // 对年月日进行监听
            $('.afd-cal-btn-year').on(
                'click',
                '.afd-cal-prev',
                function () {
                    _click_Year_Btn_Handler('prev');
                    $('.afd-cal-content').on('click', '[id^=afd-cal-date-]',
                        function () {
                            _calendarCallBack.call(this);
                        });
                    _displayMarks();
                });
            $('.afd-cal-btn-year').on(
                'click',
                '.afd-cal-next',
                function () {
                    _click_Year_Btn_Handler('next');
                    _displayMarks();
                });
            $('.afd-cal-btn-month').on(
                'click',
                '.afd-cal-prev',
                function () {
                    _click_Month_Btn_Hanler('prev');
                    _displayMarks();
                });
            $('.afd-cal-btn-month').on(
                'click',
                '.afd-cal-next',
                function () {
                    _click_Month_Btn_Hanler('next');
                    _displayMarks();
                });
            // 对日历页面所有当前月份的日期进行事件注册
            $('.afd-cal-content').on('click', '[id^=afd-cal-date-]', function () {
                _calendarCallBack.call(this);
            });
        };

    $.extend($.fn, {
        calendar: function () {
            _init(this);
            return this;
        },
        // 允许用户在某个日历点上设置marked
        setMark: function () {
            var i, len;
            markArray = Array.prototype.slice.call(arguments);
            // 默认的参数有两种方式，
            // 1.arg1,arg2,arg3..
            // 2.[arg1,arg2,arg3,..]
            // 如果参数为[arg1,arg2,arg3,..],arg4....;默认传入的参数为[arg1,arg2,arg3,..]
            // 如果参数为arg1,arg2,[arg3,arg4,arg5...],..；抛出错误
            if (markArray[0].forEach) {
                markArray = markArray[0];
            }

            for (i = 0, len = markArray.length; i < len; i += 1) {
                if (i > 0 && markArray[i].forEach) {
                    throw "arguments has error";
                }
                markArray[i] = "#afd-cal-date-" + markArray[i];
            }
            _displayMarks();
            return this;
        },
        // 用户自定义增加标记的日期
        addMark: function () {
            markArray.push("#afd-cal-date-" + arguments[0]);
            $("#afd-cal-date-" + arguments[0]).append(
                '<div class="afd-cal-day-m"></div>');
            return this;
        },
        // 用户自定义删除标记的日期
        delMark: function () {
            var i, len;
            for (i = 0, len = markArray.length; i < len; i += 1) {
                if (markArray[i] === "#afd-cal-date-" + arguments[0]) {
                    markArray.slice(i, 1);
                }
            }
            $("#afd-cal-date-" + arguments[0]).find('.afd-cal-day-m').remove()
                .removeClass();
            return this;
        },
        // 返回所有被标记的jQuery数组对象
        getMarks: function () {
            return $('.afd-cal-day-m');
        },
        //给日历中所有的button增加回调函数
        setCalendarFn: function (fn) {
            _calendarCallBack = fn;
            return this;
        }
    });

}(jQuery, this));
