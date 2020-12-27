const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const ffmpegPath = require('ffmpeg-static');

const {exec} = require('child_process')

function videoInput() {
    document.getElementById('videoInput').click();
}

function ingestVideoInput(event) {
    for (let file of event.target.files) {
        if (!file.type.match('video')) {
            continue;
        }

        if (_.where(app.videos, {path: file.path}).length != 0) {
            const notyf = new Notyf({duration: 4000});
            notyf.error("Duplicate video skipped.");
            continue;
        }

        const thumbnailPath = path.join(packageLocation, "thumbnails");
        if (!fs.existsSync(thumbnailPath)) {
            fs.mkdirSync(thumbnailPath);
        }

        ffprobe(file.path, {path: ffprobeStatic.path}).then(info => {
            for (let stream of info.streams) {
                if (stream.codec_type == "video") {
                    app.videos.push({"path": file.path, "frames": stream.nb_frames});
                    return stream.nb_frames;
                }
            }
        }).then(frames => {
            const makeThumbnail = [
                ffmpegPath, '-i', file.path,
                '-vf', `"select=eq(n\\,${Math.floor(frames / 2)})"`,
                '-vframes', '1', path.join(thumbnailPath, "out.png")
            ].join(" ");

            exec(makeThumbnail, err => console.log(err));
        });
    }
};