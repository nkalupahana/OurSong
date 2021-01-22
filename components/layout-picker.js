Vue.component('layout-picker', {
    props: ["layouts", "timerange"],
    data: () => {
        let width = app.resolution.width;
        let height = app.resolution.height;

        while (height > 200) {
            height = height / 2;
            width = width / 2;
        }

        return {
            canvasWidth: width,
            canvasHeight: height,
            constLayouts: app.constLayouts
        }
    },
    template: `<div ref="main"><layout style="margin-right: 12px;" v-for="(layout, key) in constLayouts" :timerange="timerange" :layout="layout" :width="canvasWidth" :height="canvasHeight" :skey="key" :layouts="layouts"></layout></div>`,
    mounted () {
        for (let el of this.$refs.main.querySelectorAll("canvas")) {
            el.addEventListener("click", () => {
                Vue.set(app.layouts, this.timerange, {"name": el.getAttribute("skey")});
            });
        }
    }
});