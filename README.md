# multistore-electron

> A Point of sale (POS) Multistore app using electron

## Table of Contents

- [Setup](#Setup)
- [Folder Structure](#FolderStructure)
- [Support](#support)
- [Contributing](#contributing)

### Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

# Fix all  linting errors`
npm run lint:fix

```

> Folder structure options and naming conventions for software projects

### Folder Structure

    .
    ├── build                   # Contains Compiled installation files and .exe
       └── icons                # Contains icons to be used for the electron app
                                  The format for windows must be '.ico' and size 256*256
    ├── dist                    # Contains built assets. This folder is used by electron builder to package the
                                  app.asar files. 
        ├── electron            # This folder contains built files for the electron version of the app. The javacript files are numbered because we are using leveraging code spliting instead of having one big main.js file.  
            ├── fonts           # Contains fonts used in the built electron app
            ├── imgs            # Contains images used in the built electron app
            ├── static          # Contains asset files used in the built electron app
            ├── index.html      # Main Html file used in the built electron app. This file loads the renderer.js, service-worker.js, vendor.js, manifest.js, main.js and styles.css files
            ├── main.js         # This is our output bundle, it dynamically (lazy loading) calls the numbered javascript files based on the visited routes
            └── README.md                                 
    ├── docs                    # Documentation files (alternatively `doc`)
    ├── src                     # Source files (alternatively `lib` or `app`)
    ├── test                    # Automated tests (alternatively `spec` or `tests`)
    ├── tools                   # Tools and utilities
    ├── LICENSE
    └── README.md
---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[7c4e3e9](https://github.com/SimulatedGREG/electron-vue/tree/7c4e3e90a772bd4c27d2dd4790f61f09bae0fcef) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
