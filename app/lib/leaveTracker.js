class LeaveTracker {
  constructor () {
    this.firstLeaveWeek = null
    this.lastLeaveWeek = null
    this.initialBlockStarted = false
    this.initialBlockEnded = false
    this.initialBlockLength = 0
  }

  next (value, weekNumber) {
    if (value) {
      this.firstLeaveWeek = this.firstLeaveWeek !== null ? this.firstLeaveWeek : weekNumber
      this.lastLeaveWeek = weekNumber
    }
    this.initialBlockStarted = this.firstLeaveWeek !== null
    this.initialBlockEnded = this.initialBlockEnded || (this.initialBlockStarted && !value)
    if (this.initialBlockStarted && !this.initialBlockEnded) {
      this.initialBlockLength++
    }
  }

  getLeaveBoundaries () {
    return {
      firstWeek: this.firstLeaveWeek,
      lastWeek: this.lastLeaveWeek
    }
  }
}

module.exports = LeaveTracker