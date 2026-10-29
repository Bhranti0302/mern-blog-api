const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  expireIn: 30 * 24 * 60 * 60 * 1000,
};

module.exports=cookieOptions