class LeaveTracker {
  constructor () {
    this.firstLeaveWeek = null
    this.lastLeaveWeek = null
    this.initialBlockStarted = false
    this.initialBlockEnded = false
    this.initialBlockLength = 0

    this.firstPayWeek = null
    this.lastPayWeek = null
    this.initialPayBlockStarted = false
    this.initialPayBlockEnded = false
    this.initialPayBlockLength = 0
  }

  next (isLeave, isPay, weekNumber) {
    if (isLeave) {
      this.firstLeaveWeek = this.firstLeaveWeek !== null ? this.firstLeaveWeek : weekNumber
      this.lastLeaveWeek = weekNumber
    }
    this.initialBlockStarted = this.firstLeaveWeek !== null
    this.initialBlockEnded = this.initialBlockEnded || (this.initialBlockStarted && !isLeave)
    if (this.initialBlockStarted && !this.initialBlockEnded) {
      this.initialBlockLength++
    }

    if (isPay) {
      this.firstPayWeek = this.firstPayWeek !== null ? this.firstPayWeek : weekNumber
      this.lastPayWeek = weekNumber
    }
    this.initialPayBlockStarted = this.firstPayWeek !== null
    this.initialPayBlockEnded = this.initialPayBlockEnded || (this.initialPayBlockStarted && !isPay)
    if (this.initialPayBlockStarted && !this.initialPayBlockEnded) {
      this.initialPayBlockLength++
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
