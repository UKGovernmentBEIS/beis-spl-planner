const LeaveTracker = require('./leaveTracker')
const { STATUTORY_MAXIMUM_PAY } = require('../constants')
const dset = require('dset')

class Weeks {
  constructor ({ isBirth, startWeek, primary, secondary, eligibility }) {
    this.isBirth = isBirth
    this.startWeek = startWeek
    this.primary = primary
    this.secondary = secondary
    this.primaryLeaveType = isBirth ? 'maternity' : 'adoption'
    this.payRates = this._getPayRates()
    this.minimumWeek = this._getMinimumWeek()
    this.eligibility = eligibility
  }

  leaveAndPay () {
    const weeks = []
    let primaryLeaveTracker = new LeaveTracker()
    let secondaryLeaveTracker = new LeaveTracker()
    let hasCurtailedPrimaryPay = false
    let primarySplHasStarted = false
    for (let i = this.minimumWeek; i <= 52; i++) {
      const week = this._getBaseWeek(i)
      const weekLeaveAndPay = this._getWeekLeaveAndPay(i)

      primaryLeaveTracker.next(weekLeaveAndPay.primary.leave, weekLeaveAndPay.primary.pay, i)
      if (weekLeaveAndPay.primary.leave) {
        if (!primarySplHasStarted) {
          const startSplBecauseOfBreak = primaryLeaveTracker.initialBlockEnded
          const startSplBecauseOfPayAfterCurtailment = hasCurtailedPrimaryPay && weekLeaveAndPay.primary.pay
          primarySplHasStarted = startSplBecauseOfBreak || startSplBecauseOfPayAfterCurtailment
        }
        dset(week.primary, 'leave.text', !primarySplHasStarted ? this.primaryLeaveType : 'shared')
        if (weekLeaveAndPay.primary.pay) {
          if (primarySplHasStarted) {
            dset(week.primary, 'pay.text', this.payRates.primary.statutory)
          } else {
            const useInitialPayRate = primaryLeaveTracker.initialBlockLength <= 6
            dset(week.primary, 'pay.text', useInitialPayRate ? this.payRates.primary.initial : this.payRates.primary.statutory)
          }
        } else {
          hasCurtailedPrimaryPay = true
        }
        dset(week.primary, 'pay.eligible', this._weekEligibleForPrimaryPay(week))
        dset(week.primary, 'leave.eligible', this._weekEligibleForPrimaryLeave(week))
      }

      if (!week.secondary.disabled) {
        secondaryLeaveTracker.next(weekLeaveAndPay.secondary.leave, weekLeaveAndPay.secondary.pay, i)
        if (weekLeaveAndPay.secondary.leave) {
          const usePaternityLeave = i < 8 && !secondaryLeaveTracker.initialBlockEnded && secondaryLeaveTracker.initialBlockLength <= 2
          dset(week.secondary, 'leave.text', usePaternityLeave ? 'paternity' : 'shared')
          if (weekLeaveAndPay.secondary.pay) {
            dset(week.secondary, 'pay.text', this.payRates.secondary.statutory)
          }
          dset(week.secondary, 'pay.eligible', this._weekEligibleForSecondaryPay(week))
        }
        dset(week.secondary, 'leave.eligible', this._weekEligibleForSecondaryLeave(week))
      }

      weeks.push(week)
    }
    return {
      weeks,
      leaveBoundaries: {
        primary: primaryLeaveTracker.getLeaveBoundaries(),
        secondary: secondaryLeaveTracker.getLeaveBoundaries()
      }
    }
  }

  _weekEligibleForPrimaryLeave (week) {
    if (this.eligibility.primary.spl) {
      return true
    } else if (!this.eligibility.primary.statutoryLeave) {
      return false
    } else {
      return week.primary.leave.text === 'maternity'
    }
  }

  _weekEligibleForSecondaryLeave (week) {
    if (this.eligibility.secondary.spl) {
      return true
    } else if (!this.eligibility.secondary.statutoryLeave) {
      return false
    } else {
      return week.secondary.leave.text === 'paternity'
    }
  }

  _weekEligibleForPrimaryPay (week) {
    if (this.eligibility.primary.shpp) {
      return true
    } else if (this.eligibility.primary.statutoryPay) {
      return week.primary.leave.text === 'maternity'
    } else {
      return false
    }
  }

  _weekEligibleForSecondaryPay (week) {
    if (this.eligibility.secondary.shpp) {
      return true
    } else if (this.eligibility.secondary.statutoryPay) {
      return week.secondary.leave.text === 'paternity'
    } else {
      return false
    }
  }

  hasPrimarySharedPayOrLeave () {
    // When the planner has been designed such that parents who are workers can take
    // shared parental pay and not leave, we'll need to check here for shared pay as well.
    return this.leaveAndPay().weeks.some(week => {
      return week.primary.leave.text === 'shared'
    })
  }

  hasSecondarySharedPayOrLeave () {
    // When the planner has been designed such that parents who are workers can take
    // shared parental pay and not leave, we'll need to check here for shared pay as well.
    return this.leaveAndPay().weeks.some(week => {
      return week.secondary.leave.text === 'shared'
    })
  }

  _getMinimumWeek () {
    return this.isBirth ? -11 : -2
  }

  _getBaseWeek (idx) {
    return {
      id: 'week_' + idx,
      number: idx,
      day: this.startWeek.add(idx, 'weeks'),
      primary: {
        disabled: false,
        compulsory: idx === 0 || idx === 1,
        leave: {},
        pay: {}
      },
      secondary: {
        disabled: idx < 0,
        compulsory: false,
        leave: {},
        pay: {}
      }
    }
  }

  _getWeekLeaveAndPay (idx) {
    const isCompulsoryPrimaryWeek = (idx === 0 || idx === 1)
    return {
      primary: {
        leave: this.primary.leaveWeeks.includes(idx) || isCompulsoryPrimaryWeek,
        pay: this.primary.payWeeks.includes(idx)
      },
      secondary: {
        leave: this.secondary.leaveWeeks.includes(idx),
        pay: this.secondary.payWeeks.includes(idx)
      }
    }
  }

  _getPayRates () {
    return {
      primary: {
        initial: this.primary.weeklyPay ? this._formatPay(0.9 * this.primary.weeklyPay) : '90% of weekly pay',
        statutory: this._getStatutoryPay(this.primary.weeklyPay)
      },
      secondary: {
        statutory: this._getStatutoryPay(this.secondary.weeklyPay)
      }
    }
  }

  _getStatutoryPay (weeklyPay) {
    return weeklyPay
      ? this._formatPay(Math.min(weeklyPay * 0.9, STATUTORY_MAXIMUM_PAY))
      : 'Up to ' + this._formatPay(STATUTORY_MAXIMUM_PAY)
  }

  _formatPay (pay) {
    const payAsFloat = parseFloat(pay)
    return isNaN(payAsFloat) ? pay : '£' + payAsFloat.toFixed(2)
  }
}

module.exports = Weeks
