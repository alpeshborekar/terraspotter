const STATES = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' }

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5
    this.successThreshold = options.successThreshold || 2
    this.timeout = options.timeout || 60000 // 1 minute
    this.state = STATES.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.nextAttempt = Date.now()
  }

  async call(fn) {
    if (this.state === STATES.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN — service unavailable')
      }
      this.state = STATES.HALF_OPEN
    }

    try {
      const result = await fn()
      this._onSuccess()
      return result
    } catch (err) {
      this._onFailure()
      throw err
    }
  }

  _onSuccess() {
    this.failureCount = 0
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.successThreshold) {
        this.successCount = 0
        this.state = STATES.CLOSED
        console.log('Circuit breaker: CLOSED — service recovered')
      }
    }
  }

  _onFailure() {
    this.failureCount++
    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.OPEN
      this.nextAttempt = Date.now() + this.timeout
      console.warn('Circuit breaker: OPEN — service still failing')
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN
      this.nextAttempt = Date.now() + this.timeout
      console.warn(`Circuit breaker: OPEN after ${this.failureCount} failures`)
    }
  }

  getState() {
    return this.state
  }
}

module.exports = CircuitBreaker