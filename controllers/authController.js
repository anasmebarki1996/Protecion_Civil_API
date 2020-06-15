// "use strict";
const Agent = require("./../models/agentModel");
const Unite = require("./../models/uniteModel");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
const AppError = require("./../utils/appError");
const {
    promisify
} = require("util");
const {
    Types: {
        ObjectId
    },
} = (mongoose = require("mongoose"));

const signToken = id => {
    return jwt.sign({
            id: id
        },
        process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};




exports.login = catchAsync(async (req, res, next) => {
    const {
        username,
        password
    } = req.body;

    // 1) check if username and password exist
    if (!username || !password) {
        return next(new AppError("Veuillez-vous introduire votre nom d'utilisateur et votre mot de passe!", 400));
    }

    // 2) check if agent exists && password is correct
    const agent = await Agent.findOne({
        username: username
    }).select("+password");
    if (!agent) {
        return next(new AppError("Veuillez-vous vérifier votre nom d'utilisateur et votre mot de passe!", 401));
    }

    const checkPassword = await agent.checkPassword(password, agent.password);
    console.log(checkPassword)
    if (!checkPassword) {
        return next(new AppError("Veuillez-vous vérifier votre nom d'utilisateur et votre mot de passe!", 401));
    }

    // 3) if everything ok , send token to client
    const token = signToken(agent._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        // secure: true, // to work on https
        httpOnly: true, // to prevent that agent modify the cookie in the browser,
    };

    // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("agent_jwt", token, cookieOptions);

    res.set("Authorization", token);
    res.status(200).json({
        status: "success",
        id_unite: agent.id_unite,
        agent_id: agent._id,
        agent_nom: agent.nom,
        agent_role: agent.role,
        agent_username: agent.username
    });
});



exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie("agent_jwt");
    res.status(200).json({
        status: "success"
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1) Getting token and check of it's there
    if (req.headers.cookie) {
        token = req.headers.cookie.split("agent_jwt=")[1];
    } else if (req.headers.authorization) {
        token = req.headers.authorization;
    }

    if (!token) {
        return next(
            new AppError("Vous n'est pas connecté! Veuillez-vous vous connecter s'il vous plait", 401)
        );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if agent still exists
    const currentAgent = await Agent.findById(decoded.id);
    if (!currentAgent) {
        return next(
            new AppError("Vous n'est plus connecté! Veuillez-vous vous connecter s'il vous plait", 401)
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
        if (!roles.includes(req.agent.role)) {
            return next(
                new AppError("Vous n'avez pas la permission", 403)
            )
        }
        next();
    }
}


exports.checkToken = catchAsync(async (req, res, next) => {
    res.status(200).json({
        status: "success",
    });
});

exports.checkUnite = catchAsync(async (req, res, next) => {
    // get Type unite
    const unite = await Unite.findOne({
        _id: req.agent.id_unite
    });
    req.unite = unite;
    if (req.unite.type == "secondaire") {
        req.unite.query_unite = req.agent.id_unite;
    } else {
        let unites
        // verifier si cette unité est permis pour cet agent
        if (req.body.id_unite && req.body.id_unite != req.agent.id_unite) {
            unites = await Unite.findOne({
                unite_principale: ObjectId(req.unite._id),
                _id: ObjectId(req.body.id_unite)
            }, {
                _id: 1,
            });
            if (!unites) {
                return next(
                    new AppError("Vous n'avez pas la permission", 403)
                )
            }
        }
        //get unités secondaire
        unites = await Unite.find({
            unite_principale: ObjectId(req.unite._id),
        }, {
            _id: 1,
        });
        let unite = unites.map((x) => ObjectId(x._id));
        req.unite.query_unite = {
            $in: unite,
        };
    }

    next();
});