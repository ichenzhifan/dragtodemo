/**
 * Created by Administrator on 2016/9/7.
 */
(function () {
    window.app = window.app || {};

    window.onload = function () {
        var oInputs = document.getElementsByTagName('input');
        var oDrop = document.getElementsByClassName('drop')[0];
        var oDropItemList = document.getElementsByClassName('item-list')[0];
        var oPreviewImg = document.getElementById('previewImg');
        var oImgList = document.getElementById('list');

        var dragImg = new Image();
        dragImg.src = 'public/pencil.png';
        dragImg.width = '48px';

        var createNewImg = function (url, cb) {
            if (!url) {
                return;
            }

            var img = document.createElement('img');
            img.onload = function () {
                cb && cb(img);
            };
            img.src = url;

            img.ondragstart = function (ev) {
                var ev = ev || window.event;
                ev.dataTransfer.setDragImage(dragImg, 100, 100);
                ev.dataTransfer.setData('Text', img.src);
            };
        };

        var createPlaceHolder = function (i) {
            // placeholder
            var ele = document.createElement('div');
            ele.className = 'placeholder';

            oImgList.appendChild(ele);

            return ele;
        };

        var preview = function (img) {
            oPreviewImg.style.display = 'block';
            oPreviewImg.src = img.src;
        };

        oInputs[0].onclick = function () {
            oInputs[1].click();
        };

        oInputs[1].onchange = function (event) {
            var that = this;
            var len = this.files.length || 0;
            var placeHolders = [];

            var iNow = -1;
            var imageLoaded = function (file) {
                app.createImgUrl(file, function (url) {
                    createNewImg(url, function (img) {
                        placeHolders[iNow].appendChild(img);
                        placeHolders[iNow].classList.add('loaded');
                        placeHolders[iNow].draggable = true;

                        if (++iNow < len) {
                            imageLoaded(that.files[iNow]);
                        }
                    });
                });
            };

            if (len) {
                // 设置img-list容器的宽带, 以至于能够显示所有的图片在同一行.
                oImgList.style.width = (oImgList.clientWidth + 114 * len) + 'px';

                for (var i = 0; i < len; i++) {
                    placeHolders.push(createPlaceHolder(i));
                }

                imageLoaded(that.files[++iNow]);
            }
        };

        oDrop.ondragenter = function (ev) {
            var ev = ev || window.event;

            this.classList.add('enter');
        };

        oDrop.ondragover = function (ev) {
            var ev = ev || window.event;
            ev.preventDefault();
        };

        oDrop.ondrop = function (ev) {
            var ev = ev || window.event;
            ev.preventDefault();

            this.classList.remove('enter');
            var src = ev.dataTransfer.getData('Text');
            oPreviewImg.src = src;
            oPreviewImg.style.display = 'block';
        };

        oDrop.ondragleave = function (ev) {
            var ev = ev || window.event;

            this.classList.remove('enter');
        };
    };
})();