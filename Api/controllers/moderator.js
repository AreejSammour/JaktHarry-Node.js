import { db } from "../db.js";

export const ModKrestar = async (req, res) => {
  const q = "SELECT `Krets1`, `Krets2` FROM ModeratorKrestar WHERE ModId = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
};

export const addKrestar = async (req, res) => {
  const { ModId, Krets1, Krets2 } = req.body;
  
  const q = "INSERT INTO ModeratorKrestar (ModId, Krets1, Krets2) VALUES (?, ?, ?)";
  db.query(q, [ModId, Krets1, Krets2], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Kretsar har lagts till" });
  });
};

export const addKrestar2 = async (req, res) => {
  const { ModId, Krets2 } = req.body;
  
  const q = "UPDATE ModeratorKrestar SET `Krets2`=? WHERE `ModId`=?";
  db.query(q, [Krets2, ModId], (err, result) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ message: "Kretsar har lagts till" });
  });
};

export const addKrestar1 = async (req, res) => {
  const { ModId, Krets1,Krets2 } = req.body;
  
  if (Krets1 === null && Krets2 === null) {
    const q = "DELETE FROM ModeratorKrestar WHERE `ModId`=?";
    db.query(q, [ModId], (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Raden har tagits bort" });
    });
  } else{
    const q = "UPDATE ModeratorKrestar SET `Krets1`=?,`Krets2`=? WHERE `ModId`=?";
    db.query(q, [Krets1,Krets2, ModId], (err, result) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ message: "Kretsar har lagts till" });
    });
  }
};

export const ModActivities = async (req, res) => {
  const q = "SELECT `Activityid1`, `Activityid2`, `Activityid3` FROM ModeratorKrestar WHERE ModId = ?";

  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);

    return res.status(200).json(data[0]);
  });
};

export const updateModActivities = async (req, res) => {
  const { id } = req.params; // Capture ModId from URL
  const { Activityid1, Activityid2, Activityid3 } = req.body;
  
  const q = "UPDATE ModeratorKrestar SET `Activityid1`=?, `Activityid2`=?, `Activityid3`=? WHERE `ModId`=?";
  
  try {
    db.query(q, [Activityid1, Activityid2, Activityid3, id], (err, result) => {
      if (err) {
        console.error("SQL Error:", err);
        return res.status(500).json({ error: "internt serverfel", details: err.message });
      }
      
      return res.status(200).json({ message: "Aktiviteter har lagts till" });
    });
  } catch (err) {
    console.error("Fel vid uppdatering av aktiviteter i databasen:", err);
    return res.status(500).json({ error: "internt serverfel", details: err.message });
  }
};

export const createModActivities = async (req, res) => {
  const userId = req.params.id; 
  
  const q = "INSERT INTO ModeratorKrestar (ModId) VALUES (?)";
  
  db.query(q, [userId], (err, result) => {
    if (err) {
      console.error("Ett fel uppstod när aktiviteter skulle skapas:", err);
      return res.status(500).json(err);
    }
    
    return res.status(200).json({ message: "Aktiviteter har lagts till" });
  });
};

export const GetModDetails = async (req, res) => {
  
  const q = "SELECT * FROM ModeratorKrestar WHERE ModId = ?";
  db.query(q, [req.params.id], (err, data) => {
  
    if (err) return res.status(500).json(err);

    return res.status(200).json(data);
  });
}