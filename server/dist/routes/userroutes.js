"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const redirectIfAuthenticated_1 = require("../middlewares/redirectIfAuthenticated");
const googleauthClient_1 = __importDefault(require("../middlewares/googleauthClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("../config/passport"));
// import { verifyToken } from "../middlewares/redirectIfAuthenticated";
const router = express_1.default.Router(); // instance of a mini app router
router.get('/register', redirectIfAuthenticated_1.redirectIfAuthenticated);
router.post('/register', user_1.register);
router.get('/logIn', redirectIfAuthenticated_1.redirectIfAuthenticated);
router.post('/logIn', user_1.signInUser);
router.post('/refreshtoken', user_1.refreshToken);
router.post('/logout', user_1.logOutUser);
router.get('/validate', redirectIfAuthenticated_1.verifyToken, (req, res) => {
    var _a;
    return res.json({ valid: true, access_token: (_a = req.user) === null || _a === void 0 ? void 0 : _a.token });
});
router.get('/google', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    console.log(req.user.id);
    const stateToken = jsonwebtoken_1.default.sign({ id: req.user.id }, process.env.SECRET_KEY, { expiresIn: '10m' });
    const url = googleauthClient_1.default.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.readonly'
        ],
        state: stateToken
    });
    res.redirect(url);
});
exports.default = router;
