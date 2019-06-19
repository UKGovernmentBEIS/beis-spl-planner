const express = require('express')
const router = express.Router()
const nunjucks = require('nunjucks')
const fileUrl = require('file-url')
const pdf = require('html-pdf')

const config = {
  base: fileUrl('app/views/forms') + '/',
  format: 'A4'
}

// TODO REMOVE
router.get('/example.html', function (req, res) {
  try {
    nunjucks.render('forms/example.njk', { data: req.session.data }, function (e, html) {
      if (e) {
        console.log(e)
        res.send('error')
      } else {
        res.set("ContentType", "text/html")
        res.send(html)
      }
    })
  } catch (e) {
    console.log(e)
    res.send('error')
  }
})

router.get('/declaration.pdf', function (req, res) {
  // TODO: Better error handling.
  try {
    nunjucks.render('forms/pages/declaration-'+req.query.state+'-'+req.query.parent+'.njk', { data: req.session.data }, function (e, html) {
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
