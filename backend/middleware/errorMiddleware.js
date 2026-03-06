const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // Handle specific Mongoose / JWT errors in production-friendly way
    let error = { ...err, message: err.message };

    // Mongoose: Bad ObjectId
    if (err.name === "CastError") {
        error.message = `Invalid ${err.path}: ${err.value}`;
        error.statusCode = 400;
    }

    // Mongoose: Duplicate field value
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error.message = `Duplicate value for field "${field}". Please use a different value.`;
        error.statusCode = 409;
    }

    // Mongoose: Validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        error.message = messages.join(". ");
        error.statusCode = 400;
    }

    // JWT: Invalid token
    if (err.name === "JsonWebTokenError") {
        error.message = "Invalid token. Please log in again.";
        error.statusCode = 401;
    }

    // JWT: Expired token
    if (err.name === "TokenExpiredError") {
        error.message = "Your session has expired. Please log in again.";
        error.statusCode = 401;
    }

    if (process.env.NODE_ENV === "development") {
        res.status(error.statusCode).json({
            success: false,
            status: error.status,
            message: error.message,
            stack: err.stack,
            error: err,
        });
    } else {
        // Production: only send clean, operational errors
        if (err.isOperational) {
            res.status(error.statusCode).json({
                success: false,
                status: error.status,
                message: error.message,
            });
        } else {
            console.error("UNHANDLED ERROR 💥", err);
            res.status(500).json({
                success: false,
                status: "error",
                message: "Something went wrong. Please try again later.",
            });
        }
    }
};

export default globalErrorHandler;
