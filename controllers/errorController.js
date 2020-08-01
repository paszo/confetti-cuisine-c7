const httpStatus = require('http-status-codes');

exports.pageNotFoundError = (req, res) => {
    res.status(httpStatus.NOT_FOUND);
    res.render("error");
};

exports.internalServerError = (error, req, res, next) => {
    let errorCode = httpStatus.INTERNAL_SERVER_ERROR;
    console.log(`Error occured: ${error.stack}`);
    res.status(errorCode);
    res.send(`${errorCode} | Sorry, our application is taking a nap!`);
};
