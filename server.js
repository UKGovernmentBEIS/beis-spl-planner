// Node.js core dependencies
const path = require('path')

// Npm dependencies
const express = require('express')
const session = require('express-session')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const loggingMiddleware = require('morgan')
const argv = require('minimist')(process.argv.slice(2))
const staticify = require('staticify')(path.join(__dirname, 'public'))
const compression = require('compression')
const nunjucks = require('nunjucks')
const MemoryStore = require('memorystore')(session)

// Local dependencies
const router = require('./app/router')
const paths = require('./app/paths')
const noCache = require('./common/utils/no-cache')
const correlationHeader = require('./common/middleware/correlation-header')
const handle404 = require('./common/middleware/handle-404')
const handle500 = require('./common/middleware/handle-500')
const sessionData = require('./common/utils/session-data')
const logger = require('./app/logger')

// Global constants
const unconfiguredApp = express()
const oneYear = 86400000 * 365
const publicCaching = { maxAge: oneYear }
const PORT = process.env.PORT || 3000
const { NODE_ENV } = process.env
const CSS_PATH = staticify.getVersionedPath('/stylesheets/application.min.css')
const JAVASCRIPT_PATH = staticify.getVersionedPath(
  '/javascripts/application.js'
)
const { SERVICE_NAME, STATUTORY_MAXIMUM_PAY } = require('./app/constants')

// Define app views
const APP_VIEWS = [
  path.join(__dirname, 'node_modules/govuk-frontend/dist/govuk/'),
  path.join(__dirname, 'node_modules/govuk-frontend/dist/govuk/components/'),
  path.join(__dirname, 'node_modules/@hmcts/frontend/dist/components/'),
  path.join(__dirname, 'app/views/'),
  path.join(__dirname, 'common/macros/')
]

const cookieParser = require('cookie-parser')

function initialiseGlobalMiddleware (app) {
  app.set('settings', { getVersionedPath: staticify.getVersionedPath })
  app.use(
    favicon(
      path.join(
        __dirname,
        'node_modules/govuk-frontend/dist/govuk/assets/',
        'images',
        'favicon.ico'
      )
    )
  )
  app.use(compression())
  app.use(staticify.middleware)

  if (process.env.DISABLE_REQUEST_LOGGING !== 'true') {
    const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - total time :response-time ms'

    const devFormat = ':method :url :status :response-time ms - :res[content-length]'

    const logFormat = NODE_ENV === 'production' ? prodFormat : devFormat

    const excludedPathsRegex =
      /\/((?!images|public|stylesheets|javascripts).)*/

    app.use(excludedPathsRegex, loggingMiddleware(logFormat))
  }

  app.use(cookieParser())

  app.use((req, res, next) => {
    res.locals.asset_path = '/public/' // eslint-disable-line camelcase
    const cmUserPreferences = req.cookies['cm-user-preferences']
    if (cmUserPreferences) {
      res.locals.cmUserPreferences = JSON.parse(cmUserPreferences)
    }
    noCache(res)
    next()
  })
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.use('*', correlationHeader)

  const maxAge = 86400000 // Prune expired entries every 24 hours.
  app.use(
    session({
      secret: 'beis-spl-planner',
      name: 'application',
      store: new MemoryStore({
        checkPeriod: maxAge
      }),
      resave: false,
      saveUninitialized: false
    })
  )

  app.use(sessionData)

  function handleFormErrorsForView (app) {
    app
      .route('*')
      .post(function initializeSessionErrors (req, res, next) {
        req.session.errors = {}
        next()
      })
      .get(function addErrorsToLocals (req, res, next) {
        res.locals.errors = req.session.errors
        next()
      })
  }

  handleFormErrorsForView(app)

  app.get('*', require('./common/middleware/step-validation'))
}

function initialiseProxy (app) {
  app.enable('trust proxy')
}

function initialiseTemplateEngine (app) {
  // Configure nunjucks
  // see https://mozilla.github.io/nunjucks/api.html#configure
  const nunjucksConfiguration = {
    express: app, // The express app that nunjucks should install to
    autoescape: true, // Controls if output with dangerous characters are escaped automatically
    throwOnUndefined: false, // Throw errors when outputting a null/undefined value
    trimBlocks: true, // Automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // Automatically remove leading whitespace from a block/tag
    watch: NODE_ENV !== 'production', // Reload templates when they are changed (server-side). To use watch, make sure optional dependency chokidar is installed
    noCache: NODE_ENV !== 'production' // Never use a cache and recompile templates each time (server-side)
  }

  // Initialise nunjucks environment
  const nunjucksEnvironment = nunjucks.configure(
    APP_VIEWS,
    nunjucksConfiguration
  )

  // Set view engine
  app.set('view engine', 'njk')

  // Version static assets on production for better caching
  // if it's not production we want to re-evaluate the assets on each file change
  nunjucksEnvironment.addGlobal(
    'css_path',
    NODE_ENV === 'production'
      ? CSS_PATH
      : staticify.getVersionedPath('/stylesheets/application.min.css')
  )
  nunjucksEnvironment.addGlobal(
    'js_path',
    NODE_ENV === 'production'
      ? JAVASCRIPT_PATH
      : staticify.getVersionedPath('/javascripts/application.js')
  )
  nunjucksEnvironment.addGlobal('service_name', SERVICE_NAME)
  nunjucksEnvironment.addGlobal('statutory_maximum_pay', STATUTORY_MAXIMUM_PAY)

  // Paths to external resources and tools.
  // TODO: Update fallback with final path of eligibility tool.
  nunjucksEnvironment.addGlobal(
    'mainstream_guidance_root_path',
    process.env.MAINSTREAM_GUIDANCE_ROOT_PATH ||
      'https://www.gov.uk/plan-shared-parental-leave-pay'
  )
  nunjucksEnvironment.addGlobal(
    'eligibility_tool_root_path',
    process.env.ELIGIBILITY_ROOT_PATH ||
      'https://www.gov.uk/shared-parental-leave-and-pay'
  )

  nunjucksEnvironment.addGlobal(
    'GOOGLE_ANALYTICS_ID',
    process.env.GOOGLE_ANALYTICS_ID
  )

  // Add filters
  const commonFilters = require('./common/spl-common-filters')(
    nunjucksEnvironment
  )
  Object.entries(commonFilters).forEach((nameAndFunction) =>
    nunjucksEnvironment.addFilter(...nameAndFunction)
  )
  // App filters must be imported after common filters have been added so that common filters are available for use in app filters
  const appFilters = require('./app/filters')(nunjucksEnvironment)
  Object.entries(appFilters).forEach((nameAndFunction) =>
    nunjucksEnvironment.addFilter(...nameAndFunction)
  )
}

function initialisePublic (app) {
  app.use(
    '/javascripts',
    express.static(
      path.join(__dirname, '/public/assets/javascripts'),
      publicCaching
    )
  )
  app.use(
    '/images',
    express.static(path.join(__dirname, '/public/images'), publicCaching)
  )
  app.use(
    '/stylesheets',
    express.static(
      path.join(__dirname, '/public/assets/stylesheets'),
      publicCaching
    )
  )
  app.use('/public', express.static(path.join(__dirname, '/public')))
  app.use(
    '/',
    express.static(path.join(__dirname, '/node_modules/govuk-frontend/govuk/'))
  )
}

function initialiseRoutes (app) {
  const routes = paths.getAllPaths()
  app.locals.paths = routes
  app.use('/', router)
}

function handleErrors (app) {
  app.use(handle404)
  if (process.env.NODE_ENV !== 'development') {
    app.use(handle500)
  }
}

function listen () {
  const app = initialise()
  app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`, {
      eventType: 'ApplicationEvent'
    })
  })
}

/**
 * Configures app
 * @return app
 */
function initialise () {
  const app = unconfiguredApp
  app.disable('x-powered-by')
  initialiseProxy(app)
  initialiseGlobalMiddleware(app)
  initialiseTemplateEngine(app)
  initialisePublic(app)
  initialiseRoutes(app)
  handleErrors(app)
  return app
}

/**
 * Starts app after ensuring DB is up
 */
function start () {
  listen()
}

/**
 * -i flag. Immediately invoke start.
 * Allows script to be run by task runner
 */
if (argv.i) {
  start()
}

module.exports = {
  start,
  getApp: initialise,
  staticify
}
