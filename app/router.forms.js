const express = require('express')
const router = express.Router()
const nunjucks = require('nunjucks')
const fileUrl = require('file-url')
const pdf = require('html-pdf')

const config = {
  base: fileUrl('app/views/forms') + '/',
  format: 'A4'
}

router.get('/example.pdf', function (req, res) {
  nunjucks.render('forms/example.njk', { data: req.session.data }, function (e, html) {
    pdf.create(html, config).toStream((e, stream) => stream.pipe(res))
  })
})

module.exports = router
