exports.get404 = (req, res, next) => {
    const error = new Error('Not found.');
    console.log(error.statusCode);
    error.statusCode = 404;
    next(error);
};

exports.get500 = (error, req, res, next) => {
    const data = error.data;
    console.log('error',error.statusCode);
    console.log('error',req.body);
    console.log('error',error.message);
    console.log('error',data);
    res.status(error.statusCode || 500);
    res.json({
        error: {
            message: error.message,
            data: data,
        },
    });
};