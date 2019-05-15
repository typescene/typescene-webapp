# Minimal Parcel setup

This folder contains files for a minimal Typescene Web application setup using the 'current' version of Parcel. Copy these files to your new project to get started.

### Files

The following files are included:

* [`src/index.html`](./src/index.html) - Parcel entry point
* [`src/tsconfig.json`](./src/tsconfig.json) - TypeScript configuration
* [`src/app.ts`](./src/app.ts) - application entry point
* [`src/activities/main/activity.ts`](./src/activities/main/activity.ts) - main activity
* [`src/activities/main/view/index.ts`](./src/activities/main/view/index.ts) - main view

### NPM Package

Install all dependencies to your NPM package using the following commands. Run these in the command line from your new project folder:

    npm install -D typescript parcel-bundler
    npm install @typescene/webapp

Alternatively, copy the below configuration to your own `package.json` file, and run `npm install` on the command line afterwards.

    {
        "name": "my-app",
        "private": true,
        "version": "1.0.0",
        "description": "",
        "main": "",
        "scripts": {
            "dev": "parcel src/index.html",
            "build": "parcel build src/index.html"
        },
        "keywords": [],
        "author": "",
        "license": "UNLICENSED",
        "dependencies": {
            "@typescene/webapp": "^2.0.0"
        },
        "devDependencies": {
            "typescript": "^3.4.5",
            "parcel-bundler": "^1.12.3"
        }
    }
