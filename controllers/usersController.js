const User = require('../models/user');
const {check, validationResult, body} = require('express-validator');
const passport = require('passport');
const token = process.env.TOKEN || "recipeT0k3n";
const jsonWebToken = require('jsonwebtoken');

const getUserParams = (body) => {
    return {
        name: {
            first: body.firstName,
            last: body.lastName
        },
        email: body.email,
        zipCode: parseInt(body.zipCode),
        // password: body.password
    };
};

module.exports = {
    index: (req, res, next) => {
        User.find()
            .then(users => {
                res.locals.users = users;
                next();
            })
            .catch(error => {
                console.log(`Error fetching users: ${error.message}`);
                next(error);
            });
    },
    indexView: (req, res) => {
        res.render("users/index");
    },
    new: (req, res) => {
        res.render("users/new");
    },
    create: (req, res, next) => {
      if (req.skip) {
          next();
      } else {
          let newUser = new User( getUserParams(req.body));
          User.register(newUser, req.body.password, (error, user) => {
              if(user) {
                  req.flash("success", `${user.fullName}'s account created successfully!`);
                  res.locals.redirect = "/users";
                  next();
              } else {
                  req.flash("error", `Failed to create user account because: ${error.message}.`);
                  res.locals.redirect = "/users/new";
                  next();
              }
          })
      }
    },

    // create: (req, res, next) => {
    //     if (req.skip) {
    //         next();
    //     } else {
    //         let userParams = getUserParams(req.body);
    //     User.create(userParams)
    //         .then(user => {
    //             req.flash("success", `${user.fullName}'s account created successfully!`);
    //             res.locals.redirect = "/users";
    //             res.locals.user = user;
    //             next();
    //         })
    //         .catch(error => {
    //             console.log(`Error saving user:${error.message}`);
    //             res.locals.redirect = "/users/new";
    //             req.flash("error", `Failed to create user account because: ${error.message}.`);
    //             next();
    //         });
    //     }
    // },
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) {
             res.redirect(redirectPath);
        } else {
            next();
        }
    },
    show: (req, res, next) => {
        const userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },
    showView: (req, res) => {
        res.render("users/show");
    },
    edit: (req, res, next) => {
        const userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.render("users/edit", {
                    user: user
                });
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },
    update: (req, res, next) => {
        let userId = req.params.id;
        let userParams = getUserParams(req.body);
        User.findByIdAndUpdate(userId, {
            $set: userParams
        })
            .then(user => {
                res.locals.redirect = `/users/${userId}`;
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error updating user by ID: ${error.message}`);
                next(error);
            });
    },
    delete: (req, res, next) => {
        let userId = req.params.id;
        User.findByIdAndRemove(userId)
        .then(() => {
            res.locals.redirect = "/users";
            next();
        })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
                next();
            });
    },
    login: (req, res) => {
        res.render("users/login");
    },
    logout: (req, res, next) => {
      req.logout();
      req.flash("success", "You have been logged out!");
      res.locals.redirect = "/";
      next();
    },
    authenticate: passport.authenticate('local', {
        failureRedirect: "/users/login",
        failureFlash: "Failed to login",
        successRedirect: "/",
        successFlash: "Logged in!"
    }),

    // authenticate: (req, res, next) => {
    //     User.findOne({
    //         email: req.body.email
    //     })
    //         .then(user => {
    //             if (user){
    //                 user.passwordComparison(req.body.password)
    //                     .then(passwordMatch => {
    //                         if (passwordMatch) {
    //                             res.locals.redirect = `/users/${user._id}`;
    //                             req.flash("success", `${user.fullName}'s logged in successfully!`);
    //                             res.locals.user = user;
    //                         } else {
    //                             req.flash("error", "Your account or password is incorrect. Please try again or contact your system administrator!");
    //                             res.locals.redirect = "/users/login";
    //                         }
    //                         next();
    //                     })
    //
    //             } else {
    //                 req.flash("error", "Failed to log in user account: User account not found.");
    //                 res.locals.redirect = "/users/login";
    //                 next();
    //             }
    //         })
    //         .catch(error => {
    //             console.log(`Error logging in user: ${error.message}`);
    //             next(error);
    //         });
    // },

    userCheck: [
        body('email')
            .normalizeEmail({all_lowercase: true})
            .trim(),
        check('email')
            .isEmail()
            .withMessage("Email is invalid"),
        check('zipCode')
            .notEmpty()
            .withMessage("Zip code cannot be empty")
            .isInt()
            .withMessage("Zip code must be integer")
            .isLength({
                min: 5,
                max: 5
            })
            .withMessage("Length of Zipcode must be 5 digits"),
        check('password')
            .notEmpty()
            .withMessage("Password cannot be empty")
    ],

    validate: (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            let messages = errors.array().map(e => e.msg);
            console.log(messages);
            req.skip = true;
            req.flash("error", messages.join(" and "));
            res.locals.redirect = "/users/new";
            next();
        } else {
            next();
        }
    },
    // verifyToken: (req, res, next) => {
    //     let token = req.query.apiToken;
    //     if (token) {
    //         User.findOne({apiToken: token})
    //         .then(user => {
    //             if (user) next();
    //             else next(new Error("Invalid API token."));
    //         })
    //             .catch(error => {
    //                 next(new Error(error.message));
    //             });
    //     } else {
    //         next(new Error("Invalid API token."));
    //     }
    // },
    apiAuthenticate: (req, res, next) => {
        passport.authenticate("local", (errors, user) => {
            if(user) {
                let signedToken = jsonWebToken.sign(
                    {
                        data: user._id,
                        exp: new Date().setDate(new Date().getDate() + 1)
                    },
                    "secret_encoding_passphrase"
                );
                res.json({
                    success: true,
                    token: signedToken
                });
            } else
                res.json({
                    success: false,
                    message: "Could not authenticate user."
                });
        })(req, res, next);
    },
    verifyJWT: (req, res, next) => {
        let token = req.headers.token;
        if (token) {
            jsonWebToken.verify(
                token,
                "secret_encoding_passphrase",
                (errors, payload) => {
                    if (payload) {
                        User.findById(payload.data).then(user => {
                            if(user) {
                                next();
                            } else {
                                res.status(httpStatus.FORBIDDEN).json({
                                    error: true,
                                    message: "No User account found."
                                });
                            }
                        });
                    } else {
                        res.status(httpStatus.UNAUTHORIZED).json({
                            error: true,
                            message: "Cannot verify API token."
                        });
                        next();
                    }
                }
            );
        } else {
            res.status(httpStatus.UNAUTHORIZED).json({
                error: true,
                message: "Provide Token"
            });
        }
    }
};
