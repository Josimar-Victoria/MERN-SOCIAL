const Post = require('../models/PostModels')
const User = require('../models/UserModels')

// Crear Publicacion
exports.createPost = async (req, res) => {
  try {
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: 'req.body.public_id',
        url: 'req.body.url'
      },
      owner: req.user._id
    }

    const post = await Post.create(newPostData)

    const user = await User.findById(req.user._id)

    user.posts.push(post._id)

    await user.save()

    res.status(201).json({
      success: true,
      post
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Eliminar Publicacion
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      })
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      })
    }

    await post.remove()

    const user = await User.findById(req.user._id)

    const index = user.posts.indexOf(req.params.id)
    user.posts.splice(index, 1)

    await user.save()
    res.status(200).json({
      success: true,
      message: 'Publicacion Eliminada'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Me gusta y no me gusta la publicación
exports.likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      })
    }
    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id)

      post.likes.splice(index, 1)

      await post.save()

      return res.status(200).json({
        success: true,
        message: 'Publicación no deseada'
      })
    } else {
      post.likes.push(req.user._id)

      await post.save()

      return res.status(200).json({
        success: true,
        message: 'Publicación que le gustó'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// Obtener publicación de seguimiento
exports.getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    const posts = await Post.find({
      owner: {
        $in: user.following
      }
    })
    res.status(200).json({
      success: true,
      posts
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

//actualización Caption
exports.updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada'
      })
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado'
      })
    }

    post.caption = req.body.caption
    await post.save()

    res.status(200).json({
      success: true,
      message: 'Publicacion Atualizada'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.massage
    })
  }
}

