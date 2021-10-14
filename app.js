require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./model/user");
const auth = require("./middleware/auth");
const app = express();
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
app.use(express.json());
app.post("/register", async (req, res) => {

    try {
        // Get user input
        const { first_name, last_name, email, password,role } = req.body;

        // Validate user input
        if (!(email && password && first_name && last_name && role)) {
            res.status(400).send("All input is required");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser=await (User.findOne({email}));
        //const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            role: role
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;


        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    
});

// Login
app.post("/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
          res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });
    
        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
    
          // save user token
          user.token = token;
    
          // user
          res.status(200).json(user);
        }
        res.status(400).send("Invalid Credentials");
      } catch (err) {
        console.log(err);
      }

});

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

app.post("/addUser", (req,res)=>{
    console.log("user added");
})

app.post("/removeUser", (req,res)=>{
    console.log("user removed");
})


app.post("/removeComment", (req,res)=>{
    console.log("comment removed");
})



module.exports = app;