const LeaveTracker = require('./leaveTracker')

class Weeks {
  constructor ({ isBirth, startWeek, primary, secondary }) {
    this.isBirth = isBirth
    this.startWeek = startWeek
    this.primary = primary
    this.secondary = secondary
    this.primaryLeaveType = isBirth ? 'maternity' : 'adoption'
    this.payRates = this._getPayRates()
    this.minimumWeek = this._getMinimumWeek()
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

      primaryLeaveTracker.next(weekLeaveAndPay.primary.leave, i)
      if (weekLeaveAndPay.primary.leave) {
        if (!primarySplHasStarted) {
          const startSplBecauseOfBreak = primaryLeaveTracker.initialBlockEnded
          const startSplBecauseOfPayAfterCurtailment = hasCurtailedPrimaryPay && weekLeaveAndPay.primary.pay
          primarySplHasStarted = startSplBecauseOfBreak || startSplBecauseOfPayAfterCurtailment
        }
        week.primary.leave = !primarySplHasStarted ? this.primaryLeaveType : 'shared'
        if (weekLeaveAndPay.primary.pay) {
          if (primarySplHasStarted) {
            week.primary.pay = this.payRates.primary.statutory
          } else {
            const useInitialPayRate = primaryLeaveTracker.initialBlockLength <= 6
            week.primary.pay = useInitialPayRate ? this.payRates.primary.initial : this.payRates.primary.statutory
          }
        } else {
          hasCurtailedPrimaryPay = true
        }
      }

      if (!week.secondary.disabled) {
        secondaryLeaveTracker.next(weekLeaveAndPay.secondary.leave, i)
        if (weekLeaveAndPay.secondary.leave) {
          const usePaternityLeave = i < 8 && !secondaryLeaveTracker.initialBlockEnded && secondaryLeaveTracker.initialBlockLength <= 2
          week.secondary.leave = usePaternityLeave ? 'paternity' : 'shared'
          if (weekLeaveAndPay.secondary.pay) {
            week.secondary.pay = this.payRates.secondary.statutory
          }
        }
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

  hasPrimarySharedPayOrLeave () {
    // When the planner has been designed such that parents who are workers can take
    // shared parental pay and not leave, we'll need to check here for shared pay as well.
    return this.leaveAndPay().weeks.some(week => {
      return week.primary.leave === 'shared'
    })
  }

  hasSecondarySharedPayOrLeave () {
    // When the planner has been designed such that parents who are workers can take
    // shared parental pay and not leave, we'll need to check here for shared pay as well.
    return this.leaveAndPay().weeks.some(week => {
      return week.secondary.leave === 'shared'
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
        leave: undefined,
        pay: undefined
      },
      secondary: {
        disabled: idx < 0,
        compulsory: false,
        leave: undefined,
        pay: undefined
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
    const STATUTORY_MAXIMUM = 148.68
    return weeklyPay
      ? this._formatPay(Math.min(weeklyPay * 0.9, STATUTORY_MAXIMUM))
      : 'Up to ' + this._formatPay(STATUTORY_MAXIMUM)
  }

  _formatPay (pay) {
    const payAsFloat = parseFloat(pay)
    return isNaN(payAsFloat) ? pay : '£' + payAsFloat.toFixed(2)
  }
}

module.exports = Weeks
