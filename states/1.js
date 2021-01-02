const ffprobe = require('ffprobe');
const ffprobeStatic = require('ffprobe-static');
const ffmpegPath = require('ffmpeg-static');
const SHA1 = require("crypto-js/sha1");
const UTF8 = require("crypto-js").enc.UTF8;

const {exec} = require('child_process');

function videoInput() {
    document.getElementById('videoInput').click();
}

function deleteVideo(index) {
    if (confirm("Are you sure you want to delete this video?")) {
        app.videos.splice(index, 1);
    }
}

function ingestVideoInput(event) {
    for (let file of event.target.files) {
        if (!file.type.match('video')) {
            const notyf = new Notyf({duration: 4000});
            notyf.error("Non-video file skipped.");
            continue;
        }

        if (_.where(app.videos, {path: file.path}).length != 0) {
            const notyf = new Notyf({duration: 4000});
            notyf.error("Duplicate video skipped.");
            continue;
        }

        app.processing.push(file.path);

        const thumbnailPath = path.join(packageLocation, "thumbnails");
        if (!fs.existsSync(thumbnailPath)) {
            fs.mkdirSync(thumbnailPath);
        }

        console.log("0");

        ffprobe(file.path, {path: ffprobeStatic.path}).then(info => {
            console.log("1");
            for (let stream of info.streams) {
                if (stream.codec_type == "video") {
                    console.log(stream);
                    return {"path": file.path, "frames": stream.nb_frames, "width": stream.width, "height": stream.height, "hash": SHA1(file.path).toString(UTF8), "gender": "", "duration": Number(stream.duration), sync: {}, layouts: {}};
                }
            }
        }).then(videoData => {
            console.log("2");
            const halftime = Math.floor(videoData.duration / 2);
            var measuredTime = new Date(null);
            measuredTime.setSeconds(halftime);
            var HMStime = measuredTime.toISOString().substr(11, 8);
            const makeThumbnail = [
                `"${ffmpegPath}"`, '-y', '-ss', HMStime, '-i', `"${videoData.path}"`,
                '-frames:v', '1', '"' + path.join(thumbnailPath, `${videoData.hash}-${halftime}.png`) + '"'
            ].join(" ");

            return new Promise((res, _rej) => {
                exec(makeThumbnail, err => {
                    console.log(err);
                    res(videoData);
                });
            });
        }).then(videoData => {
            console.log("3");
            const audioContext = new AudioContext();
            fetch(videoData.path)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const options = {
                        audio_context: audioContext,
                        array_buffer: buffer,
                        scale: 128
                    };

                    return new Promise((resolve, reject) => {
                        WaveformData.createFromAudio(options, (err, waveform) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(waveform);
                            }
                        });
                    });
                })
                .then(waveform => {
                    console.log("4");
                    if (_.where(app.videos, {path: file.path}).length != 0) {
                        const notyf = new Notyf({duration: 4000});
                        notyf.error("Duplicate video skipped.");
                        return;
                    }

                    videoData.waveform = {};
                    videoData.waveform.secondsPerPixel = waveform.seconds_per_pixel;
                    videoData.waveform.length = waveform.length;
                    videoData.waveform.max = [];
                    videoData.waveform.min = [];

                    for (let i = 0; i < waveform.length; ++i) {
                        videoData.waveform.max.push(waveform.channel(0).max_sample(i));
                        videoData.waveform.min.push(waveform.channel(0).min_sample(i));
                    }

                    app.processing = _.without(app.processing, file.path);
                    app.videos.push(videoData);
                });            
        });
    }
};