import Post from "../models/post.js";
import User from "../models/User.js";
import cloudinary from "cloudinary";
import getDataUri from "../utiils/dataURI.js";

// const createPost = async (req, res) => {
//   try {
//     const { caption } = req.body;
//     const image = req.file;

//     console.log("caption", caption);
//     console.log("image", image);

//     if (!caption && !image) {
//       res.status(400).json({
//         success: false,
//         message: "Please Fill All Fields!",
//       });
//     }
//     // console.log(image);
//     const imageUri = getDataUri(image);

//     console.log("imgUri", imageUri);

//     const myCloud = await cloudinary.v2.uploader.upload(imageUri.content, {
//       folder: "posts",
//     });

//     const newPostData = {
//       caption,
//       image: {
//         public_id: myCloud.public_id,
//         url: myCloud.secure_url,
//       },
//       owner: req.user._id,
//     };

//     const newPost = await Post.create(newPostData);
//     const user = await User.findById(req.user._id);

//     user.post.push(newPost._id);

//     await user.save();

//     res.status(201).json({
//       success: true,
//       message: "Post created.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;
    if (!caption) {
      return res.status(400).json({
        success: false,
        message: "Please enter all fields!",
      });
    }
    if (file) {
      const myCloud = await cloudinary.v2.uploader.upload(file, {
        folder: "posts",
      });
    }
    const newPostData = {
      caption,
      image: {
        public_id: "myCloud.public_id",
        url: "myCloud.secure_url",
      },
      owner: req.user._id,
    };
    const newPost = await Post.create(newPostData);
    const user = await User.findById(req.user._id);
    user.post.unshift(newPost._id);
    await user.save();
    return res.status(201).json({
      success: true,
      message: "Post created.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// I have Created Post method now it's time for deletePost method...

const deletePost = async (req, res) => {
  try {
    // const user = await User.findById(req.user._id);
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised",
      });
    }

    await post.deleteOne();

    {
      /* To remove from user posts array also */
    }
    const user = await User.findById(req.user._id);
    const index = user.post.indexOf(req.params.id);
    user.post.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Post Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { deletePost };

// I have Created Post delete method now it's time for like&unlike method...

const likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);
      post.likes.splice(index, 1);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post Unliked",
      });
    } else {
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({
        success: true,
        message: "Post Liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { likeAndUnlikePost };

const commentOnPost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    // Checking if comment already exists
    let commentIndex = -1;
    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      post.comments[commentIndex].comment = req.body.comment;

      post = await post.save();

      return res.status(200).json({
        success: true,
        message: "comment updated",
        comments: post.comments,
      });
    } else {
      post.comments.unshift({
        user: req.user._id,
        comment: req.body.comment,
      });

      post = await post.save();

      return res.status(200).json({
        success: true,
        message: "comment added",
        comments: post.comments,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { commentOnPost };

const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found!",
      });
    }

    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId == undefined) {
        return res.status(400).json({
          success: false,
          message: "Comment Id is Required",
        });
      }

      // Owner Koi bhi comment delete kr skta hai.
      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Selected comment has delted from your Post.",
      });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });
      await post.save();
      res.status(200).json({
        success: true,
        message: "Your comment has deleted.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export { deleteComment };

export const getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner likes comments.user");

    res.status(200).json({
      success: true,
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

// Lets create updateCaption method..
const updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised",
      });
    }
    post.caption = req.body.caption;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post caption updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { updateCaption };

export const getPostComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("comments.user");
    return res.status(200).json({
      comments: post.comments,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getPostLikes = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("likes");
    return res.status(200).json({
      likes: post.likes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
