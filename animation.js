let animation = {
    ox: 0,
    oy: 0,
    mx: 0,
    my: 0,
    mouseX:0,
    mouseY:0,
    distance: 0,
    otime:0,
    mtime:0,
    touched: false,
    moveable:false,
    drop: function (pageId, parentPageId, imageId, callback) {
        let self = this;
        let obj = $(`#${pageId}`);
        let parentObj = parentPageId ? $(`#${parentPageId}`) : null;
        let imageInWaterFall = null;
        let dropable = true;
        let checkGuesture = false;
        let moveEndFunc = function () {
            if (self.distance / $(window).height() > 0.15) {
                setTimeout(() => {
                    $(obj).css("display", "block");
                    $(obj).css("zIndex", "1");
                    $(obj).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
                }, 500);
                if (callback) {
                    callback();
                }
            }
            else {
                $(obj).css("transitionProperty", "all");
                $(obj).css("transitionDuration", "0.5s");
                $(obj).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
                $(obj).find(".needfade").css("opacity", 1);
                setTimeout(() => {
                    $(obj).css("transitionProperty", "unset");
                    $(obj).css("transitionDuration", "unset");
                }, 500);
            }
        };
        $(obj).bind("mousedown touchstart", function (e) {
            self.ox = 0;
            self.oy = 0;

            if (e.touches) {
                self.mouseX = e.touches[0].clientX;
                self.mouseY = e.touches[0].clientY;
            }
            else {
                self.mouseX = e.clientX;
                self.mouseY = e.clientY;
            }

            let imageObj = $(`#${pageId}`).find(".image");
            let imageRect = imageObj[0].getBoundingClientRect();
            if (self.mouseX < imageRect.left || self.mouseX > imageRect.left + imageRect.width ||
                self.mouseY < imageRect.top || self.mouseY > imageRect.top + imageRect.height) {
                    self.ox = self.mouseX;
                    self.oy = self.mouseY;
            }

            self.touched = true;
            checkGuesture = false;
            if (parentObj) {
                $(parentObj).css("zIndex", 2);
            }

            imageInWaterFall = parentObj ? $(parentObj).find(`img[name='${imageId}']`) : null
            if (imageInWaterFall) {
                $(imageInWaterFall).parents(".image-box").css("backgroundColor", "#ffffff");
                $(imageInWaterFall).parents(".image-box").hide();
            }

            self.distance = 0;
            dropable = false;
        });
        $(obj).bind("mousemove touchmove", function (e) {
            if (e.touches && e.touches.length > 1) {
                return;
            }

            self.moveable = true;
            let imageObj = $(`#${pageId}`).find(".image");
            let imageRect = imageObj[0].getBoundingClientRect();
            if(imageRect.top < 0 || imageRect.top + imageRect.height > $(window).height() || 
            imageRect.left < 0 || imageRect.left + imageRect.width > $(window).width()){
                self.moveable = false;
                if(self.ox == 0 && self.oy == 0){
                    return;
                }
            }

            if(self.ox == 0 && self.oy == 0){
                if (e.touches) {
                    self.ox = e.touches[0].clientX;
                    self.oy = e.touches[0].clientY;
                }
                else {
                    self.ox = e.clientX;
                    self.oy = e.clientY;
                }
            }

            if (e.touches) {
                self.mx = e.touches[0].clientX;
                self.my = e.touches[0].clientY;
            }
            else {
                self.mx = e.clientX;
                self.my = e.clientY;
            }

            self.distance = Math.sqrt((self.mx - self.ox) * (self.mx - self.ox) + (self.my - self.oy) * (self.my - self.oy));
            if (!checkGuesture && self.distance >= 10 && self.distance < 100) {
                if (Math.abs(self.mx - self.ox) <= Math.abs(self.my - self.oy)) {
                    dropable = true;
                }
                else {
                    dropable = false;
                    return;
                }

                checkGuesture = true;
            }
            else if (self.distance < 10) {
                return;
            }

            if (!dropable) {
                return;
            }

            if (self.touched) {
                let zoomin = 1 - self.distance / $(window).height() * 0.5;
                $(obj).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(self.mx - self.ox, self.my - self.oy, zoomin));
                $(obj).find(".needfade").css("opacity", 1 - (self.distance / 100));
                let rect = $(obj)[0].getBoundingClientRect();
                let poz = {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                };

                if (self.mx < poz.left || self.mx > poz.left + poz.width || self.my < poz.top || self.my > poz.top + poz.height) {
                    moveEndFunc();
                    self.touched = false;
                }
            }
        });
        $(obj).bind("mouseup touchend", function (e) {
            if (dropable) {
                moveEndFunc();
            }

            setTimeout(() => {
                $(imageInWaterFall).parents(".image-box").show();
            }, 1000);
            self.touched = false;
        });
    },
    jump: function (pageId, previousPageId, nextPageId, callbackPrevious, callbackNext) {
        let self = this;
        let obj = $(`#${pageId}`);
        let previousPage = previousPageId?$(`#${previousPageId}`):null;
        let nextPage = nextPageId?$(`#${nextPageId}`):null;
        let jumpable = true;
        let checkGuesture = false;
        let moveEndFunc = function () {
            let distanceInX = self.mx - self.ox;
            if ((Math.abs(distanceInX) >= $(window).width() / 2) || 
            (self.mtime - self.otime < 600 && Math.abs(distanceInX) > 30)
            ) {
                if (distanceInX < 0) {
                    if(callbackNext){
                        callbackNext();
                    }
                }
                else if (distanceInX > 0) {
                    if(callbackPrevious){
                        callbackPrevious();
                    }
                }
            }
            else {
                self.jumpRestore(pageId, previousPageId, nextPageId);
            }
        };
        $(obj).bind("mousedown touchstart", function (e) {
            self.ox = 0;
            self.oy = 0;

            if (e.touches) {
                self.mouseX = e.touches[0].clientX;
                self.mouseY = e.touches[0].clientY;
            }
            else {
                self.mouseX = e.clientX;
                self.mouseY = e.clientY;
            }

            let imageObj = $(`#${pageId}`).find(".image");
            let imageRect = imageObj[0].getBoundingClientRect();
            if (self.mouseX < imageRect.left || self.mouseX > imageRect.left + imageRect.width ||
                self.mouseY < imageRect.top || self.mouseY > imageRect.top + imageRect.height) {
                    self.ox = self.mouseX;
                    self.oy = self.mouseY;
            }

            self.otime=new Date().getTime();
            self.touched = true;
            checkGuesture = false;
            self.distance = 0;
            jumpable = false;
        });
        $(obj).bind("mousemove touchmove", function (e) {
            self.moveable = true;
            if (e.touches && e.touches.length > 1) {
                return;
            }

            let imageObj = $(`#${pageId}`).find(".image");
            let imageRect = imageObj[0].getBoundingClientRect();
            if(imageRect.top < 0 || imageRect.top + imageRect.height > $(window).height() || 
            imageRect.left < 0 || imageRect.left + imageRect.width > $(window).width()){
                self.moveable = false;
                if(self.ox == 0 && self.oy == 0){
                    return;
                }
            }

            if(self.ox == 0 && self.oy == 0){
                if (e.touches) {
                    self.ox = e.touches[0].clientX;
                    self.oy = e.touches[0].clientY;
                }
                else {
                    self.ox = e.clientX;
                    self.oy = e.clientY;
                }
            }

            if (e.touches) {
                self.mx = e.touches[0].clientX;
                self.my = e.touches[0].clientY;
            }
            else {
                self.mx = e.clientX;
                self.my = e.clientY;
            }

            self.distance = Math.sqrt((self.mx - self.ox) * (self.mx - self.ox) + (self.my - self.oy) * (self.my - self.oy));
            if (!checkGuesture && self.distance >= 10 && self.distance < 100) {
                if (Math.abs(self.mx - self.ox) > Math.abs(self.my - self.oy)) {
                    jumpable = true;
                }
                else {
                    jumpable = false;
                    return;
                }

                checkGuesture = true;
            }
            else if (!checkGuesture && self.distance < 10) {
                return;
            }

            if (!jumpable) {
                return;
            }

            if (self.touched) {
                $(obj).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(self.mx - self.ox, 0, 1));
                /*
                let rect = $(obj)[0].getBoundingClientRect();
                let poz = {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                };

                if (self.mx < poz.left || self.mx > poz.left + poz.width || self.my < poz.top || self.my > poz.top + poz.height) {
                    moveEndFunc();
                }

                */
                if(previousPage && (self.mx - self.ox)>=0){
                    $(nextPage).css("zIndex",1);
                    $(nextPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
                    $(previousPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(self.mx-self.ox-$(window).width() , 0, 1));
                    $(previousPage).css("zIndex",100);
                }

                if(nextPage && (self.mx - self.ox)<=0){
                    $(previousPage).css("zIndex", 1);
                    $(previousPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
                    $(nextPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(self.mx-self.ox+$(window).width() , 0, 1));
                    $(nextPage).css("zIndex",100);
                }
            }
        });
        $(obj).bind("mouseup touchend", function (e) {
            self.mtime=new Date().getTime();
            if (jumpable) {
                moveEndFunc();
            }

            self.touched = false;
        });
    },
    imageToImageEnter: function (pageId) {
        let page = pageId?$(`#${pageId}`):null;
        if (page) {
            $(page).css("zIndex", 100);
            $(page).css("transitionProperty", "all");
            $(page).css("transitionDuration", "0.3s");
            $(page).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
            setTimeout(() => {
                $(page).css("transitionProperty", "unset");
                $(page).css("transitionDuration", "unset");
            }, 300);
        }

        return 300;
     },
     imageToImageLeave: function (pageId, toNext) {
        let page = pageId?$(`#${pageId}`):null;
        if(page){
            $(page).css("transitionProperty", "all");
            $(page).css("transitionDuration", "0.3s");
            if(toNext){
                $(page).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(-$(window).width(), 0, 1));
            }
            else{
                $(page).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format($(window).width(), 0, 1));
            }

            setTimeout(() => {
                $(page).css("transitionProperty", "unset");
                $(page).css("transitionDuration", "unset");
                $(page).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
            }, 300);
        }

        return 300;
     },
    jumpRestore: function (pageId, previousPageId, nextPageId) {
        let self = this;
        let page = pageId?$(`#${pageId}`):null;
        let previousPage = previousPageId?$(`#${previousPageId}`):null;
        let nextPage = nextPageId?$(`#${nextPageId}`):null;
        if(page){
            $(page).css("transitionProperty", "all");
            $(page).css("transitionDuration", "0.5s");
            $(page).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
            setTimeout(() => {
                $(page).css("transitionProperty", "unset");
                $(page).css("transitionDuration", "unset");
            }, 200);
        }
        
        if(previousPage){
            $(previousPage).css("transitionProperty", "all");
            $(previousPage).css("transitionDuration", "0.5s");
            $(previousPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(-$(window).width(), 0, 1));
            setTimeout(() => {
                $(previousPage).css("transitionProperty", "unset");
                $(previousPage).css("transitionDuration", "unset");
                $(previousPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
                $(previousPage).css("zIndex", 1);
            }, 200);
        }

        if(nextPage){
            $(nextPage).css("transitionProperty", "all");
            $(nextPage).css("transitionDuration", "0.5s");
            $(nextPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format($(window).width(), 0, 1));
            setTimeout(() => {
                $(nextPage).css("transitionProperty", "unset");
                $(nextPage).css("transitionDuration", "unset");
                $(nextPage).css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
                $(nextPage).css("zIndex", 1);
            }, 200);
        }
    },
    zoomOutImageToRoot: function (pageId, parentPageId, imageId) {
        let self = this;
        if (!parentPageId || !pageId || !imageId) {
            return 0;
        }

        let obj = $(`#${pageId}`)
        let parentPage = $(`#${parentPageId}`);
        let imageInWaterFall = $(parentPage).find(`img[name='${imageId}']`);
        if(imageInWaterFall.length == 0){
            return;
        }

        imageInWaterFall.parents(".image-box").show();
        let imgPoz = {
            left: $(obj).find(".image")[0].getBoundingClientRect().left,
            top: $(obj).find(".image")[0].getBoundingClientRect().top,
            width: $(obj).find(".image")[0].getBoundingClientRect().width,
            height: $(obj).find(".image")[0].getBoundingClientRect().height
        };
        $(obj).css("display", "none");
        $(parentPage).css('zIndex',2);
        let oImgPoz = {
            left: imageInWaterFall[0].getBoundingClientRect().left,
            top: imageInWaterFall[0].getBoundingClientRect().top,
            width: imageInWaterFall[0].getBoundingClientRect().width,
            height: imageInWaterFall[0].getBoundingClientRect().height
        };
        let aImgPoz = self.translatePosition(oImgPoz.left, oImgPoz.top, oImgPoz.width, oImgPoz.height, imgPoz.left, imgPoz.top, imgPoz.width, imgPoz.height);
        imageInWaterFall.css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(aImgPoz.x, aImgPoz.y, aImgPoz.scale));
        imageInWaterFall.parents(".image-box").css("zIndex", 10);
        setTimeout(() => {
            imageInWaterFall.css("transitionProperty", "all");
            imageInWaterFall.css("transitionDuration", "0.3s");
            imageInWaterFall.css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
        }, 10);
        setTimeout(() => {
            imageInWaterFall.css("transitionProperty", "unset");
            imageInWaterFall.css("transitionDuration", "unset");
            imageInWaterFall.parents(".image-box").css("zIndex", 'unset');
            $(obj).css("display", "unset");
        }, 310);

        return 310;
    },
    zoomInImageToImage: function (imageId, parentId) {
        let self = this;
        if (!parentId) {
            return 0;
        }

        let imageInWaterFall = $(`.image-water-fall img[name='${imageId}']`);
        let oImgPoz = {
            left: imageInWaterFall[0].getBoundingClientRect().left,
            top: imageInWaterFall[0].getBoundingClientRect().top,
            width: imageInWaterFall[0].getBoundingClientRect().width,
            height: imageInWaterFall[0].getBoundingClientRect().height
        };
        let target = {
            width: $(window).width(),
            height: 0,
            left: 0,
            top: 0
        };
        let targetPoz = self.translatePosition(oImgPoz.left, oImgPoz.top, oImgPoz.width, oImgPoz.height, target.left, target.top, target.width, target.height)
        imageInWaterFall.css("transitionProperty", "all");
        imageInWaterFall.css("transitionDuration", "0.3s");
        imageInWaterFall.parents(".image-box").css("zIndex", 10);
        imageInWaterFall.css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(targetPoz.x, targetPoz.y, targetPoz.scale));
        setTimeout(() => {
            imageInWaterFall.css("transitionProperty", "unset");
            imageInWaterFall.css("transitionDuration", "unset");
            imageInWaterFall.parents(".image-box").css("zIndex", 'unset');
            imageInWaterFall.css("transform", "translate3d({0}px, {1}px, 0px) scale({2})".format(0, 0, 1));
        }, 300);

        return 300;
    },
    translatePosition: function (ox, oy, oWidth, oHeight, nx, ny, nWidth, nHeight) {
        let ratio = nWidth / oWidth;
        let tx = ox + (oWidth / 2 - oWidth / 2 * ratio);
        let ty = oy + (oHeight / 2 - oHeight / 2 * ratio);
        return {
            x: nx - tx,
            y: ny - ty,
            scale: ratio
        };
    }
};