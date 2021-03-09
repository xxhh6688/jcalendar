let image = function (id, longPath) {
    this.id = id;
    this.imageId = longPath.replace("/image/", "");
    imageId = this.imageId;
    this.instance = new Vue({
        el: "#{0}".format(id),
        data: {
            id: id,
            imageId: imageId,
            zIndex: 1,
            content: id,
            previousPageId: null,
            nextPageId: null,
            image: {
                url: 'https://tse2-mm.cn.bing.net/th/id/OIP.UPRTwk9iey17J6LuHYqdawHaLH?w=189&h=284&c=7&o=5&dpr=2&pid=1.7',
                properties: {
                    width: 400,
                    height: 601
                }
            },
            imageCommentList: [],
            totalCommentsCount: 100,
            currentUser: currentUser
        },
        methods: {
            process: function () {
                let self = this;
                setTimeout(() => {
                    self.registerAnimateEvent();
                    self.prepareSiblingImage();
                    self.alignImageInRoot();
                }, 10);
            },
            init: function () {
                let self = this;
                self.player = new Player(self.id);
                self.player.imageCommentList = self.imageCommentList;
                self.player.init({
                    commentsCount: self.totalCommentsCount
                });
                self.player.clickEvent = (e) => {
                    let x = 0;
                    let y = 0;

                    if (!e.touches) {
                        x = e.offsetX / $(`#${self.id}`).find(".myCanvas").width();
                        y = e.offsetY / $(`#${self.id}`).find(".myCanvas").height();
                    }
                    else {
                        x = (self.player.dragPosition.x - Math.floor($(`#${self.id}`).find(".image")[0].getBoundingClientRect().left)) / $(`#${self.id}`).find(".myCanvas").width();
                        y = (self.player.dragPosition.y - Math.floor($(`#${self.id}`).find(".image")[0].getBoundingClientRect().top)) / $(`#${self.id}`).find(".myCanvas").height();
                    }

                    //self.startComment();
                    //self.position.x = x;
                    //self.position.y = y;
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
            enterAnimation: function (page, currentPage) {
                let self = this;
                if (currentPage && currentPage.type == 'root') {
                    return animation.zoomInImageToImage(self.imageId, currentPage.id);
                }
                else if (currentPage && currentPage.type == '') {
                    return animation.imageToImageEnter(page.id)
                }
            },
            alignImageInRoot: function () {
                let self = this;
                let root = pageManager.getNearRoot();
                if (root) {
                    var img = $(`#${root.id}`).find("img[name='{0}']".format(self.imageId));
                    if (img) {
                        var imageTop = $(img)[0].getBoundingClientRect().top;
                        var scrollTop = $(`#${root.id}`).scrollTop();
                        $(`#${root.id}`).scrollTop(imageTop + scrollTop);
                    }
                }
            },
            leaveAnimation: function (page, currentPage) {
                let self = this;
                let parentId = null;
                if (page) {
                    parentId = page.id;
                }

                if (page.type == 'root') {
                    return animation.zoomOutImageToRoot(self.id, parentId, self.imageId);
                }
                else if (currentPage && currentPage.type == '') {
                    return animation.imageToImageLeave(currentPage.id, page.id == currentPage.model.instance.nextPageId);
                }

                return 0;
            },
            prepareSiblingImage: function () {
                let self = this;
                let nearRoot = pageManager.getNearRoot();
                let previousImageId = null;
                let nextImageId = null;
                if (nearRoot && nearRoot.model.instance.waterFallImage) {
                    let previousImage = nearRoot.model.instance.waterFallImage.getPreviousImage(self.imageId);
                    let nextImage = nearRoot.model.instance.waterFallImage.getNextImage(self.imageId);
                    if (previousImage) {
                        previousImageId = previousImage.id;
                    }

                    if (nextImage) {
                        nextImageId = nextImage.id;
                    }
                }

                (function () {
                    if (previousImageId) {
                        let page = pageManager.getPageByLongPath("/image/{0}".format(previousImageId));
                        if (page) {
                            self.previousPageId = page.id;
                        }
                        else {
                            self.previousPageId = pageManager.createPage("image", "/image/{0}".format(previousImageId)).id;
                        }
                    }

                    if (nextImageId) {
                        let page = pageManager.getPageByLongPath("/image/{0}".format(nextImageId));
                        if (page) {
                            self.nextImageId = page.id;
                        }
                        else {
                            self.nextPageId = pageManager.createPage("image", "/image/{0}".format(nextImageId)).id;
                        }
                    }
                })()

                animation.jump(id, self.previousPageId, self.nextPageId, function () {
                    if (previousImageId) {
                        window.location.href = "#pow/image/{0}".format(previousImageId);
                    }
                }, function () {
                    if (nextImageId) {
                        window.location.href = "#pow/image/{0}".format(nextImageId);
                    }
                });
            },
            registerAnimateEvent: function () {
                let self = this;
                let parentId = null;
                let page = pageManager.getNearRoot();
                if (page) {
                    parentId = page.id;
                }

                animation.drop(id, parentId, self.imageId, function () {
                    let page = pageManager.getNearRoot();
                    if (page) {
                        window.location.href = "#pow/" + page.path;
                    }
                    else {
                        window.location.href = "#pow/home";
                    }
                });
            }
        },
        created: function () {
        }
    });
}