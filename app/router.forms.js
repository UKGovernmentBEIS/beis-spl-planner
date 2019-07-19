const express = require('express')
const router = express.Router()
const nunjucks = require('nunjucks')
const fileUrl = require('file-url')
const pdf = require('html-pdf')
const { getBlocks, getAdjustedPayBlocks } = require('./lib/blocks')

const config = {
  base: fileUrl('app/views/forms') + '/',
  format: 'A4'
}

function generateFormAndReturn (req, res, templateName, parent) {
  // TODO: Better error handling.
  try {
    const { leaveBlocks, payBlocks } = getBlocks(req.session.data)
    const adjustedPayBlocks = getAdjustedPayBlocks(leaveBlocks, payBlocks)
    const otherParent = (parent === 'primary') ? 'secondary' : 'primary'
    const formdata = {
      data: req.session.data,
      leaveBlocks: leaveBlocks[parent],
      partnerLeaveBlocks: leaveBlocks[otherParent],
      sharedPayBlocks: adjustedPayBlocks[parent],
      partnerSharedPayBlocks: adjustedPayBlocks[otherParent]
    }
    nunjucks.render(templateName, formdata, function (e, html) {
      if (e) {
        console.log(e)
        res.send('error')
      } else {
        pdf.create(html, config).toStream((e, stream) => stream.pipe(res))
      }
    })
  } catch (e) {
    console.log(e)
    res.send('error')
  }
}

router.get('/SPL_Mother_Birth.pdf', function (req, res) {
  generateFormAndReturn(req, res, 'forms/pages/declaration-maternity-primary.njk', 'primary')
})

router.get('/SPL_FatherOrPartner_Birth.pdf', function (req, res) {
  generateFormAndReturn(req, res, 'forms/pages/declaration-maternity-secondary.njk', 'secondary')
})

router.get('/SPL_Primary_Adopter.pdf', function (req, res) {
  generateFormAndReturn(req, res, 'forms/pages/declaration-adoption-primary.njk', 'primary')
})

router.get('/SPL_Primary_Adopters_Partner.pdf', function (req, res) {
  generateFormAndReturn(req, res, 'forms/pages/declaration-adoption-secondary.njk', 'secondary')
})

router.get('/Maternity_Leave_Curtailment_SPL_Consent.pdf', function (req, res) {
  generateFormAndReturn(req, res, 'forms/pages/curtailment-notice-maternity.njk', 'primary')
})

router.get('/Adoption_Leave_Curtailment_SPL_Consent.pdf', function (req, res) {
  generateFormAndReturn(req, res, 'forms/pages/curtailment-notice-adoption.njk', 'primary')
})

module.exports = router
