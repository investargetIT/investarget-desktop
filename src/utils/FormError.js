
class FormError extends Error {
  constructor(message) {
    super(message)
    this.name = 'FormError'
  }
}

export default FormError
