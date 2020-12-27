const { dialog } = require('electron').remote;

function clearInput(id) {
    document.getElementById(id).value = "";
}

async function openExistingProject() {
    let folderPath = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    
    if (!folderPath || !folderPath.filePaths[0]) {
        return;
    }

    folderPath = folderPath.filePaths[0];
    const statePath = path.join(folderPath, "state.json");
    if (fs.existsSync(statePath)) {
        const content = JSON.parse(fs.readFileSync(statePath));
        for (let key in content) {
            app[key] = content[key];
        }
        packageLocation = folderPath;

        app.$forceUpdate();
    } else {
        const notyf = new Notyf({duration: 4000});
        notyf.error("This is not a valid OurSong package!");
    }
}

async function createProject() {
    const projectName = document.getElementById("projectName").value;
    if (!projectName) {
        const notyf = new Notyf({duration: 3000});
        notyf.error("Please enter a name!");
        return;
    }

    let folderPath = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    
    if (!folderPath) {
        return;
    }

    folderPath = folderPath.filePaths[0];
    folderPath = path.join(folderPath, projectName + ".song");

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        packageLocation = folderPath;
        bootstrap.Modal.getInstance(document.getElementById("createModal")).hide();
        app.state = 1;
    } else {
        const notyf = new Notyf({duration: 6000});
        notyf.error("A project with that name already exists at this location. Open it in the main menu, delete it, choose a new name, or pick a different location.");
        return;
    }
}