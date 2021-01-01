Vue.component('layout-picker', {
    props: ["layouts", "timerange"],
    data: () => {
        return {
            canvasWidth: 90,
            canvasHeight: 160,
            constLayouts: app.constLayouts
        }
    },
    template: `<div ref="main"><layout style="margin-right: 12px;" v-for="(layout, key) in constLayouts" :timerange="timerange" :layout="layout" :width="canvasWidth" :height="canvasHeight" :skey="key" :layouts="layouts"></layout></div>`,
    mounted () {
        for (let el of this.$refs.main.querySelectorAll("canvas")) {
            console.log(this);
            el.addEventListener("click", () => {
                Vue.set(app.layouts, this.timerange, el.getAttribute("skey"));
            });
        }
    }
});