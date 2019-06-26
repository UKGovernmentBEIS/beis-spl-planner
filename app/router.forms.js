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

router.get('/declaration.pdf', function (req, res) {
  // TODO: Better error handling.
  try {
    const { leaveBlocks, payBlocks } = getBlocks(req.session.data);
    const adjustedPayBlocks = getAdjustedPayBlocks(leaveBlocks, payBlocks);

    let formdata = {};
    if (req.query.parent === "primary") {
      formdata = { 
        data: req.session.data, 
        leaveBlocks: leaveBlocks.primary, 
        partnerLeaveBlocks: leaveBlocks.secondary,
        sharedPayBlocks: adjustedPayBlocks.primary,
        partnerSharedPayBlocks: adjustedPayBlocks.secondary
      }
    } else {
      formdata = { 
        data: req.session.data, 
        leaveBlocks: leaveBlocks.secondary, 
        partnerLeaveBlocks: leaveBlocks.primary,
        sharedPayBlocks: adjustedPayBlocks.secondary,
        partnerSharedPayBlocks: adjustedPayBlocks.primary
      }
    }

    nunjucks.render('forms/pages/declaration-'+req.query.state+'-'+req.query.parent+'.njk', 
    formdata, 
    function (e, html) {
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
})

router.get('/curtailment.pdf', function (req, res) {
  // TODO: Better error handling.
  try {
    const { leaveBlocks, payBlocks } = getBlocks(req.session.data);
    const adjustedPayBlocks = getAdjustedPayBlocks(leaveBlocks, payBlocks);

    let formdata = { 
      data: req.session.data, 
      leaveBlocks: leaveBlocks.primary, 
      partnerLeaveBlocks: leaveBlocks.secondary,
      sharedPayBlocks: adjustedPayBlocks.primary,
      partnerSharedPayBlocks: adjustedPayBlocks.secondary
    }

    nunjucks.render('forms/pages/curtailment-notice-'+req.query.state+'.njk', formdata, function (e, html) {
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
})

module.exports = router
