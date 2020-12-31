function addDividerAtPlayhead() {
    peaksPlayer.points.add({editable: true, time: peaksPlayer.player.getCurrentTime()});
}

function deleteDividerAtPlayhead() {
    for (let point of peaksPlayer.points.getPoints()) {
        if (Math.abs(peaksPlayer.player.getCurrentTime() - point.time) < 0.25) {
            peaksPlayer.points.removeByTime(point.time);
            return;
        }
    }
}

function playSection(section) {
    const times = section.split(" - ");
    peaksPlayer.segments.add({
        startTime: Number(times[0]),
        endTime: Number(times[1]),
        editable: false
    });

    peaksPlayer.player.playSegment(peaksPlayer.segments.getSegments()[0]);
    peaksPlayer.segments.removeAll();
}