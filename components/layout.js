Vue.component('layout', {
    props: ["layout", "layouts", "width", "height", "timerange", "skey"],
    template: `<canvas :skey="skey" :class="{ blueBorder:  (layouts[timerange] && (layouts[timerange].name == skey)) }" :width="width" :height="height" ref="canvas"></canvas>`,
    mounted () {
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = 'grey';
        for (let lay of this.layout) {
            lay = lay.split(" ");
            ctx.fillRect(canvas.width * lay[0],canvas.height * lay[1],canvas.width * lay[2],canvas.height * lay[3]);
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.moveTo(canvas.width * lay[0],canvas.height * lay[1]);
            ctx.lineTo(canvas.width * lay[0] + canvas.width * lay[2], canvas.height * lay[1]);
            ctx.lineTo(canvas.width * lay[0] + canvas.width * lay[2], canvas.height * lay[1] + canvas.height * lay[3]);
            ctx.lineTo(canvas.width * lay[0], canvas.height * lay[1] + canvas.height * lay[3]);
            ctx.stroke();
        }
    }
});