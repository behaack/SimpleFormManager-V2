# Simple Form Manager V2

Simple Form Manager is a javascript class you can use to manage your html forms.  It can be used with Angular, React, Vue or any other javascript library for framework. It is also built to be unopinionated about what UI components you use. Use it with plain old html controls or use it with any one of the dozens of UI components available to you. 

Simple Form Manager does not takeover your forms or shroud your forms in obscurity so you do not understand what is happening to your data, FormManager is lightweight, simple and is easy to reason about.

Unlike with the first version of Simple Form Manager, this version does not require you to put a wrapper around your components for it to work. With Simple Form Manager V2 you just wire you component it and it works!

### Installation
```
npm install simple-form-manager-v2
```
or
```
yarn add simple-form-manager-v2
```

### Usage (Getting started)
Instantiate Simple Form Manager V2
```javascript
import FM from 'simple-form-manager-v2'
import myFormSchema from './src/form-schemas/myFormSchema.js'
const fm = new FM(myFieldSchema)
```
But what is <em>myFormSchema</em> in the code sample above you ask. It is a javascript object describing your form and the validation rules for each field. See below for how to structure your form schema and how to write a validation function.

### Usage (A simple example)
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
      Note: We can disenable the submit button if there is an error
      in one or more of the field, if the field values are unchanged
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
### Form Schema Explained
In the Userage sction above, we had a form schema name myFormSchema. Here is a simple example of a form schema.

```javascript
// I am getting my validator functions here from npm package 
// vuelidate. You can write your own or find others on npm.
import { required, email } from 'vuelidate/lib/validators' 

export default {
  // the form descibed in this file had two fields
  username: { // this is one field 
    required: { // validation rule for username
      validator: required, 
      errorMessage: 'Username is required'
    }  
  },
  // email is the other field variable name in your form
  email: {
    required: { // validation rule #1 for email
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

### Validation Functions Explained
A validator function takes one of the following two forms:
```javascript
// Validation rule with no parameter (i.e. required)
fn(valueToBeValidated) => { return boolean }

// Validation rule with one, or more parameters (i.e. maxLength(100))
fn(valueToBeValidated => fn2 => (parameters...) => { return boolean })
```
You may use write your own validaiton function or you can import 3rd-party validators from npm. An excellent libray I use comes from vuelidate.

###FormManagerV2 Methods
####constructor(formSchema): void
<b>Return value:</b> None
<b>Parameters:</b>
<b>formSchema (javascript object):</b> See a detailed description above in the section entitled Form Schema Explained
<b>Description: </b>Instantiates Simple Form Manager V2 object
<b>Usage</b>
```javascript
import FM from 'simple-form-manager-v2'
import myFormSchema from './src/form-schemas/loginFormSchema.js'
const fm = new FM(loginFormSchema.js)
```

####start(tickSpeed): void
<b>Return value:</b> None
<b>Parameters:</b>
<b>tickSpeed (integer; optional, default is 500):</b> Frequncy, in milliseconds, with which form is scanned for changes. This will determine how responsive the form is to user input.
<b>Description: </b>Starts Form Manager V2 into tracking user input in the form. Before starting Form Manager, field values should first be initialized. On the first tick after start, the orginalValue (see <em>field</em> proprty below) is set to initial value of the field.

<b>Usage</b>
````javascript
 // starts tracking user input with a frequency of 1 second
fm.start(1000)
````
####stop(): void
<b>Return value:</b> None
<b>Parameters:</b> None
<b>Description: </b>Stops Simple Field Manager V2 from tracking user input. Internally User Manager. It is highly recommented that you issue a stop on field manager after each start to avoid memory leaks.
<b>Usage</b>
````javascript
// starts tracking user input with a frequency of 1 second
fm.stop() 
````

####onBlur(fieldName): void
<b>Return value:</b> None
<b>Parameters:</b> 
<b>fieldName (string): </b>The name of the field provided in the Form Schema
<b>Description: </b>This function sets the <em>touched</em> value for the field provided to true. This functions is best used by wiring it to the onBlur event for that field in question.
<b>Usage</b>
````javascript
// sets the touched value for the password field to true
fm.onBlur('password') 
````

####toggleValidationNode(fieldName, validationRule, value): void
<b>Return value:</b> None
<b>Parameters:</b> 
<b>fieldName (string): </b>A string representing the name of the field provided in the Form Schema
<b>validationRule (string): </b>A string representing the name of the validation rule provided in the Form Schema
<b>Description: </b>
Use this function to true on and off validation rules established in the Form Schema. If value is not provided, the rule is toggled, otherwise the rule is set to the value provided.
<b>Usage</b>
````javascript
// sets the 'required' validation rule for the 'socialSecurityNumber'
// field to false
fm.toggleValidationNode('socialSecurityNumber', 'required', false) 
````

####showFieldError(fieldName): boolean
<b>Return value:</b> boolean
<b>Parameters:</b> 
<b>fieldName: </b>A string representing the name of the field provided in the Form Schema
<b>Description: </b>This a helper function which return true if the field is both invalid and has been touched (i.e. has recieved and lost focus). 
<b>Usage</b>
````javascript
// return true if the 'password' field is both invalid and touched
fm.showFieldError('password') 
````

####resetForm(): void
<b>Return value:</b> none
<b>Parameters:</b> none
<b>Description: </b>Resets the form and and the field atributes for the fields, while preserving the field values. 
<b>Usage</b>
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

####resetField(fieldName): void
<b>Return value:</b> none
<b>Parameters:</b> 
<b>fieldName: </b>A string representing the name of the field provided in the Form Schema
<b>Description: </b>Resets the field atributes for the field provided in fieldName, while preserving the field value. 
<b>Usage</b>
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

###FormManager Properties
####running: boolean (readonly)
<b>Description: </b> This value is set by the methods start() and stop(). 
<b>Usage</b>
````javascript
fm.start()
console.log(fm.running)
// returns 
true
````

####fields: javascript object (read | write)
<b>Description: </b> A collection of javascript field objects, as determined by the Field Schema. For each field porvided by the Form Scheme, there are the following sub-properties:
- value: any
- dirty: boolean 
- touched: boolean
- orginalValue: any
- valid: boolean
- errorMessage: string

<b>Usage</b>
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

####form: javascript object (readonly)
<b>Description: </b> A javascript field object representing the status of the form. The properties of this form object are:
- dirty: boolean
- touched: boolean
- valid: boolean

<b>Usage</b>
````javascript
console.log(fm.form)
///returns (example)
{
  "dirty": false,
  "valid": true,
  "touched": true
}
````
####formSubmittable: boolean (readonly)
<b>Description: </b> A helper property that it true if the form is both 'dirty' and 'valid', otherwise it is set to false
<b>Usage</b>
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
  
####fieldScheme: javascript object (readonly)
<b>Description: </b> A collection of javascript field objects as determined by the Field Schema that was provider in the constructor at instantiation.

<b>Usage</b>
```javascript
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
```

####data: javascript object (readonly)
<b>Description: </b> A collection of javascript field objects, as determined by the Field Schema that represents the values of each field provided.
<b>Usage</b>
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

####all: javascript object (readonly)
<b>Description: </b> A collection of all of the javascript objects listed above: 
- fields
- scheme
- form
- data

This is made available primarily for debugging your form code



