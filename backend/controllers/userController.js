const User = require('../models/UserModels')
const Post = require('../models/PostModels')

// Registrarse
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    let user = await User.findOne({ email })
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: 'El usuario ya existe' })
    }

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: 'sample_id', url: 'sample_url' }
    })

    const token = await user.generateToken()

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true
    }

    res
      .status(201)
      .cookie('token', token, options)
      .json({
        success: true,
        user,
        token
      })
  } catch (error) {
    res.status(500).json({
      success: false,
      massage: error.message
    })
  }
}

// Acceso
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'El usuario no existe' })
    }
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Contraseña incorrecta' })
    }

    const token = await user.generateToken()

    const options = {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true
    }

    res
      .status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        user,
        token
      })
  } catch (error) {
    res.status(500).json({
      success: false,
      massage: error.message
    })
  }
}

// Cerrar sesión
exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie('token', null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: 'Desconetado'
      })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Seguir usuario
exports.followUser = async (req, res) => {
  const userToFollow = await User.findById(req.params.id)
  const loggedInUser = await User.findById(req.user._id)

  if (!userToFollow) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    })
  }

  if (loggedInUser.following.includes(userToFollow._id)) {
    const indexfollowing = loggedInUser.following.indexOf(userToFollow._id)
    const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id)

    loggedInUser.following.splice(indexfollowing, 1)
    userToFollow.followers.splice(indexfollowers, 1)

    await loggedInUser.save()
    await userToFollow.save()

    res.status(200).json({
      success: true,
      message: 'Dejar de seguir Usuario'
    })
  } else {
    loggedInUser.following.push(userToFollow._id)
    userToFollow.followers.push(loggedInUser._id)

    await loggedInUser.save()
    await userToFollow.save()

    res.status(200).json({
      success: true,
      message: 'Usuario seguido'
    })
  }

  try {
  } catch (error) {
    res.status(500).json({
      success: false,
      massage: error.message
    })
  }
}

// Actualiza contraseña
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password')

    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Proporcione la contraseña antigua y la nueva'
      })
    }
    const isMatch = await user.matchPassword(oldPassword)

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Contraseña antigua incorrecta' })
    }

    user.password = newPassword
    await user.save()

    res.status(200).json({ success: true, message: 'Contraseña Atualizada' })
  } catch (error) {
    res.status(500).json({
      success: false,
      massage: error.message
    })
  }
}

// Actualización del perfil
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const { name, email } = req.body

    if (name) {
      user.name = name
    }

    if (email) {
      user.email = email
    }

    // Use Avatar
    await user.save()
    res.status(200).json({
      success: true,
      message: 'Perfil Atualizado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      massage: error.message
    })
  }
}

// Eliminar mi perfil
exports.deleteMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const posts = user.posts
    const followers = user.followers
    const following = user.following
    const userId = user._id

    await user.remove()

    // Cerrar sesión de usuario después de eliminar el perfil
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true
    })

    // Eliminar todas las publicaciones del usuario.
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i])
      await post.remove()
    }

    // Eliminación del usuario de los seguidores siguientes
    for (let i = 0; i < array.length; i++) {
      const follower = await User.findById(followers[i])

      const index = follower.following.indexOf(userId)
      follower.following.splice(index, 1)
      await follower.save()
    }

    // Eliminación del usuario de los siguientes seguidores
    for (let i = 0; i < array.length; i++) {
      const follows = await User.findById(following[i])

      const index = follows.followers.indexOf(userId)
      follows.followers.splice(index, 1)
      await follows.save()
    }
    res.status(200).json({
      success: true,
      message: 'Perfil Eliminado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Mi perfil
exports.myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('posts')

    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Obtener perfil de usuario
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('posts')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }
    res.status(200).json({
      success: true,
      user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Obtener todos los usuarios
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find({})

    res.status(200).json({
      success: true,
      users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
