let calendarYear = function (id, longPath) {
    this.id = id;
    this.instance = new Vue({
        el: "#{0}".format(id),
        data: {
            zIndex: 1,
            waterFallImage: null,
            id: id,
            year: '',
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
                let pattern = /\/calendar\/year\/(\d+)/;
                let reg = new RegExp(pattern);
                let matches = longPath.match(reg);
                if (matches) {
                    self.year = parseInt(matches[1]);
                }

                $(`#${self.id} .year-boxs`).empty();
                self.addYear(self.year - 1);
                self.addYear(self.year);
                self.addYear(self.year + 1);
                self.goYearPositon(self.year);
            },
            addYear: function (year, fromTop) {
                let self = this;
                let yearBoxs = $(`#${self.id} .year-boxs`);
                let yearHTML = '';
                let date = new Date();
                let today = `${date.getFullYear()}${('0'+date.getMonth()).substr(-2,2)}${('0'+date.getDate()).substr(-2,2)}`;
                yearHTML += `<div class="year-box" name="${year}">`;
                yearHTML += `<div class="year">${year}</div>`;
                yearHTML += `<div class="month-boxs">`;

                for (let i = 0; i < 12; i++) {
                    let firstDay = new Date(year, i, 1).getDay();
                    let lastDate = new Date(year, i + 1, 0).getDate();
                    let start = firstDay == 7 ? 0 : firstDay;
                    yearHTML += `<div class="month-box">`;
                    yearHTML += `<div class="month">${i + 1}月</div>`;
                    yearHTML += `<div class="day-box">`;
                    for (let j = 0; j < start; j++) {
                        yearHTML += `<div class='day'></div>`;
                    }

                    for (let j = 1; j <= lastDate; j++) {
                        let dayString = `${year}${('0' + i).substr(-2, 2)}${('0' + j).substr(-2, 2)}`;
                        if (dayString == today) {
                            yearHTML += `<div class='day today'>${j}</div>`;
                        }
                        else {
                            yearHTML += `<div class='day'>${j}</div>`;
                        }
                    }

                    yearHTML += `</div>`;
                    yearHTML += `</div>`;
                }

                yearHTML += `</div>`;
                yearHTML += `</div>`;
                if (fromTop) {
                    yearBoxs.prepend(yearHTML);
                }
                else {
                    yearBoxs.append(yearHTML);
                }
            },
            removeYear: function (year) {
                let self = this;
                let yearBoxs = $(`#${self.id} .year-boxs`);
                yearBoxs.find(`.year-box[name='${year}']`).remove();
            },
            goYearPositon: function (year) {
                let self = this;
                let yearBox = $(`#${self.id} .year-boxs`).find(`.year-box[name='${year}']`);
                let distance = $(yearBox).offset().top;
                $("#{0}".format(self.id)).scrollTop(distance);
            },
            isCurrentDisplayYear: function (year) {
                let self = this;
                let yearBox = $(`#${self.id} .year-boxs`).find(`.year-box[name='${year}']`)
                if ($(yearBox).offset().top < 0 && ($(yearBox).height() + $(yearBox).offset().top) > 0) {
                    return true;
                }

                if ($(yearBox).offset().top >= 0 && $(yearBox).offset().top <= $(window).height()) {
                    return true;
                }

                return false;
            },
            scrollYear: function () {
                let self = this;
                let year = self.year;
                for (let i = -1; i <= 1; i++) {
                    if (self.isCurrentDisplayYear(year + i)) {
                        year = year + i;
                        break;
                    }
                }

                if (year == self.year) {
                    return;
                }
                else if (year == self.year - 1) {
                    self.removeYear(self.year + 1);
                    self.addYear(year - 1,true);
                }
                else if (year == self.year + 1) {
                    self.removeYear(self.year - 1);
                    self.addYear(year + 1,false);
                }

                self.year = year;
            }
        },
        created: function () {
            let self = this;
        }
    });

    let self = this;
    self.instance.init();
    $("#{0}".format(self.id)).scroll(function (e) {
        self.instance.scrollYear();
    });
}