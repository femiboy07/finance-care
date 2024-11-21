"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: __dirname + '/.env' });
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("./config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userroutes_1 = __importDefault(require("./routes/userroutes"));
const routetranscations_1 = __importDefault(require("./routes/routetranscations"));
const routeaccounts_1 = __importDefault(require("./routes/routeaccounts"));
const routebudgets_1 = __importDefault(require("./routes/routebudgets"));
const routecategory_1 = __importDefault(require("./routes/routecategory"));
const googleauthClient_1 = __importDefault(require("./middlewares/googleauthClient"));
const User_1 = __importDefault(require("./models/User"));
const categorySeeders_1 = require("./seeders/categorySeeders");
const accountSeeder_1 = require("./seeders/accountSeeder");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, { cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"]
    } });
const port = 5000;
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}));
app.use((req, res, next) => {
    req.io = io;
    next();
});
function onlyForHandShake(middleware) {
    return (req, res, next) => {
        const isHandShake = req.query.sid;
    };
}
//connect to mongoDb database finance;
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // clear the database;
            //     await clearCategories(); // Clear existing categories
            //  await clearBudgets()
            // Run seeders
            yield (0, categorySeeders_1.seedCategories)();
            // await clearAccounts()
            yield (0, accountSeeder_1.seedDefaultAccount)();
            // await seedDefaultBudget();
            // Call other seeders here
            console.log("Database seeding completed.");
        }
        catch (error) {
            console.error("Error seeding database:", error);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(process.env.MONGODB_URI, { dbName: "financeApp" });
            console.log("Connected to the database");
            yield seedDatabase(); // Call the seed function after connecting
        }
        catch (err) {
            console.log("Not able to connect to db", err);
        }
    });
}
main();
app.use('/api/auth', userroutes_1.default);
app.use('/api/transactions', routetranscations_1.default);
app.use('/api/account', routeaccounts_1.default);
app.use('/api/budgets', routebudgets_1.default);
app.use('/api/category', routecategory_1.default);
app.get('/oauth2callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, state } = req.query;
    if (code) {
        try {
            const decodedToken = jsonwebtoken_1.default.verify(state, process.env.SECRET_KEY);
            if (decodedToken !== state) {
                res.end("possible csrf attack aahhhn !!!!!!!!!!");
            }
            const userId = decodedToken.id;
            const { tokens } = yield googleauthClient_1.default.getToken(code);
            googleauthClient_1.default.setCredentials(tokens);
            // Assuming req.user.id is the user's ID
            const users = yield User_1.default.findById(userId);
            if (!users) {
                return res.json({ message: "aaahn You cant access my site sorry nigga" }).status(403);
            }
            // Update user's tokens
            users.tokens = {
                google_access_token: tokens.access_token,
                google_refresh_token: tokens.refresh_token,
            };
            yield users.save();
            res.redirect('/dashboard');
        }
        catch (err) {
            console.log(err);
        }
    }
}));
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/dashboard', passport_1.default.authenticate("jwt", { session: false }), (req, res) => {
    console.log(req.user);
    return res.send("Welcome to the dashboard");
});
// io.on("connection",(socket)=>{
//   // getting the namespace  
//   socket.on("register",(userId:any)=>{
//       if(userId){
//           socket.join(userId); 
//              socket.on('trackBudget',async()=>{
//                 const budget=await budgets.find({userId});
//                 socket.emit('initialData',budget);
//                 const changeStream=budgets.watch();
//                 changeStream.on('change',async(change)=>{
//                     if (change.operationType === 'update' || change.operationType === 'insert') {
//                         const updatedBudget = await budgets.findById(change.documentKey._id);
//                         if (updatedBudget?.userId.toString() === userId) {
//                           socket.emit('budgetUpdate', updatedBudget);
//                         }
//                       }
//                 })
//              })
//       } 
//   })
// })
httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
