const Peaks = require('peaks.js');
let peaksPlayer;

Vue.component('peaks-waveform', {
    template: `<div>
    <div id="peaks-container">
        <div id="zoomview-container"></div>
        <br>
        <div style="height: 100px" id="overview-container">Loading...</div>
    </div>
    <br>
    <audio id="peaks-audio" :src="audioPath" controls></audio>
    </div>`,
    data: () => {
        return {
            audioPath: app.audio.path
        };
    },
    mounted() {
        const audioContext = new AudioContext();
        fetch(app.audio.path)
            .then(response => response.arrayBuffer())
            .then(buffer => audioContext.decodeAudioData(buffer))
            .then(audioBuffer => {
                let points = [];
                for (let i = 1; i < app.sectionPoints.length - 1; ++i) {
                    points.push({
                        time: app.sectionPoints[i],
                        editable: true
                    });
                }

                console.log(points);

                const options = {
                    containers: {
                        overview: document.getElementById('overview-container'),
                        zoomview: document.getElementById('zoomview-container')
                    },
                    mediaElement: document.getElementById('peaks-audio'),
                    webAudio: {
                        audioContext: audioContext,
                        audioBuffer: audioBuffer
                    },
                    points
                };

                Peaks.init(options, (err, peaks) => {
                    peaksPlayer = peaks;
                    peaks.on("points.add", syncPointsWithVue);
                    peaks.on("points.remove", syncPointsWithVue)
                    peaks.on("points.dragend", syncPointsWithVue);
                    syncPointsWithVue();
                });
            });
    }
});

function syncPointsWithVue() {
    let ret = [0];
    for (let point of peaksPlayer.points.getPoints()) {
        ret.push(Number(point.time.toFixed(3)));
    }

    ret.push(Number(peaksPlayer.player.getDuration().toFixed(3)));
    ret.sort((a, b) => a - b);
    app.sectionPoints = ret;
}