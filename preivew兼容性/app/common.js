/**
 * Created by Administrator on 2016/9/7.
 */

(function () {
    window.app = window.app || {};

    /**
     * 检测是否支持FileReader
     * @returns true: 为支持, false: 不支持
     */
    app.isSupportedFileReader = function () {
        return 'FileReader' in window;
    };

    /**
     * 检测是否支持createObjectURL
     * @returns true: 为支持, false: 不支持
     */
    app.isSupportedCreateObjectURL = function () {
        return ('URL' in window || "webkitURL" in window) &&
            ('createObjectURL' in window.URL || 'createObjectURL' in window.webkitURL);
    };

    /**
     * 获取window的URL对象.
     * @type {Function}
     */
    app.URL = app.URL || function () {
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
    app.createObjectURL = app.URL.createObjectURL;

    /**
     * 根据file或blob对象, 如果browser支持FileReader, 那么使用FileReader, 或者使用URL.createObjectURL,
     * 生成对应的object url.
     * @param {FILE || BLOB} img 待生成object url的file或blob对象
     * @param {Function} done 创建完成后的回调.
     */
    app.createImgUrl = function (img, done) {
        var url = '';

        if(!img){
            done && done(url);
            return;
        }

        // 如果browser支持FileReader, 那么使用FileReader
        if(app.isSupportedFileReader()){
            var reader = new FileReader();

            reader.onload = function (ev) {
                done && done(reader.result);
            };

            reader.readAsDataURL(img);

            return;
        }

        // 否则使用URL.createObjectURL
        done && done(app.createObjectURL(img));
    };

})();