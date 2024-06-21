import { db } from "../db.js";

export const addComment = async (req, res) => {
  try {
    const q = "INSERT INTO comments(`comments`,`postId`, `uid`, `date`) VALUES (?)";

    const values = [
      req.body.comment,
      req.body.postId,
      req.body.uid,
      req.body.date,
    ];

    await db.query(q, [values]);

    return res.status(201).json("Kommentaren har lagts till");
  } catch (error) {
    console.error("Ett fel uppstod när kommentaren skulle läggas till:", error);
    return res.status(500).json(error.message);
  }
};

export const getComment = (req, res) => {
  // const q = "SELECT * FROM comments WHERE postId = ?";
  const q = `
    SELECT 
      comments.*, 
      users.username AS userName,
      users.img AS userImage,
      users.membershipNo AS membershipNo,
      comments.date AS commentDate
    FROM 
      comments 
    JOIN 
      users ON comments.uid = users.id
    WHERE 
      comments.postId = ?
  `;
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const getUserComment = (req, res) => {

  const q = "SELECT * FROM comments WHERE uId = ?";
  
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
};

export const updateCommentVisibility = (req, res) => {
  const { commentId, value } = req.body; 

  if (!commentId || !value) {
    return res.status(400).json({ message: 'Både kommentars-id och värde krävs.' });
  }
  const q= "UPDATE comments SET `Visibility`=? WHERE `id` = ?";
    
  db.query(q, [value, commentId], (err, result) => {
    if (err) {
      console.error('Error updating visibility status:', err);
      return res.status(500).json({ message: 'Fel vid uppdatering av synlighetsstatus.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kommentaren hittades inte.' });
    }

    res.status(200).json({ message: 'Synlighetsstatus har uppdaterats.' });
  });
}

export const deleteComment = (req, res) => {
  const commentId = req.params.id;

  const sql = 'DELETE FROM comments WHERE id = ?';

  db.query(sql, [commentId], (err, result) => {
    if (err) {
      console.error('Error deleting comment:', err);
      return res.status(500).json({ message: 'Fel när kommentaren skulle tas bort.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kommentaren hittades inte.' });
    }

    res.status(200).json({ message: 'Kommentaren har raderats.' });
  });
};



