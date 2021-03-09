let calendarDay = function (id, longPath) {
    this.id = id;
    this.instance = new Vue({
        el: "#{0}".format(id),
        data: {
            zIndex: 1,
            waterFallImage: null,
            id: id,
            year: 2021,
            month: 0,
            day: 0,
            hourHeight: 100,
            events: [],
            separator:4,
            eventNodes: [],
            currentEvent: null,
            changeEventDuration:{
                type:1 // 1:top 2:bottom
            },
            mouse:{
                x:0,
                y:0
            }
        },
        methods: {
            enterAnimation: function () {
                return 0;
            },
            leaveAnimation: function () {
                return 0;
            },
            init: function () {
                let self = this;
                let pattern = /\/calendar\/day\/(\d{4})(\d{2})(\d{2})/;
                let reg = new RegExp(pattern);
                let matches = longPath.match(reg);
                if (matches) {
                    self.year = parseInt(matches[1]);
                    self.month = parseInt(matches[2]) - 1;
                    self.day = parseInt(matches[3]);
                }

                self.reCalcHourHeight();
                self.addEvent({ id: 1, title: "1", from: "2021-2-25 5:00", to: "2021-2-25 7:15" });
                self.addEvent({ id: 2, title: "2", from: "2021-2-25 5:20", to: "2021-2-25 6:15" });
                self.addEvent({ id: 3, title: "3", from: "2021-2-25 5:25", to: "2021-2-25 6:45" });
                self.addEvent({ id: 4, title: "4", from: "2021-2-25 5:45", to: "2021-2-25 6:45" });

                self.analysisEvents();
                self.drawEvents();

                $(document).bind("mousemove touchmove",function(e){
                    if (e.touches) {
                        self.mouse.x = e.touches[0].clientX;
                        self.mouse.y = e.touches[0].clientY;
                    }
                    else {
                        self.mouse.x = e.clientX;
                        self.mouse.y = e.clientY;
                    }
                });
            },
            drawEvents: function () {
                let self = this;
                $(".event").not(".layer").remove();
                $.each(self.events, function (a, b) {
                    let node = self.drawEvent(b);
                    self.registerTouchEventForEventNode(node, b);
                });
            },
            calculateSiblingModeWidth: function (node, rId) {
                let self = this;
                let totalWidth = 0;
                let siblings = [];
                for (let i = 0; i < self.events.length; i++) {
                    if (Math.abs(new Date(node.from).getTime() - new Date(self.events[i].from).getTime()) < 900000) {

                        if (rId != self.events[i].rId) {
                            continue;
                        }

                        totalWidth += self.events[i].width;
                        siblings.push(self.events[i]);
                    }
                }

                siblings.push(node);
                return Math.floor(totalWidth / siblings.length);
            },
            setSibling: function (node, rId) {
                let self = this;
                let totalWidth = 0;
                let siblings = [];
                for (let i = 0; i < self.events.length; i++) {
                    if (Math.abs(new Date(node.from).getTime() - new Date(self.events[i].from).getTime()) < 900000) {
                        if (rId != self.events[i].rId) {
                            continue;
                        }

                        totalWidth += self.events[i].width;
                        siblings.push(self.events[i]);
                    }
                }

                siblings.push(node);
                for (let i = 0; i < siblings.length; i++) {
                    siblings[i].left = siblings[0].left + Math.floor(totalWidth / siblings.length) * i;
                    siblings[i].width = Math.floor(totalWidth / siblings.length);
                    siblings[i].rId = rId;
                }

            },
            testSiblingConflict: function (node, left, width) {
                let self = this;
                for (let i = 0; i < self.events.length; i++) {
                    if (Math.abs(new Date(node.from).getTime() - new Date(self.events[i].from).getTime()) < 900000) {
                        if (self.events[i].width &&
                            self.events[i].left >= left && self.events[i].left + self.events[i].width <= left + width) {
                            if (self.events[i].rId != node.rId) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            },
            analysisEvents: function () {
                let self = this;
                let wholeWidth = $(`#${self.id} .hour-line`).width();
                self.sortEvent();
                $.each(self.events, function (a, b) {
                    if (a == 0) {
                        b.left = 0;
                        b.width = wholeWidth;
                        b.rId = getRandString(10);
                        return true;
                    }

                    let testNode = {
                        left: 0,
                        width: 0
                    };
                    b.left = testNode.left;
                    b.width = testNode.width;
                    let alignSiblingNode = {
                        id: '',
                    };

                    if (new Date(b.from).getTime() >= new Date(self.events[a - 1].to).getTime()) {
                        b.left = 0;
                        b.width = wholeWidth;
                        b.rId = getRandString(10);
                    }
                    else {
                        for (let i = 0; i < a; i++) {
                            if (Math.abs(new Date(b.from).getTime() - new Date(self.events[i].from).getTime()) < 900000) {
                                let width = self.calculateSiblingModeWidth(b, self.events[i].rId);
                                if (width > testNode.width + 10) {
                                    testNode.left = -1;
                                    testNode.width = width;
                                    alignSiblingNode.id = self.events[i].rId;
                                }
                            }
                            else if (new Date(b.from).getTime() > new Date(self.events[i].from).getTime() && new Date(b.from).getTime() < new Date(self.events[i].to).getTime()) {
                                let left = self.events[i].left;
                                let width = wholeWidth - self.events[i].left;

                                for (let j = 0; j < a; j++) {
                                    if (new Date(b.from).getTime() > new Date(self.events[j].from).getTime() && new Date(b.from).getTime() < new Date(self.events[j].to).getTime()) {
                                        let newDistance = self.events[j].left - testNode.left;
                                        if (newDistance <= 10+self.separator) {
                                            continue;
                                        }
                                        else {
                                            if (width > newDistance) {
                                                width = newDistance;
                                            }
                                        }
                                    }
                                }

                                if (self.testSiblingConflict(b, left, width)) {
                                    continue;
                                }

                                if (testNode.width + 10 < width) {
                                    testNode.width = width;
                                    testNode.left = left;
                                }
                            }
                        }

                        if (testNode.left != -1) {
                            b.width = testNode.width-self.separator;
                            b.left = testNode.left+self.separator;
                            b.rId = getRandString(10);
                        }
                        else {
                            self.setSibling(b, alignSiblingNode.id);
                        }
                    }
                });
            },
            sortEvent: function () {
                let self = this;
                self.events.sort(function (a, b) {
                    if (new Date(b.from) > new Date(a.from)) {
                        return -1;
                    }
                    else if (new Date(b.from) < new Date(a.from)) {
                        return 1;
                    }
                    else if (new Date(b.from) == new Date(a.from)) {
                        if (new Date(b.end) > new Date(a.end)) {
                            return 1;
                        }
                        else if (new Date(b.end) < new Date(a.end)) {
                            return -1;
                        }
                        else {
                            return 0;
                        }
                    }
                });
                $.each(self.events,function(a,b){
                    b.width=0;
                    b.left=0;
                    b.rId='';
                });
            },
            addEvent: function (ev) {
                let self = this;
                self.events.push(ev);
            },
            drawEvent: function (ev) {
                let self = this;
                let fromTime = new Date(ev.from);
                let endTime = new Date(ev.to);
                let top = self.timeToTop(fromTime.getHours(), fromTime.getMinutes());
                let height = self.timeToTop(endTime.getHours(), endTime.getMinutes()) - top;
                let time = $(`#${self.id}`).find(".time");
                let html = `<div class="event" name="ev${ev.id}"><span class="text">${ev.title}</span><div class="background"></div></div>`;
                time.append(html);
                let node = $(`#${self.id}`).find(`[name='ev${ev.id}']`);;
                $(node).css("top", top);
                $(node).css("left", ev.left + 60);
                $(node).css("width", ev.width);
                $(node).css("height", height);
                return $(node);
            },
            timeToTop: function (hour, minute) {
                let self = this;
                return hour * self.hourHeight + Math.round(self.hourHeight / 60 * minute);
            },
            reCalcHourHeight: function () {
                let self = this;
                let time = $(`#${self.id}`).find(".hour");
                $.each($(time), function (a, b) {
                    $(b).height(self.hourHeight);
                });
            },
            calcHeightToTime: function (height) {
                let self = this;
                let hour = Math.floor(height / self.hourHeight);
                let quarterCount = Math.round(height % self.hourHeight / Math.floor(self.hourHeight / 4));
                $(".hour-quarter").hide();
                $(`div[name='${hour}-${quarterCount}']`).show();
                return {
                    hour: hour,
                    quarterCount: quarterCount
                };
            },
            enterEditMode: function (eventNode) {
                let self = this;
                return self.addEditModeLayer(eventNode);
            },
            addEditModeLayer: function (ev) {
                let self = this;
                let wholeWidth = $(`#${self.id} .hour-line`).width();
                let fromTime = new Date(ev.from);
                let endTime = new Date(ev.to);
                let top = self.timeToTop(fromTime.getHours(), fromTime.getMinutes());
                let height = self.timeToTop(endTime.getHours(), endTime.getMinutes()) - top;
                let time = $(`#${self.id}`).find(".time");
                let html =
                    `<div class="event layer" name="ev${ev.id}-layer" style="z-index:1000">` +
                    ` <span class="text">${ev.title}</span>` +
                    ` <div class="background" style="opacity:1;background:rgb(51, 82, 221)"></div>` +
                    ` <div class="event-handle-top"></div>` +
                    ` <div class="event-handle-bottom"></div>` +
                    `</div>`;
                time.append(html);
                let node = $(`#${self.id}`).find(`[name='ev${ev.id}-layer']`);
                $(node).css("top", top);
                $(node).css("left", 60);
                $(node).css("width", wholeWidth);
                $(node).css("height", height);
                self.regEventNodeLayerEvent(ev, $(node));
                self.regEventHanbleEvent($(node), $(node).find(".event-handle-top"), 1, ev);
                self.regEventHanbleEvent($(node), $(node).find(".event-handle-bottom"), 2, ev);
                return node;
            },
            registerTouchEventForEventNode: function (node, ev) {
                let self = this;
                let touchTimer = null;

                $(node).bind("mousedown touchstart", function () {
                    touchTimer = setTimeout(() => {
                        let layerNode = self.enterEditMode(ev);
                        $(layerNode).trigger("mousedown");
                        $(layerNode).bind("mouseup touchend", function (e) {
                            e.preventDefault();
                            regEvent_ClickOtherPlaceCancel(layerNode, function () {
                                $(layerNode).remove();
                            });
                        });
                    }, 500);
                });
                $(node).bind("mouseup touchend", function (e) {
                    if (touchTimer) {
                        clearTimeout(touchTimer);
                    }
                });
            },
            resetTime: function () {
                let self = this;
                $(".hour-quarter").hide();
                self.analysisEvents();
                self.drawEvents();
            },
            regEventNodeLayerEvent: function (ev, node) {
                let self = this;
                let ox = 0;
                let oy = 0;
                let dragStart = false;
                let time = null;
                $(node).bind("mousedown touchstart", function (e) {
                    if ($(e.target).attr("class") == "event-handle-top" || $(e.target).attr("class") == "event-handle-bottom") {
                        return;
                    }

                    dragStart = true;
                    otop = parseInt($(node).css("top"));
                    x=self.mouse.x;
                    y=self.mouse.y;

                    ox = x;
                    oy = y;
                    $(`#${self.id}`).css("overflow", "hidden");
                });
                $(document).bind("mousemove touchmove", function (e) {
                    let x = 0;
                    let y = 0;
                    if (e.touches) {
                        x = e.touches[0].clientX;
                        y = e.touches[0].clientY;
                    }
                    else {
                        x = e.clientX;
                        y = e.clientY;
                    }

                    let dy = y - oy;
                    if (dragStart) {
                        let height = otop + dy;
                        $(node).css("top", otop + dy);
                        time = self.calcHeightToTime(height);
                    }
                });
                $(node).bind("mouseup touchend", function (e) {
                    dragStart = false;
                    $(`#${self.id}`).css("overflow", "auto");
                    let evDate = new Date(ev.from);
                    let hour = evDate.getHours();
                    let minute = evDate.getMinutes();
                    $(node).css("top", time.hour*self.hourHeight+time.quarterCount*(self.hourHeight/4));
                    if (time && (hour != time.hour || minute != time.quarterCount * 15)) {
                        evDate.setHours(time.hour);
                        evDate.setMinutes(time.quarterCount * 15);
                        let duration = Math.floor(new Date(ev.to) - new Date(ev.from)) / 1000;
                        ev.from = `${evDate.getFullYear()}-${('0' + (evDate.getMonth() + 1)).substr(-2, 2)}-${('0' + evDate.getDate()).substr(-2, 2)} ${('0' + evDate.getHours()).substr(-2, 2)}:${('0' + evDate.getMinutes()).substr(-2, 2)}`;
                        evDate.setSeconds(evDate.getSeconds() + duration);
                        ev.to = `${evDate.getFullYear()}-${('0' + (evDate.getMonth() + 1)).substr(-2, 2)}-${('0' + evDate.getDate()).substr(-2, 2)} ${('0' + evDate.getHours()).substr(-2, 2)}:${('0' + evDate.getMinutes()).substr(-2, 2)}`;
                        self.resetTime();
                    }
                });
            },
            setTime: function (ev, newTime) {
                let self=this;
                let nodeTime = self.changeEventDuration.type==1?ev.from:ev.to;
                let evDate = new Date(nodeTime);
                let hour = evDate.getHours();
                let minute = evDate.getMinutes();
                if (newTime && (hour != newTime.hour || minute != newTime.quarterCount * 15)) {
                    evDate.setHours(newTime.hour);
                    evDate.setMinutes(newTime.quarterCount * 15);
                    if(self.changeEventDuration.type==1){
                        ev.from = `${evDate.getFullYear()}-${('0' + (evDate.getMonth() + 1)).substr(-2, 2)}-${('0' + evDate.getDate()).substr(-2, 2)} ${('0' + evDate.getHours()).substr(-2, 2)}:${('0' + evDate.getMinutes()).substr(-2, 2)}`;
                    }
                    else{
                        ev.to = `${evDate.getFullYear()}-${('0' + (evDate.getMonth() + 1)).substr(-2, 2)}-${('0' + evDate.getDate()).substr(-2, 2)} ${('0' + evDate.getHours()).substr(-2, 2)}:${('0' + evDate.getMinutes()).substr(-2, 2)}`;
                    }

                    self.resetTime();
                }
            },
            regEventHanbleEvent: function (node, handleNode,type, ev) {
                let self = this;
                let dragStart = false;
                let ox = 0;
                let oy = 0;
                let otop = 0;
                let obottom = 0;
                let oheight = 0;
                let time = null;
                $(handleNode).bind("mousedown touchstart", function (e) {
                    dragStart = true;
                    otop = parseInt($(node).css("top"));
                    obottom = parseInt($(node).css("bottom"));
                    oheight = parseInt($(node).css("height"));
                    if (e.touches) {
                        x = e.touches[0].clientX;
                        y = e.touches[0].clientY;
                    }
                    else {
                        x = e.clientX;
                        y = e.clientY;
                    }

                    ox = x;
                    oy = y;
                    $(`#${self.id}`).css("overflow", "hidden");
                    self.changeEventDuration.type=type;
                });
                $(document).bind("mousemove touchmove", function (e) {
                    let x = 0;
                    let y = 0;
                    if (e.touches) {
                        x = e.touches[0].clientX;
                        y = e.touches[0].clientY;
                    }
                    else {
                        x = e.clientX;
                        y = e.clientY;
                    }

                    let dy = y - oy;
                    if (dragStart) {
                        if (self.changeEventDuration.type==1) {
                            $(node).css("top", otop + dy);
                            $(node).css("height", oheight - dy);
                            time = self.calcHeightToTime(otop + dy);
                        }
                        else {
                            $(node).css("bottom", obottom + dy);
                            $(node).css("height", oheight + dy);
                            time = self.calcHeightToTime(otop+oheight+dy);
                        }

                    }
                });
                $(node).bind("mouseup touchend", function (e) {
                    if(dragStart){
                        dragStart = false;
                        $(`#${self.id}`).css("overflow", "auto");
                        if(self.changeEventDuration.type==1){
                            $(node).css("top",time.hour*self.hourHeight+time.quarterCount*(self.hourHeight/4));
                        }
                        else{
                            $(node).css("height",time.hour*self.hourHeight+time.quarterCount*(self.hourHeight/4)-parseInt($(node).css("top")));
                        }

                        self.setTime(ev, time);
                    }
                });
            }
        },
        created: function () {
            let self = this;
        }
    });

    let self = this;
    self.instance.init();
    $("#{0}".format(self.id)).scroll(function (e) {

    });
}