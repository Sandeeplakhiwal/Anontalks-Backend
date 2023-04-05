import User from "../models/User.js";
import Post from "../models/post.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import crypto from "crypto";

const register = async(req, res) => {
    // console.log('Hello World!');
    try{
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });
        
        if(user){
            res.status(400).json({
                success: false,
                message: "User already exists!"
            })
        };
        user = await User.create({
            name,
            email,
            password,
            avatar: {public_id: "sample_id", url: "sample_url"}
        });
        
        const token = await user.generateToken();

        let options = {
            expires: new Date(Date.now() + 90*24*60*60*1000),
            httpOnly: true,
        }

        res.status(201).cookie("token", token, options).json({
            success: true,
            user,
            token
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { register }

// Lets create Login Method
const login = async(req, res) => {
    try{
        const { email, password } =  req.body;
        
        let user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(400).json({
                success: false,
                message: "User does not exists!"
            });
        }

        const isMatch = await user.matchPassword(password);

        if(!isMatch){
            return res.status(400).json({
                success: false,
                message: "Incorrect password!"
            }); 
        }

        const token = await user.generateToken();

        let options = {
            expires: new Date(Date.now() + 90*24*60*60*1000),
            httpOnly: true,
        }

        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token
        })
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message,
            hmm: "hello world!"
        });
    }
};

export { login };

// Lets create Logout Method
const logout = async(req, res) => {
    try {
        let options = {
            expires: new Date(Date.now()),
            httpOnly: true,
        }
        res.status(200).cookie("token", null, options).json({
            success: true,
            message: "Logged Out Successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { logout };


// Lets create followUser or unfollowUser function
const followUser = async(req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);
        if(!userToFollow){
            res.status(404).json({
                success: false,
                message: "User doesn't exist!"
            })
        }

        // It is process of Unfollowing User

        if(loggedInUser.following.includes(userToFollow._id)){
            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexFollowing, 1);
            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexFollowers, 1);
            await loggedInUser.save();
            await userToFollow.save();
            return res.status(200).json({
                success: true,
                message: loggedInUser.name + ' unfollowed ' + userToFollow.name
            });
        }
        else{
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);
            await loggedInUser.save();
            await userToFollow.save();
            return res.status(200).json({
                success: true,
                message: loggedInUser.name + ' is following ' + userToFollow.name
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { followUser };




// Lets create updatePassword function
const updatePassword = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");

        const { oldPassword, newPassword } = req.body;

        if( !oldPassword || !newPassword ){
            return res.status(400).json({
                success: false,
                message: "Please Submit oldPassword & newPassword"
            })
        };

        const isMatch = await user.matchPassword(oldPassword);

        if(!isMatch){
            return res.status(404).json({
                success: false,
                message: "Incorrect Old Password."
            })
        }
        else{
            user.password = newPassword;
            await user.save();
            res.status(201).json({
                success: true,
                message: "Password Updated."
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { updatePassword };


// Lets create updateProfile function
const updateProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const { newName, newEmail } = req.body;

        if(newName){
            user.name = newName
        }
        if(newEmail){
            user.email = newEmail
        }

        await user.save();

        res.status(201).json({
            success: true,
            message: "Profile Updated."
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
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
//         let options = {
//             expires: new Date(Date.now()),
//             httpOnly: true,
//         }        
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
        let myIdIndex = follower.following.findIndex(id => id.toString() === myId.toString());
        follower.following.splice(myIdIndex, 1);
        await follower.save();
      }
  
      // Delete the user from all following's 'followers' array
      for (let i = 0; i < iAmFollowing.length; i++) {
        let following = await User.findById(iAmFollowing[i]);
        let myIdIndex = following.followers.findIndex(id => id.toString() === myId.toString());
        following.followers.splice(myIdIndex, 1);
        await following.save();
      }

      //   Remove my Id from all liked posts: TODO
      //   Remove my Id from all commented posts: TODO
  
      // Delete the user's profile
      await user.deleteOne();
  
      // Logout after deletion of profile
      let options = {
        expires: new Date(Date.now()),
        httpOnly: true,
      }
  
      res.cookie("token", null, options);
  
      res.status(200).json({
        success: true,
        message: "Profile deleted"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };

export { deleteMyProfile };

// Lets create myProfile function
const myProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("post");

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
};

export { myProfile };


const getUserProfile = async(req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("post");

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found!"
            })
        };

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
};

export { getUserProfile };


const getAllUsers = async(req, res) => {
    try {
        const users = await User.find({});

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
};

export { getAllUsers };


const forgotPassword = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        };

        // const resetPasswordToken = user.getResetPasswordToken();
        const resetPasswordToken = await user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`;

        const message = `Reset your password by clicking on the link below: \n\n ${resetUrl}`;

        try { 
            await sendEmail({
                email: user.email,
                subject: "Reset Password",
                message,
            })

            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            })

        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            res.status(500).json({
                success: false,
                message: error.message
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export { forgotPassword };

const resetPassword = async(req, res) => {
    try {
        const resetToken = await req.params.token;
        const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now()}
        });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Token is Invalid or has Expired."
            })
        };

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password Updated"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};
export { resetPassword };