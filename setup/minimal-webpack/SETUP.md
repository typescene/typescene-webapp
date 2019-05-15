# Minimal Webpack setup

This folder contains files for a minimal Typescene Web application setup using the 'current' version of Webpack. Copy these files to your new project to get started.

### Files

The following files are included:

* Configuration files
    * [`src/tsconfig.json`](./src/tsconfig.json) - TypeScript configuration
    * [`src/webpack.config.js`](./src/webpack.config.js) - Webpack configuration
* HTML output (copied on build)
    * [`src/public/index.html`](./src/public/index.html)
* Source code
    * [`src/app.ts`](./src/app.ts) - application entry point
    * [`src/activities/main/activity.ts`](./src/activities/main/activity.ts) - main activity
    * [`src/activities/main/view/index.ts`](./src/activities/main/view/index.ts) - main view

### NPM Package

Install all dependencies to your NPM package using the following commands. Run these in the command line from your new project folder:

    npm install -D typescript
    npm install -D webpack webpack-cli webpack-dev-server
    npm install -D copy-webpack-plugin ts-loader
    npm install @typescene/webapp

Alternatively, copy the below configuration to your own `package.json` file, and run `npm install` on the command line afterwards.

    {
        "name": "my-app",
        "private": true,
        "version": "1.0.0",
        "description": "",
        "main": "",
        "scripts": {
            "dev": "webpack-dev-server --hot --config src/webpack.config.js",
            "build": "webpack -p --config src/webpack.config.js"
        },
        "keywords": [],
        "author": "",
        "license": "UNLICENSED",
        "dependencies": {
            "@typescene/webapp": "^2.0.0"
        },
        "devDependencies": {
            "typescript": "^3.4.5",
            "webpack": "^4.31.0",
            "webpack-cli": "^3.3.2",
            "webpack-dev-server": "^3.3.1",
            "copy-webpack-plugin": "^5.0.3",
            "ts-loader": "^6.0.0"
        }
    }
