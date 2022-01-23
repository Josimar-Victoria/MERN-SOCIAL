const mongoose = require('mongoose')

exports.connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(con => console.log(`Base de datos conectada ${con.connection.host}`))
    .catch(err => console.error(err))
}
