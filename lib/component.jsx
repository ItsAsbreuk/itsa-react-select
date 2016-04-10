"use strict";

/**
 * Nice select for react.
 *
 *
 *
 * <i>Copyright (c) 2016 ItsAsbreuk - http://itsasbreuk.nl</i><br>
 * New BSD License - http://choosealicense.com/licenses/bsd-3-clause/
 *
 *
 * @module itsa-react-select
 * @class Select
 * @since 0.0.1
*/

import React, {PropTypes} from "react";
import ReactDOM from "react-dom";
import Button from "itsa-react-button";
import {async, later} from "itsa-utils";
import "itsa-dom";

const MAIN_CLASS = "itsa-select",
      MAIN_CLASS_PREFIX = MAIN_CLASS+"-",
      SPACED_MAIN_CLASS_PREFIX = " "+MAIN_CLASS_PREFIX,
      CONTAINER = "container",
      _SUB = "-sub",
      EMPTY_HTML = "Choose...",
      REQUIRED_MSG = "Selection is required",
      CLICK = 'click',
      KEY_TRANS_TIME = 250,
      BTN_REFOCES_TRANS_TIME = 500,
      DEF_BUTTON_PRESS_TIME = 300;

const Component = React.createClass({

    propTypes: {
        /**
         * ClassName that should be set to the select-button
         *
         * @property btnClassName
         * @type String
         * @since 0.0.1
        */
        btnClassName: PropTypes.string,

        /**
         * ClassName that should be set to the Element
         *
         * @property className
         * @type String
         * @since 0.0.1
        */
        className: PropTypes.string,

        /**
         * Whether the component is disabled
         *
         * @property disabled
         * @type Boolean
         * @since 0.0.1
        */
        disabled: PropTypes.bool,

        /**
         * The HTML that the select should show when no item is selected.
         * Defaults "Choose..."
         *
         * @property emptyHTML
         * @type String
         * @since 0.0.1
        */
        emptyHTML: PropTypes.string,

        /**
         * The errormessage to show when the Select is not validated.
         *
         * @property errorMsg
         * @type String
         * @since 0.0.1
        */
        errorMsg: PropTypes.string,

        /**
         * Whether the parent-form has been validated.
         * This value is needed to determine if the validate-status should be set.
         *
         * @property formValidated
         * @type Boolean
         * @since 0.0.1
        */
        formValidated: PropTypes.bool,

        /**
         * List with all the items, either as Strings or Objects.
         *
         * @property items
         * @type Array
         * @since 0.0.1
        */
        items: PropTypes.array.isRequired,

        /**
         * The height of the select-list. If not set, then all items are shown without a scroller.
         *
         * @property listHeight
         * @type Number
         * @since 0.0.1
        */
        listHeight: PropTypes.string,

        /**
         * Whether the Component should show an validate-reclamation (star)
         * when it requires a selected item yet when there is no item selected.
         *
         * @property markValidated
         * @type Boolean
         * @since 0.0.1
        */
        markRequired: PropTypes.bool,

        /**
         * The `onChange` function, which should update the `state`.
         *
         * @property onChange
         * @type Function
         * @since 0.0.1
        */
        onChange: PropTypes.func.isRequired,

        /**
         * Whether to Component requires a valid selection
         *
         * @property required
         * @type Boolean
         * @since 0.0.1
        */
        required: PropTypes.bool
    },

    /**
     * componentDidMount does some initialization.
     *
     * @method componentDidMount
     * @since 0.0.1
     */
    componentDidMount() {
        const instance = this;
        instance._componentNode = ReactDOM.findDOMNode(instance);
        // set outside clickHandler which watches for outside clicks that will collapse the component:
        instance.IE8_Events = !instance._componentNode.addEventListener;
        if (instance.IE8_Events) {
            document.attachEvent('on'+CLICK, instance._handleDocumentClick);
        }
        else {
            document.addEventListener(CLICK, instance._handleDocumentClick, true);
        }
    },

    /**
     * componentWilUnmount does some cleanup.
     *
     * @method componentWillUnmount
     * @since 0.0.1
     */
    componentWillUnmount() {
        const instance = this;
        instance._removeTimer && instance._removeTimer.cancel();
        if (instance.IE8_Events) {
            document.detachEvent("on"+CLICK, instance._handleDocumentClick);
        }
        else {
            document.removeEventListener(CLICK, instance._handleDocumentClick, true);
        }
    },

    /**
     * Sets the focus on the Component.
     *
     * @method focus
     * @chainable
     * @since 0.0.1
     */
    focus(intoView, transitionTime) {
        const button = this.refs.button;
        let buttonNode;
        if (intoView) {
            buttonNode = ReactDOM.findDOMNode(button);
            buttonNode.itsa_focus(false, false, transitionTime);
        }
        else {
            button.focus();
        }
        return this;
    },

    /**
     * Returns the default props.
     *
     * @method getDefaultProps
     * @return object
     * @since 0.0.1
     */
    getDefaultProps() {
        return {
            emptyHTML: EMPTY_HTML,
            errorMsg: REQUIRED_MSG,
            formValidated: false,
            markRequired: false,
            required: false
        }
    },

    /**
     * Returns the initial state.
     *
     * @method getInitialState
     * @return object
     * @since 0.0.1
     */
    getInitialState() {
        return {
            expanded: false,
            btnPressed: false
        };
    },

    /**
     * Callback-fn for the onClick-event.
     * Will invoke `this.props.onChange`
     *
     * @method handleClick
     * @since 0.0.1
     */
    handleClick(simulated) {
        let liNode, ulNode;
        const instance = this,
              props = instance.props,
              selected = props.selected,
              simulatedClick = (simulated===true),
              leftBtnClick = simulatedClick || (simulated===1),
              newExpanded = !instance.state.expanded;
        if (leftBtnClick) {
            instance.setState({
                expanded: newExpanded,
                btnPressed: true
            });
            instance._removeTimer && instance._removeTimer.cancel();
            // need to go async --> handleClick goes so quick, that is is before handleMouseDown
            // also, we can focus the right li-item only when there was a sync()
            async(() => {
                // item.focus();
                if (newExpanded) {
                    if (selected!==undefined) {
                        instance._preSelected = selected; // the item that has keyboard-focus
                    }
                    else {
                        instance._preSelected = 0;
                    }
                    ulNode = instance._getUlContainerNode();
                    liNode = ulNode.children[instance._preSelected];
                    if (liNode) {
                        if (props.listHeight) {
                            liNode.focus();
                            liNode.itsa_forceIntoNodeView(ulNode.parentNode, KEY_TRANS_TIME);
                        }
                        else {
                            liNode.itsa_focus(false, false, KEY_TRANS_TIME);
                        }
                    }
                }

                if (!instance._mouseDown && !simulatedClick) {
                    instance._removeTimer = later(() => {
                        instance.setState({btnPressed: false});
                    }, DEF_BUTTON_PRESS_TIME);
                }
            });
        }
    },

    /**
     * Callback-fn when an item is clicked
     *
     * @method handleItemClick
     * @since 0.0.1
     */
    handleItemClick(e) {
        const instance = this,
              node = e.target,
              item = node && node.getAttribute("data-id");
        instance.setState({expanded: false});
        instance.focus(true, BTN_REFOCES_TRANS_TIME);
        if (item) {
            instance.props.onChange(parseInt(item, 10));
        }
    },

    /**
     * Callback-fn when an item is scrolled by keys
     *
     * @method handleItemScroll
     * @since 0.0.1
     */
    handleItemScroll(e) {
        let len, liNode, ulNode, refocus;
        const instance = this,
              state = instance.state,
              keyCode = e.keyCode,
              props = instance.props,
              selected = props.selected;

        if (keyCode===40) {
            instance._preSelected++;
            refocus = true;
        }
        else if (keyCode===38) {
            instance._preSelected--;
            refocus = true;
        }
        else if (keyCode===13) {
            e.preventDefault();
            ulNode = instance._getUlContainerNode();
            liNode = ulNode.children[instance._preSelected];
            instance.handleItemClick({target: liNode});
        }
        else if ((keyCode===8) || (keyCode===9)) {
            e.preventDefault();
            ulNode = instance._getUlContainerNode();
            liNode = ulNode.children[selected];
            instance.handleItemClick({target: liNode});
        }
        if (refocus) {
            e.preventDefault();
            ulNode = instance._getUlContainerNode();
            len = ulNode.children.length;
            if (instance._preSelected>(len-1)) {
                instance._preSelected = len-1;
            }
            else if (instance._preSelected<0) {
                instance._preSelected = 0;
            }
            liNode = ulNode.children[instance._preSelected];
            if (props.listHeight) {
                liNode.focus();
                liNode.itsa_forceIntoNodeView(ulNode.parentNode, KEY_TRANS_TIME);
            }
            else {
                liNode.itsa_focus(false, false, KEY_TRANS_TIME);
            }
        }
    },

    /**
     * Callback-fn for the onKeyDown-event.
     *
     * @method handleKeyDown
     * @since 0.0.1
     */
    handleKeyDown(e) {
        const instance = this,
              state = instance.state,
              keyCode = e.keyCode;

        if ((keyCode===27) && (state.expanded)) {
            instance.setState({
                expanded: false
            });
            instance.focus(true, BTN_REFOCES_TRANS_TIME); // in case the focus was on a listitem
        }
        else if (((keyCode===40) || (keyCode===32)) && !(state.expanded)) {
            // prevent minus windowscroll:
            e.preventDefault();
            instance.handleClick(true);
        }
    },

    /**
     * Callback-fn for the onMouseDown-event.
     *
     * @method handleMouseDown
     * @since 0.0.1
     */
    handleMouseDown() {
        this._mouseDown = true;
    },

    /**
     * Callback-fn for the onMouseUp-event.
     *
     * @method handleMouseUp
     * @since 0.0.1
     */
    handleMouseUp() {
        if (this._mouseDown) {
            this._mouseDown = false;
            this.setState({
                btnPressed: false
            });
        }
    },

    /**
     * React render-method --> renderes the Component.
     *
     * @method render
     * @return ReactComponent
     * @since 0.0.1
     */
    render() {
        const instance = this,
              props = instance.props,
              state = instance.state,
              expanded = state.expanded,
              itemRenderer = props.itemRenderer || instance._defaultItemRenderer,
              containerStyles = {height: props.listHeight},
              selected = props.selected,
              items = props.items,
              hasSelection = (selected!==undefined) && (selected<items.length),
              required = props.required,
              disabled = props.disabled,
              errored = !expanded && props.formValidated && required && !hasSelection;
        let className = props.className,
            buttonClass = props.btnClassName,
            elementClass = MAIN_CLASS,
            containerClass = MAIN_CLASS_PREFIX+CONTAINER,
            containerSubClass = containerClass+_SUB,
            listItems, buttonHTML, tabIndex, itemScroll, handleItemClick, errorMsg,
            ariaRequired, requiredMsg, handleKeyDown, handleMouseDown;
        if (expanded) {
            tabIndex = 0; // making li-tiems focussable
            containerClass += " "+MAIN_CLASS_PREFIX+"show";
            itemScroll = instance.handleItemScroll;
            handleItemClick = instance.handleItemClick;
        }
        // About the dropdown:
        // first: outerdiv which will be relative positioned
        // next: innerdiv which will be absolute positioned
        // also: hide the container by default --> updateUI could make it shown
        listItems = items.map((item, i) => {
            let classname, ariaLabel, dangerouslySetInnerHTML;
            const renderedItem = itemRenderer(item, i);
            if (i===selected) {
                classname = "selected";
                buttonHTML = renderedItem;
            }
            ariaLabel = instance._saveHTML(renderedItem);
            dangerouslySetInnerHTML = {__html: renderedItem};
            return <li aria-label={ariaLabel} data-id={i} className={classname} dangerouslySetInnerHTML={dangerouslySetInnerHTML} key={i} role="listitem" tabIndex={tabIndex} />;
        });
        buttonHTML || (buttonHTML=props.emptyHTML);
        if (!disabled && (state.btnPressed || expanded)) {
            buttonClass = buttonClass ? buttonClass+" "+"itsa-button-active" : "itsa-button-active";
        }
        if (errored) {
            buttonClass = (buttonClass ? buttonClass+SPACED_MAIN_CLASS_PREFIX : MAIN_CLASS_PREFIX)+"error";
            errorMsg = (<div className={MAIN_CLASS_PREFIX+"error-text"}>{props.errorMsg}</div>);
        }
        if (required && props.markRequired && !hasSelection) {
            requiredMsg = (<div className={MAIN_CLASS_PREFIX+"required"} />);
            ariaRequired = true;
        }
        if (!disabled) {
            handleKeyDown = instance.handleKeyDown;
            handleMouseDown = instance.handleMouseDown;
        }
        className && (elementClass+=" "+className);
        return (
            <div
                aria-required={ariaRequired}
                className={elementClass}
                onKeyDown={handleKeyDown}
                onMouseDown={handleMouseDown}
                onMouseUp={instance.handleMouseUp}>
                <Button
                    {...props}
                    buttonHTML={buttonHTML}
                    className={buttonClass}
                    disabled={disabled}
                    onClick={instance.handleClick}
                    ref="button" />
                <div className={containerClass} onKeyDown={itemScroll}>
                    <div className={containerSubClass} style={containerStyles}>
                        <ul
                            onClick={handleItemClick}
                            role="list">
                            {listItems}
                        </ul>
                    </div>
                </div>
                {requiredMsg}
                {errorMsg}
            </div>
        );
    },

    /**
     * Returns a html that represent the item as how it should be rendered.
     *
     * @method _defaultItemRenderer
     * @private
     * @param String|Object list-item
     * @return String html that represent the item
     * @since 0.0.1
     */
    _defaultItemRenderer(item) {
        return item;
    },

    /**
     * Returns the ul-element that contains all li-elements.
     *
     * @method _getUlContainerNode
     * @private
     * @return Element
     * @since 0.0.1
     */
    _getUlContainerNode() {
        const instance = this;
        instance._ulNode || (instance._ulNode=instance._componentNode.getElementsByTagName('ul')[0]);
        return instance._ulNode;
    },

    /**
     * Callback for a click on the document. Is needed to close the Component when clicked outside.
     *
     * @method _handleDocumentClick
     * @private
     * @param Object e
     * @since 0.0.1
     */
    _handleDocumentClick(e) {
        const instance = this,
              targetNode = e.target;
        if ((instance._componentNode!==targetNode) && !instance._componentNode.contains(targetNode)) {
            instance.setState({
                expanded: false
            });
        }
    },

    /**
     * Returns a save string
     *
     * @method _saveHTML
     * @private
     * @param String html the text that should be removed from any html-entities
     * @return String
     * @since 0.0.1
     */
    _saveHTML(html) {
        return html && html.replace(/<[^>]*>/g, '');
    }

});

module.exports = Component;
