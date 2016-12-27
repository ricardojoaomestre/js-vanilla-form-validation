define('formValidator',
['formValidatorMethods', 'formValidatorConstants'],
function (methods, _) {

    var FormValidator = function () {
        this.form = null;
        this.formElements = null;
        this.customValidations = [];
        this.asyncCustomValidations = [];

        if (arguments && arguments.length >= 1) {
            this.init(arguments[0], arguments[1] || {});
        } else {
            throw 'error: invalid arguments. Please provide at least 1 argument to specify the form context';
        }


    };

    FormValidator.prototype = {

        /**
         * Gets all the input elements of the given form and initializes the eventListeners on them
         * @param {object} form
         * @param {object} options By default formValidator runs the input validation on blur and/or on change. These
         * options allow to specify if any of these actions are disabled or not through "validateOnBlur" and "validateOnChange"
         * options.
         */
        init: function (form, options) {
            this.form = form;

            options = options || {};
            options.validateOnBlur = (typeof options.validateOnBlur === "undefined") || options.validateOnBlur;
            options.validateOnChange = (typeof options.validateOnChange === "undefined") || options.validateOnChange;

            if (!this.form) {
                throw _.NAME + ' is not loaded!';
            } else {
                this.formElements = this.form.querySelectorAll(_.INPUT_SELECTOR);
                methods.loadEvents(this, options);
            }

        },

        /**
         * Runs validations for the given form
         * @param {object} targetEvent
         * @returns {boolean} Returns true if all the rules passed, and false otherwise 
         */
        validateForm: function () {
            return methods.validateForm(this);
        },

        /**
         * Runs validation for the given input
         * @param {object} input
         */
        validateInput: function (input) {
            return methods.validateInput(input, this);
        },

        /**
         * Adds a custom validation rule to a given input with custom validation logic
         * 
         * @param {object} sourceInput - input to validate
         * @param {object} validationMethod - method to validate
         * @param {string} triggerName - string with the name of the native event
         * @param {string} errorMessage - default error message to use case callback returns only true or false
         * @param {object} destinationInput - input where the error message should be displayed
         */
        addCustomValidation: function (sourceInput, validationMethod, triggerName, errorMessage, destinationInput) {
            var customValidation = methods.addCustomValidation(sourceInput, validationMethod, triggerName, errorMessage, destinationInput);
            if (customValidation) {
                this.customValidations.push(customValidation);
            }
        },

        /**
        * Remove custom validation for the given input with custom validation logic
        * @param {object} sourceInput - input to validate
        * @param {string} triggerEvent - string with the name of the native event
        * @param {string} eventHandler - string with the function assign to 'triggerEvent' event
        * @param {string} errorMessage - default error message to use case callback returns only true or false
        * @param {object} destinationInput - input where the error message should be displayed
        */
        removeCustomValidation: function (sourceInput, triggerEvent, eventHandler, errorMessage, destinationInput) {
            methods.removeCustomValidation(sourceInput, triggerEvent, eventHandler);
        },

        addAsyncCustomValidation: function (sourceInput, validationMethod, responseParser, successCallback, failureCallback) {
            var asyncCustomValidation = methods.addAsyncCustomValidation(sourceInput, validationMethod, responseParser, successCallback, failureCallback);
            if (asyncCustomValidation) {
                this.asyncCustomValidations.push(asyncCustomValidation);
            }
        },

        /**
        * Remove validations for the given form
        * @param {object} targetEvent
        */
        removeValidations: function () {
            return methods.removeValidations(this);
        },

        /**
        * Set state to a given element
        * @param {object} input
        * @param {string} state
        */
        setValidationState: function (input, state) {
            methods.setValidationState(input, state);
        },

        /**
        * Get available validation states of an input or form
        */
        validationStates: _.STATES

    };

    return FormValidator;

});