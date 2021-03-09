let search = function (id, longPath) {
    this.id = id;
    this.instance = new Vue({
        el: "#{0}".format(id),
        data: {
            id:id,
            zIndex:1,
            content:'search',
            currentUser:currentUser
        },
        methods: {}
    });
}