async function ingestAudioInput() {
    let filePath = await dialog.showOpenDialog({
        properties: ['openFile']
    });
    
    if (!filePath || !filePath.filePaths[0]) {
        return;
    }

    let audioData = {};
    audioData.path = filePath.filePaths[0];

    const audioContext = new AudioContext();
    fetch(audioData.path)
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
            if (_.where(app.videos, {path: audioData.path}).length != 0) {
                const notyf = new Notyf({duration: 4000});
                notyf.error("Duplicate video skipped.");
                return;
            }

            audioData.waveform = {};
            audioData.waveform.secondsPerPixel = waveform.seconds_per_pixel;
            audioData.waveform.length = waveform.length;
            audioData.waveform.max = [];
            audioData.waveform.min = [];

            for (let i = 0; i < waveform.length; ++i) {
                audioData.waveform.max.push(waveform.channel(0).max_sample(i));
                audioData.waveform.min.push(waveform.channel(0).min_sample(i));
            }

            app.audio = audioData;
        });            
}