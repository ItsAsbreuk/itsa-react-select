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

require("itsa-dom");

const React = require("react"),
    PropTypes = React.PropTypes,
    ReactDOM = require("react-dom"),
    cloneProps = require("itsa-react-clone-props"),
    FocusContainer = require("itsa-react-focuscontainer"),
    Button = require("itsa-react-button"),
    utils = require("itsa-utils"),
    later = utils.later,
    async = utils.async,
    MAIN_CLASS = "itsa-select",
    MAIN_CLASS_PREFIX = MAIN_CLASS+"-",
    SPACED_MAIN_CLASS_PREFIX = " "+MAIN_CLASS_PREFIX,
    FORM_ELEMENT_CLASS_SPACES = " itsa-formelement",
    CONTAINER = "container",
    _SUB = "-sub",
    EMPTY_HTML = "Choose...",
    REQUIRED_MSG = "Selection is required",
    CLICK = "click",
    BTN_REFOCES_TRANS_TIME = 500,
    DEF_BUTTON_PRESS_TIME = 300;

const Component = React.createClass({

    propTypes: {
        /**
         * Whether to autofocus the Component.
         *
         * @property autoFocus
         * @type Boolean
         * @since 0.0.1
        */
        autoFocus: PropTypes.bool,

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
         * Whether the loop the items when the last/first item is reached.
         *
         * @property loop
         * @default false
         * @type Boolean
         * @since 15.0.0
        */
        loop: PropTypes.bool,

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
         * Whether the checkbox is readonly
         *
         * @property readOnly
         * @type Boolean
         * @default false
         * @since 15.2.0
        */
        readOnly: PropTypes.bool,

        /**
         * Whether to Component requires a valid selection
         *
         * @property required
         * @type Boolean
         * @since 0.0.1
        */
        required: PropTypes.bool,

        /**
         * The index that is selected
         *
         * @property readOnly
         * @type number
         * @default null
         * @since 15.2.0
        */
        selected: PropTypes.number,

        /**
         * Inline style
         *
         * @property style
         * @type object
         * @since 0.0.1
        */
        style: PropTypes.object,

        /**
         * The tabindex of the Component.
         *
         * @property type
         * @type Number
         * @since 0.1.2
        */
        tabIndex: PropTypes.number
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
        instance.IE8_EVENTS = !instance._componentNode.addEventListener;
        if (instance.IE8_EVENTS) {
            document.attachEvent("on"+CLICK, instance._handleDocumentClick);
        }
        else {
            document.addEventListener(CLICK, instance._handleDocumentClick, true);
        }
        if (instance.props.autoFocus) {
            instance._focusLater = later(() => instance.focus(), 50);
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
        this._focusLater && this._focusLater.cancel();
        if (instance.IE8_EVENTS) {
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
     * @param [transitionTime] {Number} transition-time to focus the element into the view
     * @chainable
     * @since 0.0.1
     */
    focus(transitionTime) {
        return this.refs.button.focus(transitionTime);
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
            autoFocus: false,
            disabled: false,
            emptyHTML: EMPTY_HTML,
            errorMsg: REQUIRED_MSG,
            formValidated: false,
            loop: false,
            markRequired: false,
            readOnly: false,
            required: false
        };
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
     * Callback that sets the focus to the descendent element by calling `focus()`
     *
     * @method handleContainerFocus
     * @param e {Object} event-payload
     * @since 0.1.0
     */
    handleContainerFocus(e) {
        (e.target===e.currentTarget) && this.focus();
    },

    /**
     * Callback-fn for the onClick-event.
     * Will invoke `this.props.onChange`
     *
     * @method handleClick
     * @since 0.0.1
     */
    handleClick(simulated) {
        const instance = this,
            props = instance.props,
            simulatedClick = (simulated===true),
            newExpanded = !instance.state.expanded;
        if (!props.disabled && !props.readOnly) {
            instance.setState({
                expanded: newExpanded,
                btnPressed: true
            });
            instance._removeTimer && instance._removeTimer.cancel();
            instance.refs.focuscontainer.focusActiveElement();
            // need to go async --> handleClick goes so quick, that is is before handleMouseDown
            async(() => {
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
            props = instance.props,
            item = node && node.getAttribute("data-id");
        if (!props.disabled && !props.readOnly && !this._buttonDown) {
            instance.setState({expanded: false});
            instance.focus(true, BTN_REFOCES_TRANS_TIME);
            if (item) {
                instance.props.onChange(parseInt(item, 10));
            }
        }
    },

    /**
     * Callback-fn when an item is scrolled by keys
     *
     * @method handleItemScroll
     * @since 0.0.1
     */
    handleItemScroll(e) {
        const instance = this,
            keyCode = e.keyCode,
            props = instance.props;
        if (!props.disabled && !props.readOnly && (keyCode===13)) {
            instance.handleItemClick({target: document.activeElement});
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
            props = instance.props,
            state = instance.state,
            keyCode = e.keyCode;

        if (!props.disabled && !props.readOnly && !instance._buttonDown) {
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
        }
        instance._buttonDown = true;
    },

    /**
     * Callback-fn for the onKeyUp-event.
     *
     * @method handleKeyUp
     * @since 0.0.1
     */
    handleKeyUp() {
        this._buttonDown = false;
    },

    /**
     * Callback-fn for the onMouseDown-event.
     *
     * @method handleMouseDown
     * @since 0.0.1
     */
    handleMouseDown() {
        const props = this.props;
        if (!props.disabled && !props.readOnly) {
            this._mouseDown = true;
        }
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
            disabled = props.disabled,
            readOnly = props.readOnly,
            expanded = state.expanded && !disabled && !readOnly,
            itemRenderer = props.itemRenderer || instance._defaultItemRenderer,
            containerStyles = {height: props.listHeight},
            selected = props.selected,
            items = props.items,
            hasSelection = (typeof selected==="number") && (selected>=0) && (selected<items.length),
            required = props.required,
            errored = !expanded && props.formValidated && required && !hasSelection;
        let className = props.className,
            buttonClass = props.btnClassName,
            elementClass = MAIN_CLASS+FORM_ELEMENT_CLASS_SPACES,
            containerClass = MAIN_CLASS_PREFIX+CONTAINER,
            containerSubClass = containerClass+_SUB,
            buttonProps = cloneProps.clone(props),
            listItems, buttonHTML, itemScroll, handleItemClick, errorMsg, handleKeyUp,
            ariaRequired, requiredMsg, handleKeyDown, handleMouseDown, handleContainerFocus;
        delete buttonProps.tabIndex;
        delete buttonProps.style;
        delete buttonProps.className;
        delete buttonProps.disabled;
        delete buttonProps.onClick;
        delete buttonProps.readOnly;
        delete buttonProps.ref;
        if (expanded) {
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
            return (<li aria-label={ariaLabel} className={classname} dangerouslySetInnerHTML={dangerouslySetInnerHTML}
                data-id={i} key={i} role="listitem"/>);
        });
        buttonHTML || (buttonHTML=props.emptyHTML);
        if (!disabled && !readOnly && (state.btnPressed || expanded)) {
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
        if (!disabled && !readOnly) {
            handleKeyDown = instance.handleKeyDown;
            handleKeyUp = instance.handleKeyUp;
            handleMouseDown = instance.handleMouseDown;
            handleContainerFocus = instance.handleContainerFocus;
        }
        className && (elementClass+=" "+className);
        disabled && (elementClass+=" disabled");
        readOnly && (elementClass+=" readonly");
        return (
            <div
                aria-required={ariaRequired}
                className={elementClass}
                onFocus={handleContainerFocus}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                onMouseDown={handleMouseDown}
                onMouseUp={instance.handleMouseUp}
                style={props.style}
                tabIndex={props.tabIndex} >
                <Button
                    {...props}
                    buttonHTML={buttonHTML}
                    className={buttonClass}
                    disabled={disabled}
                    onClick={instance.handleClick}
                    readOnly={props.readOnly}
                    ref="button" />
                <div className={containerClass} onKeyDown={itemScroll}>
                    <FocusContainer
                        className={containerSubClass}
                        keyDown={40}
                        keyUp={38}
                        loop={props.loop}
                        ref="focuscontainer"
                        selector="li[role='listitem']"
                        style={containerStyles} >
                        <ul
                            onClick={handleItemClick}
                            role="list">
                            {listItems}
                        </ul>
                    </FocusContainer>
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
        instance._ulNode || (instance._ulNode=instance._componentNode.getElementsByTagName("ul")[0]);
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
        return html && html.replace(/<[^>]*>/g, "");
    }

});

module.exports = Component;
