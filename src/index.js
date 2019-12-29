const {app, BrowserWindow, globalShortcut} = require('electron');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  // and load the url of the app.
  mainWindow.loadURL('https://music.yandex.ru');

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  bindMediaKeys();
};

/**
 * Registers media keys to control tracks.
 */
function bindMediaKeys() {
  let ret;
  ret = globalShortcut.register('MediaPlayPause', () => callAPI('togglePause()'));
  if (!ret) logBindError('MediaPlayPause');

  ret = globalShortcut.register('MediaNextTrack', () => callAPI('next()'));
  if (!ret) logBindError('MediaNextTrack');

  ret = globalShortcut.register('MediaPreviousTrack', async () => {
    if (await callAPI('getProgress().position >= 5')) {
      callAPI('setPosition(0)');
    } else {
      callAPI('prev()');
    }
  });
  if (!ret) logBindError('MediaPreviousTrack');
}

/**
 * Calls yandex api in main window.
 * @param {string} command
 * @returns {!Promise<any>}
 */
function callAPI(command) {
  return execute(`window.externalAPI.${command}`);
}

/**
 * Executes js in main window.
 * @param {string} expression
 * @returns {!Promise<any>}
 */
function execute(expression) {
  return mainWindow.webContents.executeJavaScript(expression);
}

function logBindError(key) {
  console.log(`Cant bind global shortcut', 'Cant bind ${key}. Closing tab. \nPossible second opened tab?`);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
