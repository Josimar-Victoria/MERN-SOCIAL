const app = require('./app')
const { connectDatabase } = require('./config/database')

connectDatabase()

app.listen(process.env.PORT, () => {
  console.log(`El servidor se está ejecutando en el puerto http://localhost:${process.env.PORT}`)
})
