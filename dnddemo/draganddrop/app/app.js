/**
 * Created by Administrator on 2016/9/8.
 */
(function () {
    window.onload = function () {
        var oInputs = document.getElementsByTagName('input');
        var oBox = document.getElementById('box');
        var oSelectingBox = document.getElementById('selectingBox');
        var oShapeControls = document.getElementById('shapeControls');
        var oShapeControlItems = oShapeControls.getElementsByClassName('controller');
        var oImgList = document.getElementsByClassName('img-list')[0];
        var oImages = oImgList.getElementsByClassName('item');

        // 允许释放的区域
        var dropBox = document.getElementsByClassName('drop-box')[0];

        // 选择框的位置和宽高信息.
        var selectBoxPosition = {
            top: 0,
            left: 0,
            width: 0,
            height: 0
        };

        // 存放选中的元素.
        var selectedItems = [];

        /**
         * 更新控制框的位置和宽高, 以及控制图标的位置.
         * @param style
         */
        var updateShape = function (style) {
            if (!style) {
                return;
            }

            // 设置控制框为可见.
            oShapeControls.classList.add('show');

            // 设置控制框的宽高和位置.
            common.setPropties(oShapeControls, {
                top: style.top + 'px',
                left: style.left + 'px',
                width:  style.width + 'px',
                height: style.height + 'px'
            });

            // 设置控制框里的控制图标的位置.
            common.setPropties(oShapeControlItems[0], {
                top: '-4px',
                left: '-4px'
            });
            common.setPropties(oShapeControlItems[1], {
                top: '-4px',
                left: (selectBoxPosition.width - 4) + 'px'
            });
            common.setPropties(oShapeControlItems[2], {
                top: (selectBoxPosition.height - 4) + 'px',
                left: '-4px'
            });
            common.setPropties(oShapeControlItems[3], {
                top: (selectBoxPosition.height - 4) + 'px',
                left: (selectBoxPosition.width - 4) + 'px'
            });
        };

        /**
         * 显示或隐藏选中元素的样式.
         * @param {boolean} show, true: 显示, false: 隐藏
         */
        var toggleSelectedItemStyle = function (ele, show) {
            if(!ele){
                return;
            }

            if(show){
                ele.getElementsByClassName('shape-contour')[0].classList.add('show');
            }else{
                ele.getElementsByClassName('shape-contour')[0].classList.remove('show');
            }
        };

        var resetControls = function () {
            // 隐藏控制框
            common.reset(oShapeControls);
            oShapeControls.classList.remove('show');

            // 清楚选中元素的样式.
            selectedItems.forEach(function (v) {
                toggleSelectedItemStyle(v, false);
            });

            // reset选择框的样式.
            selectBoxPosition = {
                top: 0,
                left: 0,
                width: 0,
                height: 0
            };
        };

        var getSelectedItems = function (scope) {
            var items = [];

            for(var i=0; i<oImages.length; i++){
                if(common.isElementIn(scope, oImages[i])){
                    toggleSelectedItemStyle(oImages[i], true);
                    items.push(oImages[i]);
                    oImages[i].index = items.length - 1;
                }
            }

            return items;
        };

         var createNewItem = function (url, oImgList, cb) {
            if (!url) {
                return;
            }

            var html = '<div class="item">' +
                '<img src="' + url + '"/>' +
                 '<div class="shape-contour">'  +
                 '<div class="shape-anchor"></div>' +
                 '<div class="shape-anchor"></div>' +
                 '<div class="shape-anchor"></div>' +
                 '<div class="shape-anchor"></div>' +
                 '</div>' +
                 '</div>';

             oImgList.innerHTML += html;

             cb && cb();
            // img.ondragstart = function (ev) {
            //     var ev = ev || window.event;
            //     ev.dataTransfer.setDragImage(dragImg, 100, 100);
            //     ev.dataTransfer.setData('Text', img.src);
            // };
        };

        oInputs[0].onmousedown = function (ev) {
            var ev = ev || window.event;
            ev.stopPropagation();
        };

        /*给选择图片按钮加点击事件*/
        oInputs[0].onclick = function (ev) {
            var ev = ev || window.event;
            ev.stopPropagation();

            oInputs[1].click();
        };

        oInputs[1].onchange = function (event) {
            var that = this;
            var len = this.files.length || 0;
            var placeHolders = [];

            var iNow = -1;
            var imageLoaded = function (file) {
                var url = common.createObjectURL(file);
                createNewItem(url, oImgList, function () {
                    if (++iNow < len) {
                        imageLoaded(that.files[iNow]);
                    }
                });
            };

            if (len) {
                imageLoaded(that.files[++iNow]);
            }
        };
        /**/


        /**
         * @param ev
         */
        oBox.onmousedown = function (ev) {
            var ev = ev || window.event;
            var scrollPosition = common.getScrollPosition();
            var position = {
                x: ev.clientX - oBox.offsetLeft + scrollPosition.left,
                y: ev.clientY - oBox.offsetTop + scrollPosition.top
            };

            resetControls();

            // 显示选择框
            oSelectingBox.classList.add('show');

            oSelectingBox.style.left = position.x + 'px';
            oSelectingBox.style.top = position.y + 'px';

            // 更新选择框的位置信息.
            selectBoxPosition.left = position.x;
            selectBoxPosition.top = position.y;

            document.onmousemove = function (ev) {
                var ev = ev || window.event;
                var movingPosition = {
                    x: ev.clientX - oBox.offsetLeft,
                    y: ev.clientY - oBox.offsetTop
                };

                var dist = {
                    width: movingPosition.x - position.x,
                    height: movingPosition.y - position.y,
                };

                oSelectingBox.style.width = dist.width + 'px';
                oSelectingBox.style.height = dist.height + 'px';

                // 更新选择框的宽高信息.
                selectBoxPosition.width = dist.width;
                selectBoxPosition.height = dist.height;
            };

            document.onmouseup = function (ev) {
                document.onmousemove = null;
                document.onmouseup = null;

                // 隐藏选择框
                oSelectingBox.classList.remove('show');
                common.reset(oSelectingBox);

                // 更新控制框的位置和宽高信息,并显示.
                updateShape(selectBoxPosition);
                selectedItems = getSelectedItems(selectBoxPosition);

                // 如果没有元素被选中, 则重置控制框样式.
                if(!selectedItems || !selectedItems.length){
                    resetControls();
                }
            };
        };

        /**
         * 给控制框加事件.
         * @param ev
         */
        oShapeControls.onmousedown = function (ev) {
            var ev = ev || window.event;
            ev.stopPropagation();
        };

        oShapeControls.ondragstart = function (ev) {
            var ev = ev || window.event;
            //ev.dataTransfer.setDragImage(dragImg, 100, 100);
            var indexArr = [];

            selectedItems.forEach(function (v) {
                indexArr.push(v.index);
            });

            ev.dataTransfer.setData('Text', indexArr.join(','));
        };

        /*----------------释放相关的事件---------------------------*/
        dropBox.ondragenter = function (ev) {
            var ev = ev || window.event;

            this.classList.add('enter');
        };

        dropBox.ondragover = function (ev) {
            var ev = ev || window.event;
            ev.preventDefault();
        };

        dropBox.ondrop = function (ev) {
            var ev = ev || window.event;
            ev.preventDefault();

            this.classList.remove('enter');
            var indexStr = ev.dataTransfer.getData('Text');

            if(indexStr){
                var indexes = indexStr.split(',');
                var html = '';

                indexes.forEach(function (i) {
                    dropBox.appendChild(selectedItems[parseInt(i)]);
                });
            }

            resetControls();

            // 清楚选中元素.
            selectedItems = [];
        };

        dropBox.ondragleave = function (ev) {
            var ev = ev || window.event;

            this.classList.remove('enter');
        };
    };
})();