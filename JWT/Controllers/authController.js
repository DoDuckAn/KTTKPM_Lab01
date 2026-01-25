const jwt=require("jsonwebtoken");

const generateAccessToken=(username)=>{
    return jwt.sign(
        {username},
        process.env.JWT_SECRET,
        {
            expiresIn:'1h'
        }
    );
}

const generateRefreshToken=async(username)=>{
    return refreshToken=jwt.sign(
        {username},
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:'1d'
        }
    );
}

const login=async(req,res)=>{
    try {
        const{username,password}=req.body;
        if(username==="admin"&&password==="1"){
            const accessToken=generateAccessToken(username);
            const refreshToken=await generateRefreshToken(username);
            res.status(200).json({
                success:true,
                error:false,
                message:'đăng nhập thành công',
                accessToken:accessToken,
                refreshToken:refreshToken
            });
        }
        else{
            res.status(401).json({
                success:false,
                error:false,
                message:"sai tk hoặc mk"
            })
        }
    } catch (error) {
        res.status(500).json({
            success:false,
            error:true,
            message:error.message
        })
    }
}

const newAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ 
            success: false, 
            message: "Không tìm thấy Refresh Token" 
        });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: "Refresh Token không hợp lệ hoặc đã hết hạn" 
            });
        }
        const accessToken = generateAccessToken(decoded.username);

        res.status(200).json({
            success: true,
            accessToken: accessToken
        });
    });
};


module.exports={login,newAccessToken};