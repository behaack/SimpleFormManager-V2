# Simple Form Manager V2

Simple Form Manager V2 (SFMv2) is a javascript class you can use to manage your html forms.  It can be used with Angular, React, Vue or any other javascript library for framework. Good form management requires an an tremendous amount boilerplate and redundant code to manage state, and validate user input. Most solutions are complicated, highly opinionated and tend to be framework.

SFMv2 can be usued with any one of the dozens of UI components available to you. Simple Form Manager does not takeover your forms or shroud your forms in obscurity so you do not understand what is happening to your data, SFMv2 is lightweight, simple and is easy to reason about. SFMv2 internal objects are fully exposed to you, the developer, so you can see what is going with your data. 

SFMv2 is a complete re-write of the orginial Simple Form Manager and has a completely different interface. Unlike the original version of Simple Form Manager, this version does not <em>require</em> you to put a wrapper around your components for it to work. With Simple Form Manager V2 you just wire your components it, and it works!

SFM and SFMv2 are inspired by Vuelidate, the excellent form validation system written for Vue.

## Installation
```
npm install simple-form-manager-v2
```
or
```
yarn add simple-form-manager-v2
```

## Simple Form Manager V2 Interface Summary
### Properties
###### fields: object,
###### fieldScheme: readonly object
###### form: readonly object,
###### data: readonly object,
###### all: readonly object,
###### formSubmittable: readonly boolean  
###### running: readonly boolean

### Methods
###### start(tickSpeed: number): void
###### stop(): void
###### toggleValidationNode(fieldName: string, validator: any, value: any: void
###### setFieldValidationStatus: (fieldName: string, validator: string, value: boolean) => void
###### setFieldStatus: (fieldName: string, isValid: boolean, errorMsg: string) => void
###### restoreForm(): void
###### resetForm(): void
###### resetField(fieldName: string): void
###### showFieldError(fieldName: string): boolean
###### setValue(fieldName: string, value: any): void
###### setTouched(fieldName: string, value: boolean): void
###### setObjectValue(fieldName: string, value: object): void
###### setValues(values: object): void
###### onBlur(fieldName: string): void - DEPRECATED
###### onUpdateValue(fieldName: string, value: any): void - DEPRECATED
###### onUpdateObjectValue(fieldName: string, value: any): void - DEPRECATED


A full description of these properties and methods can be found futher down in this document.

## Usage (Getting started)
Instantiate Simple Form Manager V2
```javascript
import FM from 'simple-form-manager-v2'
import myFormSchema from './src/form-schemas/myFormSchema.js'
const fm = new FM(myFieldSchema)
```
But what is <em>myFormSchema</em> in the code sample above you ask. It is a javascript object describing your form and the validation rules for each field. See below for how to structure your form schema and how to write a validation function.

## Usage (A simple example)
Simple Form Manager V2 will work with any framework. The example I use here is for a VueJs use case. 

```javascript
// userFormSchema.js
import { required } from 'vuelidate/lib/validators'

export default {
  userName: {
    required: {
      validator: required,
      errorMessage: 'User Name is required'
    }
  }
}
```
```html
// userForm.vue
<template>
  <form @submit.prevent="onSubmit">
    <!-- 
      We will show field errors here...
      Only show if the field has been 'touched', i.e. received and lost focus
    -->
    <div v-if="(!fm.fields.userName.valid && fm.fields.userName.touched)">
      <div>{{ fm.fields.userName.errorMessage }}</div>
    </div>
    <!-- 
      Each field in your form is set-up as follows
    -->        
    <input
      @blur="fm.onBlur('userName')"
      v-model="fm.fields.userName.value" 
      type="text" 
    />
    <!-- 
      Note: We can disable the submit button if there is an error
      in one or more of the fields or if the form values are unchanged
    -->     
    <input 
      type="submit" 
      value="Submit"
      :disabled="!(fm.form.dirty && fm.form.valid)"
    >
  </form>
</template>
<script>
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import FM from './assets/CFormManagerV2'
import Schema from './assets/userFormSchema'

export default defineComponent({
  name: 'user-form',
  setup() {
    // Instantiate Form Manager
    // We are using Vue3 so this is done inside a ref()
    const fm = ref(new FM(Schema))

    // When page is mounted set-up the form
    onMounted(() => {
      // Initial value of userName field
      fm.value.fields.userName.value = 'Joe Blow'
      // CRITICAL - start form manager AFTER field 
      // values have been initialized
      fm.value.start()
    })
    
    // CRITICAL - to prevent memory leaks, 
    // stop form manager when page is unMounted
    onUnmounted(() => {
      fm.value.stop()
    })

    const onSubmit = () => {
      // Notice a nice package of your form data is available  
      // fm.data
      console.log('Submit: ', fm.value.data)
      fm.value.resetForm()      
    }

    return {      
      fm, // We must make fm available to the form
      onSubmit
    }
  }
});
</script>
```
## Form Schema Explained
In the Userage sction above, we had a form schema name myFormSchema. Here is a simple example of a form schema.

```javascript
// I am getting my validator functions here from npm package 
// vuelidate. You can write your own or find others on npm.
import { required, email } from 'vuelidate/lib/validators' 

export default {
  // the form descibed in this file had three fields:
  //   - userId
  //   - userName
  //   - email
  userId: {}, // no validation rules, in the interface the id is likely read-only
  username: {
    required: { // validation rule for username
      validator: required, 
      errorMessage: 'Username is required'
    }  
  },
  // email is the other field variable name in your form
  email: {
    required: { 
      validator: required, // Must me a function, see below for details
      errorMessage: 'Email is required' // Must be a string
    },
    validEmail: { // validation rule #2 for email
      validator: email,
      errorMessage: 'Email is not a proper email format'      
    }
    validEmail: { // validation rule #2 for email
      validator: maxLength(100),
      errorMessage: 'Email may not exceed 100 characters'      
    }    
  }
}
```

Notice that each of the fields <em>usermame</em> and <em>email</em> in the form schema above has node(s) below them - these are validation rule nodes. You may have as many validation rules (or none at all) for each field as you like and you may give them any name that you like. 

The only requirement for each validation rule is that each validation rule node must have two sub-nodes: <em>validator</em> & <em>errorMessage</em>. The <em>validator</em> node must be assigned a <em></em>function, this fn is used to validated the value assigned to field. The <em>errorMessage</em> node is assigned a string that your form can you to display to the user is the validation rule fails.

That's it! To summarize: a form schema consists of the follow structure:

```
field-node(s)
  validation-rule-node(s)
    validator: function
    errorMessage: string
```

## Validation Functions Explained
A validator function takes one of the following two forms:
```javascript
// Validation rule with no parameter (i.e. required)
fn(valueToBeValidated) => { return boolean }

// Validation rule with one, or more parameters (i.e. maxLength(100))
fn(valueToBeValidated => fn2 => (parameters...) => { return boolean })
```
You may use write your own validaiton function or you can import 3rd-party validators from npm. An excellent libray I use comes from vuelidate.
## Simple Form Manager V2 Methods
#### constructor(formSchema): void
###### <b>Return value:</b> None
###### <b>Parameters:</b>
###### <b>formSchema (javascript object):</b> See a detailed description above in the section entitled Form Schema Explained
###### <b>Description: </b>Instantiates Simple Form Manager V2 object
###### <b>Usage</b>
```javascript
import FM from 'simple-form-manager-v2'
import myFormSchema from './src/form-schemas/loginFormSchema.js'
const fm = new FM(loginFormSchema.js)
```

### start(tickSpeed): void
###### <b>Return value:</b> None
###### <b>Parameters:</b>
###### <b>tickSpeed (integer; optional, default is 25):</b> Frequncy, in milliseconds, with which form is scanned for changes. This will determine how responsive the form is to user input.
###### <b>Description: </b>Starts Form Manager V2 into tracking user input in the form. Before starting Form Manager, field values should first be initialized. On the first tick after start, the orginalValue (see <em>field</em> proprty below) is set to initial value of the field.
###### <b>Usage</b>
````javascript
 // starts tracking user input with a frequency of 1 second
fm.start(1000)
````

### stop(): void
###### <b>Return value:</b> None
###### <b>Parameters:</b> None
###### <b>Description: </b>Stops Simple Field Manager V2 from tracking user input. Internally User Manager. It is highly recommented that you issue a stop on field manager after each start to avoid memory leaks.
###### <b>Usage</b>
````javascript
// starts tracking user input with a frequency of 1 second
fm.stop() 
````

### setValue(fieldName, value): void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>value (any): </b>The new value to be assigned to 'value' property of the field referenced by fieldName
###### <b>Description: </b>This a helper function to make it easier to set the <em>value</em> property for the field provided. This method is best used by wiring it to the onChange event for that field in question. 
###### <b>Usage</b>
````javascript
// change the value of the 'lastName' field to and empty string (i.e. '')
fm.setTouched('lastName', '')
````

### setValues(values): void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>values (object): </b>An object containing key-value pairs with the keys matching the field names provided in the Form Schema
###### <b>Description: </b>This a helper function to make it easier to set the values for the fields provided in the Form Schema. If a field name in the object does not match the field name in the Field Schema, it is ignored.
###### <b>Usage</b>
````javascript
let person = {
  FirstName: 'Mary',
  MiddleInitial: 'L',
  LastName: 'Henderson'
}
// sets the values of the fields: FirstName, MiddleInitial & LastName 
fm.setValues(person)
````

### setTouched(fieldName, value): void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>value (boolean): </b>Optional - The new value to be assigned to 'touched' property of the field referenced by fieldName. If a value is not provided the default value is true
###### <b>Description: </b>This a helper function to make it easier to set the <em>touched</em> value for the field provided. This method is best used by wiring it to the onBlur event for that field in question. 
###### <b>Usage</b>
````javascript
// sets the touched value for the password field to true
fm.setValue('password') 
````

### setObjectValue(fieldName, value): void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>value (object): </b>The new value to be assigned to the 'objectValue' property field referenced by fieldName. The object value property is helpful for holding an object returned by dropdown
###### <b>Description: </b>This a helper function to make it easier to set the <em>value</em> property for the field provided. This functions is best used by wiring it to the onChange event for that field in question. 
###### <b>Usage</b>
````javascript
let country = { 
  countryCode: 'CH', 
  countryName: 'Switzerland',
  capital: 'Bern'
}

// change the objectValue of the 'countryCode' field to country
fm.setUpdateModelValue('countryCode', country)
````
### onBlur(fieldName): void
###### <b>DEPRECATED - replaced by setTouched</b>
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>Description: </b>This a helper function to make it easier to set the <em>touched</em> value for the field provided to true. This method is best used by wiring it to the onBlur event for that field in question. 
###### <b>Usage</b>
````javascript
// sets the touched value for the password field to true
fm.onBlur('password') 
````

### onUpdateValue(fieldName, value): void
###### <b>DEPRECATED - replaced by setValue</b>
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>value (any): </b>The new value to be assigned to 'value' property of the field referenced by fieldName
###### <b>Description: </b>This a helper function to make it easier to set the <em>value</em> property for the field provided. This method is best used by wiring it to the onChange event for that field in question. 
###### <b>Usage</b>
````javascript
// change the value of the 'lastName' field to and empty string (i.e. '')
fm.onUpdateValue('lastName', '')
````

### setFieldValidationStatus: (fieldName: string, validator: string, value: boolean) => void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>validator (string): </b>The name of the validator provided in the Form Schema
###### <b>value (boolean): </b>The new value to be assigned to the 'valid' status of the validator 
###### <b>Description: </b>There are times when the validation criteria for a field requires more information than is contained within the field itself. An example of this is a Password form with a Password and a Password confirmation field. This method allows you to calculate the validation status of a field and set the validation value.
###### <b>Usage</b>
````javascript
const formScheme = {
  password: {
    required: {
      validator: required,
      message: 'Password is required'
    }
  },
  confirmationPassword: {
    matchesPassword: {
      validator: null, // No validator, this is handled outside of Form Manager
      message: 'Password and Confirmation Password do not match'
    }
  }  
}

// change the 'valid' status of the 'confirmationPassword' to false
fm.setFieldStatus('confirmationPassword', 'matchesPassword', false)
````

### setFieldStatus: (fieldName: string, isValid: boolean, errorMsg: string) => void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>isValid (boolean): </b>The validation status of the field
###### <b>errorMsg (string): </b>The error message to be displayed if the field is not valid 
###### <b>Description: </b>Sets the validation status of a field to true or false. If the field is not valid, the error message is also set.
###### <b>Usage</b>
````javascript
// change the 'valid' status of the 'confirmationPassword' to false
fm.setFieldStatus('confirmationPassword', false, 'Password and Confirmation Password do not match')
````

### onUpdateObjectValue(fieldName, value): void
###### <b>DEPRECATED - replaced by setUpdateObjectValue</b>
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>The name of the field provided in the Form Schema
###### <b>value (any): </b>The new value to be assigned to the 'objectValue' property field referenced by fieldName. The object value property is helpful for holding an object returned by dropdown
###### <b>Description: </b>This a helper function to make it easier to set the <em>value</em> property for the field provided. This functions is best used by wiring it to the onChange event for that field in question. 
###### <b>Usage</b>
````javascript
// change the value of the 'lastName' field to and empty string (i.e. '')
fm.onUpdateModelValue('countryCode', { 
  countryCode: 'CH', 
  countryName: 'Switzerland',
  capital: 'Bern'
})
````

### toggleValidationNode(fieldName, validationRule, value): void
###### <b>Return value:</b> None
###### <b>Parameters:</b> 
###### <b>fieldName (string): </b>A string representing the name of the field provided in the Form Schema
###### <b>validationRule (string): </b>A string representing the name of the validation rule provided in the Form Schema
###### <b>Description: </b>
Use this function to true on and off validation rules established in the Form Schema. If value is not provided, the rule is toggled, otherwise the rule is set to the value provided.
###### <b>Usage</b>
````javascript
// sets the 'required' validation rule for the 'socialSecurityNumber'
// field to false
fm.toggleValidationNode('socialSecurityNumber', 'required', false) 
````

### showFieldError(fieldName): boolean
###### <b>Return value:</b> boolean
###### <b>Parameters:</b> 
###### <b>fieldName: </b>A string representing the name of the field provided in the Form Schema
###### <b>Description: </b>This a helper function which return true if the field is both invalid and has been touched (i.e. has recieved and lost focus). 
###### <b>Usage</b>
````javascript
// return true if the 'password' field is both invalid and touched
fm.showFieldError('password') 
````

### resetForm(): void
###### <b>Return value:</b> none
###### <b>Parameters:</b> none
###### <b>Description: </b>Restores the form and the field attributes for the fields, while returing the field values to their orginial values. 
###### <b>Usage</b>

````javascript
//
// Values before resetting the form
//

// Field values
console.log(fm.fields)
// returns
{
  "userName": {
    "dirty": true,
    "touched": true,
    "value": "janejohnson",
    "originalValue": "sallysmith",
    "valid": true,
    "errorMessage": ""
  },
  "phoneNumber": {
    "dirty": true,
    "touched": true,
    "value": "999QQQQQQQ",
    "originalValue": "888-999-1234",
    "valid": false,
    "errorMessage": "Not a valid phone number"
  }  
}

// Form values
console.log(fm.form)
// returns
{
  "dirty": true,
  "valid": false,
  "touched": true
}

//
// Values after resetting the form
//
fm.resetField('userName')
console.log(fm.fields.userName)
// Field values
console.log(fm.fields)
// returns
{
  "userName": {
    "dirty": false,
    "touched": false,
    "value": "sallysmith",
    "originalValue": "sallysmith",
    "valid": true,
    "errorMessage": ""
  },
  "phoneNumber": {
    "dirty": false,
    "touched": false,
    "value": "888-999-1234",
    "originalValue": "888-999-1234",
    "valid": false,
    "errorMessage": "Not a valid phone number"
  }  
}

// Form values
console.log(fm.form)
// returns
{
  "dirty": false,
  "valid": false,
  "touched": false
}
````

### resetForm(): void
###### <b>Return value:</b> none
###### <b>Parameters:</b> none
###### <b>Description: </b>Resets the form and the field attributes for the fields, while preserving the field values. 
###### <b>Usage</b>

````javascript
//
// Values before resetting the form
//

// Field values
console.log(fm.fields)
// returns
{
  "userName": {
    "dirty": true,
    "touched": true,
    "value": "janejohnson",
    "originalValue": "sallysmith",
    "valid": true,
    "errorMessage": ""
  },
  "phoneNumber": {
    "dirty": true,
    "touched": true,
    "value": "999QQQQQQQ",
    "originalValue": "888-999-1234",
    "valid": false,
    "errorMessage": "Not a valid phone number"
  }  
}

// Form values
console.log(fm.form)
// returns
{
  "dirty": true,
  "valid": false,
  "touched": true
}

//
// Values after resetting the form
//
fm.resetField('userName')
console.log(fm.fields.userName)
// Field values
console.log(fm.fields)
// returns
{
  "userName": {
    "dirty": false,
    "touched": false,
    "value": "janejohnson",
    "originalValue": "janejohnson",
    "valid": true,
    "errorMessage": ""
  },
  "phoneNumber": {
    "dirty": false,
    "touched": false,
    "value": "999QQQQQQQ",
    "originalValue": "999QQQQQQQ",
    "valid": false,
    "errorMessage": "Not a valid phone number"
  }  
}

// Form values
console.log(fm.form)
// returns
{
  "dirty": false,
  "valid": false,
  "touched": false
}
````

### resetField(fieldName): void
###### <b>Return value:</b> none
###### <b>Parameters:</b> 
###### <b>fieldName: </b>A string representing the name of the field provided in the Form Schema
###### <b>Description: </b>Resets the field atributes for the field provided in fieldName, while preserving the field value. 
###### <b>Usage</b>

````javascript
console.log(fm.fields.userName)
// returns
{
  "dirty": true,
  "touched": true,
  "value": "janejohnsonaaaaaaaaaaaaaaaaaaaaaa",
  "originalValue": "",
  "valid": false,
  "errorMessage": "User Name exceeds 15 charcters"
}

fm.resetField('userName')
console.log(fm.fields.userName)
// returns
{
  "dirty": false,
  "touched": false,
  "value": "janejohnsonaaaaaaaaaaaaaaaaaaaaaa",
  "originalValue": "janejohnsonaaaaaaaaaaaaaaaaaaaaaa",
  "valid": false,
  "errorMessage": "User Name exceeds 15 charcters"
}
````

## Simple Form Manager V2 Properties
### running: boolean (readonly)
###### <b>Description: </b> This value is set by the methods start() and stop(). 
###### <b>Usage</b>

````javascript
fm.start()
console.log(fm.running)
// returns 
true
````

### fields: javascript object (read | write)
###### <b>Description: </b> A collection of javascript field objects, as determined by the Field Schema. For each field porvided by the Form Scheme, there are the following sub-properties:
- value: any
- dirty: boolean 
- touched: boolean
- orginalValue: any
- valid: boolean
- errorMessage: string

###### <b>Usage</b>

````javascript
// Read Example
console.log(fm.fields)
// returns 
{
  "userName": {
    "dirty": true,
    "touched": true,
    "value": "jdoe",
    "originalValue": "",
    "valid": true,
    "errorMessage": ""
  },
  "password": {
    "dirty": true,
    "touched": true,
    "value": "hello1",
    "originalValue": "",
    "valid": false,
    "errorMessage": "Passwords must be at least 8 charcters and consist of at least 1 special charcter "
  }
}

// Write Example
fm.fields.userName.value = 'johnDoe'
fm.fields.phoneNumber.value = '999-999-1212'
fm.start()
````

````html
<!-- 
Vue JS: Databinding to field object 'fm.fields.userName.value'
-->
<input
  @blur="fm.onBlur('userName')"
  v-model="fm.fields.userName.value" 
  type="text" 
/>

<!-- 
React JS: Databinding to field object 'fm.fields.userName.value'
-->

handleChange = (e) => {
  /// ...handle update
},
handleBlur = (e) => {
  /// ...handle update
},
render(){
  return (
    <input
      value="{this.state.fm.fields.userName.value" 
      onChange={this.handleChange}
      onBlur={this.handleBlur}
      type="text" 
    />
  )
}
````

Though these properties are read/write, with the exception of <em>orginalValue</em>, <em>value</em>, Form Manager will overwrite your changes (if it is running) with the tickSpeed provided at start(). As such, you will only ever want to directly update <em>value</em>

### form: javascript object (readonly)
###### <b>Description: </b> A javascript field object representing the status of the form. The properties of this form object are:
- dirty: boolean
- touched: boolean
- valid: boolean

###### <b>Usage</b>
````javascript
console.log(fm.form)
///returns (example)
{
  "dirty": false,
  "valid": true,
  "touched": true
}
````

### formSubmittable: boolean (readonly)
###### <b>Description: </b> A helper property that it true if the form is both 'dirty' and 'valid', otherwise it is set to false
###### <b>Usage:</b>

````javascript
// ********************
// **** Example #1 ****
// ********************
console.log(fm.form)
// returns
{
  "dirty": false,
  "valid": true,
  "touched": true
}
console.log(fm.formSubmittable)
 // returns
 false

// ********************
// **** Example #2 ****
// ********************
console.log(fm.form)
// returns
{
  "dirty": true,
  "valid": true,
  "touched": true
}
console.log(fm.formSubmittable)
 // returns
 true
````

### fieldScheme: javascript object (readonly)
###### <b>Description: </b> A collection of javascript field objects as determined by the Field Schema that was provider in the constructor at instantiation.

###### <b>Usage</b>

````javascript
import FM from 'simple-form-manager-v2'
import myFormSchema from './src/form-schemas/myFormSchema.js'
const fm = new FM(myFieldSchema)
console.log(fm.scheme)
//returns
{
  "userName": {
    "required": {
      "errorMessage": "User Name is required",
      "isActive": true
    }
  }
}

fm.toggleValidationNode('userName', 'required', false) 
//returns
{
  "userName": {
    "required": {
      "errorMessage": "User Name is required",
      "isActive": false
    }
  }
}
````

### data: javascript object (readonly)
###### <b>Description: </b> A collection of javascript field objects, as determined by the Field Schema that represents the values of each field provided.
###### <b>Usage</b>
````javascript
import FM from 'simple-form-manager-v2'
import myFormSchema from './src/form-schemas/myFormSchema.js'
const fm = new FM(myFieldSchema)
fm.fields.userName = 'sallysmith'
fm.fields.phone = '000-888-9999'
fm.fields.income = '999999'
console.log(fm.data)
{
  "userName": "sallysmith",
  "phone": "000-888-9999",
  "income": "999999",
  "age": null
}
````

### all: javascript object (readonly)
###### <b>Description: </b> A collection of all of the javascript objects listed above: 
- fields
- scheme
- form
- data

This is made available primarily for debugging your form code



