var router = {
    currentPage: null,
    map: [
        { "url": "/calendar/year/\\d+", "page": "calendar.year" },
        { "url": "/calendar/month/\\d+", "page": "calendar.month" },
        { "url": "/calendar/day/\\d+", "page": "calendar.day" },
    ],
    getTargetPage: function () {
        var self = this;
        var path = window.location.hash.replace("#pow", "");
        var page = null;
        $.each(self.map, function (a, b) {
            var patts = '^' + b.url + '$';
            var patt = new RegExp(patts, "ig");
            if (patt.test(path) === true) {
                page = b.page;
                return false;
            }
        });

        return page;
    },
    parse: function () {
        var self = this;
        var path = window.location.hash.replace("#pow", "");
        var page = self.getTargetPage();
        if (!page) {
            return;
        }
        
        if(pageManager.inited){
            pageManager.goPage(page, path);
        }
        else{
            pageManager.init().then(function(){
                pageManager.goPage(page, path);
            });
        }
    }
};

$(document).ready(function () {
    window.onhashchange = function () {
        router.parse();
    };
    router.parse();
});