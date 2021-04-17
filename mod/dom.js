const path = require('path');
const fs = require('fs');
const electron = require('electron');
const readFile = require('util').promisify(fs.readFile);

console.log('%cMicroshit!', 'color: #FF5200; -webkit-text-stroke: 2px black; font-size: 72px; font-weight: bold;');

const mainProcessInfo = {
    originalNodeModulesPath: electron.ipcRenderer.sendSync('main-process-info', 'original-node-modules-path'),
    originalPreloadScript: electron.ipcRenderer.sendSync('main-process-info', 'original-preload-script')
};

const Module =  require('module');
Module.globalPaths.push(mainProcessInfo.originalNodeModulesPath);
if (mainProcessInfo.originalPreloadScript) {
    process.electronBinding('command_line').appendSwitch('preload', mainProcessInfo.originalPreloadScript);
    // This hack is no longer needed due to context isolation having to be on
    //electron.contextBridge.exposeInMainWorld = (key, val) => window[key] = val; // Expose DiscordNative
    require(mainProcessInfo.originalPreloadScript);
}
