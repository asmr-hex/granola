# op graphical user interface
This is the graphical user interface for the op vst.

## Install
``` bash
# Clone the repository
$ git clone https://github.com/connorwalsh/op

# Go into the gui directory
$ cd op/gui

# Install dependencies
$ npm install
```

## Develop
Just run this command to start developing with hot reloading.
``` bash
$ npm start
```

## What's included
- JSX support for React.
- CSS modules support.
- JS, CSS and assets automatic bundling.
- Hot reloading via Webpack 4.


## Folder structure
```
├── gui/

    ├── app/

        ├── build/                      # Webpack 4 will manage this folder for you
            ├── bundle.css              # Bundled CSS
            ├── bundle.js               # Bundled JS
            ├── ...                     # Your images will be copied here

        ├── src/

            ├── assets/                 # Images
                ├── electron.png
                ├── react.png
                ├── webpack.png

            ├── components/             # React Components
                ├── Link/               # To keep them modularized follow this structure:
                    ├── index.jsx       # Your component's React code
                    ├── styles.css      # Your component's scoped CSS
                ├── Logo/
                    ├── index.jsx
                    ├── styles.css

            ├── App.jsx                 # React main component where everything is tied up
            ├── renderer_process.js     # Electron's renderer-process, where you React app is called.
            ├── global.css              # Global CSS and global constants go here

        ├── index.html                  # This HTML only uses build/ folder's files

    ├── main_process.js                 # Electron's main process. Whole app is launched from here
    ├── package.json
    ├── webpack.config.js               # Webpack 4 setup
```

## References
- [electron-react-webpack](https://github.com/pastahito/electron-react-webpack) -
this repo builds off of this template.
