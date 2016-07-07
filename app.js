"use strict";

import "purecss";

let component, props;

const React = require("react"),
    ReactDOM = require("react-dom"),
    FocusContainer = require("itsa-react-focuscontainer"),
    Select = require("./lib/component-styled.jsx");

props = {
    props1: {
        readOnly: false,
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
        listHeight: "40px",
        onChange(newSelected) {
            props.props1.selected = newSelected;
            render();
        },
        required: true,
        markRequired: true
    },
    props2: {
        readOnly: false,
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
            props.props2.selected = newSelected;
            render();
        },
        required: true,
        selected: 2,
        markRequired: true
    }
};

const MyForm = React.createClass({
    render() {
        const props = this.props;
        return (
            <FocusContainer
                className="main-container"
                selector=".itsa-formelement">
                <Select {...props.props1} />
                <Select {...props.props2} />
            </FocusContainer>

        );
    }

});

const render = () => {
    ReactDOM.render(
         <MyForm {...props} />,
        document.getElementById("component-container")
    );
};

render();