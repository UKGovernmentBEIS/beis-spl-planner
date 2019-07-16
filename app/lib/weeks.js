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
    this.eligibility = eligibility
    this.payRates = this._getPayRates()
    this.minimumWeek = this._getMinimumWeek()
  }

  leaveAndPay () {
    const weeks = []
    const primaryLeaveTracker = new LeaveTracker()
    const secondaryLeaveTracker = new LeaveTracker()
    let hasCurtailedPrimaryPay = false
    let primarySplHasStarted = false
    for (let i = this.minimumWeek; i <= 52; i++) {
      const week = this._getBaseWeek(i)
      const weekLeaveAndPay = this._getWeekLeaveAndPay(i)

      primaryLeaveTracker.next(weekLeaveAndPay.primary.leave, i)
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
        secondaryLeaveTracker.next(weekLeaveAndPay.secondary.leave, i)
        if (weekLeaveAndPay.secondary.leave) {
          const maxCellsDisplayedAsPaternity = this.eligibility.secondary.spl || this.eligibility.secondary.shpp ? 2 : 8
          const usePaternityLeave = i < 8 && !secondaryLeaveTracker.initialBlockEnded && secondaryLeaveTracker.initialBlockLength <= maxCellsDisplayedAsPaternity
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
    } else if (!this.eligibility.secondary.shpp) {
      return week.number < 8
    } else {
      return week.secondary.leave.text === 'paternity'
    }
  }

  _weekEligibleForPrimaryPay (week) {
    const {
      'shpp': shppEligible,
      'statutoryPay': statutoryPayEligible,
      'maternityAllowance': maternityAllowanceEligible
    } = this.eligibility.primary
    if (shppEligible) {
      return true
    } else if (statutoryPayEligible || maternityAllowanceEligible) {
      return week.primary.leave.text === 'maternity'
    } else {
      return false
    }
  }

  _weekEligibleForSecondaryPay (week) {
    if (this.eligibility.secondary.shpp) {
      return true
    } else if (!this.eligibility.secondary.statutoryPay) {
      return false
    } else if (!this.eligibility.secondary.spl) {
      return week.number < 8
    } else {
      return week.secondary.leave.text === 'paternity'
    }
  }

  hasPrimarySharedPayOrLeave () {
    return this._hasSharedPayOrLeave('primary')
  }

  hasSecondarySharedPayOrLeave () {
    return this._hasSharedPayOrLeave('secondary')
  }

  _hasSharedPayOrLeave (parent) {
    const weeks = this.leaveAndPay().weeks
    return weeks.some(week => {
      return week[parent].leave.text === 'shared'
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
        outOfPermittedRange: idx < 0,
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
        initial: this._getPrimaryPayRate('initial'),
        statutory: this._getPrimaryPayRate('statutory')
      },
      secondary: {
        statutory: this._getStatutoryPay(this.secondary.weeklyPay)
      }
    }
  }

  _getPrimaryPayRate (period) {
    const {
      'shpp': shppEligible,
      'statutoryPay': statutoryPayEligible,
      'maternityAllowance': maternityAllowanceEligible
    } = this.eligibility.primary
    const maternityAllowanceOnly = !shppEligible && !statutoryPayEligible && maternityAllowanceEligible
    if (maternityAllowanceOnly) {
      // when maternity allowance only, we only know the upper bound of the mother’s pay
      return this._getStatutoryPay()
    } else if (period === 'initial') {
      return this.primary.weeklyPay ? this._formatPay(0.9 * this.primary.weeklyPay) : '90% of weekly pay'
    } else {
      return this._getStatutoryPay(this.primary.weeklyPay)
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
