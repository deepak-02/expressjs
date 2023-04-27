const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");

const app = express();

var corsOptions = {
    origin: "*"
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

//mongosh "mongodb://mongo:2MEztr1AYzClTgXfM6Yx@containers-us-west-176.railway.app:5791"
db.mongoose
    .connect(`mongodb://mongo:2MEztr1AYzClTgXfM6Yx@containers-us-west-176.railway.app:5791`, {
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
        const message = `
Welcome to my application.

These are the available APIs and methods in this application:

signup: {
  endPoint: api/auth/signup,
  request: {
    "email": "test@gmail.com",
    "name": "test",
    "roles": [
      "user",
      "moderator"
    ],
    "password": "12345678"
  }
}

login: {
  endPoint: api/auth/signin,
  request: {
    "email": "test@gmail.com",
    "password": "12345678"
  }
}

profileUpdate: {
  endPoint: api/profile/update,
  request: {
    "name": "test123",
    "email": "test@gmail.com",
    "phone": "12345678",
    "address": "123asdfg Main St",
    "gender": "Male"
  }
}

profileImage: {
  endPoint: api/upload-image,
  request: // as formdata 
           // fields: email, image
}

removeImage: {
  endPoint: api/remove-image,
  request: {
    "email": "test@gmail.com"
  }
}

getProfile: {
  endPoint: api/profile/get,
  request: {
    "email": "test@gmail.com"
  }
}

getOtp: {
  endPoint: api/get-otp,
  request: {
    "email": "test@gmail.com"
  }
}

verifyOtp: {
  endPoint: api/verify-otp,
  request: {
    "email": "test@gmail.com",
    "otp": "1234"
  }
}

resetPassword: {
  endPoint: api/reset-password,
  request: {
    "email": "test@gmail.com",
    "password": "1234568"
  }
}
`;

    res.send(message);
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
