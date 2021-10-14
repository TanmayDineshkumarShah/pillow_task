const jwt = require("jsonwebtoken");
const role=require('./role');
const config = process.env;

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    if(role[decoded.role].find(function(url){return url == req.baseUrl})){
        req.user = decoded;
        next();
    }
    else{
        return res.status(401).send("Access Denied: You don't have correct privilege to perform this operation");
    }
    
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;