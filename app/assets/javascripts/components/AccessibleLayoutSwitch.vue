<template>
  <div class="govuk-grid-row govuk-!-margin-bottom-2">
    <div class="govuk-grid-column-full">
      <button class="focus-only button-link" type="button" role="button"
        :aria-pressed="useAccessibleLayout ? 'true' : 'false'"
        @click.left="toggleAccessibleLayout">
        Toggle accessible layout
      </button>
      <div class="govuk-inset-text" v-if="useAccessibleLayout">
        <div>
          You are using the accessible layout of the calendar.
        </div>
        <button class="button-link" type="button"
          @click.left="toggleAccessibleLayout">
          Return to visual layout
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="sass" scoped>
  /* Uses approach from govuk-skip-link */
  .focus-only {
    width: 1px !important;
    height: 1px !important;
    margin: 0 !important;
    overflow: hidden!important;
    clip: rect(0 0 0 0)!important;
    -webkit-clip-path: inset(50%)!important;
    clip-path: inset(50%)!important;
    white-space: nowrap!important;
    font-family: nta,Arial,sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: block;
    &:active, &:focus {
      width: auto!important;
      height: auto!important;
      margin: inherit!important;
      overflow: visible!important;
      clip: auto!important;
      -webkit-clip-path: none!important;
      clip-path: none!important;
      white-space: inherit!important;
    }
  }
</style>


