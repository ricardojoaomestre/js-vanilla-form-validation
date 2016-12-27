define('formValidatorConstants', {
    NAME: 'FormValidator',
    INPUT_SELECTOR: 'input,select,textarea',
    STATES: {
        DIRTY: 'dirty',
        VIRTUALLY_DIRTY: 'virtually_dirty',
        VISITED: 'visited',
        SUBMITTED: 'submitted',
        ERROR: 'form-validator_error'
    },
    EVENTS: {
        SUBMIT_FORM: 'submit'
    }
});