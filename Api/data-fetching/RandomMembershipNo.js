import { db } from "../db.js";

const getRandomMembershipNo = () => {
  return new Promise((resolve, reject) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const checkQ = "SELECT * FROM users WHERE membershipNo = ?";
    db.query(checkQ, [result], (err, data) => {
      if (err) {
        reject(err);
      } else if (data.length) {
        // If membership number already exists, generate a new one
        resolve(getRandomMembershipNo());
      } else {
        resolve(result);
      }
    });
  });
};
export default getRandomMembershipNo;