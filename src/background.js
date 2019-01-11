'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

const {autoUpdater} = require("electron-updater");
const log = require('electron-log');

import * as Splashscreen from "@trodi/electron-splashscreen";

var path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Standard scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })

//////////////////////
// AutoUpdater Logs //
//////////////////////
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

///////////////////////////
// Create default window //
///////////////////////////
function createWindow () {

  let winOptions = {
    width: 1200,
    height: 800,
    minWidth: 940,
    minHeight: 300,
    icon: path.join(__static, "icons/icon.png") 
  }

  let config = Splashscreen.Config = {
    windowOpts: winOptions,
    templateUrl: path.join(__static, "foxeed-splashscreen.jpg"),
    minVisible: 2000,
    splashScreenOpts: {
        width: 600,
        height: 337,
        transparent: true
    },
  };

  win = Splashscreen.initSplashScreen(config);

  // win.maximize();

  if (isDevelopment || process.env.IS_TEST) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    await installVueDevtools()
    createWindow()

  } else {
    autoUpdater.checkForUpdates();
    createWindow()
  }
})

/////////////////
// AutoUpdater //
/////////////////

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('auto-update', text);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Recherche de mise à jour...');
})

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('La dernière mise à jour disponible est en cours de téléchargement...');
})

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Pas de mise à jour disponible.');
})

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('update-downloaded');
})

ipcMain.on('quit-and-install-update', (event, arg) => {
  autoUpdater.quitAndInstall();
})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
