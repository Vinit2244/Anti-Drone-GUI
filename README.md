# Foreign Object Detection GUI

## Requirements

- For Linux install `libudev-dev` for usb serial port enumeration.

```bash
sudo apt-get install libudev-dev
```

- For Linux to get serial port permissions

```bash
sudo usermod -a -G dialout $USER
sudo apt-get remove modemmanager -y
```

- Install Tauri Prerequisites from [here](https://tauri.app/v1/guides/getting-started/prerequisites)
- Install NodeJS >= 18.16.0 from [here](https://nodejs.org/en)
- Install Yarn >= 3.5.1 from [here](https://yarnpkg.com/getting-started/install)

## Running in Dev Mode

Before running for the first time, install js dependencies using the following command.

```bash
yarn install
```

The following will start a dev build of the app

```bash
yarn tauri dev
```

Note: WEBKIT_DISABLE_COMPOSITING_MODE env variable will be automatically set to 1 to overcome rendering bugs.

## Compiling

```bash
yarn tauri build
```

The generated installer varies depending on the operating system where the command is executed:

- On Linux, a `.appImage` and `.deb` executables are created.
- On Windows, a `.msi` and `.exe` executables are created.
- On Mac, a `.app` and `.dmg` file is created.

The executables is saved at `src-tauri/target/release/bundle`

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer) + [XState VSCode](https://marketplace.visualstudio.com/items?itemName=statelyai.stately-vscode)
- For VS Code run the following to generate a new settings.json and select the new Typescript version

```bash
yarn dlx @yarnpkg/sdks vscode
```
