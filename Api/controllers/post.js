import { db } from "../db.js";

export const getPosts = (req, res) => {
  let q;
  let queryParams;

  if (req.query.cat) {
    if (req.query.cat != "aktiviteter"){
      q = `SELECT posts.*, users.username 
      FROM posts 
      LEFT JOIN users ON posts.uid = users.id 
      WHERE posts.cat=?
    `;
    } else {
      q = `
        SELECT p.*, u.username, u.img AS userImage, ad.*
        FROM posts p
        INNER JOIN users u ON u.id = p.uid 
        LEFT JOIN ActivityDetails ad ON p.postId = ad.ActivityId
        WHERE p.cat=?`;
    }
    queryParams = [req.query.cat];
  } else if (req.query.uid) {
    q = `
    SELECT posts.*, users.username 
    FROM posts 
    LEFT JOIN users ON posts.uid = users.id 
    WHERE posts.uid=?
  `;
    queryParams = [req.query.uid];
  } else {
    q = `
    SELECT posts.*, users.username 
    FROM posts 
    LEFT JOIN users ON posts.uid = users.id
  `;
    queryParams = [];
  }

  db.query(q, queryParams, (err, data) => {
    if (err) return res.status(500).send(err);

    return res.status(200).json(data);
  });
};

export const getPost = (req, res) => {

  const q = `
        SELECT p.postId AS postId, p.title, p.desc, p.img, p.date, p.uid, p.cat, p.text, p.avg_rating,
           u.username, u.img AS userImage, ad.*
        FROM posts p
        INNER JOIN users u ON u.id = p.uid 
        LEFT JOIN ActivityDetails ad ON p.postId = ad.ActivityId
        WHERE p.postId = ?;`;
        
  db.query(q, [req.params.id], (err, data) => {
    if (err) {
      console.error("Error querying the database:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data[0]);
  });
};

const formatDate = (date) => {
  return date instanceof Date ? date.toISOString().split('T')[0] : null;
};

export const addPost = async (req, res) => {
  try {
    const qPost = "INSERT INTO posts(`title`, `desc`, `text`, `img`, `cat`, `date`,`uid` ) VALUES (?)";

    const values = [
      req.body.title,
      req.body.desc,
      req.body.text,
      req.body.img,
      req.body.cat,
      req.body.date,
      req.userInfo.id
    ];

    await db.query(qPost, [values], function(err, postResult) {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json(err.message);
      }

      const postId = postResult.insertId;
    
      if (req.body.cat == "aktiviteter" && postId ){
      
        const adminDate = formatDate(new Date(req.body.adminDate));
        const deadline = formatDate(new Date(req.body.deadline));
      
        const qActivity = "INSERT INTO ActivityDetails (`ActivityId`, `status`, `adminDate`, `deadline`, `price`, `spots`) VALUES (?)";
        const values2 = [
          postId,
          req.body.status || "closed",
          adminDate,
          deadline,
          req.body.price || 0,
          req.body.spots || 0,
        ];
      
        db.query(qActivity, [values2], (err, result) => {
          if (err) {
            console.error("Error inserting activity details:", err);
            return res.status(500).json({ error: "Error inserting activity details" });
          }
          
          // Handle successful insertion
          return res.status(201).json({ message: "Aktivitetsdetaljerna har infogats" });
        });
      } else {
        return res.status(201).json({ message: "Inlägget har uppdaterats" });
      }
  });
  
  } catch (error) {
    console.error("Error adding post:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(500).json({ error: "Fel vid tillägg av aktivitetsdetaljerna. Kontrollera att inlägget existerar." });
    }
    return res.status(500).json(error.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const q = "DELETE FROM posts WHERE `postId` = ?";
    const result = await db.query(q, [postId]);

    if (result.affectedRows === 0) {
      return res.status(404).json("Inlägget kunde inte hittas eller har redan tagits bort.");
    }

    return res.json("Inlägget har raderats!");
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json(error.message);
  }
};

export const updatePost = (req, res) => {
  try {
    const postId = req.params.id;

    const qPost = "UPDATE posts SET `title`=?, `desc`=?, `text`=?, `img`=?, `cat`=? WHERE `postId` = ?";
    
    const values = [
      req.body.title,
      req.body.desc,
      req.body.text,
      req.body.img,
      req.body.cat,
      postId
    ];

    db.query(qPost, values, (error, postResult) => {
      if (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ error: "Ett fel uppstod vid uppdatering av inlägget." });
      }
      if (postResult.affectedRows === 0) {
        return res.status(404).json({ message: "Inlägget hittades inte eller ingen ändring gjordes." });
      }

      if (req.userInfo.role !== 1 && req.userInfo.role !== 2) {
        return res.status(403).json("Du har inte behörighet att uppdatera detta inlägg!");
      }
      return res.json({ message: "Inlägget har uppdaterats" });
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Ett fel uppstod vid uppdatering av inlägget." });
  }
}

export const updateActivityDetails = (req, res) => {
  try {
    const postId = req.params.id;

    const adminDate = formatDate(new Date(req.body.adminDate));
    const deadline = formatDate(new Date(req.body.deadline));

    const qActivity = "UPDATE ActivityDetails SET `status`=?, `adminDate`=?, `deadline`=?, `price`=?, `spots`=? WHERE `ActivityId` = ?";
    const values2 = [
      req.body.status || "closed",
      adminDate,
      deadline,
      req.body.price || 0,
      req.body.spots || 0,
      postId
    ];

    db.query(qActivity, values2, (error, activityResult) => {
      if (error) {
        console.error("Error updating ActivityDetails:", error);
        return res.status(500).json({ error: "Ett fel uppstod vid uppdatering av aktivitetsdetaljerna." });
      }

      if (activityResult.affectedRows === 0) {
        return res.status(404).json({ message: "Aktivitetsdetaljerna hittades inte eller ingen ändring gjordes." });
      }

      return res.json({ message: "Aktivitetsdetaljerna har uppdaterats" });
    });

  } catch (error) {
    console.error("Error updating activity details:", error);
    return res.status(500).json({ error: "Ett fel uppstod vid uppdatering av aktivitetsdetaljerna." });
  }
}

export const userPostStatus = async (req, res) => {
  try {
    
    const postId = req.query.activityToReg; 
    const userId = req.query.userId;

    const query = 'SELECT * FROM UserActivity WHERE uid = ? AND aid = ?';
    db.query(query, [userId, postId], (err, rows) => {
      if (err) {
        console.error("Error checking user post status:", err);
        return res.status(500).json({ err: "internt serverfel" });
      }

      const exists = rows.length > 0;

      // Send the response directly
      res.status(200).json({ exists });
    });
  } catch (err) {
    console.error("Error checking user post status:", err);
    res.status(500).json({ err: "internt serverfel" });
  }
};

export const signUpToActivity = async (req, res) => {
  try {
    const q = "INSERT INTO UserActivity (`aid`, `uid`) VALUES (?, ?)";
    const values = [req.body.activityToReg, req.body.userId];
    await db.query(q, values);
    
    return res.status(201).json("Aktiviteten har lagts till för användaren");
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Handle duplicate entry error
      console.error("Duplicate entry error:", error);
      return res.status(409).json("Användaren har redan registrerat sig för denna aktivitet");
    } else {
      // Handle other errors
      console.error("Error adding post:", error);
      return res.status(500).json(error.message);
    }
  }
};

export const userPostStatus2 = async (req, res) => {
  try {
    const postId = req.query.postId;
    const userId = req.query.userId;

    const query = 'SELECT * FROM UserActivity WHERE uid = ? AND aid = ?';
    const rows = await new Promise((resolve, reject) => {
      db.query(query, [userId, postId], (err, rows) => {
        if (err) {
          console.error("Error checking user post status:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
    // If rows are returned, it means the user has already signed up for the post
    const exists = rows.length > 0;

    // Send the response directly
    res.status(200).json({ exists });
  } catch (err) {
    console.error("Error checking user post status:", err);
    res.status(500).json({ err: "Internal Server Error" });
  }
};

export const AddNewUserAct = async (req, res) => {
  try {
    const postId = req.body.optionId;
    const userId = req.body.userId;

    const q = "INSERT INTO UserActivity (aid, uid) VALUES (?, ?)";
    const values = [postId, userId];
    await db.query(q, values);

    return res.status(201).json("Aktiviteten har lagts till för användaren");

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.error("Duplicate entry error:", error);
      return res.status(409).json("Användaren har redan registrerat sig för denna aktivitet");
    } else {
      console.error("Error adding post:", error);
      return res.status(500).json(error.message);
    }
  }
};

export const getEntries = async (req, res) => {
  const postId = req.params.id;
  const q = "SELECT * FROM UserActivity WHERE aid=?";
  db.query(q, [postId], (err, data) => {
    if (err) return res.status(500).send(err);

    return res.status(200).json(data.length);
  });
}

export const updateRegisterTotal= (req, res) => {
  try {
    const postId = req.body.activityToUpdate;
    const postTotal = req.body.NewTotal;

    const qPost = "UPDATE ActivityDetails SET `total`=? WHERE `ActivityId` = ?";
    
    const values = [
      postTotal,
      postId
    ];

    db.query(qPost, values, (error, postResult) => {
      if (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ error: "Ett fel uppstod vid uppdatering av inlägget." });
      }
      return res.json({ message: "Inlägget har uppdaterats" });
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ error: "Ett fel uppstod vid uppdatering av inlägget." });
  }
}

export const addPostRating = (req, res) => {
  const postId = req.params.id;

  const insertQuery = 'INSERT INTO postRatings (postId, userId, rating) VALUES (?, ?, ?)';

  const selectQuery = 'SELECT * FROM postRatings WHERE postId = ? AND userId = ?';
  db.query(selectQuery, [postId, req.body.userId], (error, results, fields) => {
    if (error) {
      res.status(500).send('Error getting post rating: ' + error.message);
      return;
    }
    if (results.length === 0) {
      db.query(insertQuery, [postId, req.body.userId, req.body.rating], (error, results, fields) => {
        if (error) {
          console.error('Error adding post rating: ' + error.message);
          res.status(500).send('Error adding post rating: ' + error.message);
          return;
        }
        res.status(200).send('Post rating added successfully');
      }); return;
    }

    const updateQuery = 'UPDATE postRatings SET rating = ? WHERE postId = ? AND userId = ?';

    db.query(updateQuery, [req.body.rating, postId, req.body.userId], (updateError, updateResults, updateFields) => {
      if (updateError) {
        res.status(500).send('Error adding post rating: ' + error.message);
      }
      res.status(200).json({ success: true });
    });
  });
}

export const getUserPostRating = (req, res) => {
  const postId = req.params.id;

  const selectQuery = 'SELECT rating FROM postRatings WHERE postId = ? AND userId = ?';
  db.query(selectQuery, [postId, req.query.userId], (error, results, fields) => {
    if (error) {
      res.status(500).send('Error getting post rating: ' + error.message);
      return;
    }
    if (results.length === 0) {
      res.status(200).json({ rating: 0 });
      return;
    }
    const rating = results[0].rating;
    res.status(200).json({ rating });
  });
}

export const getAverageRating = (req, res) => {
  const postId = req.params.id;

  const selectQuery = 'SELECT rating, userId FROM postRatings WHERE postId = ?';
  db.query(selectQuery, [postId], (error, results, fields) => {
      if (error) {
          res.status(500).send('Error getting post rating: ' + error.message);
          return;
      }
      if (results.length === 0) {
          // Return null for averageRating when no ratings are found
          res.status(200).json({ averageRating: null, totalLength: 0, usersRated: [] });
          return;
      }
      const ratings = results;
      
      // Calculate the sum of all ratings
      const sumOfRatings = ratings.reduce((total, current) => total + current.rating, 0);

      // Extract user IDs who have rated the post
      const usersRated = ratings.map(r => r.userId);

      // Calculate the average rating
      const averageRating = sumOfRatings / ratings.length;
      
      res.status(200).json({ averageRating, totalLength: ratings.length, usersRated });
  });
}

