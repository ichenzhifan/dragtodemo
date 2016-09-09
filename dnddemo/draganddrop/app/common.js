/**
 * Created by Administrator on 2016/9/8.
 */
var common = (function () {
    /**
     * 设置DOM元素的style值.
     * @param {HtmlElement} obj
     */
    var setPropties = function (obj, style) {
        if (!obj) {
            return;
        }
        style = style || {};

        for (var s in style) {
            if (style.hasOwnProperty(s)) {
                obj.style[s] = style[s];
            }
        }
    };

    /**
     * 重置Dom元素的位置和宽高信息.
     */
    var reset = function (obj) {
        setPropties(obj, {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        });
    };

    /**
     * 获取滚动条的滚动距离.
     */
    var getScrollPosition = function () {
        return {
            top: document.body.scrollTop || document.documentElement.scrollTop,
            left: document.body.scrollLeft || document.documentElement.scrollLeft
        }
    };

    /**
     * 获取制定dom元素的坐标, 宽高信息.
     * @param ele
     * @returns {{left: *, top: *, width: number, height: number}}
     */
    var getElementPosition = function (ele) {
        if(!ele){
            return;
        }

        // 滚动条的滚动距离
        var scrollPosition = getScrollPosition();

        var left = ele.offsetLeft + scrollPosition.left;
        var top = ele.offsetTop + scrollPosition.top;
        var width = ele.clientWidth;
        var height = ele.clientHeight;

        return {
           left: left,
           top: top,
           width: width,
           height: height
        };
    };

    /**
     * 判断元素是否在该选中区域内.
     * @param {object} scope {left, top, width, height} 定义区域的位置.
     * @param {HTMLElement} ele 需要判读的元素
     */
    var isElementIn = function (scope, ele) {
        if(!scope || !ele){
            return false;
        }

        var isIn = true;
        var elePosition = getElementPosition(ele);

        // 判读左边
        if(elePosition.left < scope.left){
            return false;
        }

        // 判读顶部
        if(elePosition.top < scope.top){
            return false;
        }

        // 判读右边
        if((elePosition.left + elePosition.width) > (scope.left + scope.width)){
            return false;
        }

        // 判读底部
        if((elePosition.top + elePosition.height) > (scope.top + scope.height)){
            return false;
        }

        return true;
    };

    /**
     * 检测是否支持FileReader
     * @returns true: 为支持, false: 不支持
     */
    var isSupportedFileReader = function () {
        return 'FileReader' in window;
    };

    /**
     * 检测是否支持createObjectURL
     * @returns true: 为支持, false: 不支持
     */
    var isSupportedCreateObjectURL = function () {
        return ('URL' in window || "webkitURL" in window) &&
            ('createObjectURL' in window.URL || 'createObjectURL' in window.webkitURL);
    };

    /**
     * 获取window的URL对象.
     * @type {Function}
     */
   var URL = function () {
            var url;
            if ("URL" in window) {
                url = window.URL
            } else if ("webkitURL" in window) {
                url = window.webkitURL;
            } else {
                url = {
                    createObjectURL: function () {
                        return
                    }
                }
            }
            return url;
        };

    /**
     * 定义一个方法, 用来创建一个DOMString.
     * @type {any}
     */
   var createObjectURL = URL().createObjectURL;

    /**
     * 根据file或blob对象, 如果browser支持FileReader, 那么使用FileReader, 或者使用URL.createObjectURL,
     * 生成对应的object url.
     * @param {FILE || BLOB} img 待生成object url的file或blob对象
     * @param {Function} done 创建完成后的回调.
     */
    var createImgUrl = function (img, done) {
        var url = '';

        if(!img){
            done && done(url);
            return;
        }

        // 如果browser支持FileReader, 那么使用FileReader
        if(isSupportedFileReader()){
            var reader = new FileReader();

            reader.onload = function (ev) {
                done && done(reader.result);
            };

            reader.readAsDataURL(img);

            return;
        }

        // 否则使用URL.createObjectURL
        done && done(createObjectURL(img));
    };

    return {
        setPropties: setPropties,
        reset: reset,
        getScrollPosition: getScrollPosition,
        isElementIn: isElementIn,
        getElementPosition: getElementPosition,
        isSupportedFileReader: isSupportedFileReader,
        isSupportedCreateObjectURL: isSupportedCreateObjectURL,
        URL: URL,
        createObjectURL: createObjectURL,
        createImgUrl: createImgUrl
    };
})();