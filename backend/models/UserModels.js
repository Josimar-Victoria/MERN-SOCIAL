const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor ingresa un nombre']
  },

  avatar: {
    public_id: String,
    url: String
  },

  email: {
    type: String,
    required: [true, 'Por favor ingresa un corre eletronico'],
    unique: [true, 'Este correo eletronico ya existe']
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa tu password'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
})

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10)
  }

  next()
})

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET)
}

module.exports = mongoose.model('User', userSchema)
