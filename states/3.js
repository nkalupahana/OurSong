function playSyncedTracks() {
    let mainAudio = document.getElementById("mainAudioPlay");
    let userAudio = document.getElementById("userAudioPlay");
    if (mainAudio.paused) {
        mainAudio.currentTime = 0;
        userAudio.currentTime = calculateUserStartTime();
    
        mainAudio.play();
        userAudio.play();
    } else {
        mainAudio.pause();
        userAudio.pause();
    }
}

function adjustVolume(el, id) {
    document.getElementById(id).volume = el.value / 100;
}

function calculateUserStartTime() {
    const userTime = calculateWaveformTime(document.getElementById("waveform" + app.currentVideo), app.videos[app.currentVideo].waveform.secondsPerPixel);
    const mainTime = calculateWaveformTime(document.getElementById("waveform-1"), app.audio.waveform.secondsPerPixel);
    return userTime - mainTime;
}

function syncWithVue() {
    app.videos[app.currentVideo].sync.startTime = calculateUserStartTime();    
    app.videos[app.currentVideo].sync.mainTransform = document.getElementById("waveform-1").getContext("2d").getTransform().e;
    app.videos[app.currentVideo].sync.childTransform = document.getElementById("waveform" + app.currentVideo).getContext("2d").getTransform().e;
}

function toggleLock() {
    app.videos[app.currentVideo].sync.lock = !app.videos[app.currentVideo].sync.lock;
    app.$forceUpdate();
}

function nextUser() {
    if (!document.getElementById("mainAudioPlay").paused) {
        playSyncedTracks();
    }

    if (app.currentVideo == app.videos.length - 1) {
        app.currentVideo = 0;
    } else {
        app.currentVideo += 1;
    }
}

function prevUser() {
    if (!document.getElementById("mainAudioPlay").paused) {
        playSyncedTracks();
    }
    
    if (app.currentVideo == 0) {
        app.currentVideo = app.videos.length -1;
    } else {
        app.currentVideo -= 1;
    }
}