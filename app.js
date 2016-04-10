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