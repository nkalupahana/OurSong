let app;
let packageLocation = "";
const path = require('path');
const fs = require("fs");

window.addEventListener('DOMContentLoaded', () => {
    app = new Vue({
        el: '#app',
        data: {
            state: 0,
            videos: []
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

    fs.writeFileSync(path.join(packageLocation, "state.json"), JSON.stringify(app.$data));
}

const debouncedAutoSave = _.debounce(autosave, 1000);