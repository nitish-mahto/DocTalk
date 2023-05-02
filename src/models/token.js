const jwt = require("jsonwebtoken");

function generateJWT(payload) {
  return new Promise((resolve, reject) => {
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: "480h",
    });
    jwt.verify(token, process.env.SECRET_KEY, function (err, authData) {
      resolve({
        token: token,
        sessionTime: authData.exp,
        tokenObject: payload,
      });
    });
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = {
  generateJWT,
  verifyToken,
};
