import { db } from "../db.js";
import { bucket } from "../firebase.js"
import util from "util";
import bcrypt from "bcryptjs";
import mime from 'mime-types';
import nodemailer from 'nodemailer';

const queryAsync = util.promisify(db.query).bind(db);

export const getUsers = async (req, res) => {
  try {
    const q = "SELECT * FROM users";
    const data = await queryAsync(q);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const DoesUserExist = async (req, res) => {
  try {
    const membershipNo = req.query.membershipNo;  
      const q = "SELECT * FROM users WHERE membershipNo = ?"; 
      const result = await queryAsync(q, [membershipNo]);
      if (result.length > 0) {
          return res.status(200).json({ userExists: true, result});
      } else {
          return res.status(200).json({ userExists: false });
      }
  } catch (error) {
      return res.status(500).json(error.message);
  }
};

export const deleteUser= async (req, res) => {
  try {
    const userId = req.params.id;

    const q = "DELETE FROM users WHERE `id` = ?";
    const result = await db.query(q, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json("Användaren kunde inte hittas eller har redan tagits bort.");
    }

    return res.json("Användaren är raderad!");
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json(error.message);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const newRole = req.body.role;

    const q = "UPDATE users SET `role`=? WHERE `id` = ?";

    const values = [newRole, userId];

    const result = await db.query(q, values);

    if (result.affectedRows === 0) {
      return res.status(403).json("Du kan uppdatera endast ditt inlägg!");
    }

    return res.json("Inlägget har uppdaterats");
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json(error.message);
  }
};

export const getActivities = (req, res) => {
  try {
    const userId = req.query.userId; 
    const q = `SELECT p.* FROM posts p WHERE p.postId IN (SELECT uact.aid FROM UserActivity uact WHERE uact.uid = ?)`
    db.query(q, [userId], (error, results) => {
      if (error) {
        return res.status(400).json({ message: "Error fetching post sign ups", error: error.message });
      }
      const processedData = results.map(activity => {
        // Perform any processing or modification here
        return {
          postId: activity.postId,
          title: activity.title,
          date: activity.date
        };
      });
      // Send the processed data back to the frontend server
      return res.status(200).json({ message: "Sign up list fetch successful", data: processedData });
      
    });
  } catch (err) {
    return res.status(400).json({ message: "Error fetching post sign ups", error: err.message });
  }
};

export const deleteUserActivity = async (req, res) => {
  try {
    const deleteId = req.params.postId;
    const userId = req.params.userId;

    const q = "DELETE FROM UserActivity WHERE `uid` = ? AND `aid` = ?";
    const result = await db.query(q, [userId ,deleteId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json("Inlägget kunde inte hittas eller har redan tagits bort.");
    }

    return res.json("Inlägget har raderats!");
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json(error.message);
  }
}

export const getActUsers = (req, res) => {
  try {
    const actId = req.query.activity;
    
    const q = `SELECT u.* FROM users u WHERE u.id IN (SELECT uact.uid FROM UserActivity uact WHERE uact.aid = ?)`
    db.query(q, [actId], (error, results) => {
      if (error) {
        return res.status(400).json({ message: "Error fetching post sign ups", error: error.message });
      }
      
      // Send the processed data back to the frontend server
      return res.status(200).json({ message: "Sign up list fetch successful", data: results });
    });
  } catch (err) {
    return res.status(400).json({ message: "Error fetching post sign ups", error: err.message });
  }
}

export const getPostSignUps = async (req, res) => {
    const { userInfo } = req;
    
    try {
        const q = `SELECT ps.*, p.* FROM activities_post_signups ps JOIN posts p ON ps.post_id = p.postId WHERE ps.uid = ${userInfo.id}`;
        const data = await queryAsync(q);

        return res
            .status(200)
            .json({ message: "Sign up list fetch successful", data });
    } catch (err) {
        return res
            .status(400)
            .json({ message: "Error fetching post sign ups", err });
    }
};

export const updatePassword = async (req, res) => {
  const { userInfo } = req;

  const findUserQuery = "SELECT * FROM users WHERE id = ?";

  db.query(findUserQuery, [userInfo.id], (err, userData) => {
    if (err) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (userData.length === 0) {
      return res.status(404).json({ error: 'Användaren hittades inte' });
    }

    const user = userData[0];

    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      // Validate input fields
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'Alla fält krävs' });
      }

      // Check if new and confirm passwords match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Nya och bekräfta lösenord matchar inte' });
      }

      // Check if old password matches the one in the database
      const isPasswordCorrect = bcrypt.compareSync(oldPassword, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ error: 'Fel gamla lösenord' });
      }

      // Hash the new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // Update the user's password in the database
      const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';

      db.query(updatePasswordQuery, [hashedPassword, userInfo.id], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({ error: 'Misslyckades med att uppdatera lösenordet' });
        }

        res.status(200).json({ message: 'Lösenordet har uppdaterats' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

export const deletePostSignUps = async (req, res) => {
  const { userInfo } = req;
  const activityId = req.params.id;

  try {
      const q = `DELETE FROM UserActivity WHERE uid = ${userInfo.id} AND aid = ${activityId}`;
      const result = await queryAsync(q);

      if (result.affectedRows === 0) {
          return res.status(404).json("Aktivitetsprenumerationen kunde inte hittas eller har redan tagits bort.");
      }

      return res.json("Aktiviteten har avslutats!");
  } catch (error) {
      console.error("Error deleting user activity:", error);
      return res.status(500).json(error.message);
  }
};

export const updateProfilePic = async (req, res) => {
  const { userInfo } = req.body;
  const [file] = req.files;

  if (!userInfo || !file) {
    return res.status(400).json("Saknar användarinfo eller fildata");
  }

  try {
    // Assuming `bucket` is correctly initialized and points to Google Cloud Storage bucket
    const blob = bucket.file(`${Date.now()}.${mime.extension(file.mimetype)}`);
    await blob.save(file.buffer);
    await blob.makePublic();

    const publicUrl = blob.publicUrl();

    const q = "UPDATE `users` SET `img`=? WHERE id=?";
    const values = [publicUrl, JSON.parse(userInfo).id];
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Error updating profile pic in database:", err);
        return res.status(500).json(err.message);
      }
      
      if (data.affectedRows === 0) {
        return res.status(403).json("Unable to update profile pic");
      }

      return res.status(200).json({ data: publicUrl });
    });

  } catch (error) {
    console.error("Error updating profile pic:", error);
    return res.status(500).json(error.message);
  }
};

export const updateLastActivity = async (req, res) => {
  try {
    const { userId } = req.params;

    const q = "UPDATE users SET lastActivity = CURRENT_TIMESTAMP() WHERE id = ?";

    db.query(q, [userId], (err, result) => {
      if (err) {
        console.error('Error updating last activity:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // Successfully updated lastActivity timestamp
        res.status(200).json({ message: 'Senaste aktiviteten har uppdaterats' });
      }
    });
  } catch (error) {
    console.error('Error updating last activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getUserActivities = async (req, res) => {
  const q = "SELECT ps.id,ps.uid,ps.aid,p.title FROM UserActivity ps JOIN posts p ON ps.aid = p.postId";
  db.query(q, (err, data) => {
    if (err) return res.status(500).send(err);

    return res.status(200).json(data);
  });
};

export const getUserDetails = (req, res) => {

  const q = ` SELECT * FROM users WHERE id = ?;`;
        
  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data[0]);
  });
};

export const updateIntress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const Intress1 = req.body.intress1;
    const Intress2 = req.body.intress2;
    const Intress3 = req.body.intress3;

    const q = "UPDATE users SET `intress1`=?, `intress2`=?, `intress3`=? WHERE `id` = ?";

    const values = [Intress1, Intress2, Intress3, userId];

    const result = await db.query(q, values);

    return res.json("Användarintressen har uppdaterats");
  } catch (error) {
    console.error("Error updating user intresses:", error);
    return res.status(500).json(error.message);
  }
};

export const resetPass = async (req, res) => {
  try { 
    const UserEmail = req.query.email; 
      const q = "SELECT * FROM users WHERE email = ?"; 
      const result = await queryAsync(q, [UserEmail]);
      
      if (result.length > 0) {
        
        const newPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(newPassword, 10);
  
        await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, UserEmail]);
  
        const transporter = nodemailer.createTransport({
          host: 'smtp-mail.outlook.com',
          port: 587,
          secure: false, // StartTLS should be enabled
          auth: {
            user: 'jaktharryapp@hotmail.com', 
            pass: 'jakt28462846', 
          },
        });
  
        var mailOptions = {
          from: 'jaktharryapp@hotmail.com',
          to: UserEmail,
          subject: 'New Password',
          text: `Your new password is: ${newPassword}. Please log in with this password and then change it.`,
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.log('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send password reset email', detail: error.message });
          } else {
            return res.status(200).json({ message: 'Password reset email sent successfully' });
          }
        });
      } else {
        return res.status(404).json({ error: 'Användaren hittades inte' });
      }
    } catch (error) {
      return res.status(500).json(error.message);
    }
  };

  function generateRandomPassword() {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return newPassword;
  }