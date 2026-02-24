const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    } else {
        // Production: Don't leak stack traces or internal details
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                message: err.message,
            });
        } else {
            // 1) Log error for us
            console.error("ERROR 💥", err);

            // 2) Send generic message
            res.status(500).json({
                success: false,
                status: "error",
                message: "Something went very wrong!",
            });
        }
    }
};

export default globalErrorHandler;
