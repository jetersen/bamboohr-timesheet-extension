# BambooHR Timesheet Extension

> A browser extension to automagically fill out the timesheet on BambooHR.

## Features

- Automatically fill empty, editable weekday entries on BambooHR with `7,4` hours and save the changes, excluding entries with leave information.
- Wait for asynchronously rendered inputs and save controls, including on slow page loads.

## Install

[link-chrome]: https://chrome.google.com/webstore/detail/bamboohr-timesheet-extens/fpfibmnbfankihbpmgapkhpchnkmeboc "Version published on Chrome Web Store"
[link-firefox]: https://addons.mozilla.org/firefox/addon/bamboohr-timesheet-extension/ "Version published on Mozilla Add-ons"

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" valign="middle">][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/fpfibmnbfankihbpmgapkhpchnkmeboc.svg?label=%20">][link-chrome] and other Chromium based browsers

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/firefox/firefox.svg" width="48" alt="Firefox" valign="middle">][link-firefox] [<img valign="middle" src="https://img.shields.io/amo/v/bamboohr-timesheet-extension.svg?label=%20">][link-firefox] and other Firefox based browsers

Install the extension from the [Chrome Web Store][link-chrome] or [Firefox Add-ons][link-firefox].

## Development

### Build locally

Use Node.js 24 LTS (`nvm use` reads `.nvmrc`).

1. Run `npm ci` to install dependencies.
2. Run `npm run build` for the Chrome extension in `distribution`.
3. Run `npm run build:firefox` for the Firefox extension in `distribution-firefox`.

Vite+ runs the build, linting, formatting, and Vitest tests. CRXJS packages the manifest and content script as a self-contained bundle. Configuration lives in `vite.config.ts`; no global tools are required.

Run `npm test` for static checks, DOM regression tests, both production builds, and package validation. The regression tests use isolated fixtures and never contact BambooHR. Run `npm run lint-fix` to apply the default formatter and automatic lint fixes.

### Run the extension

1. Run `npm run dev` for Chrome or `npm run dev:firefox` for Firefox.
2. In Chrome, open `chrome://extensions`, enable Developer mode, and load `distribution` using **Load unpacked**.
3. In Firefox, open `about:debugging#/runtime/this-firefox`, select **Load Temporary Add-on**, and choose `distribution-firefox/manifest.json`.

Use a dedicated browser profile for development. The content script automatically fills and saves eligible timesheet entries. Automatic extension reloads are disabled to avoid repeating those actions after code edits; reload the extension and target page manually when testing changes.

### Publishing

The Test workflow runs checks, both browser builds, package validation, and `npm audit` on pushes and pull requests. Pushes to `main` also run the Release workflow, which publishes browser-specific packages to both stores using calendar versions (`YY.M.D`, with a time suffix for additional releases on the same day). The workflow can also be run manually. Publishing uses the `Chrome` and `Firefox` environments for store credentials. The Firefox source upload includes the lockfile, build configuration, and build instructions needed to reproduce the package.

## License

See [LICENSE](./LICENSE)
