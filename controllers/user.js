import User from "../models/User.js";

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
        const { email, password } = req.body;
        
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