const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron

const spawn = require('child_process').spawn
const net = require('net')


// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

// To avoid being garbage collected
let mainWindow

// start synth process
// spawn('cargo', ['run', '..'])

app.on('ready', () => {

  // create socket to backend process
  synthClient = net.Socket()

  // TODO: add retry logic to block until connected to backend
  synthClient.connect({host:'localhost', port:3333},  () => {
    console.log('connected to server!');
  });


  // setup main windows
  mainWindow = new BrowserWindow({width: 800, height: 600})
  mainWindow.loadURL(`file://${__dirname}/app/index.html`)

  // listen for responses from backend and send directly to renderer
  synthClient.on('data', (data) => {
    mainWindow.webContents.send('update', data.toString() + "!!!!")
  })
  
  // listen for incoming ipc from renderer
  ipcMain.on('update', (event, data) => {
    // on each incoming message, relay directly to the backend.
    synthClient.write(data)
  })
})
