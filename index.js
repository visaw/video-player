$(function() {
    var container = $('.container');                //定义整个视频加控制区域
    var video = $('video');                         //定义视频区域
    var header = container.find('.header');         //定义控制区域头部
    var footer = container.find('.footer');         //定义控制区域底部
    var playBtn = container.find('.icon-play');     //定义播放按钮
    var stopBtn = container.find('.icon-stop');     //定义停止按钮
    var rateBtns = container.find('.speed span');   //定义播放速率的按钮组
    var volBtn = container.find('.icon-vol');       //定义声音/静音按钮
    var volBar = container.find('.vol-bar');        //定义音量条
    var timeBar = container.find('.time-bar');      //定义时间条
    var duration = container.find('.duration');     //定义视频总时长文字区域
    var curTime = container.find('.cur-time');      //定义视频当前播放时长文字区域
    var volLine = container.find('.vol-line');      //定义音量条背景条
    var timeLine = container.find('.time-line');    //定义时间条背景

    var changeSkin = $('[name=changeSkin]');      //一键换肤
    var loading = $('.loading');

    /**
     * isShow === true，显示头部与底部
     * isShow === false，隐藏头部与底部
     * @param isShow {boolean}
     */
    function showControl(isShow) {
        if (isShow) {
            header.fadeIn(500);
            footer.fadeIn(500);
        } else {
            header.fadeOut(500);
            footer.fadeOut(500);
        }
    }

    /**
     * 修改播放按钮的样式
     * isPlay === true, 播放按钮为play样式
     * isPlay === false, 播放按钮为start样式
     * @param isPlay {boolean}
     */
    function changePlayBtn(isPlay) {
        if (isPlay) {
            playBtn.removeClass('start').addClass('play');
        } else {
            playBtn.removeClass('play').addClass('start');
        }
    }

    /**
     * 修改声音/静音按钮的样式
     * isSound === true， 按钮为sound样式
     * isSound === false, 按钮为silent样式
     * @param isSound {boolean}
     */
    function changeVolBtn(isSound) {
        if (isSound) {
            volBtn.removeClass('silent').addClass('sound');
        } else {
            volBtn.removeClass('sound').addClass('silent');
        }
    }

    /**
     * 修改音量条的样式
     * @param percent {String}
     */
    function changeVolBar(percent) {
        volBar.css('width', percent);
    }

    /**
     * 修改时间条的样式
     * @param percent {String}
     */
    function changeTimeBar(percent) {
        timeBar.css('width', percent);
    }

    /**
     * 格式化时间
     * @param times {Number} 时长，以s为单位
     * @returns {string}     00：00：00
     */
    function timeFormat(times) {
        var hours = "";
        var minutes = Math.floor(times / 60);
        if (minutes < 10) {
            minutes = "0" + minutes;
        } else if(minutes > 59) {
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
        }
        var seconds = Math.round(times % 60);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (hours) {
            return hours + ":" + minutes + ":" + seconds;
        } else {
            return minutes + ":" + seconds;
        }

    }

    /**
     * 拖动音量条的方法
     * @param e {Object} 事件event
     */
    function dragVolBar(e) {
        var mouseX = e.pageX;
        var volBarX = volBar.offset().left;
        var volLineWidth = volLine.width();
        var volBarWidth = mouseX - volBarX;
        if (volBarWidth < 0) {
            volBarWidth = 0;
        } else if (volBarWidth > volLineWidth) {
            volBarWidth = volLineWidth;
        }
        changeVolBar(volBarWidth / volLineWidth * 100 + "%");
        video[0].volume = volBarWidth / volLineWidth;
        changeVolBtn(video[0].volume > 0);
    }

    /**
     * 拖动时间条的方法
     * @param e {Object} 事件event
     */
    function dragTimeBar(e) {
        var mouseX = e.pageX;
        var timeBarX = timeBar.offset().left;
        var timeLineWidth = timeLine.width();
        var timeBarWidth = mouseX - timeBarX;
        if (timeBarWidth < 0) {
            timeBarWidth = 0;
        } else if (timeBarWidth > timeLineWidth) {
            timeBarWidth = timeLineWidth;
        }
        changeTimeBar(timeBarWidth / timeLineWidth * 100 + "%");
        video[0].currentTime = timeBarWidth / timeLineWidth * video[0].duration;
    }

    /**
     * 当视频的元数据被加载时
     * 绑定一系列事件
     * 同时进行一系列初始化操作
     */
    video[0].onloadedmetadata = function() {

        loading.css('display', 'none');

        var videoDuration = video[0].duration;      //定义视频的总时长
        var speed = video[0].playbackRate;
        var videoVolume = video[0].volume;          //定义视频的音量
        var isVolDrag = false;                      //音量条是否处于拖拽状态
        var isTimeDrag = false;                     //时间条是否处于拖拽状态


        video[0].volume = 0.5;                      //初始化操作，音量为0.5
        duration.html(timeFormat(videoDuration));   //设置视频时长区域

        /**
         * 当播放按钮被点击时
         * 如果当前视频处于播放状态，则视频暂停播放，播放按钮图标变成start的样式
         * 如果当前视频处于未播放状态，则视频开始播放，播放按钮图标变成play的样式
         */
        playBtn.click(function() {
            if (video[0].paused || video[0].ended) {
                video[0].play();
                changePlayBtn(true);
            } else {
                video[0].pause();
                changePlayBtn(false);
            }
        });

        /**
         * 当停止按钮被点击时
         * 暂停当前视频播放
         * 改变播放按钮的样式为start
         * 将当前视频的播放时间设置为总时长
         */
        stopBtn.click(function() {
            video[0].pause();
            changePlayBtn(false);
            video[0].currentTime = 0;
            changeTimeBar("0");
        });

        /**
         * 为每一个速率绑定点击事件
         * 当前速率被点击时，移除其他速率的selected的样式，并为当前速率绑定selected的样式
         * 设置当前播放速率为当前点击的速率
         */
        $.each(rateBtns, function(index, obj) {
            $(obj).click(function() {
                rateBtns.removeClass('selected');
                $(obj).addClass('selected');
                video[0].playbackRate = (index + 1);
                console.log(speed);
            })
        });

        /**
         * 当声音/静音按钮被点击时
         * 判断当前视频音量是否大于0
         * 如果当前音量 > 0，将视频音量设置为0，同时按钮图标变为silent，volBar的宽度变为0
         * 如果当前音量 === 0，将视频音量设置为上一次的音量，同时按钮图标变为sound，volBar的宽度变为上一次的宽度
         */
        volBtn.click(function() {
            var curVolume = video[0].volume;
            if (curVolume > 0) {
                videoVolume = curVolume;
                video[0].volume = 0;
                changeVolBtn(false);
                changeVolBar("0");
            } else {
                video[0].volume = videoVolume;
                changeVolBtn(true);
                changeVolBar(videoVolume * 100 + "%");
            }
        });

        /**
         * 当鼠标在音量条上按下时，音量条进入拖拽状态
         */
        volBar.mousedown(function(e) {
            e.stopPropagation();
            isVolDrag = true;
        });

        /**
         * 当鼠标在视频移动时，判断音量条/时间条是否处于拖拽状态
         * 如果处于拖拽状态，则调用拖动音量条/时间条的方法；
         */
        container.mousemove(function(e) {
            e.stopPropagation();
            if (isVolDrag) {
                dragVolBar(e);
            }
            if (isTimeDrag) {
                dragTimeBar(e);
            }
        });

        /**
         * 鼠标松开的时候，音量条/时间条离开拖拽状态
         */
        container.mouseup(function(e) {
            e.stopPropagation();
            isVolDrag = false;
            isTimeDrag = false;
        });

        /**
         * 当volLine被点击时候
         */
        volLine.click(function(e) {
            dragVolBar(e);
        });

        /**
         * 当视频当前播放时长发生变化时，修改时间条的样式和当前时长的文字区域
         */
        video[0].ontimeupdate = function() {
            var videoCurTime = video[0].currentTime;
            console.log(videoCurTime);
            curTime.html(timeFormat(videoCurTime));
            changeTimeBar(videoCurTime / videoDuration * 100 + "%");
        };

        /**
         * 当鼠标在时间条上按下时，时间条进入拖拽状态
         */
        timeBar.mousedown(function(e) {
            e.stopPropagation();
            isTimeDrag = true;
        });

        /**
         * 当timeLine被点击时候
         */
        timeLine.click(function(e) {
            dragTimeBar(e);
        });

        /**
         * 播放结束时改变播放按钮的样式
         */
        video[0].onended = function() {
            changePlayBtn(false);
        };

        video[0].onwaiting = function() {
            loading.css('display', 'block');
        };

        video[0].oncanplay = function() {
            loading.css('display', 'none');
        }
    };

    /**
     * 鼠标进入视频区域时，显示头部与底部
     */
    container.mouseenter(function() {
        showControl(true)
    });

    /**
     * 鼠标离开视频区域时，隐藏头部与底部
     */
    container.mouseleave(function() {
        showControl(false)
    });

    /**
     * 一键换肤功能
     */
    changeSkin.change(function() {
        var color = changeSkin.val();
        var red = parseInt(color.slice(1,3), 16);
        var green = parseInt(color.slice(3,5), 16);
        var blue = parseInt(color.slice(5), 16);

        var opsRed = 255 - red;
        var opsGreen = 255 - green;
        var opsBlue = 255 - blue;

        header.css('background-color', 'rgb(' + red + ',' + green + ',' + blue + ')');
        footer.css('background-color', 'rgb(' + red + ',' + green + ',' + blue + ')');
        $('.footer .bottom .speed span.selected').css('color', 'rgb(' + red + ',' + green + ',' + blue + ')');
        $('body').css('color', 'rgb(' + opsRed + ',' + opsGreen + ',' + opsBlue + ')');
        timeBar.css('background-color', 'rgb(' + opsRed + ',' + opsGreen + ',' + opsBlue + ')');
        volBar.css('background-color', 'rgb(' + opsRed + ',' + opsGreen + ',' + opsBlue + ')');
        $('.footer .bottom .speed span.selected').css('background-color', 'rgb(' + opsRed + ',' + opsGreen + ',' + opsBlue + ')');
    })


});