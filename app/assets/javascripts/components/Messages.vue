<template>
    <div>
        <div>&ensp;{{ sharedLeaveRemaining }} leave weeks remaining</div>
        <div>&ensp;{{ payRemaining }} pay weeks remaining</div>
    </div>
</template>

<script>
    
  module.exports = {
    data: () => ({
      leaveWeeks: {
        primary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 },
        secondary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 }
      },
      shppAndPrimaryInitialPayWeeks: 0,
      paternityPayWeeks: 0
    }),
    props: {
      weeks: Array
    },
    methods: {
      resetTotals: function () {
        this.leaveWeeks = {
          primary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 },
          secondary: { nonSpl: 0, spl: 0, shppCountedAsSpl: 0 }
        }
        this.shppAndPrimaryInitialPayWeeks = 0
        this.paternityPayWeeks = 0
      },
      updateTotalsForParent: function (parent, week) {
        const isSpl = week[parent].leave.text === 'shared'

        if (week[parent].leave.text && week[parent].leave.eligible) {
          if (isSpl) {
            this.leaveWeeks[parent].spl++
          } else {
            this.leaveWeeks[parent].nonSpl++
          }
        }

        if (week[parent].pay.text && week[parent].pay.eligible) {
          const isPaternity = !isSpl && (parent === 'secondary')

          if (isPaternity) {
            this.paternityPayWeeks++
          } else {
            this.shppAndPrimaryInitialPayWeeks++

            if (!week[parent].leave.eligible) {
              this.leaveWeeks[parent].shppCountedAsSpl++
            }
          }
        }
      }
    },
    computed: {
      primaryLeaveUsed: function () {
        return this.leaveWeeks.primary.nonSpl
      },
      splUsed: function () {
        return this.leaveWeeks.primary.spl + this.leaveWeeks.secondary.spl
      },
      shppCountedAsSpl: function () {
        return this.leaveWeeks.primary.shppCountedAsSpl + this.leaveWeeks.secondary.shppCountedAsSpl
      },
      sharedLeaveRemaining: function () {
        const leaveBalanceUsed = this.primaryLeaveUsed + this.splUsed + this.shppCountedAsSpl
        return 52 - leaveBalanceUsed
      },
      payUsed: function () {
        return this.shppAndPrimaryInitialPayWeeks
      },
      payRemaining: function () {
        return 39 - this.payUsed
      }
    },
    watch: {
      weeks: {
        immediate: true,
        handler: function (val) {
          this.resetTotals()
          for (let week of val) {
            this.updateTotalsForParent('primary', week)
            this.updateTotalsForParent('secondary', week)
          }
        }
      }
    }
  }
</script>