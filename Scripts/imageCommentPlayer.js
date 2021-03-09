let Player = function (pageId) {
    let self = this;
    this.ctx = null;
    this.option = {};
    this.playStop = false;
    this.resizePosition = {
        x1: 0, // touch first finger x in screen
        y1: 0, // touch first finger y in screen
        x2: 0, // touch second finger x in screen
        y2: 0, // touch second figner y in screen
        cx: 0, // center of image x in screen
        cy: 0, // center of image y in screen
        scalex: 1, // current scale x
        newScalex: 1, // new scale x
        x: 0, // current transform x in screen
        y: 0, // current transform y in scrren
        nx: 0, // new transform x
        ny: 0 // new transform y
    };
    this.dragPosition = {
        x: 0,
        y: 0,
        ox: 0, //old x
        oy: 0 // old y
    };
    this.commentStartIndex = 0;
    this.currentShowComment = [];
    this.imageCommentList = [];
    this.sprites = [];
    this.canvasChanged = false;
    this.needRepaint = false;
    this.autoPlayTimer = null;
    this.highlightItemId = null;
    this.margin = 30;
    this.padding = 8;
    this.font = "16px Microsoft YaHei";
    $(window).resize(function () {
        self.resizeCanvas();
    });
    this.init = (options) => {
        self.option = options;
        var c = $(`#${pageId}`).find(".myCanvas")[0];
        self.ctx = c.getContext("2d");
        self.sprites.splice(0, self.sprites.length);
        self.resizeCanvas();
        self.registerEvent(self);
        let timeInterval = 0.1;
        autoPlayTimer = setInterval(function () {
            if (self.playStop) {
                return;
            }

            self.showImageComment(self.commentStartIndex);
        }, 1000 * timeInterval);
    };
    this.cleanup = () => {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
        }

        this.sprites.splice(0, this.sprites.length);
        this.currentShowComment.splice(0, this.currentShowComment.length);
    };
    this.highlightItem = id => {
        let self = this;
        self.highlightItemId = id;
        self.needRepaint = true;
    };
    this.getTextWidth = function (ctx, text) {
        ctx.save();
        ctx.font = this.font;
        let w = ctx.measureText(text).width + this.padding * 2;
        ctx.restore();
        return w;
    };
    this.addText = (ctx, text, x, y) => {
        let self = this;
        let canvasWidth = $(`#${pageId}`).find(".myCanvas").width();
        let ratio = this.getTextWidth(ctx, text) / canvasWidth;
        while (ratio > 0.25) {
            text = text.substr(0, text.length - 5) + "...";
            ratio = this.getTextWidth(ctx, text) / canvasWidth;
        }

        //let textPoz = this.getBestTextPosition(ctx, text, this.font, $("#myCanvas").width(), $("#myCanvas").height(), x, y, this.padding, this.margin);
        //if (!textPoz) {
        //    return null;
        //}

        //let tbk = new textBackground({
        //    x: textPoz.x,
        //    y: textPoz.y,
        //    font: self.font,
        //    padding: self.padding,
        //    text: text
        //});
        //let positions = tbk.get4Links(ctx); // return 4 links
        //tbk.draw(ctx);
        //let position = this.getBestLinkPoint(x, y, positions);
        //let l = new line({
        //    x1: x,
        //    y1: y,
        //    x2: position.x,
        //    y2: position.y
        //});
        //l.draw(ctx);
        let c1 = new circle({
            radius: 5,
            fillStyle: 'rgba(255,255,255,0)',
            x: x,
            y: y
        });
        c1.draw(ctx);
        let s = new sprite();
        s.c1 = c1;
        //s.line = l;
        //s.text = tbk;
        this.sprites.push(s);
        return {
            sprite: s,
            text: text,
            //position: [
            //    {
            //        x: positions[3].x,
            //        y: positions[0].y
            //    },
            //    {
            //        x: positions[1].x,
            //        y: positions[0].y
            //    },
            //    {
            //        x: positions[1].x,
            //        y: positions[2].y
            //    },
            //    {
            //        x: positions[3].x,
            //        y: positions[2].y
            //    }
            //]
        };
    };
    this.getExistSprite = function (id) {
        let t = this.sprites.filter(x => x.id == id);
        if (t.length > 0) {
            return t[0];
        }

        return null;
    };
    this.getBestLinkPoint = (circleX, circleY, links) => {
        let x = links[0].x;
        let y = links[1].y;
        let nw = {
            x: links[3].x,
            y: links[0].y
        };
        let ne = {
            x: links[1].x,
            y: links[0].y
        };
        let se = {
            x: links[1].x,
            y: links[2].y
        };
        let sw = {
            x: links[3].x,
            y: links[2].y
        };

        if (y - circleY >= (y - nw.y) / (nw.x - x) * (circleX - x) && y - circleY >= (y - ne.y) / (ne.x - x) * (circleX - x)) {
            return links[0];
        }

        if (y - circleY >= (y - nw.y) / (nw.x - x) * (circleX - x) && y - circleY <= (y - ne.y) / (ne.x - x) * (circleX - x)) {
            return links[1];
        }

        if (y - circleY <= (y - nw.y) / (nw.x - x) * (circleX - x) && y - circleY <= (y - ne.y) / (ne.x - x) * (circleX - x)) {
            return links[2];
        }

        if (y - circleY <= (y - nw.y) / (nw.x - x) * (circleX - x) && y - circleY >= (y - ne.y) / (ne.x - x) * (circleX - x)) {
            return links[3];
        }
    };
    this.getBestTextPosition = (ctx, text, font, width, height, x, y, padding, margin) => {
        ctx.save();
        ctx.font = font;
        let px = x;
        let py = y;
        let w = ctx.measureText(text).width + padding * 2;
        let h = parseInt(font, 10) + padding * 2;
        let pathList = [];
        pathList.push({ x: px, y: py });
        let direction = "E";
        let space = 40;
        let step = width * height / space / space * 4;
        ctx.restore();

        while (step > 0) {
            if (direction == "E") {
                px = px + space;
                let tmp = pathList.filter(v => (v.x == px && v.y == py + space));
                if (tmp.length == 0) {
                    direction = "S";
                }
            }
            else if (direction == "S") {
                py = py + space;
                let tmp = pathList.filter(v => (v.x == px - space && v.y == py));
                if (tmp.length == 0) {
                    direction = "W";
                }
            }
            else if (direction == "W") {
                px = px - space;
                let tmp = pathList.filter(v => (v.x == px && v.y == py - space));
                if (tmp.length == 0) {
                    direction = "N";
                }
            }
            else if (direction == "N") {
                py = py - space;
                let tmp = pathList.filter(v => (v.x == px + space && v.y == py));
                if (tmp.length == 0) {
                    direction = "E";
                }
            }

            pathList.push({ x: px, y: py });
            step--;

            if (px + w > width) {
                continue;
            }

            if (py + h > height) {
                continue;
            }

            if (px < 0 || py < 0) {
                continue;
            }

            if (x > px - margin && x < px + w + margin && y > py - margin && y < py + h + margin) {
                continue;
            }

            if (this.checkConflictInObjs([{ x: px - h / 2, y: py }, { x: px + w + h / 2, y: py }, { x: px + w + h / 2, y: py + h }, { x: px - h / 2, y: py + h }])) {
                continue;
            }

            return {
                x: px,
                y: py
            };
        }

        return null;
    };
    this.checkConflictInObjs = (obj) => {
        let isCross = false;
        $.each(this.sprites, function (a, b) {
            if (self.checkConflict(obj, b.text.positions, 5)) {
                isCross = true;
                return false;
            }
        });

        return isCross;
    };
    this.checkConflict = (obj1, obj2, margin) => {
        let isCross = false;
        $.each(obj1, function (a, b) {
            if (b.x >= obj2[0].x - margin && b.x <= obj2[1].x + margin && b.y >= obj2[0].y - margin && b.y <= obj2[2].y + margin) {
                isCross = true;
                return false;
            }
        });
        if (isCross) {
            return isCross;
        }

        $.each(obj2, function (a, b) {
            if (b.x >= obj1[0].x - margin && b.x <= obj1[1].x + margin && b.y >= obj1[0].y - margin && b.y <= obj1[2].y + margin) {
                isCross = true;
                return false;
            }
        });
        return isCross;
    };
    this.addImageComment = (ctx, text, x, y, px, py, order, id) => {
        x = Math.floor(x);
        y = Math.floor(y);
        let obj = this.addText(ctx, text, x, y);
        let comment = {
            id: id,
            x: px,
            y: py,
            order: order,
            createTime: new Date().toISOString(),
            text: text
        };
        obj.sprite.id = comment.id;
        if (this.imageCommentList.length == 0) { // todo
            this.imageCommentList.push(comment);
        }

        this.currentShowComment.push(comment);
        self.showCurrentComment(false);

        $.each(self.imageCommentList, function (a, b) {
            if (b.order == comment.order - 1) {
                self.imageCommentList.splice(a + 1, 0, comment);
                return false;
            }
        });
    };
    this.showCurrentCommentTimer = null;
    this.showCurrentComment = (realtime) => {
        let self = this;
        if (self.needRepaint) {
            self.needRepaint = false;
        }
        else {
            return;
        }

        if (this.showCurrentCommentTimer && !realtime) {
            clearTimeout(this.showCurrentCommentTimer);
        }

        let timeInterval = 500;
        if (realtime) {
            timeInterval = 10;
        }

        this.showCurrentCommentTimer = setTimeout(function () {
            self.clearCanvas(self.ctx);
            $.each(self.currentShowComment, function (a, b) {
                let s = self.getExistSprite(b.id);
                if (s) {
                    if (s.id == self.highlightItemId) {
                        s.color = '#ff0000';
                    }
                    else {
                        s.color = '#ffffff';
                    }

                    s.draw(self.ctx);
                    return true;
                }

                let obj = self.addText(self.ctx, b.text, b.x * $(`#${pageId}`).find(".myCanvas").width(), b.y * $(`#${pageId}`).find(".myCanvas").height());
                if (obj) {
                    obj.sprite.id = b.id;
                }
            });
        }, timeInterval);
    };
    this.showImageComment = (start) => {
        let self = this;
        let count = 30;
        let p1 = start;
        let p2 = p1 + count;
        if (!self.needRepaint && (self.currentShowComment.length == 0 || self.imageCommentList[start].id != self.currentShowComment[0].id)) {
            self.needRepaint = true;
        }

        this.currentShowComment = this.imageCommentList.slice(p1, p2);
        let i = this.sprites.length;
        while (i--) {
            if (this.currentShowComment.filter(x => x.id == this.sprites[i].id).length == 0) {
                this.sprites.splice(i, 1);
            }
        }

        self.showCurrentComment(true);
    };
    this.clearCanvas = (ctx) => {
        ctx.clearRect(0, 0, $(`#${pageId}`).find(".myCanvas").width(), $(`#${pageId}`).find(".myCanvas").height());
    };
    this.resizeCanvas = function () {
        if ($(`#${pageId}`).find(".myCanvas").length == 0) {
            return;
        }

        $(`#${pageId}`).find(".image").css("transform", "translate3d({0}px, {1}px, 0px) scale3d({2}, {3}, 1)".format(0, 0, 1, 1));
        $("#image-container").height($(`#${pageId}`).find(".image").height());
        if ($(`#${pageId}`).find(".image").height() > $(`#${pageId}`).find(".main-box").height()) {
            $(`#${pageId}`).find(".main-box").css("align-items", "unset");
        }
        else {
            $(`#${pageId}`).find(".main-box").css("align-items", "center");
        }

        $(`#${pageId}`).find(".myCanvas").css("left", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + "px");
        $(`#${pageId}`).find(".myCanvas").css("top", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + "px");
        $(`#${pageId}`).find(".myCanvas")[0].width = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width;
        $(`#${pageId}`).find(".myCanvas")[0].height = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height;

        self.resizePosition = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0, 
            cx: 0,
            cy: 0,
            scalex: 1,
            newScalex: 1,
            x: 0, 
            y: 0, 
            nx: 0, 
            ny: 0 
        };
        self.dragPosition = {
            x: 0,
            y: 0,
            ox: 0, 
            oy: 0 
        };
    };
    this.registerEvent = function () {
        let self = this;
        let dragStart = false;
        let positionX = 0;
        let btnPosition = 0;
        let mouseX = 0;
        let mouseY = 0;
        let resizeStart = false;
        let mouseDown = false;
        $(`#${pageId}`).find(".myCanvas").unbind("mouseup touchend");
        $(`#${pageId}`).find(".myCanvas").unbind("mousewheel");
        $(`#${pageId}`).find(".myCanvas").unbind("mousedown touchstart");
        $(`#${pageId}`).find(".myCanvas").unbind("mousemove touchmove");
        let oldTime = 0;
        let doubleTouchTime = 0;
        let singleTouchTimer = null;
        $(`#${pageId}`).find(".myCanvas").bind("mouseup touchend", (e) => {
            mouseDown=false;
            if (dragStart) {
                dragStart = false;
            }

            if (resizeStart) {
                resizeStart = false;
                if (e.touches && e.touches.length == 1) {
                    self.dragPosition.ox = self.resizePosition.nx;
                    self.dragPosition.oy = self.resizePosition.ny;
                }
            }

            let now = new Date().getTime();
            if (now - doubleTouchTime < 300) {
                clearTimeout(singleTouchTimer);
                // double click
                self.resizeCanvas();
                self.needRepaint = true;
                return;
            }

            if (!self.canvasChanged) {
                doubleTouchTime = new Date().getTime();
            }

            singleTouchTimer = setTimeout(function () {
                if (self.canvasChanged) {
                    oldTime = new Date().getTime();
                }

                addLog(`canvas changed: ${self.canvasChanged} ${now} ${oldTime}`);
                if (!self.canvasChanged) {
                    if (now - oldTime < 300) {
                        return;
                    }

                    self.clickEvent(e);
                }

                self.canvasChanged = false;
            }, 300);
        });
        $(`#${pageId}`).find(".myCanvas").bind("mousewheel", function (e) {
            e.preventDefault();
            let x = 0;
            let y = 0;
            let oldx = mouseX;
            let oldy = mouseY;
            let scalex = 1 + e.originalEvent.deltaY / Math.abs(e.originalEvent.deltaY) * -0.1;
            self.resizePosition.cx = Math.floor($(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width / 2);
            self.resizePosition.cy = Math.floor($(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height / 2);
            x = -(oldx - self.resizePosition.cx) * (scalex - 1);
            y = -(oldy - self.resizePosition.cy) * (scalex - 1);
            scalex *= self.resizePosition.scalex;
            x = self.resizePosition.x + x;
            y = self.resizePosition.y + y;
            $(`#${pageId}`).find(".image").css("transform", "translate3d({0}px, {1}px, 0px) scale3d({2}, {3}, 1)".format(x, y, scalex, scalex));
            $(`#${pageId}`).find(".myCanvas").css("left", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + "px");
            $(`#${pageId}`).find(".myCanvas").css("top", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + "px");
            $(`#${pageId}`).find(".myCanvas")[0].width = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width;
            $(`#${pageId}`).find(".myCanvas")[0].height = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height;
            self.sprites.length = 0;
            self.needRepaint = true;
            self.showCurrentComment(false);
            self.resizePosition.newScalex = scalex;
            self.resizePosition.scalex = scalex;
            self.resizePosition.x = x;
            self.resizePosition.y = y;
            self.resizePosition.nx = x;
            self.resizePosition.ny = y;
            return;
        });
        $(`#${pageId}`).find(".myCanvas").bind("mousedown touchstart", function (e) {
            moveable = true;
            if (e.touches && e.touches.length >= 2) {
                resizeStart = true;
                self.resizePosition.x1 = e.touches[0].clientX;
                self.resizePosition.y1 = e.touches[0].clientY;
                self.resizePosition.x2 = e.touches[1].clientX;
                self.resizePosition.y2 = e.touches[1].clientY;
                self.resizePosition.cx = Math.floor($(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width / 2);
                self.resizePosition.cy = Math.floor($(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height / 2);
                self.resizePosition.scalex = self.resizePosition.newScalex;
                self.resizePosition.scaley = self.resizePosition.newScalex;
                self.resizePosition.x = self.resizePosition.nx;
                self.resizePosition.y = self.resizePosition.ny;
                return;
            }

            self.dragPosition.x = 0;
            self.dragPosition.y = 0;

            if (e.touches && e.touches.length == 1) {
                self.dragPosition.ox = self.resizePosition.nx;
                self.dragPosition.oy = self.resizePosition.ny;
            }

            if (!e.touches) {
                mouseDown = true;
                self.dragPosition.ox = self.resizePosition.nx;
                self.dragPosition.oy = self.resizePosition.ny;
            }
        });
        $(`#${pageId}`).find(".myCanvas").bind("mousemove touchmove", function (e) {
            if (e.touches && e.touches.length >= 2) {
                self.needRepaint = true;
                let newResizePosition = {};
                newResizePosition.x1 = e.touches[0].clientX;
                newResizePosition.y1 = e.touches[0].clientY;
                newResizePosition.x2 = e.touches[1].clientX;
                newResizePosition.y2 = e.touches[1].clientY;
                let x = 0;
                let y = 0;
                let oldx = Math.floor((self.resizePosition.x1 + self.resizePosition.x2) / 2);
                let oldy = Math.floor((self.resizePosition.y1 + self.resizePosition.y2) / 2);
                let scalex = Math.abs(newResizePosition.x1 - newResizePosition.x2) / Math.abs(self.resizePosition.x1 - self.resizePosition.x2);
                x = -(oldx - self.resizePosition.cx) * (scalex - 1);
                y = -(oldy - self.resizePosition.cy) * (scalex - 1);
                scalex *= self.resizePosition.scalex;
                x = self.resizePosition.x + x;
                y = self.resizePosition.y + y;
                $(`#${pageId}`).find(".image").css("transform", "translate3d({0}px, {1}px, 0px) scale3d({2}, {3}, 1)".format(x, y, scalex, scalex));
                $(`#${pageId}`).find(".myCanvas").css("left", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + "px");
                $(`#${pageId}`).find(".myCanvas").css("top", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + "px");
                $(`#${pageId}`).find(".myCanvas")[0].width = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width;
                $(`#${pageId}`).find(".myCanvas")[0].height = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height;
                self.sprites.length = 0;
                self.showCurrentComment(false);
                self.resizePosition.newScalex = scalex;
                self.resizePosition.nx = x;
                self.resizePosition.ny = y;
                self.canvasChanged = true;
                return;
            }

            if (e.touches) {
                mouseX = e.touches[0].clientX;
                mouseY = e.touches[0].clientY;
            }
            else {
                mouseX = e.clientX;
                mouseY = e.clientY;
            }

            let imageObj = $(`#${pageId}`).find(".image");
            let imageRect = imageObj[0].getBoundingClientRect();
            if(imageRect.top > 0 && imageRect.top + imageRect.height < $(window).height() && 
            imageRect.left > 0 && imageRect.left + imageRect.width < $(window).width()){
                moveable = false;
                return;
            }

            if(!moveable){
                return;
            }

            if (!resizeStart && e.touches && e.touches.length == 1) {
                self.needRepaint = true;
                if(self.dragPosition.x == 0 && self.dragPosition.y == 0){
                    self.dragPosition.x = e.touches[0].clientX;
                    self.dragPosition.y = e.touches[0].clientY;
                }

                let deltX = e.touches[0].clientX - self.dragPosition.x;
                let deltY = e.touches[0].clientY - self.dragPosition.y;
                let x = self.dragPosition.ox + deltX;
                let y = self.dragPosition.oy + deltY;
                $(`#${pageId}`).find(".image").css("transform", "translate3d({0}px, {1}px, 0px) scale3d({2}, {3}, 1)".format(x, y, self.resizePosition.newScalex, self.resizePosition.newScalex));
                $(`#${pageId}`).find(".myCanvas").css("left", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + "px");
                $(`#${pageId}`).find(".myCanvas").css("top", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + "px");
                $(`#${pageId}`).find(".myCanvas")[0].width = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width;
                $(`#${pageId}`).find(".myCanvas")[0].height = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height;
                self.showCurrentComment(false);
                self.resizePosition.x = x;
                self.resizePosition.y = y;
                self.resizePosition.nx = x;
                self.resizePosition.ny = y;
                self.canvasChanged = true;
                return;
            }

            if (!resizeStart && !e.touches) {
                if (!mouseDown) {
                    return;
                }

                self.needRepaint = true;
                if(self.dragPosition.x == 0 && self.dragPosition.y == 0){
                    self.dragPosition.x = e.clientX;
                    self.dragPosition.y = e.clientY;
                }

                let deltX = e.clientX - self.dragPosition.x;
                let deltY = e.clientY - self.dragPosition.y;
                let x = self.dragPosition.ox + deltX;
                let y = self.dragPosition.oy + deltY;
                $(`#${pageId}`).find(".image").css("transform", "translate3d({0}px, {1}px, 0px) scale3d({2}, {3}, 1)".format(x, y, self.resizePosition.newScalex, self.resizePosition.newScalex));
                $(`#${pageId}`).find(".myCanvas").css("left", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().left + "px");
                $(`#${pageId}`).find(".myCanvas").css("top", $(`#${pageId}`).find(".image")[0].getBoundingClientRect().top + "px");
                $(`#${pageId}`).find(".myCanvas")[0].width = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().width;
                $(`#${pageId}`).find(".myCanvas")[0].height = $(`#${pageId}`).find(".image")[0].getBoundingClientRect().height;
                self.showCurrentComment(false);
                self.resizePosition.x = x;
                self.resizePosition.y = y;
                self.resizePosition.nx = x;
                self.resizePosition.ny = y;
                self.canvasChanged = true;
            }
        });
        $(document).unbind("mousemove touchmove");
        $(document).unbind("mouseup touchend");
        $(document).bind("mousemove touchmove", function (e) {
            if (dragStart) {
                let delta = 0;
                if (e.touches) {
                    delta = e.touches[0].clientX - positionX;
                }
                else {
                    delta = e.clientX - positionX;
                }

                $("#change-progress-btn").css("left", btnPosition + delta);
                if (parseInt($("#change-progress-btn").css("left"), 10) < -$("#change-progress-btn").width() / 2) {
                    $("#change-progress-btn").css("left", -$("#change-progress-btn").width() / 2);
                }
                else if (parseInt($("#change-progress-btn").css("left"), 10) > $("#progress-bar").width() - $("#change-progress-btn").width() / 2) {
                    $("#change-progress-btn").css("left", $("#progress-bar").width() - $("#change-progress-btn").width() / 2);
                }

                let width = $("#progress-bar").width();
                let left = parseInt($("#change-progress-btn").css("left") + $("#change-progress-btn").width() / 2, 10);
                self.showImageComment(Math.floor(self.imageCommentList.length * left / width));
            }
        });
        $(document).bind("mouseup touchend", function (e) {
            if (mouseDown) {
                mouseDown = false;
            }
        });
    };
};
let circle = function (option) {
    this.option = option;
    this.draw = function (ctx) {
        ctx.save();
        ctx.globalAlpha = this.option.optical ? this.option.optical : 1;
        ctx.beginPath();
        ctx.strokeStyle = this.option.color ? this.option.color : '#f3f3f3';
        let radius = this.option.radius ? this.option.radius : 5;
        ctx.arc(this.option.x, this.option.y, this.option.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        ctx.fill();
        ctx.lineWidth = this.option.lineWidth ? option.lineWidth : 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 3;
        ctx.shadowColor = "#000000";
        ctx.stroke();
        ctx.restore();
    };
};
let textBackground = function (option) {
    this.option = option;
    this.positions = [];
    this.get4Links = function (ctx) {
        x = this.option.x + this.option.padding; // text position x
        y = this.option.y + this.option.padding; // text position y
        ctx.save();
        ctx.beginPath();
        ctx.font = this.option.font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000000';
        let width = ctx.measureText(this.option.text).width;
        ctx.globalAlpha = 0.5;
        let px = x - this.option.padding;
        let py = y - this.option.padding;
        let w = width + this.option.padding * 2;
        let h = parseInt(this.option.font, 10) + this.option.padding * 2;
        ctx.restore();
        this.positions = [
            {
                x: px - h / 2,
                y: py
            },
            {
                x: px + w + h / 2,
                y: py
            },
            {
                x: px + w + h / 2,
                y: py + h
            },
            {
                x: px - h / 2,
                y: py + h
            }
        ];

        return [
            {
                x: px + w / 2,
                y: py
            },
            {
                x: px + w + h / 2,
                y: py + h / 2
            },
            {
                x: px + w / 2,
                y: py + h
            },
            {
                x: px - h / 2,
                y: py + h / 2
            }
        ];
    };
    this.draw = function (ctx) {
        x = this.option.x + this.option.padding; // text position x
        y = this.option.y + this.option.padding; // text position y
        ctx.save();
        ctx.beginPath();
        ctx.font = this.option.font;
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#000000';
        let width = ctx.measureText(this.option.text).width;
        ctx.globalAlpha = 0.5;
        let px = x - this.option.padding;
        let py = y - this.option.padding;
        let w = width + this.option.padding * 2;
        let h = parseInt(this.option.font, 10) + this.option.padding * 2;
        ctx.arc(this.option.x, this.option.y + h / 2, h / 2, 0.5 * Math.PI, 1.5 * Math.PI, false);
        ctx.arc(this.option.x + w, this.option.y + h / 2, h / 2, 1.5 * Math.PI, 0.5 * Math.PI, false);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = option.fontColor ? option.fontColor : '#ffffff';
        ctx.fillText(this.option.text, x, y);
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;
        ctx.strokeStyle = '#f3f3f3';
        ctx.lineTo(this.option.x, this.option.y + h);
        ctx.stroke();
        ctx.restore();
    };
};
let line = function (option) {
    this.option = option;
    this.draw = function (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.globalAlpha = 0.8;
        ctx.moveTo(this.option.x1, this.option.y1);
        ctx.lineTo(this.option.x2, this.option.y2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#f3f3f3';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 3;
        ctx.shadowColor = "#000000";
        ctx.stroke();
        ctx.restore();
    };
};
let sprite = function () {
    this.id = null;
    this.c1 = null;
    this.text = null;
    this.line = null;
    this.color = "#ffffff";
    this.draw = function (ctx) {
        //this.text.option.fontColor = this.color;
        this.c1.option.color = this.color;
        this.c1.draw(ctx);
        //this.text.draw(ctx);
        //this.line.draw(ctx);
    };
};
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
window.requestAnimFrameCustom = (() => {
    return function (callback) {
        return window.setTimeout(callback, 1000);
    };
})();

function scanImages() {
    setInterval(function () {
        $("#image-water-fall img").each(function (a, b) {
            if (!$(b).attr("md5")) {
                getImageContentMd5($(b));
                wrapImg($(b));
            }
        });
    }, 1000);
}

function getImageContentMd5(img) {
    $.ajax({
        url: $(img)[0].src,
        success: function (data) {
            var md5 = $.md5(base64Encode(data));
            $(img).attr('md5', md5);
        }
    });
}

function wrapImg(img) {
    $(img).bind("click", function () {
        imgCommentButtonClick($(img));
    });
}
function initVue() {
    vm = new Vue({
        el: '#main-box',
        data: {
            debug: false,
            image: {
                url: '',
                md5: '',
                img:null,
            },
            closeCallback:null,
            player: null,
            insertPosition: 0,
            imageCommentList: [],
            totalCommentsCount: 0,
            showCommentDialog: false,
            showConversationDialog: {
                show: false,
                showDetail:true,
            },
            imageShow: false,
            position: {
                x: 0,
                y: 0
            },
        },
        watch: {
        },
        created: function () {
        },
        methods: {
            init: function () {
                let self = this;
                if (!self.imageShow) {
                    return;
                }

                self.player = new Player();
                self.player.imageCommentList = self.imageCommentList;
                self.player.init({
                    commentsCount: self.totalCommentsCount
                });
                self.player.clickEvent = (e) => {
                    let x = 0;
                    let y = 0;

                    if (!e.touches) {
                        x = e.offsetX / $(`#${pageId}`).find(".myCanvas").width();
                        y = e.offsetY / $(`#${pageId}`).find(".myCanvas").height();
                    }
                    else {
                        x = (self.player.dragPosition.x - Math.floor($(`#${pageId}`).find(".image")[0].getBoundingClientRect().left)) / $(`#${pageId}`).find(".myCanvas").width();
                        y = (self.player.dragPosition.y - Math.floor($(`#${pageId}`).find(".image")[0].getBoundingClientRect().top)) / $(`#${pageId}`).find(".myCanvas").height();
                    }

                    //self.startComment();
                    self.position.x = x;
                    self.position.y = y;
                };

                for (var i = 0; i < 100; i++) {
                    self.imageCommentList.push({
                        id: i,
                        order: 1,
                        text: `Integer malesuada nulla non purus maximus, et blandit ligula sodales. ${i}`,
                        x: Math.random(),
                        y: Math.random()
                    });
                }
            },
            addComment: function () {
                let self = this;
                self.imageCommentsScroll();
                let newComment = {
                    id: new Date().getTime(),
                    order: 1,
                    text: $("#comment-text").val(),
                    x: self.position.x,
                    y: self.position.y
                };
                self.imageCommentList.splice(self.insertPosition, 0, newComment);
                self.player.commentStartIndex++;
                self.showCommentDialog = false;
            },
            startComment: function () {
                let self = this;
                self.showCommentDialog = true;
                Vue.nextTick(function () {
                    $("#comment-text").focus();
                    $('#comment-text').on("cut", function (e) {
                        self.textNumberCount();
                    });
                    $('#comment-text').on("paste", function (e) {
                        self.textNumberCount();
                    });
                    $('#comment-text').on("keyup", function (e) {
                        self.textNumberCount();
                    });
                });
            },
            showConversationUsers: function () {
                let self = this;
                self.showConversationDialog.show = false;
            },
            startConversation: function () {
                let self = this;
                self.showConversationDialog.show = true;
            },
            textNumberCount: function () {
                let allowNumber = 30;
                let length = allowNumber - $("#comment-text").val().length > 0 ? allowNumber - $("#comment-text").val().length : 0;
                $("#comment-text-length").text(length);
            },
            imageCommentsScroll: function (e) {
                let self = this;
                let height = $('#image-comment-list-box').height();
                let scrollTop = $('#image-comment-list-box').scrollTop();
                let scrollHeight = $('#image-comment-list-box').prop('scrollHeight');
                let ratio = (height + scrollTop) / scrollHeight;
                self.insertPosition = Math.floor(self.imageCommentList.length * ratio);
                let start = self.insertPosition - 30;
                if (start < 0) {
                    start = 0;
                }

                self.player.commentStartIndex = start;
            },
            close: function () {
                let self = this;
                $(`#${pageId}`).find(".main-box").remove();
                $("body").css("overflow", "auto");
                if (self.closeCallback) {
                    self.closeCallback(self.image.img);
                }
            },
            closeConversation: function () {
                let self = this;
                self.showConversationDialog.show = false;
                if (!self.imageShow) {
                    self.close();
                }
            },
        }
    });
}

function addBasicFrame() {
    var deferred = $.Deferred();
    $("body").css("overflow", "hidden");
    $.ajax({
        url: "/Scripts/structure.html",
        method: "get",
        complete: function (data) {
            $("body").append(data.responseText);
            initVue();
            deferred.resolve();
        },
        contentType: "text/plain; charset=utf-8",
        dataType: "json"
    });
    return deferred;
}

function imgCommentButtonClick(img, callback) {
    addBasicFrame().then(function () {
        vm.image.img = img;
        vm.image.url = $(img)[0].src;
        vm.image.md5 = $(img).attr('md5');
        vm.imageShow = true;
        vm.closeCallback = callback;
        Vue.nextTick(function () {
            vm.init();
        });
    });
}

function startConversation() {
    addBasicFrame().then(function () {
        vm.showConversationDialog.show = true;
        Vue.nextTick(function () {
            vm.init();
        });
    });
}

function base64Encode(str) {
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
}

var vm = null;

function addLog(text) {

    $("#log-list-box").append(`<div>${text}</div>`);
}

//scanImages();