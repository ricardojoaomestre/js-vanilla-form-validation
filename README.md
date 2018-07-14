# js-vanilla-form-validation

Summary:

A simple but effective form validator that **uses native browser validations** to keep your form data as clean and correct as possible! It also has a feature to **let you write your own validations, even when those validations depend on business logic on server side**.

---

Form validator uses `checkValidity()` method and validity property of HMLT5 to validate the input fields and get the `validityState` object with the information of which validations failed and which didn't. Then we map these properties with the data attributes of the input field to obtain the error messages. Here's how it looks:

```javascript
    ValidityState = {
        badInput: false,
        customError: false,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        tooShort: false,
        typeMismatch: false,
        valid: false,
        valueMissing: true
    };
```

Simple example:

```html
<form id="myForm">
    <input type="text" required data-value-missing="This field is required!" />
    ...
```

On javascript you should have the page dependency of FormValidator plugin

```javascript
define(['formValidator'], function (FormValidator) {
    
    ...

    // create an instance of the plugin and associate it to the form
    var form = document.getElementById('myForm');
    this.validator = new FormValidator(form);

    ...

    function onSubmit() {
        // validate the entire form at once
        this.validator.validateForm();
    }

});

```

It's also possible to **validate a field at a time**:

```javascript
    ...

    var input = document.querySelector('#myForm input[type=text]');
    var self = this; 

    input.addEventListener('blur', function () {
        self.validator.validateInput(this);
    });
```

We can also add **custom validations** to the inputs. The validation function must return `boolean` or `string` with the error message.

```javascript
    ...

    // this function must return a boolean or a string with the error message.
    function myCustomValidation(value) {
        return (value === "123");
    }

    this.validator.addCustomValidation(input, myCustomValidation, 'blur');

```

Simple **dependency validation** is also possible with this plugin. Imagine you have a form with first name and last name. None of the fields are mandatory but if you fill the last name field, the first name should also be filled. Here's an example of how to do that:

```html
<form id="myForm">
    <input type="text" name="first_name" />
    <input type="text" name="last_name" />

```

```javascript
    ...
    var form = document.getElementById('myForm');
    var firstName = form.querySelector('input[name=first_name]');
    var lastName = form.querySelect('input[name=last_name]');

    var validator = new FormValidator(form);

    function validateFirstNameLastName() {
        return (lastName !== "" && firstName === "");
    }

    // add custom validation
    // when lastName loses focus, it runs the validateFirstNameLastName function
    // if it doesn't pass display the error message 'First Name is required if you fill Last Name filed' in firstName input.
    // if the validation function returns a string with an error that's the message that will be displayed, ignoring the one passed as argument
    validator.addCustomValidation(lastName, 'blur', validateFirstNameLastName, 'First Name is required if you fill Last Name field.', firstName);

```

Here is a mapping between the validation rules and related data attributes:

| Input rule                                      | Data attribute for the message |
|-------------------------------------------------|--------------------------------|
| `pattern`                                       | `data-pattern-mismatch`        |
| `max`                                           | `data-range-overflow`          |
| `min`                                           | `data-range-underflow`         |
| `step`                                          | `data-step-mismatch`           |
| `maxlength`                                     | `data-too-long`                |
| `type=text, type=email type=tel type=number...` | `data-type-mismatch`           |
| `required`                                      | `data-value-missing`           |


To give feedback to the user if a field is valid or not at a given time, we have to control the state of an input. there are 3 possible states: 

*  **Visited**: When the user has visited the input.
* **Dirty**: when the user has tried to change the value of the input.
* **Virtually_dirty**: when a custom validation has to mark an input as it was somehow changed to take validation in place.

