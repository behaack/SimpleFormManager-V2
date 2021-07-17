export interface IForm {
  dirty: boolean;
  valid: boolean;
  touched: boolean;
}

export interface IAll {
  form: IForm,
  running: boolean
  tickSpeed: number
  scheme: any
  fieldDetails: any
  data: any
}

export interface IFormManager {
  fields: any,
  fieldScheme: any
  form: IForm,
  data: any,
  all: IAll,
  running: boolean
  toggleValidationNode: (fieldName: string, validator: any, value: any) => void
  resetForm: () => void
  resetField: (fieldName: string) => void
  onBlur: (fieldName: string) => void
  start: (tickSpeed: number) => void
  stop: () => void
}

export default class CFormManager implements IFormManager {
  private valuePoll: any
  private isDirty: boolean
  private isValid: boolean
  private isTouched: boolean
  private isRunning: boolean
  private iTickSpeed: number
  private scheme: any
  private fieldNameArray: any[]
  public fields: any
  
  constructor (formValidationSchema: any = {}) {
    this.isRunning = false
    this.iTickSpeed = 0
    this.isValid = false
    this.isDirty = false
    this.isTouched = false
    this.scheme = formValidationSchema
    this.fieldNameArray = this.buildFieldNameArray(formValidationSchema)
    this.validateValidator()
    this.fields = this.initializeFields(this.fieldNameArray)
  }

  get fieldScheme (): any {
    return this.scheme
  }

  get form (): IForm {
    return {
      dirty: this.isDirty,
      valid: this.isValid,
      touched: this.isTouched      
    }
  }

  get data (): any {
    let fields = {}
    this.fieldNameArray.forEach((fieldName) => {
      fields = {
        ...fields,
        [fieldName]: this.fields[fieldName].value
      }
    })
    return fields;
  }

  get running (): boolean {
    return this.isRunning
  }

  get all (): IAll {
    return {
      form: this.form,
      running: this.running,
      tickSpeed: this.iTickSpeed,
      scheme: this.scheme,
      fieldDetails: this.fields,
      data: this.data
    }
  }      

  public onBlur(fieldName: string): void {
    this.fields[fieldName].touched = true
  }

  public start (tickSpeed = 500): void {
    this.iTickSpeed = tickSpeed
    this.isRunning = true
    this.fieldNameArray.forEach((fieldName) => {
      this.fields[fieldName].originalValue = this.fields[fieldName].value
    })    
    this.valuePoll = setInterval(() => {
      this.fieldNameArray.forEach((fieldName) => {
        const field = this.fields[fieldName]
        field.dirty = (field.originalValue !== field.value)
        this.validateField(fieldName, false)
      })
      this.updateFormStatus()
    }, tickSpeed)
  }

  public stop(): void {
    this.isRunning = false
    this.iTickSpeed = 0
    clearInterval(this.valuePoll)
  }

  public toggleValidationNode (fieldName: string, validator: any = undefined, value: any = undefined): void {
    const fieldValidators = this.scheme[fieldName]
    if (fieldValidators) {
      Object.keys(fieldValidators).forEach((v) => {
        if (v === validator || !validator) {
          fieldValidators[v].isActive = (value === undefined) ? !fieldValidators[v].isActive : value
        }
      })
    }
    this.validateField(fieldName, true)
  }

  public resetForm (): void {
    const spreed = this.iTickSpeed
    const running = this.running
    if (running) { this.stop() }
    this.fieldNameArray.forEach((fieldName) => {
      this.fields[fieldName].dirty = false
      this.fields[fieldName].touched = false
      this.fields[fieldName].originalValue = this.fields[fieldName].value
    })
    this.updateFormStatus()
    if (running) { this.start(spreed) }
  }

  public resetField (fieldName: string): void {
    this.fields[fieldName].dirty = false
    this.fields[fieldName].touched = false
    this.fields[fieldName].originalValue = this.fields[fieldName].value
  }

  // ********************
  // Private Functions 
  // ********************
  private updateFormStatus (): void {
    let isValid = true
    let isDirty = false
    let isTouched = false
    this.fieldNameArray.forEach((fieldName) => {
      if (!this.fields[fieldName].valid) {
        isValid = false
      }
      if (this.fields[fieldName].dirty) {
        isDirty = true
      }
      if (this.fields[fieldName].touched) {
        isTouched = true
      }      
    })

    this.isValid = isValid
    this.isDirty = isDirty
    this.isTouched = isTouched
  } 

  private validateField (fieldName: string, updateFormStatus = true): void {
    const fieldValidators = this.scheme[fieldName]
    let isValid = true
    let errorMessage = ''
    if (fieldValidators) {
      Object.keys(fieldValidators).forEach((e) => {
        if (fieldValidators[e].validator) {
          if (fieldValidators[e].isActive) {
            const result = fieldValidators[e].validator(this.fields[fieldName].value)
            if (!result) {
              isValid = false
              if (fieldValidators[e].errorMessage) {
                errorMessage = fieldValidators[e].errorMessage
              }
            }
          }
        }
      })  
    }

    this.fields[fieldName].valid = isValid
    this.fields[fieldName].errorMessage = errorMessage

    if (updateFormStatus) {
      this.updateFormStatus()
    }    
  }  

  private buildFieldNameArray (formValidationSchema: any = {}): any[] {
    const fieldArray: any[] = []
    Object.keys(formValidationSchema).forEach((fieldName) => {
      fieldArray.push(fieldName)
    })
    return fieldArray
  }

  private validateValidator (): void {
    const schema = this.scheme
    this.fieldNameArray.forEach((fieldName) => {
      const fieldValidators = schema[fieldName]
      if (fieldValidators) {
        Object.keys(fieldValidators).forEach((e) => {
          const validatorProperties = fieldValidators[e]
          if (validatorProperties.isActive === undefined) {
            validatorProperties.isActive = true
          }
        })
      }
    })
  }

  private initializeFields (fieldArray: any[]): any {
    let fields = {}
    fieldArray.forEach((fieldName) => {
      fields = {
        ...fields,
        [fieldName]: {
          dirty: false,
          touched: false,
          value: null,
          originalValue: null,
          valid: true,
          errorMessage: ''
        }
      }
    })

    return fields
  }
}
