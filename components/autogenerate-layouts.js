const shuffle = require("knuth-shuffle-seeded");

// TODO: alternate m/f
function getNames() {
    let ret = [];
    for (let video of app.videos) {
        ret.push(video.hash);
    }

    return shuffle(ret);
}

Vue.component('autogenerate-layouts', {
    template: `<span></span>`,
    mounted () {
        var names = getNames();
        for (let section of app.accSections) {
            if (!app.layouts[section].names) {
                app.layouts[section].names = [];
                for (let i  = 0; i < app.constLayouts[app.layouts[section].name].length; ++i) {
                    if (names.length == 0) names = getNames();
                    app.layouts[section].names.push(names.shift());
                }
            }
        }
    }
});