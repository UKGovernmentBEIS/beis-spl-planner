const { describe, it, beforeEach } = require('mocha')
const { expect } = require('chai')
const sinon = require('sinon')

const mockEnv = {
  getFilter: sinon.stub().returns((data, parent) => `Parent Name: ${parent}`)
}

const filters = require('../../../../../../app/views/accessible-planner/answers-so-far/filters')(mockEnv)

describe('Filters', () => {
  let rows, data, dateMacroStub, dateEndMacroStub, formattedStartDate

  beforeEach(() => {
    rows = []

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 9)

    formattedStartDate = startDate.toISOString().split('T')[0]
    const endDate = new Date(startDate)
    endDate.setMonth(startDate.getMonth() + 1)

    data = {
      'leave-blocks': {
        primary: { spl: { _0: { start: formattedStartDate, end: endDate.toISOString().split('T')[0] } } },
        secondary: { spl: { _0: { start: formattedStartDate, end: endDate.toISOString().split('T')[0] } } },
        'spl-block-planning-order': ['primary', 'secondary']
      }
    }
    dateMacroStub = sinon.stub().returns('Formatted Start Date')
    dateEndMacroStub = sinon.stub().returns('Formatted End Date')
  })

  describe('appendSplAnswerRows', () => {
    it('should append rows for SPL blocks with start and end dates', () => {
      filters.appendSplAnswerRows(rows, data, dateMacroStub, dateEndMacroStub)

      expect(rows).to.have.lengthOf(4)

      // First SPL block (Primary)
      expect(rows[0].key.text).to.include('SPL block 1 of 2 start')
      expect(rows[0].value.text).to.equal('Formatted Start Date')
      expect(rows[0].actions.items[0].href).to.include('/planner/shared-parental-leave/start?block=1')

      expect(rows[1].key.text).to.include('SPL block 1 of 2 end')
      expect(rows[1].value.text).to.equal('Formatted End Date')
      expect(rows[1].actions.items[0].href).to.include('/planner/shared-parental-leave/end?block=1')

      // Second SPL block (Secondary)
      expect(rows[2].key.text).to.include('SPL block 2 of 2 start')
      expect(rows[2].value.text).to.equal('Formatted Start Date')
      expect(rows[2].actions.items[0].href).to.include('/planner/shared-parental-leave/start?block=2')

      expect(rows[3].key.text).to.include('SPL block 2 of 2 end')
      expect(rows[3].value.text).to.equal('Formatted End Date')
      expect(rows[3].actions.items[0].href).to.include('/planner/shared-parental-leave/end?block=2')
    })

    it('should handle cases with no SPL blocks', () => {
      data['leave-blocks'].primary.spl = null
      data['leave-blocks'].secondary.spl = null

      filters.appendSplAnswerRows(rows, data, dateMacroStub, dateEndMacroStub)

      expect(rows).to.have.lengthOf(0)
    })

    it('should skip blocks without start or end dates', () => {
      data['leave-blocks'].secondary.spl._0 = { start: formattedStartDate }

      filters.appendSplAnswerRows(rows, data, dateMacroStub, dateEndMacroStub)

      expect(rows).to.have.lengthOf(3)

      expect(rows[0].key.text).to.include('SPL block 1 of 2 start')
      expect(rows[1].key.text).to.include('SPL block 1 of 2 end')
      expect(rows[2].key.text).to.include('SPL block 2 of 2 start')
    })
  })

  describe('removeRowsWithEmptyValues', () => {
    it('should remove rows with empty values', () => {
      rows = [
        { key: { text: 'Row 1' }, value: { text: 'Not Empty' } },
        { key: { text: 'Row 2' }, value: { text: '' } },
        { key: { text: 'Row 3' }, value: { text: ' ' } },
        { key: { text: 'Row 4' }, value: { html: '<p>Not Empty</p>' } },
        { key: { text: 'Row 5' }, value: { html: ' ' } }
      ]

      const filteredRows = filters.removeRowsWithEmptyValues(rows)

      expect(filteredRows).to.have.lengthOf(2)
      expect(filteredRows[0].key.text).to.equal('Row 1')
      expect(filteredRows[1].key.text).to.equal('Row 4')
    })

    it('should retain all rows if all values are non-empty', () => {
      rows = [
        { key: { text: 'Row 1' }, value: { text: 'Not Empty' } },
        { key: { text: 'Row 2' }, value: { html: '<p>Non-empty</p>' } }
      ]

      const filteredRows = filters.removeRowsWithEmptyValues(rows)

      expect(filteredRows).to.deep.equal(rows)
    })
  })
})
