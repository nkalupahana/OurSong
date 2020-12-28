async function ingestAudioInput() {
    let filePath = await dialog.showOpenDialog({
        properties: ['openFile']
    });
    
    if (!filePath || !filePath.filePaths[0]) {
        return;
    }

    app.audio = filePath.filePaths[0];
}