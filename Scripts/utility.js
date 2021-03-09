var verify = {
    v: Object.prototype.toString,
    isNumber: function (value) {
        return this.v.call(value) == '[object Number]';
    },
    isBoolean: function (value) {
        return this.v.call(value) == '[object Boolean]';
    },
    isString: function (value) {
        return this.v.call(value) == '[object String]';
    },
    isArray: function (value) {
        return this.v.call(value) == '[object Array]';
    },
    isFunction: function (value) {
        return this.v.call(value) == '[object Function]';
    },
    isObject: function (value) {
        return this.v.call(value) == '[object Object]';
    },
    isUndefined: function (value) {
        return this.v.call(value) == '[object Undefined]';
    },
    isNull: function (value) {
        return this.v.call(value) == '[object Null]';
    },
};

function setCookie(c_name, value, expiredays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
        else {
            return null;
        }
    }
    return null;
}

if (!String.prototype.format) {
    String.prototype.format = function () {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

function getHashValue(key) {
    var matches = location.hash.match(new RegExp(key + '=([^&]*)'));
    return matches ? matches[1] : null;
}

function getRandString(count) {
    var randStr = "";
    var arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    for (var i = 0; i < count; i++) {
        var r = Math.floor(Math.random() * 36);
        randStr = randStr + arr[r];
    }
    return randStr;
}

function getFormatedDate(date) {
    let d = new Date(date);
    let str = "{0}年{1}月{2}日 {3}:{4}".format(d.getFullYear(), ("0"+(d.getMonth() + 1)).substr(-2,2), ("0"+d.getDate()).substr(-2,2), ("0"+d.getHours()).substr(-2,2), ("0"+d.getMinutes()).substr(-2,2));
    return str;
}

function getFormatedDateShort(date) {
    let d = new Date(date);
    let str = "{0}年{1}月{2}日".format(d.getFullYear(), ("0" + (d.getMonth() + 1)).substr(-2, 2), ("0" + d.getDate()).substr(-2, 2), ("0" + d.getHours()).substr(-2, 2), ("0" + d.getMinutes()).substr(-2, 2));
    return str;
}

function getFormatedDateSample(date) {
    let d = new Date(date);
    let str = "{0}-{1}-{2}".format(d.getFullYear(), ("0" + (d.getMonth() + 1)).substr(-2, 2), ("0" + d.getDate()).substr(-2, 2), ("0" + d.getHours()).substr(-2, 2), ("0" + d.getMinutes()).substr(-2, 2));
    return str;
}

function getArrayBuffer(arr) {
    var bf = new Uint8Array(arr.length);
    for (var i = arr.length; i--;)
        bf[i] = arr[i];
    return bf;
}

function decode64(input) {
    var keyStr = "ABCDEFGHIJKLMNOP" +
        "QRSTUVWXYZabcdef" +
        "ghijklmnopqrstuv" +
        "wxyz0123456789+/" +
        "=";

    var output = "";
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;
    var arr = new Array();

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
        alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output = output + String.fromCharCode(chr1);
        arr.push(chr1);

        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
            arr.push(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
            arr.push(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

    } while (i < input.length);

    return arr;
}

function regEvent_ClickOtherPlaceCancel(ele, callback){
    let name=$(ele).attr('name');
    if(!name){
        return;
    }

    $(document).bind("mousedown touchstart",function(e){
        let target = e.target;
        let parentNode = $(target).parents(`[name='${name}']`)
        if(parentNode.length==0 && $(target).attr("name")!=name){
            if(callback){
                callback();
            }
        }
    });
}

Vue.component('pages', {
    props: ['pages'],
    template:
        '<div class="page-items" v-if="pages.count>1">' +
        '<a v-bind:href="pages.url+\'page=\'+(pages.currentPage-1)" v-on:click="pages.clickCallback(pages.currentPage-1)" v-if="pages.currentPage>1" class="page-item"><span>上一页</span></a>' +
        '<a v-bind:href="pages.url+\'page=1\'" v-on:click="pages.clickCallback(1)" class="page-item" v-bind:class="{selected:pages.currentPage==1}"><span>1</span></a>' +
        '<a href="javascript:void(0)" v-if="pages.currentPage>5&&pages.count>9" class="page-item-dot">...</a>' +
        '<a v-bind:href="pages.url+\'page=\'+p" v-on:click="pages.clickCallback(p)" v-for="p in pages.showPages" class="page-item" v-bind:class="{selected:pages.currentPage==p}">{{p}}</a>' +
        '<a href="javascript:void(0)" v-if="pages.currentPage<=pages.count-5&&pages.count>9" class="page-item-dot">...</a>' +
        '<a v-bind:href="pages.url+\'page=\'+pages.count" v-on:click="pages.clickCallback(pages.count)" class="page-item" v-bind:class="{selected:pages.currentPage==pages.count}">{{pages.count}}</a>' +
        '<a v-bind:href="pages.url+\'page=\'+pages.next" v-on:click="pages.clickCallback(pages.next)" v-if="pages.currentPage<pages.count" class="page-item">下一页</a>' +
        '</div>'
});

Vue.component('loading', {
    props: ['show'],
    template:
        '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:1000;background-color:#ffffff;">' +
        '   <div style="display:flex;align-items:center;">' +
        '       <i class="fas fa-sync-alt fa-spin" style="color:#808080"></i><span style="margin-left:10px;color:#808080">loading</span>' +
        '   </div>' +
        '</div>'
});

