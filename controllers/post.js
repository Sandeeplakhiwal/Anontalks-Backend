import Post from "../models/post.js";
import User from "../models/User.js";

const createPost = async(req, res) => {
    try{
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: req.body.public_id,
                url: "req.body.url"
            },
            owner: req.user._id
        };

        const newPost = await Post.create(newPostData);
        const user = await User.findById(req.user._id);

        user.post.push(newPost._id);

        await user.save();

        res.status(201).json({
            success: true,
            post: newPost
        });
    }catch(error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export { createPost };

// I have Created Post method now it's time for deletePost method...

const deletePost = async(req, res) => {
    try {
        // const user = await User.findById(req.user._id);
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if(post.owner.toString() !== req.user._id.toString()){
            return res.status(401).json({
                success: false,
                message: "Unauthorised"
            })
        }

        await post.deleteOne();

        {/* To remove from user posts array also */}
        const user = await User.findById(req.user._id);
        const index = user.post.indexOf(req.params.id);
        user.post.splice(index, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Post Deleted Successfully"
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export { deletePost };




// I have Created Post method now it's time for like&unlike method...

const likeAndUnlikePost = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);
            post.likes.splice(index, 1);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Unliked"
            })
        }
        else{
            post.likes.push(req.user._id);
            await post.save();  
            return res.status(200).json({
                success: true,
                message: "Post Liked"
            })
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { likeAndUnlikePost }

const getPostOfFollowing = async(req, res) => {
    try {
        // const user = await User.findById(req.user._id).populate("following", "post");
        const user = await User.findById(req.user._id);
        const posts = await Post.find({
            owner: {
                $in: user.following
            }
        });
        res.status(200).json({
            success: true,
            // following: user.following
            posts
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export { getPostOfFollowing };