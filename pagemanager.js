let pageDefinition = [
    {
        name: 'calendar.year',
        type: 'root',
        model: calendarYear,
        index: 1,
        page: '/pages/calendar.year.html',
        cache: ''
    },
    {
        name: 'calendar.month',
        type: 'root',
        model: calendarMonth,
        index: 1,
        page: '/pages/calendar.month.html',
        cache: ''
    },
    {
        name: 'calendar.day',
        type: 'root',
        model: calendarDay,
        index: 1,
        page: '/pages/calendar.day.html',
        cache: ''
    },
    {
        name: 'common-user-bar',
        type: 'share',
        model: null,
        index: 0,
        page: '/pages/header.html',
        cache: ''
    },
];

let pageManager = {
    roots: [],
    inited: false,
    currentRootIndex: 1,
    currentPage: null,
    init: function () {
        let self = this;
        let deferred = $.Deferred();
        let count = pageDefinition.length;
        $.each(pageDefinition, function (a, b) {
            self.getHTML(b.page).then(function (data) {
                count--;
                b.cache = data;
                if (count == 0) {
                    self.mergePage();
                    self.inited = true;
                    deferred.resolve();
                }
            });
        });
        return deferred;
    },
    mergePage: function () {
        let self = this;
        let reg = new RegExp(/\[\[.+\]\]/);
        $.each(pageDefinition, function (a, b) {
            while (b.cache.match(reg)) {
                let name = b.cache.match(reg)[0].replace(/\[|\]/g, '');
                b.cache = b.cache.replace(b.cache.match(reg)[0], self.getPageDefinition(name).cache);
            }
        });
    },
    createPage: function (path, longPath) {
        let self = this;
        let content = self.getPageDefinition(path).cache;
        var randId = 'L-' + new Date().getTime();
        content = content.replace("{id}", randId);
        $("body").append(content);
        let pd = self.getPageDefinition(path);
        let model = new pd.model(randId, longPath);
        let p = new page();
        p.model = model;
        p.id = randId;
        p.path = path;
        p.longPath = longPath;
        if (self.roots.length == 0) {
            self.currentRootIndex = self.getPageDefinition(path).index;
        }

        p.index = self.currentRootIndex;
        p.type = self.getPageDefinition(path).type == "root" ? "root" : '';
        if (self.roots.filter(x => x.index == self.getPageDefinition(path).index).length == 0) {
            self.roots.push({
                index: self.getPageDefinition(path).index,
                layers: []
            });
        }

        self.roots.filter(x => x.index == self.getPageDefinition(path).index)[0].layers.push(p);
        

        return p;
    },
    setActivePage: function (page) {
        let self = this;
        let func = function () {
            page.setIndex(100);
            if (self.currentPage && self.currentPage.id != page.id) self.currentPage.setIndex(1);
            if (self.currentPage && self.currentPage.index == page.index && page.type == "root") {
                let roots = self.roots.filter(x => x.index == page.index);
                if (roots.length > 0) {
                    let layers = roots[0].layers;
                    for (var i = layers.length - 1; i >= 0; i--) {
                        if (layers[i].longPath != page.longPath) {
                            var p = layers.pop();
                            $(`#${p.id}`).remove();
                        }
                        else {
                            break;
                        }
                    }
                }
            }

            self.currentPage = page;
            if (self.currentPage.state == 'new') {
                self.currentPage.state = 'old';
                if(self.currentPage.model.instance.process){
                    self.currentPage.model.instance.process();
                }
            }
        };

        let needAnimation = false;

        if (self.currentPage && (self.currentPage.index == page.index)) {
            needAnimation = true;
        }

        if (needAnimation && page.model.instance.enterAnimation) {
            let time = page.model.instance.enterAnimation(page, self.currentPage);
            let time2 = self.currentPage.model.instance.leaveAnimation(page, self.currentPage);
            time = time2 > time ? time2 : time;
            setTimeout(() => {
                func();
            }, time);
        }
        else {
            func();
        }
    },
    goPage: function (path, longPath) {
        let self = this;
        if (self.currentPage && longPath == self.currentPage.path) {
            return;
        }

        let goPageProcess = function () {
            let roots = self.roots.filter(x => x.index == self.getPageDefinition(path).index);
            let root = roots.length > 0 ? roots[0] : null;
            if (self.getPageDefinition(path).type == "root" && self.getPageDefinition(path).index != self.currentRootIndex) {
                self.currentRootIndex = self.getPageDefinition(path).index;
                if (root && root.layers.length > 0) {
                    let page = root.layers[root.layers.length - 1];
                    if (root.layers.length == 1) {
                        self.setActivePage(page);
                    }
                    else {
                        window.location.href = `#pow${page.longPath}`;
                    }
                }
                else {
                    self.setActivePage(self.createPage(path, longPath));
                }
            }
            else if (self.getPageDefinition(path).type == "root" && self.getPageDefinition(path).index == self.currentRootIndex) {
                if (root && root.layers.length > 0) {
                    let rootPage = null;
                    for (var i = root.layers.length - 1; i >= 0; i--) {
                        if (root.layers[i].type != "root" || root.layers[i].path != path) {

                        }
                        else {
                            rootPage = root.layers[i];
                            break;
                        }
                    }

                    if (rootPage) {
                        self.setActivePage(rootPage);
                    }
                    else {
                        self.setActivePage(self.createPage(path, longPath));
                    }
                }
                else {
                    self.setActivePage(self.createPage(path, longPath));
                }
            }
            else if (self.getPageDefinition(path).type != "root") {
                let root = self.roots.filter(x => x.index == self.currentRootIndex);
                if (root.length == 0) {
                    self.setActivePage(self.createPage(path, longPath));
                }
                else {
                    let pages = root[0].layers.filter(x => x.longPath == longPath);
                    if (pages.length == 0) {
                        self.setActivePage(self.createPage(path, longPath));
                    }
                    else {
                        self.setActivePage(pages[0]);
                    }
                }
            }
        };

        goPageProcess();
    },
    backToRoot: function () {
        let self = this;
        let layers = self.roots.filter(x => x.index == self.currentRootIndex)[0].layers;
        if (layers.length > 0) {
            layers.splice(1, self.length - 1);
            for (var i = layers.length - 1; i > 0; i--) {
                var page = layers.pop();
                $(`#${page.id}`).remove();
            }

            self.currentPage = layers[0];
            self.currentPage.setIndex(100);
        }
        else {
            self.setActivePage(self.createPage("home", "home"));
        }
    },
    getNearRoot: function () {
        let page = null;
        let self = this;
        let root = self.roots.filter(x => x.index == self.currentRootIndex);
        if (root.length > 0) {
            let layers = self.roots.filter(x => x.index == self.currentRootIndex)[0].layers;
            for (let i = layers.length - 1; i >= 0; i--) {
                if (layers[i].type == "root") {
                    page = layers[i]
                    break;
                }
            }
        }

        return page;
    },
    getPage: function (id) {
        let self = this;
        let page = null;
        let layers = self.roots.filter(x => x.index == self.currentRootIndex)[0].layers;
        for (let i = layers.length - 1; i >= 0; i--) {
            if (layers[i].id == id) {
                page = layers[i]
                break;
            }
        }

        return page;
    },
    getPageByLongPath: function (longPath) {
        let page = null;
        let self = this;
        let root = self.roots.filter(x => x.index == self.currentRootIndex);
        if (root.length == 0) {
            return page;
        }
        else {
            let pages = root[0].layers.filter(x => x.longPath == longPath);
            if (pages.length == 0) {
                return page;
            }
            else {
                page = pages[0];
            }
        }

        return page;
    },
    getHTML: function (path) {
        let deferred = $.Deferred();
        $.ajax({
            url: path,
            method: "get",
            complete: function (data) {
                deferred.resolve(data.responseText);
            },
            contentType: "text/plain; charset=utf-8",
            dataType: "json"
        });
        return deferred;
    },
    resetLayerIndex: function () {
        let self = this;
        $.each(self.roots, function (a, b) {
            $.each(b.layers, function (c, d) {
                d.setIndex(1);
            })
        });
    },
    getPageDefinition: function (name) {
        let pages = pageDefinition.filter(x => x.name == name);
        if (pages.length > 0) {
            return pages[0];
        }

        return null;
    }
};

function page() {
    this.model = null;
    this.state = "new";
    this.name = ""
    this.id = "";
    this.path = "";
    this.longPath = "";
    this.type = "";
    this.index = 0;
    this.setIndex = function (index) {
        this.model.instance.zIndex = index;
    }
}