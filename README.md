## Rebel
[![Linter and Builder checker 🚀](https://github.com/SkywardAI/rebel/actions/workflows/linter-builder-checker.yml/badge.svg)](https://github.com/SkywardAI/rebel/actions/workflows/linter-builder-checker.yml) [![CodeQL](https://github.com/SkywardAI/rebel/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/SkywardAI/rebel/actions/workflows/github-code-scanning/codeql) [![Release Drafter 🚀](https://github.com/SkywardAI/rebel/actions/workflows/release-drafter.yml/badge.svg)](https://github.com/SkywardAI/rebel/actions/workflows/release-drafter.yml) [![Releasing Image 🚀](https://github.com/SkywardAI/rebel/actions/workflows/release-image.yml/badge.svg)](https://github.com/SkywardAI/rebel/actions/workflows/release-image.yml)

This frontend application is written by native javascript without use any frontend frame.\
Don't have to worry about package.json and package-lock.json, they are for linter only, see [Code Lint](#code-lint).

## Run
Because morden browsers won't let file directly read models,\
you still need support to run it by using some libraries:\
Run by npm serve:
> npx serve --cors

OR
> npm install serve\
> serve --cors

And access ports relatively
## Code Lint
**Please do code lint first before you push!**\
If you want to run code lint, you can run
> npm install\
> npm run lint
