define('formValidatorMethods',
['formValidatorConstants'],
function (_) {

    /**
     * Adds the class in the given parameter state for the given element
     * @param {object} elem
     * @param {string} state
     */
    function _setState(elem, state) {
        elem && elem.classList && elem.classList.add(state);
    }

    /**
     * Tells if the given element has the given state (class)
     * @param {object} elem
     * @param {string} state
     * @returns {boolean} returns true if the element has the give state (in class list) 
     */
    function _hasState(elem, state) {
        return (elem && elem.classList && elem.classList.contains(state));
    }

    /**
     * Removes a the classe (state) of the given element
     * @param {object} elem
     * @param {string} state
     */
    function _removeState(elem, state) {
        elem && elem.classList && elem.classList.remove(state);
    }

    /**
     * Checks if the give element is visible in the DOM
     * @param {object} elem
     * @returns {boolean} Returns true if the element is visible and false otherwise
     */
    function _isHiddenInput(elem) {
        var style = window.getComputedStyle(elem);
        return (elem.offsetParent === null && style.display !== 'none');
    }

    /**
     * Checks if the give element is disabled
     * @param {object} elem
     * @returns {boolean} Returns true if the element is disabled and false otherwise
     */
        function _isDisabledInput(elem) {
            return elem.disabled;
        }

    /**
     * Filters the custom validations for a given element.
     * @param {object} elem the element with the custom validations
     * @returns {object} An array of validations for the given element 
     */
    function _getElementCustomValidations(elem, customValidations) {
        var validations = [];
        if (customValidations && customValidations.length > 0) {
            validations = customValidations.filter(function (item) { return (item.sourceInput === elem); });
        }
        return validations;
    }

    /**
     * Clears the error message of the given element
     * @param {object} elem
     */
    function _clearError(elem) {
        if (elem && elem.parentNode) {
            var errorSpan = elem.parentNode.querySelector('span.' + _.STATES.ERROR);
            if (errorSpan && errorSpan.classList) {
                errorSpan.classList.add('hide');
                elem.setCustomValidity('');
            }
        }
    }


    /**
     * Clears all the errors from custom validations of the given element.
     * If the validation has an foreign input defined it clears its message, otherwise it
     * clears the elements custom error message.
     * @param {object} elem
     */
    function _clearCustomValidations(elem, customValidations) {
        if (customValidations && customValidations.length > 0) {
            var validationsList = _getElementCustomValidations(elem, customValidations);
            var input;
            for (var i = 0 ; i < validationsList.length ; i++) {
                //if (!validationsList[i].errorState) {
                input = validationsList[i].errorMessageInput || validationsList[i].sourceInput;
                _clearError(input);
                _removeState(input, _.STATES.VIRTUALLY_DIRTY);
                validationsList[i].errorState = true;
                //}
            }
        }
    }

    /**
     * Clears the errors in all visible form elements
     */
    function _clearFormErrors(formElements) {
        for (var i = 0 ; i < formElements.length ; i++) {
            _clearError(formElements[i]);
        }
    }

    /**
     * Changes the state of an element to "dirty" when its value changes
     * @param {object} evt
     */
    function _onChangeEventHandler(evt) {
        _setState(evt.currentTarget, _.STATES.DIRTY);
    }

    /**
     * Changes the state of an element to "visited" when the element loses focus.
     * If the element has the state "dirty" it validates the input right away.
     * @param {object} evt
     */
    function _onBlurEventHandler(evt) {
        _setState(evt.currentTarget, _.STATES.VISITED);
        if (_hasState(evt.currentTarget, _.STATES.DIRTY)) {
            this.validateInput(evt.currentTarget);
        }
    }


    /**
     * Displays the first rule of a validationSet that is not passing and displays the message
     * defined on the matching data attribute.
     * @param {object} validationSet ValidationSet Object of an input element
     * @returns {boolean} Returns true if all rules pass and false if at least one rules fails 
     */
    function _checkValidations(validationSet) {
        var isFormValid = true;
        var elem;
        var message;

        for (var i = 0 ; i < validationSet.length ; i++) {
            elem = validationSet[i].element;
            for (var key in validationSet[i].validation) {
                if (validationSet[i].validation[key] && elem.dataset.hasOwnProperty(key)) {
                    message = elem.dataset[key];
                    _showErrorMessage(elem, message);
                    isFormValid = false;
                    break;
                }
            }
        }
        return isFormValid;
    }

    /**
     * Display the SPAN with the error message or creates it if it doesn't exist yet
     * @param {object} elem
     * @param {string} message
     */
    function _showErrorMessage(elem, message) {
        var errorNode = elem.parentNode.querySelector('span.' + _.STATES.ERROR);

        if (errorNode) {
            errorNode.innerHTML = message;
            errorNode.classList.remove('hide');
        }
        else {
            errorNode = document.createElement("SPAN");
            errorNode.innerHTML = message;
            errorNode.classList.add(_.STATES.ERROR);
            elem.parentNode.appendChild(errorNode);
        }
    }

    /**
     * Creates an object with two properties:
     * - element: an input element
     * - validation: the validationSet object of that element
     * @param {object} elem
     * @returns {object} 
     */
    function _createValidationSetObject(elem) {
        return { element: elem, validation: elem.validity };
    }



    /**
     * Runs custom validation tests against an element.
     * @param {object} elem
     * @returns {boolean} returns true if the validation passes and false otherwise 
     */
    function _checkInputCustomValidations(elem, customValidations) {
        var validationsList = _getElementCustomValidations(elem, customValidations);
        return _checkCustomValidations(validationsList);
    }

    function _checkInputAsyncCustomValidations(elem, asyncCustomValidations) {
        var validationsList = _getElementCustomValidations(elem, asyncCustomValidations);
        _checkAsyncCustomValidations(validationsList);
    }

    /**
     * Runs the custom validation methods in the given Array and displays the error messages
     * according to the custom validation set configuration.
     * @param {object} customValidationsList Array with the validations to test
     * @returns {boolean} returns true if all validations pass, and false if one or more fails.
     */
    function _checkCustomValidations(customValidationsList) {
        if (!customValidationsList || customValidationsList.length === 0) {
            return true;
        }

        var validationResult = true,
            validationRule;

        for (var i = 0; validationResult && i < customValidationsList.length  ; i++) {

            validationRule = customValidationsList[i];

            // run the validation method which might return a boolean or a string with the error message
            validationResult = validationRule.validationMethod();
            validationRule.errorState = (!!validationResult);
            _displayCustomValidationOutcome(validationResult, validationRule);

        }
        return validationResult;
    }

    function _checkAsyncCustomValidations(asyncCustomValidationList) {
        if (!asyncCustomValidationList || asyncCustomValidationList.length === 0) {
            return true;
        }

        _checkAsyncCustomValidation(asyncCustomValidationList, 0);

    }

    function _checkAsyncCustomValidation(asyncCustomValidationList, index) {

        if (index > asyncCustomValidationList.length - 1) {
            return;
        }

        var validationRule = asyncCustomValidationList[index];
        validationRule.validationMethod().then(function (result) {
            // remove error message from the foreign input
            if (validationRule.errorMessageInput) {
                _clearCustomValidations(validationRule.errorMessageInput, asyncCustomValidationList);
            }
                // remove error message from the current input
            else {
                _clearCustomValidations(validationRule.sourceInput, asyncCustomValidationList);
            }
            validationRule.success(result);
            _setState(validationRule.sourceInput, _.STATES.VISITED);
            _setState(validationRule.sourceInput, _.STATES.DIRTY);
            _checkAsyncCustomValidation(asyncCustomValidationList, index + 1);
        }, function (error) {
            var parsedResult = validationRule.parser(error);
            if (parsedResult) {
                _displayCustomValidationOutcome(parsedResult, validationRule);
            }
            validationRule.failure(error);
        });
    }

    function _displayCustomValidationOutcome(validationResult, validationRule) {

        if (typeof validationResult === 'boolean' && !validationResult) {

            // display the error on a foreign input field if defined
            if (validationRule.errorMessageInput) {
                _setState(validationRule.errorMessageInput, _.STATES.VIRTUALLY_DIRTY);
                validationRule.errorMessageInput.setCustomValidity(validationRule.errorMessage);
                _showErrorMessage(validationRule.errorMessageInput, validationRule.errorMessage);
            }
                // display the error on the current input field
            else {
                validationRule.sourceInput.setCustomValidity(validationRule.errorMessage);
                _showErrorMessage(validationRule.sourceInput, validationRule.errorMessage);
            }
        }
        else if (typeof validationResult === "string" && validationResult.length > 0) {

            // display the error on a foreign input field if defined
            if (validationRule.errorMessageInput) {
                _setState(validationRule.errorMessageInput, _.STATES.VIRTUALLY_DIRTY);
                validationRule.errorMessageInput.setCustomValidity(validationResult);
                _showErrorMessage(validationRule.errorMessageInput, validationResult);

            }
                // display the error on the current input field
            else {
                validationRule.sourceInput.setCustomValidity(validationResult);
                _showErrorMessage(validationRule.sourceInput, validationResult);
            }
        }
    }


    var methods = {

        /**
         * Loads the default event listeners for all the form elements
         * @param {object} context The form where the elements are.
         */
        loadEvents: function (context, options) {
            for (var i = 0 ; i < context.formElements.length ; i++) {
                options && options.validateOnChange && context.formElements[i].addEventListener('change', _onChangeEventHandler.bind(context));
                options && options.validateOnBlur && context.formElements[i].addEventListener('blur', _onBlurEventHandler.bind(context));
            }
        },

        /**
         * Validates all visible elements in the form. 
         * It clears the existing errors, runs the core validations and displays the messages.
         * Then runs the custom validations.
         * 
         * @returns {boolean} returns true if the form is valid and false otherwise 
         */
        validateForm: function (ctx) {
            var isValid = ctx.form.checkValidity();
            var validationset = [];

            _clearFormErrors(ctx.formElements);
            _setState(ctx.form, _.STATES.SUBMITTED);

            if (!isValid) {
                var formElementsCount = ctx.formElements.length;
                for (var i = 0 ; i < formElementsCount ; i++) {
                    var element = ctx.formElements[i];
                    if (!_isHiddenInput(element) && !element.validity.valid) { // only validates visible elements
                        validationset.push(_createValidationSetObject(element));
                    }
                }
            }

            // display the messages for each invalid input
            var coreValidationsResult = _checkValidations(validationset);

            // run the custom validations battery
            var customValidationsResult = _checkCustomValidations(ctx.customValidations);

            // run the async custom validations battery
            var asyncCustomValidationsResult = _checkAsyncCustomValidations(ctx.asyncCustomValidations);

            return (coreValidationsResult && customValidationsResult);
        },

        /**
         * Tests the given element for core validations and custom validations
         * @param {object} elem
         */
        validateInput: function (elem, ctx) {
            _clearError(elem);

            var isValid = elem.checkValidity();
            var validationset = [];

            if (!isValid) {
                validationset.push(_createValidationSetObject(elem));
                _checkValidations(validationset);
            }
                // only run custom validations if all the others pass
            else {
                isValid = _checkInputCustomValidations(elem, ctx.customValidations);
                if (isValid) {
                    _checkInputAsyncCustomValidations(elem, ctx.asyncCustomValidations);
                }
            }
            return isValid;
        },

        /**
         * Adds a custom validation rule to a given input that will be triggered at a event triggerEvent and will be evaluated
         * by a given eventHandler method.
         * ErrorMessage sets a custom error message if the method that validates only returns true or false, else it uses the 
         * validation method output (message) to display the message.
         * ErrorMessageInput is the input where the message must be displayed. If not defined the message will be displayed on
         * the SourceInput.
         * 
         * @param {object} options
         *      sourceInput - input to validate
         *      trigger - event name that will trigger the validation (optional)
         *      validationMethod - validation method
         *      errorMessage - default error message to display if failure or callback function return a boolean (optional)
         *      errorMessageInput - input where the error should be displayed (optioanl)
         * @returns {object}  
         */
        addCustomValidation: function (sourceInput, validationMethod, triggerName, errorMessage, errorMessageInput) {
            if (!sourceInput || !validationMethod || (triggerName && (typeof triggerName !== "string" || triggerName.length === 0))) {
                throw 'error: Wrong parameters.';
            } else {

                if (triggerName && validationMethod)
                    sourceInput.addEventListener(triggerName, validationMethod);

                var customValidation = {
                    sourceInput: sourceInput,
                    validationMethod: validationMethod,
                    errorMessage: errorMessage,
                    errorMessageInput: errorMessageInput,
                    errorState: true
                };

                return customValidation;
            }
        },

        addAsyncCustomValidation: function (sourceInput, validationMethod, responseParser, successCallback, failureCallback) {
            if (!sourceInput || !validationMethod || typeof validationMethod !== "function" || !responseParser || typeof responseParser !== "function" || !successCallback || typeof successCallback !== "function") {
                throw 'error: Invalid Paramters.'
            } else {
                var asyncCustomValidation = {
                    sourceInput: sourceInput,
                    validationMethod: validationMethod,
                    parser: responseParser,
                    success: successCallback,
                    failure: failureCallback,
                    errorState: true
                };

                return asyncCustomValidation;
            }
        },

        /**
         * TODO: Not implemented yet
         * @param {type} sourceInput
         * @param {type} triggerEvent
         * @param {type} eventHandler
         */
        removeCustomValidation: function (sourceInput, triggerEvent, eventHandler) {

            if (!sourceInput || !eventHandler || typeof eventHandler !== 'function' || (triggerEvent && (typeof triggerEvent !== "string" || triggerEvent.length === 0))) {
                throw 'error: Invalid Paramters.'
            } else {
                sourceInput.removeEventListener(triggerEvent, eventHandler);
            }
        },

        /**
        * Removes form validations
        * Removes all states and error messages from a given form
        * @param {object} elem
        */
        removeValidations: function (ctx) {
            _clearFormErrors(ctx.formElements);
            _removeState(ctx.form, _.STATES.SUBMITTED);

            for (var i = 0 ; i < ctx.formElements.length ; i++) {
                _removeState(ctx.formElements[i], _.STATES.DIRTY);
                _removeState(ctx.formElements[i], _.STATES.VIRTUALLY_DIRTY);
                _removeState(ctx.formElements[i], _.STATES.VISITED);
            }
        },

        /**
        * Set a state to a given input
        * Available states are stored in _.STATES object
        * @param {object} elem
        * @param {string} state
        */
        setValidationState: function (elem, state) {
            _setState(elem, state);
        }
    };

    return methods;

});