[![Build Status](https://travis-ci.org/ItsAsbreuk/itsa-react-select.svg?branch=master)](https://travis-ci.org/ItsAsbreuk/itsa-react-select)

Nice select for react.

Lightweight, focussable and responses to the keyboard.

## How to use:

```js
"use strict";

import "purecss";

let component, props;

const React = require("react"),
    ReactDOM = require("react-dom"),
    Component = require("./lib/component-styled.jsx");

props = {
    items: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
    className: "months",
    emptyHTML: "Choose a Month...",
    onChange(newSelected) {
        props.selected = newSelected;
        render();
    },
    required: true,
    markRequired: true
};

const render = () => {
    ReactDOM.render(
        <Component {...props} />,
        document.getElementById("component-container")
    );
};

render();
```

## About the css

You need the right css in order to make use of `itsa-react-select`. There are 2 options:

1. You can use the css-files inside the `css`-folder.
2. You can use: `Component = require("itsa-react-select/lib/component-styled.jsx");` and build your project with `webpack`. This is needed, because you need the right plugin to handle a requirement of the `scss`-file.


[View live example](http://projects.itsasbreuk.nl/react-components/itsa-select/component.html)

[API](http://projects.itsasbreuk.nl/react-components/itsa-select/api/)