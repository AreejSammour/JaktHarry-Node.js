import axios from "axios";
import React, { useEffect, useState } from "react";
import del from "../img/del.png";
import { Link } from "react-router-dom";

export const TabContent14 = () => {
  const [users, setUsers] = useState([]);
  const [ModeratorActivities, setModeratorActivities] = useState({});
  const [allActivities, setAllActivities] = useState([]);
  const [selectedActMap, setSelectedActMap] = useState({});
  const [reloadData, setReloadData] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch users
      const userRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/users`
      );
      const filteredUsers = userRes.data.filter((user) => user.role === 2);

      setUsers(filteredUsers);
      // Fetch activities
      const activityRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts?cat=aktiviteter`
      );
      setAllActivities(activityRes.data);
      setReloadData(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    if (reloadData) {
      fetchData();
    }
  }, [reloadData]);

  const hasActivities = async (userId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/activities/${userId}`;
      const res = await axios.get(apiUrl);
      if (res.data) {
        const { Activityid1, Activityid2, Activityid3 } = res.data;
        const hasActivity = { userId, Activityid1, Activityid2, Activityid3 };

        const getActivityPost = (activityId) => {
          const post = allActivities.find(
            (activity) => activity.postId === activityId
          );
          return post ? post : null;
        };

        const postActivity1 = getActivityPost(Activityid1);
        const postActivity2 = getActivityPost(Activityid2);
        const postActivity3 = getActivityPost(Activityid3);
        // Update the state with the new data
        setModeratorActivities((prevState) => ({
          ...prevState,
          [userId]: {
            Activityid1: { ...Activityid1, post: postActivity1 },
            Activityid2: { ...Activityid2, post: postActivity2 },
            Activityid3: { ...Activityid3, post: postActivity3 },
            hasActivity,
          },
        }));
      } else {
        console.log("No activities found for the user. Creating a new user...");
        await createModActivitiesInDB(userId);

        const {
          Activityid1 = null,
          Activityid2 = null,
          Activityid3 = null,
        } = {};
        const hasActivity = Activityid1 || Activityid2 || Activityid3;
        setModeratorActivities((prevState) => ({
          ...prevState,
          [userId]: {
            Activityid1,
            Activityid2,
            Activityid3,
            hasActivity,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching moderator activities:", err);
    }
  };

  useEffect(() => {
    users.forEach((user) => {
      hasActivities(user.id);
    });
    // eslint-disable-next-line
  }, [allActivities]);

  const createModActivitiesInDB = async (userId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/activities/${userId}`;
      await axios.post(apiUrl);
      console.log("Activities created successfully");
    } catch (err) {
      console.error("Error creating activities in the database:", err);
    }
  };

  const handleActivitySelection = (userId, selectedActivityId) => {
    setSelectedActMap((prevState) => ({
      ...prevState,
      [userId]: selectedActivityId,
    }));
  };

  const handleAddActivityConfirm = async (userId, activityKey) => {
    try {
      const selectedActivityId = selectedActMap[userId];
      const existingActivities = ModeratorActivities[userId] || {};

      if (!selectedActivityId) {
        console.error("No activity selected");
        return;
      }

      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/activities/${userId}`;

      const updatedActivities = {
        Activityid1:
          activityKey === "Activityid1"
            ? selectedActivityId
            : existingActivities.Activityid1?.post?.postId || null,
        Activityid2:
          activityKey === "Activityid2"
            ? selectedActivityId
            : existingActivities.Activityid2?.post?.postId || null,
        Activityid3:
          activityKey === "Activityid3"
            ? selectedActivityId
            : existingActivities.Activityid3?.post?.postId || null,
      };

      const response = await axios.put(apiUrl, updatedActivities);
      console.log(response.data);

      const updatedApiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/activities/${userId}`;
      const updatedResponse = await axios.get(updatedApiUrl);

      // Update the state with the new data
      setModeratorActivities((prevState) => ({
        ...prevState,
        [userId]: {
          Activityid1: updatedResponse.data.Activityid1,
          Activityid2: updatedResponse.data.Activityid2,
          Activityid3: updatedResponse.data.Activityid3,
          hasActivity: true,
        },
      }));

      setReloadData(true);
      await fetchData();
    } catch (err) {
      console.error("Error updating activities:", err);
    }
  };

  const renderActivityDropdown = (userId, activityKey) => {
    const selectedActivityId = selectedActMap[userId];
    const selectedActivity = allActivities.find(
      (activity) => activity.postId === selectedActivityId
    );
    const placeholder = selectedActivity
      ? selectedActivity.title
      : "Välj en aktivitet";

    return (
      <div className="mt-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
        <select
          className="form-select form-select-sm"
          value={selectedActivityId || ""}
          onChange={(e) => handleActivitySelection(userId, e.target.value)}
        >
          <option value="">...{placeholder}</option>
          {allActivities.map((activity) => (
            <option key={activity.postId} value={activity.postId}>
              {activity.title}
            </option>
          ))}
        </select>
        {selectedActivityId && (
          <button
            type="button"
            className="btn btn-outline-success btn-sm mt-2"
            onClick={() => handleAddActivityConfirm(userId, activityKey)}
          >
            Confirm
          </button>
        )}
      </div>
    );
  };

  const handleDelete = async (userId, activityKey) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/activities/${userId}`;
  
      const existingActivities = ModeratorActivities[userId] || {};

      let updatedActivities = {};
      
      if (activityKey === "Activityid1") {
        updatedActivities = {
          Activityid1: existingActivities.Activityid2?.post?.postId || null,
          Activityid2: existingActivities.Activityid3?.post?.postId || null,
          Activityid3: null,
        };
      } else if (activityKey === "Activityid2") {
        updatedActivities = {
          Activityid1: existingActivities.Activityid1?.post?.postId || null,
          Activityid2: existingActivities.Activityid3?.post?.postId || null,
          Activityid3: null,
        };
      } else if (activityKey === "Activityid3") {
        updatedActivities = {
          Activityid1: existingActivities.Activityid1?.post?.postId || null,
          Activityid2: existingActivities.Activityid2?.post?.postId || null,
          Activityid3: null,
        };
      } else {
        updatedActivities = {
          Activityid1: existingActivities.Activityid1?.post?.postId || null,
          Activityid2: existingActivities.Activityid2?.post?.postId || null,
          Activityid3: existingActivities.Activityid3?.post?.postId || null,
        };
      }
   
      const response = await axios.put(apiUrl, updatedActivities); 
  
      // Update the state with the new data
      setModeratorActivities((prevState) => ({
        ...prevState,
        [userId]: {
          ...prevState[userId],
          Activityid1: response.data.Activityid1,
          Activityid2: response.data.Activityid2,
          Activityid3: response.data.Activityid3,
          hasActivity: response.data.Activityid1 || response.data.Activityid2 || response.data.Activityid3,
        },
      }));
  
      setReloadData(true);
    } catch (err) {
      console.error(`Error deleting activity ${activityKey} for user ${userId}:`, err);
    }
  };
  
  const handleReloadData = () => {
    setReloadData(true);
  };

  return (
    <div className="PostClass PostClass12">
      <div className="d-flex justify-content-end m-3">
        <button className="btn btn-dark" onClick={handleReloadData}>
          Get Data
        </button>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="10%">#</th>
              <th width="25%">Moderator</th>
              <th width="45%">Aktiviteter som han ansvarar för</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <React.Fragment key={user.id}>
                <tr>
                  <td width="10%"># {user.membershipNo}</td>
                  <td className="userClass" width="25%">
                    <small>
                      {user.username}
                      <p className="my-1">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="my-1">{user.email}</p>
                      <p className="my-1">0{user.phone}</p>
                    </small>
                  </td>
                  <td className="userClass" width="45%">
                    <div>
                      {/* Show Activity1 */}
                      {ModeratorActivities[user.id] &&
                      ModeratorActivities[user.id].Activityid1?.post?.title ? (
                        <div>
                          <span>
                            <strong>Aktivitet 1: </strong>
                            {
                              ModeratorActivities[user.id].Activityid1?.post
                                ?.title
                            }
                            <Link className="ms-5" to=""
                              onClick={() => handleDelete(user.id, "Activityid1") }>
                              <img src={del} alt="" className="iconClass4" />
                            </Link>
                          </span>
                          {/* Show Activity2 if Activity1 is selected */}
                          {ModeratorActivities[user.id].Activityid2?.post
                            ?.title ? (
                            <div>
                              <span>
                                <strong>Aktivitet 2: </strong>
                                {
                                  ModeratorActivities[user.id].Activityid2?.post
                                    ?.title
                                }
                                <Link className="ms-5" to=""
                                  onClick={() => handleDelete(user.id, "Activityid2") }>
                                  <img src={del} alt="" className="iconClass4" />
                                </Link>
                              </span>
                              {/* Show Activity3 if Activity1 and Activity2 are selected */}
                              {ModeratorActivities[user.id].Activityid3?.post
                                ?.title ? (
                                <div>
                                  <span>
                                    <strong>Aktivitet 3: </strong>
                                    {
                                      ModeratorActivities[user.id].Activityid3
                                        ?.post?.title
                                    }
                                    <Link className="ms-5" to=""
                                      onClick={() => handleDelete(user.id, "Activityid3") }>
                                      <img src={del} alt="" className="iconClass4" />
                                    </Link>
                                  </span>
                                </div>
                              ) : (
                                renderActivityDropdown(user.id, "Activityid3")
                              )}
                            </div>
                          ) : (
                            renderActivityDropdown(user.id, "Activityid2")
                          )}
                        </div>
                      ) : (
                        renderActivityDropdown(user.id, "Activityid1")
                      )}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
