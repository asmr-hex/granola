const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron

const spawn = require('child_process').spawn
const net = require('net')
const osc = require('osc')


// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

// To avoid being garbage collected
let mainWindow
let updClient

const UDPClient = {
  host: '0.0.0.0',
  port: 57121,
}

const UDPBackend = {
  host: '127.0.0.1',
  port: 3333,
}

const DefaultWindowConfig = {
  width: 800,
  height: 600,
  webPreferences: {
    nodeIntegration: true, 
  }
}

const RENDER_TO_MAIN_IPC_CHAN = 'update'

// start synth process
spawn('cargo', ['run', '..'])

app.on('ready', () => {

  // create socket to backend process
  // synthClient = net.Socket()

  // create a UDP OSC client
  udpClient = new osc.UDPPort({
    localAddress: UDPClient.host,
    localPort: UDPClient.port,
    metadata: true
  })

  // Listen for incoming OSC bundles.
  udpClient.on("bundle", (oscBundle, timeTag, info) => {
    console.log("An OSC bundle just arrived for time tag", timeTag, ":", oscBundle);
    console.log("Remote info is: ", info);
  })
  
  // open client UDP port
  udpClient.open()

  udpClient.on("ready", () => {
    // we are now connected to the synth backend
    
    // setup main windows
    mainWindow = new BrowserWindow(DefaultWindowConfig)
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)

    // listen for responses from backend and send directly to renderer process
    // TODO fix this to receive "bundle" messages like above!
    udpClient.on('data', (data) => {
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
      // synthClient.write(data)
      updClient.send({
        address: "/s_new",
        args: [
          {
            type: "s",
            value: "default"
          },
          {
            type: "i",
            value: 100
          }
        ]
      }, UDPBackend.host, UDPBackend.port)
    })
  })
  
})

