# Relief Forge desktop

The web app (`../index.html`) in its own window, plus:

- **Native AI runtime** (ONNX Runtime for Node): DirectML on Windows, used instead of WebGPU when it works. Linux uses WebGPU first, then the native CPU runtime. Switch it off under Setup → Graphics.
- **Native save dialogs**, remembering the last folder for each kind of file.
- **Works offline** after the first run: the models are cached by the app, and the scripts and fonts it loads from CDNs are kept in the app's data folder.

## Releases

GitHub builds them (`.github/workflows/desktop.yml`). Push a tag such as `v2.0.1` and a draft Release appears with:

- `Relief-Forge-<version>-windows-setup.exe`: installs for you only (no admin needed), with a Start menu entry. **Recommended.**
- `Relief-Forge-<version>-windows-portable.exe`: one file, no install. It unpacks itself to the Temp folder on each start; on some PCs Temp's permissions stop Chromium's sandbox from reading it and the app closes at once (the zip or setup avoid this).
- `Relief-Forge-<version>-windows-x64.zip`: the same app unpacked: extract it anywhere and run `Relief Forge.exe`. Starts faster and antivirus tools are calmer about it.
- `Relief-Forge-<version>-linux-x86_64.AppImage`: `chmod +x` it and run it (Ubuntu 22.04+ needs `sudo apt install libfuse2`)
- `Relief-Forge-<version>-linux-amd64.deb`: `sudo apt install ./Relief-Forge-<version>-linux-amd64.deb`

The files aren't code-signed, so Windows SmartScreen asks to confirm the first time (More info → Run anyway). Each file has a build-provenance attestation instead: `gh attestation verify <file> --repo SnazzyGaz/DepthNormal`.

On Linux, if the window is black or glitchy, start it with `--no-vulkan`.

## Building it yourself

```
cd desktop
npm ci
npm start              # run from source
npm run dist:win       # or dist:linux
```

`npm start` and the builds copy `../index.html` into `app/` first and stamp it with the version from `package.json`.
