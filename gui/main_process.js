const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron

const spawn = require('child_process').spawn
const net = require('net')


// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

// To avoid being garbage collected
let mainWindow
let synthClient

const SynthBackend = {
  host: 'localhost',
  port: 3333,
}

const DefaultWindowConfig = {
  width: 800,
  height: 600,
}

const RENDER_TO_MAIN_IPC_CHAN = 'update'

// start synth process
spawn('cargo', ['run', '..'])

app.on('ready', () => {

  // create socket to backend process
  synthClient = net.Socket()

  // if there is an error connecting, retry connecting
  synthClient.on('error', (error) => {
    synthClient.connect(SynthBackend);  
  })
  
  // attempt to connect
  synthClient.connect(SynthBackend);

  synthClient.on('connect', () => {
    // we are now connected to the synth backend
    
    // setup main windows
    mainWindow = new BrowserWindow(DefaultWindowConfig)
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)

    // listen for responses from backend and send directly to renderer process
    synthClient.on('data', (data) => {
      // parse the incoming data to send the updates to the appropriate component
      // each incoming message should be a JSON object where the top level keys are the
      // ids of the components which need to be updated.
      jsonData = JSON.parse(data)
      for (const component in jsonData) {
        mainWindow.webContents.send(component, JSON.stringify(jsonData[component])) 
      }
    })
    
    // listen for incoming ipc from renderer process
    ipcMain.on(RENDER_TO_MAIN_IPC_CHAN, (event, data) => {
      // on each incoming message, relay directly to the synth backend.
      synthClient.write(data)
    })    
  })
})

