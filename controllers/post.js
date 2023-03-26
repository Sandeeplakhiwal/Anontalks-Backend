import Post from "../models/post"

export const createPost = async(req, res) => {
    try{
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: req.body.public_id,
                url: "req.body.url"
            },
            owner: req.user._id
        };
        const newPost = await Post.create(newPostData)

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
}