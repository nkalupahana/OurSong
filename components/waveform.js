const PIXEL_DIVISOR = 2;
const PIXEL_OFFSET = 75;

function transform(canvas, ctx, xmove, waveform) {
    clear(canvas, ctx);
    ctx.translate(xmove,0);
    draw(canvas, ctx, waveform);
}

function clear(canvas, ctx) {
    ctx.save();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

function draw(canvas, ctx, waveform) {
    const scaleY = (amplitude, height) => {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

    ctx.strokeStyle = 'black';
    ctx.beginPath();

    for (let x = 0; x < waveform.length; x++) {
        const val = waveform.max[x];
        ctx.lineTo((x/PIXEL_DIVISOR) + PIXEL_OFFSET, scaleY(val, canvas.height) + 0.5);
    }

    for (let x = waveform.length - 1; x >= 0; x--) {
        const val = waveform.min[x];
        ctx.lineTo((x/PIXEL_DIVISOR) + PIXEL_OFFSET, scaleY(val, canvas.height) + 0.5);
    }

    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.lineTo(-canvas.getContext("2d").getTransform().e + PIXEL_OFFSET, 0);
    ctx.lineTo(-canvas.getContext("2d").getTransform().e + PIXEL_OFFSET, canvas.height);
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.fill();
}

function calculateWaveformTime(canvas, secondsPerPixel) {
    return (-canvas.getContext("2d").getTransform().e) * secondsPerPixel * PIXEL_DIVISOR;
}

function renderWaveform(obj, onMount) {
    const canvas = obj.$refs.canvas;
    const ctx = canvas.getContext("2d");
    const waveform = (obj.vid == -1 ? app.audio.waveform : app.videos[obj.vid].waveform);

    let drag = {drag: false, startX: 0};
    canvas.addEventListener("mousedown", event => {
        if (!document.getElementById("mainAudioPlay").paused) {
            playSyncedTracks();
        }

        drag.drag = true;
        drag.startX = event.clientX;
    });

    canvas.addEventListener("mousemove", event => {
        if (drag.drag) {
            transform(canvas, ctx, event.clientX - drag.startX, waveform);
            if (obj.vid == -1) {
                let childCanvas = document.getElementById("waveform" + app.currentVideo);
                transform(childCanvas, childCanvas.getContext("2d"), event.clientX - drag.startX, app.videos[app.currentVideo].waveform);
            }
            drag.startX = event.clientX;
        }
    });

    canvas.addEventListener("mouseup", event => {
        drag.drag = false;
        syncWithVue();
        debouncedAutoSave();
    });

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    if (obj.vid == -1) {
        transform(canvas, ctx, (app.videos[app.currentVideo].sync.mainTransform || 0), waveform);
    } else {
        transform(canvas, ctx, (app.videos[app.currentVideo].sync.childTransform || 0), waveform);
    }
}

Vue.component('waveform', {
    props: ["vid", "update"],
    template: `<canvas ref="canvas" :class="'waveform'+vid+update" :id="'waveform' + vid" style="height: 125px; width: 80%;"></canvas>`,
    mounted () {
        renderWaveform(this, true);
    },
    updated() {
        renderWaveform(this, false);
    }
});