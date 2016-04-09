[![Build Status](https://travis-ci.org/ItsAsbreuk/COMPONENT_NAME.svg?branch=master)](https://travis-ci.org/ItsAsbreuk/itsa-react-select)

Nice select for react.

Lightweight, focussable and responses to the keyboard.

## How to use:

```js
const ReactDOM = require("react-dom"),
      Component = require("itsa-react-select");

let props = {
    checked: true
};

const handleChange = () => {
    props.checked = !props.checked;
    renderCheckBox();
};

const renderCheckBox = () => {
    ReactDOM.render(
        <Component {...props} onChange={handleChange} />,
        document.getElementById("container")
    );
};

renderCheckBox();
```

## About the css

You need the right css in order to make use of `itsa-react-select`. There are 2 options:

1. You can use the css-files inside the `css`-folder.
2. You can use: `Component = require("itsa-react-select/lib/component-styled.jsx");` and build your project with `webpack`. This is needed, because you need the right plugin to handle a requirement of the `scss`-file.


[View live example](http://projects.itsasbreuk.nl/react-components/itsa-select/component.html)

[API](http://projects.itsasbreuk.nl/react-components/itsa-select/api/)