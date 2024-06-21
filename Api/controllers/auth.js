import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getRandomUserImage from "../data-fetching/fetch-user-image.js";
import getRandomMembershipNo from "../data-fetching/RandomMembershipNo.js";

export const register = (req, res) => {
  //CHECK EXISTING USER
  const q = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(q, [req.body.email, req.body.username], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("Användare finns redan!");

    try {
      // Get a random user image URL
      const userImg = await getRandomUserImage();
      const membershipNo = await getRandomMembershipNo();
      
      // Hash the password and create a user
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const role = Number(req.body.role);
      const phone = Number(req.body.phone);

      const insertQ = "INSERT INTO users(`username`,`email`,`password`, `img`,`role`, `firstName`, `lastName`, `phone`, `membershipNo`) VALUES (?)";
      const values = [req.body.username, req.body.email, hash, userImg, role, req.body.firstName, req.body.lastName, phone, membershipNo];

      db.query(insertQ, [values], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Användare har skapats.");
      });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  });
};

export const login = (req, res) => {
  //CHECK USER

  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Användaren hittades inte!");

    //Check password
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Fel användarnamn eller lösenord!");

      const tokenPayload = {
        id: data[0].id,
        role: data[0].role,
        username: data[0].username // Include the username
    };
    const token = jwt.sign(tokenPayload, "jwtkey");
    const { password, ...other } = data[0];
    res.cookie("access_token",token,{http:true})
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ token, ...other });// Include token along with other user data
  });
};

export const logout = (req, res) => {
  res.clearCookie("access_token",{
    sameSite:"none",
    secure:true
  }).status(200).json("Användaren har loggats ut.")
};