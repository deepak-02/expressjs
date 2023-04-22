const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
    cookieSession({
        name: "login-session",
        secret: "COOKIE_SECRET", // should use as secret environment variable
        httpOnly: true
    })
);

const db = require("./app/models");
const Role = db.role;

db.mongoose
    .connect(`mongodb://mongo:dYyr6LcPDr2aOojksjfo@containers-us-west-75.railway.app:5520`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to my application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

async function initial() {
    const count = await Role.estimatedDocumentCount();

    if (count === 0) {
        try {
            await new Role({ name: "user" }).save();
            console.log("added 'user' to roles collection");

            await new Role({ name: "moderator" }).save();
            console.log("added 'moderator' to roles collection");

            await new Role({ name: "admin" }).save();
            console.log("added 'admin' to roles collection");
        } catch (err) {
            console.error("Error adding roles to database:", err);
        }
    }
}


// function initial() {
//
//     Role.estimatedDocumentCount((err, count) => {
//         if (!err && count === 0) {
//             new Role({
//                 name: "user"
//             }).save(err => {
//                 if (err) {
//                     console.log("error", err);
//                 }
//
//                 console.log("added 'user' to roles collection");
//             });
//
//             new Role({
//                 name: "moderator"
//             }).save(err => {
//                 if (err) {
//                     console.log("error", err);
//                 }
//
//                 console.log("added 'moderator' to roles collection");
//             });
//
//             new Role({
//                 name: "admin"
//             }).save(err => {
//                 if (err) {
//                     console.log("error", err);
//                 }
//
//                 console.log("added 'admin' to roles collection");
//             });
//         }
//     });
// }
