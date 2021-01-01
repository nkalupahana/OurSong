let app;
let packageLocation = "";
const path = require('path');
const fs = require("fs");
const { dialog } = require('electron').remote;
const WaveformData = require('waveform-data');
const yaml = require('js-yaml');

window.addEventListener('DOMContentLoaded', () => {
    const layouts = yaml.load(fs.readFileSync('./layouts.yaml', 'utf8'));
    app = new Vue({
        el: '#app',
        data: {
            // TO SAVE
            state: 0,
            videos: [],
            audio: {},
            sectionPoints: [],
            layouts: {},
            // TEMP
            processing: [],
            currentVideo: 0,
            // CONST
            states: ["Setup", "Add Videos", "Add Master Audio", "Synchronize Videos", "Create Video Segments", "Window Faces", "Customize", "Export"],
            constLayouts: layouts
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
            accSections: () => {
                let ret = [];
                for (let i = 0; i < app.sectionPoints.length - 1; ++i) {
                    ret.push(`${app.sectionPoints[i]} - ${app.sectionPoints[i + 1]}`);
                }

                return ret;
            }
        },
        methods: {
            thumbnail: video => {
                return path.join(packageLocation, "thumbnails", `${video.hash}-${Math.floor(video.duration / 2)}.png`);
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
        watch: {
            state: () => {
                // Clear variables marked TEMP in app data
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
        JSON.stringify({"state": app.state, "audio": app.audio, 
            "videos": app.videos, "sectionPoints": app.sectionPoints, "layouts": app.layouts}));
}

const debouncedAutoSave = _.debounce(autosave, 2000);

function nextState() {
    app.state += 1;
}

function setState(state) {
    app.state = state;
}