# babel-plugin-s2s-redux-sagas-manager

> manage redux sagas

Here is the sample repository using this s2s plugin.
[https://github.com/cndlhvn/s2s-redux-actions-sample](https://github.com/cndlhvn/s2s-redux-actions-sample)

## Install

```
$ yarn add --dev babel-plugin-s2s-redux-sagas-manager
```

## Dependency

This plugin is dependent on babel-plugin-s2s-action-builders, babel-plugin-s2s-redux-sagas and babel-plugin-s2s-redux-sagas-root.

Please prepare these plugins before using this plugin.

[https://github.com/cndlhvn/babel-plugin-s2s-action-builders](https://github.com/cndlhvn/babel-plugin-s2s-action-builders)

[https://github.com/cndlhvn/babel-plugin-s2s-redux-sagas](https://github.com/cndlhvn/babel-plugin-s2s-redux-sagas)

[https://github.com/cndlhvn/babel-plugin-s2s-redux-sagas-root](https://github.com/cndlhvn/babel-plugin-s2s-redux-sagas-root)

## s2s.config.js

s2s-redux-sagas-manager plugin watch the `src/builders/*.js` files.


```js
module.exports = {
  watch: './**/*.js',
  plugins: [
    {
      test: /src\/sagas\/(?!.*index).*\.js/,
      plugin: ['s2s-redux-sagas']
    },
    {
      test: /src\/sagas\/(?!.*index).*\.js/,
      output: "index.js",
      plugin: ['s2s-redux-sagas-root',
      { input: 'src/sagas/*.js', output: "src/sagas/index.js" }]
    },
    {
      test: /src\/builders\/.*\.js/,
      plugin: ['s2s-redux-sagas-manager',
      { input: 'src/builders/*.js', output: "src/sagas/*.js" }]
    }
  ],
  templates: [
    {
      test: /src\/sagas\/.*\.js/, input: 'saga.js'
    }
  ]
}
```
## Start s2s

Start the s2s with yarn command

```
yarn run s2s
```

## Usage

#### When create a action builder file

When you create a `src/builders/*.js`, s2s creates `src/sagas/*.js` as a same name. \
For example, you create a `src/builders/user.js`, then s2s creates a `src/sagas/user.js`

#### Write action name

This plugin manages only a action name whose name end is "Request". \
If you create an action name that does not contain "Request", This plugin ignores it.


#### In:

In the action builder file, write action name with camelcase such as `getPokemonRequest` and save it.

`src/builders/pokemon.js`
```js
getPokemonRequest
```

It will be expanded like this.

#### Out:

`src/builders/pokemon.js`
```js
let getPokemonRequest;
let getPokemonSuccess;
let getPokemonFailure;
```

`src/sagas/pokemon.js`
```js
import { put, call, takeLatest } from "redux-saga/effects";
import * as actions from "../actions";
import api from "../api";

export function* handleGetPokemonRequest(action) {
  try {
    const { data } = yield call(api.getPokemonRequest, action.payload);
    yield put(actions.getPokemonSuccess(data));
  } catch (error) {
    yield put(actions.getPokemonFailure(error));
  }
}

export default [
  takeLatest(actions.getPokemonRequest.toString(), handleGetPokemonRequest)
];
```

#### Remove action name

If you remove the "action name" written in the `src/builders/*.js` file, "action name" is removed from the file with the same name in `src/sagas/`.

# Test

This plugin has two test files. \
First is babel plugin main test file named `test.js` on root directory. \
Next is a `test/index.js` that will be transformed by the plugin.

Run this command.

` npm run test`

Test will run and you can see what happen.

If you modify the target javascript source code, please change the `test/index.js`.
