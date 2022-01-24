$(function(){
	// 日历计算逻辑
	var Year = new Date().getFullYear(),
		Month = new Date().getMonth() + 1;
	$('.c_year span').text(Year);
	$('.c_month span').text(Month);
	drawCalendar(Year, Month);
	var weekday =  $('.onToday').index(),
		dayObj = $('.onToday').data('data');
	// 右侧展示逻辑 初始化
	showCenterContent(dayObj, weekday);
	// 年份 月份 的 加减 显示
	$('.m_prev, .m_next, .y_prev, .y_next').click(function(e){
		e.stopPropagation();
		var type = $(this).attr('class');
		changeMonth($('.c_year span').text(), $('.c_month span').text(), type);
	});
	// 返回今天
	$('.back_today').click(function(e){
		e.stopPropagation();
		changeMonth(Year, Month, 'back_today');
	});
	$('.c_body').click(function(e){
		var evt = e || window.event,
			target = evt.target || evt.srcElement,
			$target = $(target);
		if(target.tagName === 'DIV' || target.tagName === 'SPAN'){
			$target = $(target).parent('td');
		}
		$target.parents('tbody').find('td').css('border', '1px solid #a1bd92');
		$target.css('border', '2px solid #ff8621');
		var weekday =  $target.index(),
			dayObj = $target.data('data');
		// 右侧展示逻辑
		showCenterContent(dayObj, weekday);
	});
	// 组织切换的页面不能被选中
	document.getElementsByClassName('calendar_tool')[0].onselectstart = function(e){
		e.preventDefault();
	}
});

var feativals = {
    '1-1': '元旦',		'2-14': '情人节',	'3-8': '妇女节',	'3-12': '植树节',	'4-1': '愚人节',	'4-22': '地球日',	'5-1': '劳动节',
    '5-4': '青年节',	'6-1': '儿童节',	'7-1': '建党节',	'8-1': '建军节',	'9-10': '教师节',	'10-1': '国庆节',	'12-25': '圣诞节'
},
lunarFeatival = {
    '1-1': '春节',	 '2-2': '龙抬头',	'1-15': '元宵节',	'4-4': '寒食节',	'4-5': '清明节',
    '5-5': '端午节', '8-15': '中秋节',	'9-9': '重阳节'
};

// 渲染日历
function drawCalendar(year, month){
    var year = year, month = month;
    if(month > 12){
        year = year + 1;
        month = 1;
    }else if(month < 1){
        year = year - 1;
        month = 12;
    }
    $('.c_year span').text(year);
    $('.c_month span').text(month);
    var arr = [],
        prveMonthDay = (new Date(year, month-1, 0)).getDate(),
        arrLen = 0,
        onTodayBol = true;
    $('.c_body').empty();
    for(var i = 1,DayLen = getDayLen(year, month - 1); i < DayLen; i++){
        arr.unshift({
            day: prveMonthDay - i + 1,
            no_mon: true,
            year: month === 1 ? year - 1 : year,
            month: month === 1 ? 12 : month - 1
        });
    }
    for(var i = 1,monthDay = new Date(year,month,0).getDate();i <= monthDay; i++){
        arr.push({
            day: i,
            year: year,
            month: month
        });
    }
    for(var i = 0,nextMon = getDayLen(year, month); i<(8 - nextMon); i++){
        arr.push({
            day: i + 1,
            no_mon: true,
            year: month === 12 ? year + 1 : year,
            month: month === 12 ? 1 : month + 1
        });
    }
    arrLen = arr.length;
    while(arr.length > 0){
        var row = document.createElement("tr");
        for(var i = 1; i <= 7; i++){
            var cell = document.createElement("td");
            if(arr.length > 0){
                var dayObj = arr.shift();
                dayObj.no_mon ? $(cell).addClass('prevDay') : ''; // 不是本月日期灰色处理
                lunarObj = Lunar.toLunar(dayObj.year, dayObj.month, dayObj.day); // 计算农历
                cell.innerHTML = '<div>' + dayObj.day + '</div><span>' + (lunarObj[6] === '初一' ? lunarObj[5] : lunarObj[6]) + '</span>';
                dayObj.lunar = lunarObj;
                $(cell).data('data', dayObj);
                // 如果检测到今天，需要特别处理
                if(onTodayBol && dayObj.day && IsSame(new Date(dayObj.year,dayObj.month-1,dayObj.day),new Date())){
                    $(cell).addClass("onToday");
                    onTodayBol = false;
                }
                // 如果检测到节假日，需要特别处理
                var m_day = dayObj.month + '-' + dayObj.day;
                for(var j in feativals){
                    if(j === m_day){
                        $(cell).attr('title', feativals[j]).find('span').text(feativals[j]).css({'display': 'inline-block', 'width': '60%', 'background': '#ea8773', 'color': '#fff'});
                    }
                }
                // 农历节日
                var lunar_m_day = lunarObj[1] + '-' + lunarObj[2];
                for(var c in lunarFeatival){
                    if(c === lunar_m_day){
                        $(cell).attr('title', lunarFeatival[j]).find('span').text(lunarFeatival[c]).css({'display': 'inline-block', 'width': '60%', 'background': '#ea8773', 'color': '#fff'});
                    }
                }
                // 除夕为每年最后一天，需要判断 29/30
                if(lunarObj[1] === 12 && (lunarObj[2] === 29 || lunarObj[2] === 30)){
                    var uim = new Date(dayObj.year, dayObj.month - 1, dayObj.day);
                    uim.setDate(uim.getDate() + 1);
                    if(Lunar.toLunar(dayObj.year, dayObj.month, dayObj.day)[0] !== Lunar.toLunar(uim.getFullYear(), uim.getMonth() + 1, uim.getDate())[0]){
                        $(cell).attr('title', '除夕').find('span').text('除夕').css({'display': 'inline-block', 'width': '60%', 'background': '#ea8773', 'color': '#fff'});
                    }
                }
            }
            // 周末红色处理
            if(i === 6 || i === 7){
                $(cell).addClass('c_red');
            }
            row.appendChild(cell);
        }
        $('.c_body').append($(row));
    }
    $('.c_body').find('tr').css('height', arrLen === 35 ? '78px' : '65px');
}
function IsSame(d1, d2) {
    return (d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate());
}
function getDayLen(year, month){
    return ((new Date(year,month,1)).getDay() === 0 ? 7 : (new Date(year,month,1)).getDay())
}
function showCenterContent(dayObj, weekIndex){
    $('.calendar_center .c_holiday').empty();
    var week = ['一', '二', '三', '四', '五', '六', '日'],
        lunarObj = dayObj.lunar;
    $('.calendar_center .c_date span').text(dayObj.year + '-' + dayObj.month + '-' + dayObj.day);
    $('.calendar_center .c_week span').text('星期' + week[weekIndex]);
    $('.calendar_center .c_day').text(dayObj.day);
    $('.calendar_center .c_lunar div').text(lunarObj[3] + ' ' + lunarObj[4] + '年');
    $('.calendar_center .c_lunar span').text(lunarObj[5] + ' ' + lunarObj[6]);
    // 插入阳历节日
    var month_day = dayObj.month + '-' + dayObj.day;
    for(var i in feativals){
        if(i === month_day){
            $('.calendar_center .c_holiday').append('<span>'+ feativals[i] +'</span>');
        }
    }
    // 插入农历节日
    var lunar_m_day = lunarObj[1] + '-' + lunarObj[2];
    for(var c in lunarFeatival){
        if(c === lunar_m_day){
            $('.calendar_center .c_holiday').append('<span>'+ lunarFeatival[c] +'</span>');
        }
    }
    // 插入农历节日， 除夕为每年最后一天，需要判断 29/30
    if(lunarObj[1] === 12 && (lunarObj[2] === 29 || lunarObj[2] === 30)){
        var uim = new Date(dayObj.year, dayObj.month - 1, dayObj.day);
        uim.setDate(uim.getDate() + 1);
        if(Lunar.toLunar(dayObj.year, dayObj.month, dayObj.day)[0] !== Lunar.toLunar(uim.getFullYear(), uim.getMonth() + 1, uim.getDate())[0]){
            $('.calendar_center .c_holiday').append('<span>除夕</span>');
        }
    }
}
function changeMonth(year, month, str){
    var c_year, c_month;
    if(year && month){
        c_year = parseInt(year);
        c_month = parseInt(month);
    }
    if(str === 'm_prev'){
        drawCalendar(c_year, c_month - 1);
    }else if(str === 'm_next'){
        drawCalendar(c_year, c_month + 1);
    }else if(str === 'y_prev'){
        drawCalendar(c_year - 1, c_month);
    }else if(str === 'y_next'){
        drawCalendar(c_year + 1, c_month);
    }else if(str === 'back_today'){
        drawCalendar(c_year, c_month);
    }
    var first_dom = str === 'back_today' ? $('.c_body td.onToday') : $('.c_body td').eq(0),
        weekday =  first_dom.index(),
        dayObj = first_dom.data('data');
    first_dom.css('border', '2px solid #ff8621');
    showCenterContent(dayObj, weekday); // 右侧更新第一个日期
}