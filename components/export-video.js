function log(msg) {
    document.getElementById("exportlog").innerHTML += msg + "<br>";
}

Vue.component('export-video', {
    template: `<div id="exportlog"></div>`,
    async mounted () {
        log("Export begins!");
        let finalPaths = [];
        for (let sec of app.accSections) {
            log("SECTION " + sec);
            log("STEP 1: Clipping videos:");
            const names = app.layouts[sec].names;
            const layouts = app.constLayouts[app.layouts[sec].name];
            const times = sec.split(" - ");
            let videos = [];
            let inputPaths = [];
            for (let i = 0; i < names.length; ++i) {
                videos.push(app.videos.find(vid => vid.hash == names[i]));
                inputPaths.push(path.join(packageLocation, `${videos[i].hash}.${videos[i].ext}`));
            }

            for (let i = 0; i < names.length; ++i) {
                const startTime = Number(times[0]) + Number(videos[i].sync.startTime);
                const duration = Number(times[1]) - Number(times[0]);
                const filename = SHA1(`${videos[i].hash}-${startTime}-${duration}`).toString(UTF8) + `.${videos[i].ext}`;
                const outputPath = path.join(packageLocation, filename);
                log(i);
                if (fs.existsSync(outputPath)) {
                    log("ALREADY EXISTS, SKIPPED.");
                    inputPaths[i] = filename;
                    continue;
                }

                const cmd = `${ffmpegPath} -ss ${startTime} -i '${inputPaths[i]}' -t ${duration} '${outputPath}'`;
                await new Promise((res, _rej) => {
                    exec(cmd, err => {
                        console.log(err);
                        res();
                    });
                });

                inputPaths[i] = filename;
            }

            log("STEP 2: Window Faces");
            for (let i = 0; i < names.length; ++i) {
                const oa = inputPaths[i].split(".");
                const constLayout = layouts[i].split(" ");
                const ratio = Number(constLayout[2]) / Number(constLayout[3]);
                const layout = videos[i].layouts[ratio];
                const filename = SHA1(`${oa[0]}-${layout.x}-${layout.y}-${layout.width}-${layout.height}-${app.resolution.width}-${app.resolution.height}`).toString(UTF8) + `.${oa[1]}`;
                const outputPath = path.join(packageLocation, filename);
                const inputPath = path.join(packageLocation, inputPaths[i]);

                log(i);
                if (fs.existsSync(outputPath)) {
                    log("ALREADY EXISTS, SKIPPED.");
                    inputPaths[i] = filename;
                    continue;
                }

                const cmd = `${ffmpegPath} -i '${inputPath}' -vf 'crop=iw*${layout.width}:ih*${layout.height}:iw*${layout.x}:ih*${layout.y},scale=${app.resolution.width*constLayout[2]}:${app.resolution.height*constLayout[3]}' '${outputPath}'`;
                await new Promise((res, _rej) => {
                    exec(cmd, err => {
                        console.log(err);
                        res();
                    });
                });

                inputPaths[i] = filename;
            }

            log("STEP 3: Assemble Fragments");
            let inputs = "";
            let layout = "";
            for (let i = 0; i < names.length; ++i) {
                const constLayout = layouts[i].split(" ");
                inputs += `-i ${path.join(packageLocation, inputPaths[i])} `;
                layout += `${app.resolution.width * constLayout[0]}_${app.resolution.height * constLayout[1]}|`;
            }

            const outputPath = path.join(packageLocation, SHA1(inputs + layout).toString(UTF8) + ".mp4");
            const cmd = `${ffmpegPath} ${inputs} -filter_complex 'xstack=inputs=${names.length}:${layout}' '${outputPath}'`;
            finalPaths.push(`file '${outputPath}'`);

            if (fs.existsSync(outputPath)) {
                log("ALREADY EXISTS, SKIPPED.");
                continue;
            }

            await new Promise((res, _rej) => {
                exec(cmd, err => {
                    console.log(err);
                    res();
                });
            });
        }

        {
            log("STEP 4: COMBINE!");
            const textPath = path.join(packageLocation, "files.txt");
            fs.writeFileSync(textPath, finalPaths.join("\n"));
            const outputPath = path.join(packageLocation, "combined.mp4");
            const cmd = `${ffmpegPath} -f concat -safe 0 -i ${textPath} -c copy '${outputPath}' -y`;
            console.log(cmd);

            await new Promise((res, _rej) => {
                exec(cmd, err => {
                    console.log(err);
                    res();
                });
            });
        }

        {
            log("STEP 5: AUDIO");
            const inputPath = path.join(packageLocation, "combined.mp4");
            const outputPath = path.join(packageLocation, "out.mp4");
            const cmd = `${ffmpegPath} -i '${inputPath}' -i '${app.audio.path}' -c:v copy -map 0:v:0 -map 1:a:0 '${outputPath}' -y`;

            await new Promise((res, _rej) => {
                exec(cmd, err => {
                    console.log(err);
                    res();
                });
            });

            log("DONE! " + outputPath)
        }
    }
});