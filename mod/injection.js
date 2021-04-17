console.log("Hello from microshit :3")

const electron = require('electron');
const path = require('path');
const ipcMain = require('electron').ipcMain;

ipcMain.on('main-process-info', (event, arg) => {
    switch(arg) {
        case "original-node-modules-path":
            event.returnValue = path.resolve(electron.app.getAppPath(), 
                'node_modules');
        case "original-preload-script":
            event.returnValue = event.sender.__preload;
    }
});

class BrowserWindow extends electron.BrowserWindow {
    constructor(originalOptions) {
        let win = new electron.BrowserWindow(originalOptions);
        if (!originalOptions || !originalOptions.webPreferences) return win; // eslint-disable-line constructor-super
        const originalPreloadScript = originalOptions.webPreferences.preload;

        originalOptions.webPreferences.preload = path.join(
            process.env.modPath, 'dom.js');
        originalOptions.webPreferences.transparency = true;

        win = new electron.BrowserWindow(originalOptions);
        win.webContents.__preload = originalPreloadScript;
        return win;
    }
}

BrowserWindow.webContents;

const electron_path = require.resolve('electron');
Object.assign(BrowserWindow, electron.BrowserWindow); 
    // Assigns the new chrome-specific ones

if (electron.deprecate && electron.deprecate.promisify) {
	const originalDeprecate = electron.deprecate.promisify; 
        // Grab original deprecate promisify
	electron.deprecate.promisify = (originalFunction) => originalFunction ? 
        originalDeprecate(originalFunction) : 
            () => void 0; // Override with falsey check
}

const newElectron = Object.assign({}, electron, {BrowserWindow});
// Tempfix for Injection breakage due to new version of Electron
// Found by Zerebos (Zack Rauen)
delete require.cache[electron_path].exports;
// /TempFix
require.cache[electron_path].exports = newElectron;
