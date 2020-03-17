"use strict";
const Agent = require("./../models/agentModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const {
    promisify
} = require("util");

const signToken = id => {
    return jwt.sign({
            id: id
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

exports.signUp = catchAsync(async (req, res, next) => {
    const newAgent = await Agent.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        date_de_naissance: req.body.date_de_naissance,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    res.status(200).json({
        status: "success"
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const {
        email,
        password
    } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
        return next(new AppError("Please provide email and password!", 400));
    }

    // 2) check if agent exists && password is correct
    const agent = await Agent.findOne({
        email: email
    }).select("+password");

    if (!agent) {
        return next(new AppError("Incorrect email and password!", 401));
    }

    const checkPassword = await agent.checkPassword(password, agent.password);
    if (!checkPassword) {
        return next(new AppError("Incorrect email and password!", 401));
    }

    // 3) if everything ok , send token to client
    const token = signToken(agent._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // secure: true, // to work on https
        httpOnly: true // to prevent that agent modify the cookie in the browser
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("messenger_jwt", token, cookieOptions);

    res.status(200).json({
        status: "success",
        token
    });
});


exports.signUp = catchAsync(async (req, res, next) => {
    await Agent.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        date_de_naissance: req.body.date_de_naissance,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    res.status(200).json({
        status: "success"
    });
});

exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("messenger_jwt");
    res.status(200).json({
        status: "success"
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting token and check of it's there
    if (req.headers.cookie) {
        token = req.headers.cookie.split("messenger_jwt=")[1];
    }

    if (!token) {
        return next(
            new AppError("You are not logged in! Please log in to get access.", 401)
        );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if agent still exists
    const currentAgent = await Agent.findById(decoded.id);
    if (!currentAgent) {
        return next(
            new AppError("You are no longer logged in ! Please log in again.", 401)
        );
    }

    // 4) Check if agent changed password after the tocken was issued
    if (await currentAgent.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError("Agent recently changed password! Please log in again.", 401)
        );
    }

    // Grant access to protected route
    req.agent = currentAgent;

    next();
});

exports.restricTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError("Vous n'avez pas la permission", 403)
            )
        }
        next();
    }
}