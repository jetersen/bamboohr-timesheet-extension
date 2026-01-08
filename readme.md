# BambooHR Timesheet Extension

> A browser extension to automagically fill out the timesheet on BambooHR.

## Features

- Automatically fill out the timesheet on BambooHR with `7,4` hours for each day.

## Install

[link-chrome]: https://chrome.google.com/webstore/detail/bamboohr-timesheet-extens/fpfibmnbfankihbpmgapkhpchnkmeboc 'Version published on Chrome Web Store'
[link-firefox]: https://addons.mozilla.org/firefox/addon/bamboohr-timesheet-extension/ 'Version published on Mozilla Add-ons'

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" valign="middle">][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/fpfibmnbfankihbpmgapkhpchnkmeboc.svg?label=%20">][link-chrome] and other Chromium based browsers

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/firefox/firefox.svg" width="48" alt="Firefox" valign="middle">][link-firefox] [<img valign="middle" src="https://img.shields.io/amo/v/bamboohr-timesheet-extension.svg?label=%20">][link-firefox] and other Firefox based browsers

Install the extension from the [Chrome Web Store][link-chrome] or [Firefox Add-ons][link-firefox].

## Development

### Build locally

1. Clone the repository: `git clone https://github.com/jetersen/bamboohr-timesheet-extension`
2. Run `npm install` to install all required dependencies
3. Run `npm run build`

The build step will create the `distribution` folder containing the generated extension.

### Run the extension

Using [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) is recommended for automatic reloading and running in a dedicated browser instance.

1. Run `npm run watch` to watch for file changes and build continuously
2. Run `npm install --global web-ext` (only for the first time)
3. In another terminal, run `web-ext run -t chromium`

## License
See [LICENSE](./LICENSE)
