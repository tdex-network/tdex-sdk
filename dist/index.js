
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./tdex-sdk.cjs.production.min.js')
} else {
  module.exports = require('./tdex-sdk.cjs.development.js')
}
