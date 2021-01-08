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
            resolution: {
                height: 1920,
                width: 1080
            },
            // TEMP (NOTE: update in watch when added/remove)
            processing: [],
            currentVideo: 0,
            currentRatio: 0,
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
            },
            stepFourComplete: () => {
                for (let section of app.accSections) {
                    if (app.layouts[section] == undefined) {
                        return false;
                    }
                }

                return true;
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
            },
            windowRatios: () => {
                let ret = [];
                for (let key in app.layouts) {
                    for (let lstr of app.constLayouts[app.layouts[key]]) {
                        lstr = lstr.split(" ");
                        ret.push(Number(lstr[2]) / Number(lstr[3]));
                    }
                }

                return _.uniq(ret);
            },
            videosRatioed: ratio => {
                let ret = 0;
                for (let video of app.videos) {
                    if (video.layouts[ratio]) {
                        ++ret;
                    }
                }

                return ret;
            },
            stepFiveComplete: () => {
                for (let video of app.videos) {
                    for (let ratio of app.windowRatios()) {
                        if (!video.layouts[ratio]) {
                            return false;
                        }
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
                app.currentRatio = 0;
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
            "videos": app.videos, "sectionPoints": app.sectionPoints, "layouts": app.layouts, "resolution": app.resolution}));
}

const debouncedAutoSave = _.debounce(autosave, 2000);

function nextState() {
    app.state += 1;
}

function setState(state) {
    if (state == 0) {
        window.location.reload();
    } else {
        app.state = state;
    }
}