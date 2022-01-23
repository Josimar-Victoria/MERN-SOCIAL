const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')

if (process.env.NODE_ENV !== 'producción') {
  require('dotenv').config({ path: 'backend/config/config.env' })
}

// Uso de middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())


// Importación de rutas
const post = require('./routes/postRoute')
const user = require('./routes/userRoute')

// Uso de rutas
app.use('/api/v1', post)
app.use('/api/v1', user)

module.exports = app
