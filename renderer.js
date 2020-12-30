let app;
let packageLocation = "";
const path = require('path');
const fs = require("fs");
const { dialog } = require('electron').remote;
const WaveformData = require('waveform-data');

window.addEventListener('DOMContentLoaded', () => {
    app = new Vue({
        el: '#app',
        data: {
            // TO SAVE
            state: 0,
            videos: [],
            audio: {},
            // TEMP
            processing: [],
            currentVideo: 0,
            // GENERAL
            states: ["Setup", "Add Videos", "Add Master Audio", "Synchronize Videos", "Create Video Segments", "Window Faces", "Customize", "Export"]
        },
        computed: {
            stepOneComplete: () => {
                for (let video of app.videos) {
                    if (!video.name || !video.gender) {
                        return false;
                    }
                }

                return true;
            },
            stepThreeComplete: () => {
                for (let video of app.videos) {
                    if (!video.sync.lock) {
                        return false;
                    }
                }
                
                return true;
            }
        },
        methods: {
            thumbnail: video => {
                return path.join(packageLocation, "thumbnails", `${video.hash}-${Math.floor(video.duration / 2)}.png`);
            }
        },
        watch: {
            state: () => {
                // Clear variables marked TEMP
                app.currentVideo = 0;
                app.processing = [];
            }
        },
        updated() {
            debouncedAutoSave();
        }
    });
});

function autosave() {
    console.log("autosave");
    if (!packageLocation || !app) {
        return;
    }

    if (app.state == 0) {
        return;
    }

    fs.writeFileSync(path.join(packageLocation, "state.json"), 
        JSON.stringify({"state": app.state, "audio": app.audio, "videos": app.videos}));
}

const debouncedAutoSave = _.debounce(autosave, 2000);

function nextState() {
    app.state += 1;
}

function setState(state) {
    app.state = state;
}