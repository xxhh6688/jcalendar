let calendarMonth = function (id, longPath) {
    this.id = id;
    this.instance = new Vue({
        el: "#{0}".format(id),
        data: {
            zIndex: 1,
            waterFallImage: null,
            id: id,
            year:2021,
            month:0,
        },
        methods: {
            enterAnimation:function(){
                return 0;
            },
            leaveAnimation:function(){
                return 0;
            },
            init:function(){
                let self = this;
                let pattern = /\/calendar\/month\/(\d{4})(\d+)/;
                let reg = new RegExp(pattern);
                let matches = longPath.match(reg);
                if (matches) {
                    self.year = parseInt(matches[1]);
                    self.month = parseInt(matches[2]) - 1;
                }

                $(`#${self.id} .month-boxes`).empty();
                self.addMonth(self.year, self.month - 3);
                self.addMonth(self.year, self.month - 2);
                self.addMonth(self.year, self.month - 1);
                self.addMonth(self.year, self.month);
                self.addMonth(self.year, self.month + 1);
                self.addMonth(self.year, self.month + 2);
                self.addMonth(self.year, self.month + 3);
                self.goMonthPositon(self.year,self.month);
            },
            addMonth:function(year, month, fromTop){
                let self = this;
                if(month < 0){
                    year--;
                    month = 12 + month;
                }
                else if(month > 11){
                    year++;
                    month = month - 12;
                }

                let monthBoxes = $(`#${self.id} .month-boxes`);
                let monthHTML = '';
                let date = new Date();
                let today = `${date.getFullYear()}${('0'+date.getMonth()).substr(-2,2)}${('0'+date.getDate()).substr(-2,2)}`;
                year = new Date(year, month).getFullYear();
                month = new Date(year, month).getMonth();
                monthHTML += `<div class="month-box" name="${year}-${month}">`;
                monthHTML += `<div class="month">`;
                let firstDate = parseInt(new Date(year, month, 1).getDay());
                let lastDate = new Date(year, month + 1, 0).getDate();
                firstDate = firstDate==7?0:firstDate;
                for(let i=0;i<7;i++){
                    if(i == firstDate){
                        monthHTML += `<div class="month-text">${month+1}月</div>`;
                    }
                    else{
                        monthHTML += `<div class="month-text"></div>`;
                    }
                }

                monthHTML += `</div>`;
                monthHTML += `<div class="day-box">`;
                for(let i=0;i<firstDate;i++){
                    monthHTML += `<div class="day"></div>`;
                }

                for(let i=1;i<=lastDate;i++){
                    monthHTML += `<div class="day">${i}</div>`;
                }

                monthHTML += `</div>`;
                monthHTML += `</div>`;
                
                if (fromTop) {
                    monthBoxes.prepend(monthHTML);
                }
                else {
                    monthBoxes.append(monthHTML);
                }
            },
            removeMonth:function (year,month) {
                let self = this;
                if(month < 0){
                    year--;
                    month = 12 + month;
                }
                else if(month > 11){
                    year++;
                    month = month - 12;
                }

                let monthBox = $(`#${self.id}`);
                monthBox.find(`.month-box[name='${year}-${month}']`).remove();
            },
            goMonthPositon: function (year,month) {
                let self = this;
                let monthBox = $(`#${self.id}`).find(`.month-box[name='${year}-${month}']`);
                let distance = $(monthBox).offset().top;
                $("#{0}".format(self.id)).scrollTop(distance);
            },
            isCurrentDisplayMonth: function (year, month) {
                let self = this;
                let monthBox = $(`#${self.id}`).find(`.month-box[name='${year}-${month}']`)
                

                if ($(monthBox).offset().top >= 0 && $(monthBox).offset().top <= $(window).height()) {
                    return true;
                }

                return false;
            },
            scrollMonth: function () {
                let self = this;
                let year = self.year;
                let month = self.month;
                for (let i = -1; i <= 1; i++) {
                    let m = month + i;
                    let y = year;
                    if(m < 0){
                        m = 11;
                        y--;
                    }
                    else if(m > 11){
                        m = 0;
                        y++;
                    }

                    if (self.isCurrentDisplayMonth(y, m)) {
                        year = y;
                        month = m;
                        break;
                    }
                }

                if (year == self.year && month == self.month) {
                    return;
                }
                else if (year == self.year - 1 || month == self.month - 1) {
                    self.removeMonth(self.year, self.month + 3);
                    self.addMonth(year, month - 3, true);
                }
                else if (year == self.year + 1 || month == self.month + 1) {
                    self.removeMonth(self.year, self.month - 3);
                    self.addMonth(year, month + 3, false);
                }

                self.year = year;
                self.month = month;
            }
        },
        created: function () {
            let self = this;
        }
    });

    let self = this;
    self.instance.init();
    $("#{0}".format(self.id)).scroll(function (e) {
        self.instance.scrollMonth();
    });
}