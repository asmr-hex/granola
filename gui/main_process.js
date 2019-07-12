const electron = require('electron')
const {app, BrowserWindow, ipcMain} = electron

const spawn = require('child_process').spawn
const net = require('net')


// Let electron reloads by itself when webpack watches changes in ./app/
require('electron-reload')(__dirname)

// To avoid being garbage collected
let mainWindow

// start synth process
spawn('cargo', ['run', '..'])

app.on('ready', () => {

  client = net.Socket()
  console.log("OKOKOKOK")
  client.connect({host:'localhost', port:3333},  () => {
    console.log('connected to server!');

    console.log("OOOOOOOOOOOOOOOOO")
    
    ipcMain.on('HI', (event, arg) => {
      client.write(arg, (data) => {
        event.returnValue = data.toString() + "!!!!!!"
      })
    })
    
    mainWindow = new BrowserWindow({width: 800, height: 600})

    mainWindow.loadURL(`file://${__dirname}/app/index.html`)
  });
})

