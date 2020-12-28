const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const ffmpegPath = require('ffmpeg-static');
const SHA1 = require("crypto-js/sha1");
const UTF8 = require("crypto-js").enc.UTF8;

const {exec} = require('child_process');

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
                    return {"path": file.path, "frames": stream.nb_frames, "hash": SHA1(file.path).toString(UTF8), "gender": ""};
                }
            }
        }).then(videoData => {
            const frameNumber = Math.floor(videoData.frames / 2);
            const makeThumbnail = [
                `"${ffmpegPath}"`, '-i', `"${videoData.path}"`,
                '-vf', `"select=eq(n\\,${frameNumber})"`,
                '-vframes', '1', '"' + path.join(thumbnailPath, `${videoData.hash}-${frameNumber}.png`) + '"'
            ].join(" ");

            exec(makeThumbnail, err => {
                console.log(err);
                app.videos.push(videoData);
            });
        });
    }
};