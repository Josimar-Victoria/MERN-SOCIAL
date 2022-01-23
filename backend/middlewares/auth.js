const User = require('../models/UserModels')
const jwt = require('jsonwebtoken')

exports.isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies

    console.log(req.cookies.token)

    if (!token) {
      return res.status(401).json({
        message: 'Por favor inicie sesión primero'
      })
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded._id)

    next()
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
