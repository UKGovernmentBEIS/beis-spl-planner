const express = require('express')
const router = express.Router()
const nunjucks = require('nunjucks')
const pdf = require('html-pdf')

router.get('/example.pdf', function (req, res) {
  nunjucks.render('forms/example.njk', { data: req.session.data }, function (e, html) {
    pdf.create(html).toStream((e, stream) => stream.pipe(res))
  })
})

module.exports = router
