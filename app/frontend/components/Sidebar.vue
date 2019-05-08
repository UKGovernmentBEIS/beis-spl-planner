<template>
  <div>
    <h2 class="govuk-heading-m">
      Leave and pay totals
    </h2>
    <p>
      Any unused {{ primary.leaveType }} leave can be taken as shared parental leave,
      and any unused {{ primary.leaveType }} pay can be taken as shared parental pay.
    </p>
  </div>
</template>

<script>
  module.exports = {
    props: {
      primary: Object,
      secondary: Object
    },
    filters: {
      weeks: function (number) {
        return number + ' ' + (number === 1 ? 'week' : 'weeks')
      }
    }
  }
</script>
