"use strict";

import "purecss";

let component, props;

const React = require("react"),
    ReactDOM = require("react-dom"),
    Component = require("./lib/component-styled.jsx");

const Button = require("itsa-react-button/lib/component-styled.jsx");

props = {
    items: ["Marco Asbreuk", "Silke Asbreuk", "Karsten Asbreuk", "Monique Harbers", "Marco Asbreuk - 2", "Silke Asbreuk - 2", "Karsten Asbreuk - 2", "Monique Harbers - 2"],
    onChange(newSelected) {
        props.selected = newSelected;
        render();
    },
    required: true,
    formValidated: true,
    listHeight: '8em'
};

const render = () => {
    component = ReactDOM.render(
        <Component {...props} />,
        document.getElementById("component-container")
    );
};

render();

component.focus();

ReactDOM.render(
    <Button buttonText="Choose..." />,
    document.getElementById("button-container")
);