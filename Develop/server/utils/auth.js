const jwt = require('jsonwebtoken');

// Secret for signing the JWT (should be in environment variables)
const secret = process.env.JWT_SECRET || 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Middleware to extract token from headers and verify
  authMiddleware: function ({ req }) {
    // Get token from headers, query, or cookies
    let token = req.headers.authorization || '';

    if (token) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req; // Return the request unmodified if no token is present
    }

    try {
      // Decode and attach the user information to the request
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err) {
      console.log('Invalid token');
    }

    return req; // Return request with potentially attached user info
  },

  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};

