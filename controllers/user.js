import User from "../models/User.js";
import Post from "../models/post.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import crypto from "crypto";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "Another account is using this email address!",
      });
    }

    let usernameExist = await User.findOne({ name });
    if (usernameExist) {
      return res.status(406).json({
        success: false,
        message: "Username already exist, try different",
      });
    }

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: "sample_id", url: "sample_url" },
    });

    const token = await user.generateToken();

    const options = {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    };

    return res.status(201).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { register };

// Lets create Login Method
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password!",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password!",
      });
    }

    const token = await user.generateToken();

    const options = {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    };

    res.status(200).cookie("token", token, options).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { login };

// Lets create Logout Method
const logout = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    };
    res.status(200).cookie("token", null, options).json({
      success: true,
      message: "Logged Out Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { logout };

// Lets create followUser or unfollowUser function
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);
    if (!userToFollow) {
      res.status(404).json({
        success: false,
        message: "User doesn't exist!",
      });
    }

    // It is process of Unfollowing User

    if (loggedInUser.following.includes(userToFollow._id)) {
      const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
      loggedInUser.following.splice(indexFollowing, 1);
      const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);
      userToFollow.followers.splice(indexFollowers, 1);
      await loggedInUser.save();
      await userToFollow.save();
      return res.status(200).json({
        success: true,
        message: loggedInUser.name + " unfollowed " + userToFollow.name,
      });
    } else {
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);
      await loggedInUser.save();
      await userToFollow.save();
      return res.status(200).json({
        success: true,
        message: loggedInUser.name + " is following " + userToFollow.name,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { followUser };

export const followSuggestions = async (req, res) => {
  try {
    // Fetch the current user's data with populated followers and following
    const user = await User.findById(req.user._id)
      .populate("followers")
      .populate("following");

    // Set to store unique user IDs in the final suggestions
    const uniqueUserIds = new Set();

    // Function to add suggestions to the set
    const addSuggestionsToSet = async (suggestions) => {
      for (const suggestion of suggestions) {
        if (!req.user.following.some((f) => f._id.equals(suggestion._id))) {
          uniqueUserIds.add(suggestion._id.toString());
        }
      }
    };

    // Fetch suggestions for each follower
    await Promise.all(
      user.followers.map(async (follower) => {
        if (!follower._id.equals(req.user._id)) {
          // Exclude the user's own followers
          const followerData = await User.findById(follower._id).populate({
            path: "following",
            match: {
              _id: {
                $nin: [...req.user.following.map((f) => f._id), req.user._id],
              },
            },
          });

          // Suggestions for the follower's following
          const followingSuggestions = followerData.following.filter(
            (followed) =>
              !req.user.following.some((f) => f._id.equals(followed._id))
          );

          // Suggestions for the follower's followers
          const followersSuggestions = followerData.followers.filter(
            (follower) =>
              !req.user.following.some((f) => f._id.equals(follower._id))
          );

          // Add suggestions to the set
          await addSuggestionsToSet([
            ...followingSuggestions,
            ...followersSuggestions,
          ]);
        }
      })
    );

    // Include suggestions from the people whom the user is following
    await Promise.all(
      user.following.map(async (followed) => {
        // Populate the "following" field for each person the user is following
        const followedData = await User.findById(followed._id).populate(
          "following"
        );

        // Add suggestions to the set
        await addSuggestionsToSet(followedData.following);
      })
    );

    // Fetch user objects based on unique user IDs
    const uniqueFinalSuggestions = await User.find({
      _id: { $in: Array.from(uniqueUserIds), $nin: [req.user._id] },
    });

    // Respond with the final list of suggestions
    return res.status(200).json({
      success: true,
      users: [...uniqueFinalSuggestions],
    });
  } catch (error) {
    // Handle errors and respond with an error status
    console.error(error);
    return res.status(500).json({
      success: false,
    });
  }
};

// Lets create updatePassword function
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please Submit oldPassword & newPassword",
      });
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(404).json({
        success: false,
        message: "Incorrect Old Password.",
      });
    } else {
      user.password = newPassword;
      await user.save();
      res.status(201).json({
        success: true,
        message: "Password Updated.",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { updatePassword };

// Lets create updateProfile function
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { newName, newEmail } = req.body;

    if (newName) {
      user.name = newName;
    }
    if (newEmail) {
      user.email = newEmail;
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: "Profile Updated.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { updateProfile };

// Lets create deleteMyProfile function
// const deleteMyProfile = async(req, res) => {
//     try {
//         let myId = req.user._id;
//         const user = await User.findById(myId);
//         const posts = user.post;
//         const myFollowers = user.followers;
//         const iAmFollowing = user.following;

//         // Delete all the posts of user
//         for(let i=0; i < posts.length; i++){
//             const post = await Post.findById(posts[i]);
//             await post.deleteOne();
//         }
//         // Delete me from all follower's 'following' array
//         for(let i=0; i<myFollowers.length; i++){
//             let follower = await User.findById(myFollowers[i]);
//             let myIdIndex = follower.following.findIndex(myId);
//             follower.following.splice(myIdIndex, 1);
//             await follower.save();
//         }
//         // Delete me from all following's 'followers' array
//         for(let i=0; i<iAmFollowing.length; i++){
//             let following = await User.findById(iAmFollowing[i]);
//             let myIdIndex = following.followers.findIndex(myId);
//             following.followers.splice(myIdIndex, 1);
//             await following.save();
//         }

//         // Delete User Profile
//         await user.deleteOne();

//         // Logout after deletion of profile
// const options = {
//   httpOnly: true,
//   expires: new Date(
//     Date.now()
//   ),
//   secure: process.env.NODE_ENV === "production",
//   sameSite: "none",
// };
//         res.cookie("token", null, options);

//         res.status(200).json({
//             success: true,
//             message: "Profile deleted"
//         })

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// };

const deleteMyProfile = async (req, res) => {
  try {
    // Get the currently logged-in user's ID
    const myId = req.user._id;

    // Find the user in the database
    const user = await User.findById(myId);

    // Get the IDs of all the user's posts
    const posts = user.post;

    // Get the IDs of all the user's followers
    const myFollowers = user.followers;

    // Get the IDs of all the users the user is following
    const iAmFollowing = user.following;

    // Delete all of the user's posts
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.deleteOne();
    }

    // Delete the user from all follower's 'following' array
    for (let i = 0; i < myFollowers.length; i++) {
      let follower = await User.findById(myFollowers[i]);
      let myIdIndex = follower.following.findIndex(
        (id) => id.toString() === myId.toString()
      );
      follower.following.splice(myIdIndex, 1);
      await follower.save();
    }

    // Delete the user from all following's 'followers' array
    for (let i = 0; i < iAmFollowing.length; i++) {
      let following = await User.findById(iAmFollowing[i]);
      let myIdIndex = following.followers.findIndex(
        (id) => id.toString() === myId.toString()
      );
      following.followers.splice(myIdIndex, 1);
      await following.save();
    }

    //   Remove my Id from all liked posts: TODO
    //   Remove my Id from all commented posts: TODO

    // Delete the user's profile
    await user.deleteOne();

    // Logout after deletion of profile
    const options = {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    };

    res.cookie("token", null, options);

    res.status(200).json({
      success: true,
      message: "Profile deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { deleteMyProfile };

// Lets create myProfile function
const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "post followers following"
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { myProfile };

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "post followers following post.owner post.likes post.comments.user"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getUserProfile };

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getAllUsers };

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // const resetPasswordToken = user.getResetPasswordToken();
    const resetPasswordToken = await user.getResetPasswordToken();

    await user.save();

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetPasswordToken}`;

    const message = `Reset your password by clicking on the link below: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Reset Password",
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { forgotPassword };

const resetPassword = async (req, res) => {
  try {
    const resetToken = await req.params.token;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is Invalid or has Expired.",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password Updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export { resetPassword };

const getMyPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = [];

    for (let i = 0; i < user.post.length; i++) {
      const post = await Post.findById(user.post[i]).populate(
        "likes comments.user"
      );
      posts.push(post);
    }

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getMyPosts };

// Fetch top 3 users with the largest number of followers
export const popularSuggestions = async (req, res) => {
  try {
    const topUsers = await User.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "followers",
        },
      },
      {
        $project: {
          _id: 1,
          avatar: 1,
          name: 1,
          email: 1,
          post: 1,
          followers: 1,
          following: 1,
        },
      },
      {
        $sort: { followers: -1 },
      },
      {
        $limit: 3,
      },
    ]);

    res.status(200).json({
      success: true,
      users: topUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search a profile
export const searchUserProfile = async (req, res) => {
  try {
    if (req.query.keyword === "") {
      return res.status(200).json({
        success: true,
        users: [],
      });
    }
    const users = await User.find({
      name: {
        $regex: req.query.keyword,
        $options: "i",
      },
    });
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
