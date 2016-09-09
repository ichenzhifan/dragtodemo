/**
 * Created by Administrator on 2016/9/9.
 */
(function () {
    window.onload = function () {
        var oCanvas = document.getElementsByClassName('canvas')[0];
        var oItems = oCanvas.getElementsByClassName('item');
        var oSelectingBox = document.getElementById('selectingBox');
        var oShapeControls = document.getElementById('shapeControls');
        var selectedItems = [];

        var createRectShape = function (ctx, x, y, w, h) {
            ctx.save();
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
        };

        /**
         * 校正x,y坐标, 坐标不能出现在容器外.
         * @param wrap 容器
         * @param ele dom元素
         * @param currentX 坐标x
         * @param currentY 坐标y
         */
        var correctXY = function (wrap, ele, currentX, currentY) {
            var wrapW = wrap.clientWidth;
            var wrapH = wrap.clientHeight;

            var eleW = ele.clientWidth;
            var eleH = ele.clientHeight;

            console.log(wrapW, wrapH, currentX, currentY);

            // 左边
            if (currentX < 0) {
                currentX = 0;
            }

            // 顶部
            if (currentY < 0) {
                currentY = 0;
            }

            // 右边
            if (currentX + eleW > wrapW) {
                currentX = wrapW - eleW;
            }

            // 底部
            if (currentY + eleH > wrapH) {
                currentY = wrapH - eleH;
            }

            return {
                x: currentX,
                y: currentY
            };
        };

        /**
         * 更新控制框的位置和宽高, 以及控制图标的位置.
         * @param style
         */
        var updateControlsShape = function (controlBox, selectedItems) {
            if (!controlBox) {
                return;
            }

            // 获取控制框里的4个小圆点.
            var oShapeControlItems = controlBox.getElementsByClassName('controller');

            // 根据选中元素的个数和元素的位置, 动态计算外层的控制框的位置和实际宽度.
            var position = common.calcWrapPositionBySelectedItems(selectedItems);

            // 设置控制框为可见.
            controlBox.classList.add('show');

            // 设置控制框的宽高和位置.
            common.setPropties(controlBox, {
                top: position.top + 'px',
                left: position.left + 'px',
                width: position.width + 'px',
                height: position.height + 'px'
            });

            // 设置控制框里的控制图标的位置.
            common.setPropties(oShapeControlItems[0], {
                top: '-4px',
                left: '-4px'
            });
            common.setPropties(oShapeControlItems[1], {
                top: '-4px',
                left: (position.width - 4) + 'px'
            });
            common.setPropties(oShapeControlItems[2], {
                top: (position.height - 4) + 'px',
                left: '-4px'
            });
            common.setPropties(oShapeControlItems[3], {
                top: (position.height - 4) + 'px',
                left: (position.width - 4) + 'px'
            });
        };

        /**
         * 更新选中元素中, 标注为选中的图标的样式.
         * @param {HTMLElement} ele dom元素.
         */
        var updateSelectedItemShapePosition = function (ele) {
            if (!ele) {
                return;
            }

            var position = common.getElementPosition(ele);
            var shapes = ele.getElementsByClassName('shape-anchor');

            common.setPropties(ele, {
                width: position.width + 'px',
                height: position.height + 'px'
            });

            // 显示选中元素的"选中样式"
            toggleSelectedItemStyle(ele, true);

            // 设置控制框里的控制图标的位置.
            common.setPropties(shapes[0], {
                top: '-3px',
                left: position.width / 2 + 'px'
            });
            common.setPropties(shapes[1], {
                top: position.height / 2 + 'px',
                left: (position.width - 3) + 'px'
            });
            common.setPropties(shapes[2], {
                top: (position.height - 3) + 'px',
                left: position.width / 2 + 'px'
            });
            common.setPropties(shapes[3], {
                top: position.height / 2 + 'px',
                left: '-3px'
            });
        };

        /**
         * 更新选中的所有元素, 移动后的位置.
         * @param eles 待更新位置的所有元素
         * @param distance 移动的距离. {width, height}
         */
        var updatedSelectedItemsPosition = function (eles, distance) {
            if(!eles && !eles.length){
                return;
            }

            eles.forEach(function (ele) {
               var position = common.getElementPosition(ele);
                common.setPropties(ele, {
                    top: (position.top + distance.height) + 'px',
                    left: (position.left + distance.width) + 'px'
                });
            });
        };

        var resetControls = function () {
            // 隐藏控制框
            common.reset(oShapeControls);
            oShapeControls.classList.remove('show');

            // 清楚选中元素的样式.
            selectedItems.forEach(function (v) {
                toggleSelectedItemStyle(v, false);
            });

            selectedItems = [];
        };

        /**
         * 显示或隐藏选中元素的样式.
         * @param {boolean} show, true: 显示, false: 隐藏
         */
        var toggleSelectedItemStyle = function (ele, show) {
            if (!ele) {
                return;
            }

            if (show) {
                ele.getElementsByClassName('shape-contour')[0].classList.add('show');
            } else {
                ele.getElementsByClassName('shape-contour')[0].classList.remove('show');
            }
        };

        /**
         * 获取在制定区域内, 所有可选的元素.
         * @param scope
         * @returns {Array}
         */
        var getSelectedItems = function (scope, allItems) {
            var items = [];

            for (var i = 0; i < allItems.length; i++) {
                if (common.isElementIn(scope, allItems[i])) {
                    items.push(allItems[i]);
                    allItems[i].index = items.length - 1;
                }
            }

            return items;
        };

        /**
         * 给控制元素添加事件, 以至于可以拖动.
         * @param ele
         */
        var addControlShapeMovingHandler = function (ele) {
            ele.onmousedown = function (ev) {
                var that = this;
                var ev = ev || window.event;
                var scrollPosition = common.getScrollPosition();
                var position = {
                    x: ev.clientX - that.offsetLeft + scrollPosition.left,
                    y: ev.clientY - that.offsetTop + scrollPosition.top
                };

                ev.stopPropagation();

                document.onmousemove = function (ev) {
                    var ev = ev || window.event;
                    var movingPosition = {
                        x: ev.clientX - that.offsetLeft,
                        y: ev.clientY - that.offsetTop
                    };

                    var dist = {
                        width: movingPosition.x - position.x,
                        height: movingPosition.y - position.y,
                    };

                    // var xy = correctXY(oCanvas, item, item.offsetLeft + dist.width, item.offsetTop + dist.height);
                    var xy = {
                        x: that.offsetLeft + dist.width,
                        y: that.offsetTop + dist.height
                    };

                    // 更新控制元素的位置.
                    that.style.top = xy.y + 'px';
                    that.style.left = xy.x + 'px';

                    // 更新选中元素的位置.
                    updatedSelectedItemsPosition(selectedItems, dist);
                };

                document.onmouseup = function (ev) {
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            };
        };

        /**
         * 给item添加可移动的事件.
         * @param index
         */
        var addItemMovingHandler = function (item, index) {
            item.onmousedown = function (ev) {
                var ev = ev || window.event;
                var scrollPosition = common.getScrollPosition();
                var position = {
                    x: ev.clientX - item.offsetLeft + scrollPosition.left,
                    y: ev.clientY - item.offsetTop + scrollPosition.top
                };

                ev.stopPropagation();

                // resetControls();
                //
                // // 显示选择框
                // oSelectingBox.classList.add('show');
                //
                // oSelectingBox.style.left = position.x + 'px';
                // oSelectingBox.style.top = position.y + 'px';
                //
                // // 更新选择框的位置信息.
                // selectBoxPosition.left = position.x;
                // selectBoxPosition.top = position.y;

                document.onmousemove = function (ev) {
                    var ev = ev || window.event;
                    var movingPosition = {
                        x: ev.clientX - item.offsetLeft,
                        y: ev.clientY - item.offsetTop
                    };

                    var dist = {
                        width: movingPosition.x - position.x,
                        height: movingPosition.y - position.y,
                    };

                    // var xy = correctXY(oCanvas, item, item.offsetLeft + dist.width, item.offsetTop + dist.height);
                    var xy = {
                        x: item.offsetLeft + dist.width,
                        y: item.offsetTop + dist.height
                    };

                    item.style.top = xy.y + 'px';
                    item.style.left = xy.x + 'px';

                    // oSelectingBox.style.width = dist.width + 'px';
                    // oSelectingBox.style.height = dist.height + 'px';
                    //
                    // // 更新选择框的宽高信息.
                    // selectBoxPosition.width = dist.width;
                    // selectBoxPosition.height = dist.height;
                };

                document.onmouseup = function (ev) {
                    document.onmousemove = null;
                    document.onmouseup = null;

                    // // 隐藏选择框
                    // oSelectingBox.classList.remove('show');
                    // common.reset(oSelectingBox);
                    //
                    // // 更新控制框的位置和宽高信息,并显示.
                    // updateShape(selectBoxPosition);
                    // selectedItems = getSelectedItems(selectBoxPosition);
                    //
                    // // 如果没有元素被选中, 则重置控制框样式.
                    // if(!selectedItems || !selectedItems.length){
                    //     resetControls();
                    // }
                };
            };
        };

        /**
         * 添加onmousedown, onmousemove and onmouseup事件. 以拖动鼠标选择元素
         * @param box
         */
        var addCanvasHandler = function (box) {
            box.onmousedown = function (ev) {
                var ev = ev || window.event;
                var scrollPosition = common.getScrollPosition();
                var position = {
                    x: ev.clientX - box.offsetLeft + scrollPosition.left,
                    y: ev.clientY - box.offsetTop + scrollPosition.top,
                    width: 0,
                    height: 0
                };
                console.log('canvas');
                ev.stopPropagation();

                // 隐藏选择框
                oSelectingBox.classList.remove('show');
                common.reset(oSelectingBox);

                resetControls();

                // 设置选择框的位置
                oSelectingBox.style.left = position.x + 'px';
                oSelectingBox.style.top = position.y + 'px';

                document.onmousemove = function (ev) {
                    var ev = ev || window.event;
                    var movingPosition = {
                        x: ev.clientX - box.offsetLeft,
                        y: ev.clientY - box.offsetTop
                    };

                    position.width = movingPosition.x - position.x;
                    position.height = movingPosition.y - position.y;

                    // 显示选择框
                    oSelectingBox.classList.add('show');
                    oSelectingBox.style.width = position.width + 'px';
                    oSelectingBox.style.height = position.height + 'px';
                };

                document.onmouseup = function (ev) {
                    document.onmousemove = null;
                    document.onmouseup = null;

                    // 隐藏选择框
                    oSelectingBox.classList.remove('show');
                    common.reset(oSelectingBox);

                    // 获取在该区域, 所有可选的元素.
                    selectedItems = getSelectedItems({
                        top: position.y,
                        left: position.x,
                        width: position.width,
                        height: position.height
                    }, oItems);

                    // 如果没有元素被选中, 则重置控制框样式.
                    if (!selectedItems || !selectedItems.length) {
                        resetControls();
                    }else{
                        // 更新控制框的位置和宽高信息,并显示.
                        updateControlsShape(oShapeControls, selectedItems);
                        addControlShapeMovingHandler(oShapeControls);

                        // 设置控制框里面的4个小圆点的位置.
                        selectedItems.forEach(function(v){
                            updateSelectedItemShapePosition(v);
                        })
                    }
                };
            };
        };

        init();

        function init() {
            var oC1 = document.getElementById('c1');
            var oGc1 = oC1.getContext('2d');

            var oC2 = document.getElementById('c2');
            var oGc2 = oC2.getContext('2d');

            var oC3 = document.getElementById('c3');
            var oGc3 = oC3.getContext('2d');

            // 创建第一个矩形.
            createRectShape(oGc1, 0, 0, oC1.width, oC1.height);
            createRectShape(oGc2, 0, 0, oC2.width, oC2.height);
            createRectShape(oGc3, 0, 0, oC3.width, oC3.height);

            // 给canvas里的item添加可移动事件.
            for (var i = 0; i < oItems.length; i++) {
                addItemMovingHandler(oItems[i], i);
            }

            // 给整个canvas添加onmousedown, onmousemove and onmouseup事件. 以选择元素.
            addCanvasHandler(oCanvas);
        }
    };
})();