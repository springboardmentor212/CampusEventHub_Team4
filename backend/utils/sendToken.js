const sendToken = (user, statusCode, res) => {
    const token = user.generateToken();

    const cookieOptions = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days matching JWT expiry
        ),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        path: "/",
    };

    res.cookie("token", token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        data: {
            user,
        },
    });
};

export default sendToken;
