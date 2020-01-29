# Angular Big App Schematic

A schematic like `ng new` but with easy module and component generation built in allowing you to scaffold out an angular workspace with any number of modules and component.

[![npm](https://img.shields.io/npm/v/big-app.svg)](https://www.npmjs.com/package/big-app)

## Getting started

```bash
npm i -g big-app
```

```bash
ng new --collection=big-app
```

_or with inline options_

```bash
ng new --collection=big-app --modules 3 --components 3
```

## Features

The schematic will create an Angular workspace with 2 apps and a lib with the `app-one` application containing the modules and components requested.

<details><summary>Example Output (2 modules & components)</summary>

```text
.
├── projects
│   ├── app-one
│   │   ├── e2e
│   │   │   ├── src
│   │   │   │   ├── app.e2e-spec.ts
│   │   │   │   └── app.po.ts
│   │   │   ├── protractor.conf.js
│   │   │   └── tsconfig.json
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── a-mod
│   │   │   │   │   ├── a-mod-a-comp
│   │   │   │   │   │   ├── a-mod-a-comp.component.css
│   │   │   │   │   │   ├── a-mod-a-comp.component.html
│   │   │   │   │   │   ├── a-mod-a-comp.component.spec.ts
│   │   │   │   │   │   └── a-mod-a-comp.component.ts
│   │   │   │   │   ├── a-mod-b-comp
│   │   │   │   │   │   ├── a-mod-b-comp.component.css
│   │   │   │   │   │   ├── a-mod-b-comp.component.html
│   │   │   │   │   │   ├── a-mod-b-comp.component.spec.ts
│   │   │   │   │   │   └── a-mod-b-comp.component.ts
│   │   │   │   │   ├── a-mod-routing.module.ts
│   │   │   │   │   ├── a-mod.component.css
│   │   │   │   │   ├── a-mod.component.html
│   │   │   │   │   ├── a-mod.component.spec.ts
│   │   │   │   │   ├── a-mod.component.ts
│   │   │   │   │   └── a-mod.module.ts
│   │   │   │   ├── b-mod
│   │   │   │   │   ├── b-mod-a-comp
│   │   │   │   │   │   ├── b-mod-a-comp.component.css
│   │   │   │   │   │   ├── b-mod-a-comp.component.html
│   │   │   │   │   │   ├── b-mod-a-comp.component.spec.ts
│   │   │   │   │   │   └── b-mod-a-comp.component.ts
│   │   │   │   │   ├── b-mod-b-comp
│   │   │   │   │   │   ├── b-mod-b-comp.component.css
│   │   │   │   │   │   ├── b-mod-b-comp.component.html
│   │   │   │   │   │   ├── b-mod-b-comp.component.spec.ts
│   │   │   │   │   │   └── b-mod-b-comp.component.ts
│   │   │   │   │   ├── b-mod-routing.module.ts
│   │   │   │   │   ├── b-mod.component.css
│   │   │   │   │   ├── b-mod.component.html
│   │   │   │   │   ├── b-mod.component.spec.ts
│   │   │   │   │   ├── b-mod.component.ts
│   │   │   │   │   └── b-mod.module.ts
│   │   │   │   ├── app-routing.module.ts
│   │   │   │   ├── app.component.html
│   │   │   │   ├── app.component.scss
│   │   │   │   ├── app.component.spec.ts
│   │   │   │   ├── app.component.ts
│   │   │   │   └── app.module.ts
│   │   │   ├── assets
│   │   │   │   └── .gitkeep
│   │   │   ├── environments
│   │   │   │   ├── environment.prod.ts
│   │   │   │   └── environment.ts
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── polyfills.ts
│   │   │   ├── styles.scss
│   │   │   └── test.ts
│   │   ├── browserslist
│   │   ├── karma.conf.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.spec.json
│   │   └── tslint.json
│   ├── app-two
│   │   ├── e2e
│   │   │   ├── src
│   │   │   │   ├── app.e2e-spec.ts
│   │   │   │   └── app.po.ts
│   │   │   ├── protractor.conf.js
│   │   │   └── tsconfig.json
│   │   ├── src
│   │   │   ├── app
│   │   │   │   ├── app-routing.module.ts
│   │   │   │   ├── app.component.html
│   │   │   │   ├── app.component.scss
│   │   │   │   ├── app.component.spec.ts
│   │   │   │   ├── app.component.ts
│   │   │   │   └── app.module.ts
│   │   │   ├── assets
│   │   │   │   └── .gitkeep
│   │   │   ├── environments
│   │   │   │   ├── environment.prod.ts
│   │   │   │   └── environment.ts
│   │   │   ├── favicon.ico
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   ├── polyfills.ts
│   │   │   ├── styles.scss
│   │   │   └── test.ts
│   │   ├── browserslist
│   │   ├── karma.conf.js
│   │   ├── tsconfig.app.json
│   │   ├── tsconfig.spec.json
│   │   └── tslint.json
│   └── lib-one
│       ├── src
│       │   ├── lib
│       │   │   ├── lib-one.component.spec.ts
│       │   │   ├── lib-one.component.ts
│       │   │   ├── lib-one.module.ts
│       │   │   ├── lib-one.service.spec.ts
│       │   │   └── lib-one.service.ts
│       │   ├── public-api.ts
│       │   └── test.ts
│       ├── karma.conf.js
│       ├── ng-package.json
│       ├── package.json
│       ├── README.md
│       ├── tsconfig.lib.json
│       ├── tsconfig.spec.json
│       └── tslint.json
├── .editorconfig
├── .gitignore
├── angular.json
├── package.json
├── README.md
├── tsconfig.json
└── tslint.json
```

</details>

### Modules

The schematic will generate the desired number of lazy modules with an alphabet increasing identifier.

For example, `3` modules would generate:

- `/a-mod`
- `/b-mod`
- `/c-mod`

The lazy loaded route definitions for each module will be added to the `app-routing.module.ts` file.

### Components

The schematic will generate the desired number of components in each module with an alphabet increasing identifier.

For each component `ng generate component` is called producing the usual `*.ts`, `*.scss`, `*.html`, `*.spec.ts` files.

For example, `3` components would generate:

- `a-mod-a-comp/`
- `a-mod-b-comp/`
- `a-mod-c-comp/`
