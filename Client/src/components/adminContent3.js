import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import del from "../img/del.png";
import moment from "moment";

export const TabContent13 = () => {
  const [users, setUsers] = useState([]);
  const [userPosts, setUserPosts] = useState({});
  const [ModeratorKrestar, setModeratorKrestars] = useState({});
  const [isPostsVisible, setIsPostsVisible] = useState({});
  const [selectedKretsMap, setSelectedKretsMap] = useState({});

  const kretsarList = [
    "StockholmCentrala",
    "Hallstavik",
    "HaningeTyresö",
    "Lidingö",
    "Mälarö",
    "Norrort",
    "NorrtäljeNorra",
    "NorrtäljeSödra",
    "Nynäshamn",
    "Rimbo",
    "SolnaSundbyberg",
    "Söderort",
    "Södertälje",
    "UpplandsBro",
    "WermdöNacka",
    "VäsbySollentunaJärfälla",
    "Västerort",
    "ÖsteråkerVaxholm",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/users`;

        const res = await axios.get(apiUrl);
        const filteredUsers = res.data.filter((user) => user.role === 2);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const fetchUserPosts = async (userId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?uid=${userId}`;
      const res = await axios.get(apiUrl);
      setUserPosts({ ...userPosts, [userId]: res.data });
      setIsPostsVisible({
        ...isPostsVisible,
        [userId]: !isPostsVisible[userId],
      });
    } catch (err) {
      console.error("Error fetching user items:", err);
      return [];
    }
  };

  const handleClick = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    window.open(postUrl, "_blank");
  };

  const hasKretsar = async (userId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/krestar/${userId}`;
      const res = await axios.get(apiUrl);
      const { Krets1, Krets2 } = res.data;

      const hasKrets = Krets1 || Krets2;

      if (hasKrets) {
        setModeratorKrestars((prevState) => ({
          ...prevState,
          [userId]: {
            Krets1,
            Krets2,
            hasKrets,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching moderator krestars:", err);
    }
  };

  useEffect(() => {
    users.forEach((user) => {
      hasKretsar(user.id);
    });
  }, [users]);

  const handleKretsSelection = (userId, krets) => {
    setSelectedKretsMap((prevState) => ({
      ...prevState,
      [userId]: krets,
    }));
  };

  const handleAddKretsConfirm = async (userId, kretsId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators`;
      if (kretsId === "Krets1") {
        const requestData = {
          ModId: userId,
          Krets1: selectedKretsMap[userId],
          Krets2: null,
        };
        const response = await axios.post(apiUrl, requestData);
        console.log(response.data);
      } else if (kretsId === "Krets2") {
        const requestData = {
          ModId: userId,
          Krets2: selectedKretsMap[userId],
        };
        const response = await axios.put(apiUrl, requestData);
        console.log(response.data);
      }

      // Log the response if needed

      const updatedApiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/krestar/${userId}`;
      const updatedResponse = await axios.get(updatedApiUrl);

      // Update the state with the updated data
      setModeratorKrestars((prevState) => ({
        ...prevState,
        [userId]: {
          Krets1: updatedResponse.data.Krets1,
          Krets2: updatedResponse.data.Krets2,
          hasKrets: true, // Assuming that if data is present, hasKrets should be true
        },
      }));
    } catch (error) {
      console.error("Error adding krets:", error);
    }
  };

  const handleDelete = async (userId, kretsId) => {

    try {
      if (kretsId === "Krets1") {
        const requestData = {
          ModId: userId,
          Krets1: ModeratorKrestar[userId].Krets2,
          Krets2: null,
        };
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/add`;
        const response = await axios.put(apiUrl, requestData);
        console.log(response.data);
      } else if (kretsId === "Krets2") {
        const requestData = {
          ModId: userId,
          Krets2: null,
        };
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators`;
        const response = await axios.put(apiUrl, requestData);
        console.log(response.data);
      }

      const updatedApiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/krestar/${userId}`;
      const updatedResponse = await axios.get(updatedApiUrl);

      // Update the state with the updated data
      setModeratorKrestars((prevState) => ({
        ...prevState,
        [userId]: {
          Krets1: updatedResponse.data.Krets1,
          Krets2: updatedResponse.data.Krets2,
          hasKrets: true, // Assuming that if data is present, hasKrets should be true
        },
      }));
    } catch (error) {
      console.error("Error adding krets:", error);
    }
  };

  return (
    <div className="PostClass PostClass12">
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="10%">#</th>
              <th width="25%">Användarnamn</th>
              <th width="45%">Kretsar</th>
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
                    {ModeratorKrestar[user.id] ? (
                      <>
                        {ModeratorKrestar[user.id].Krets1 && (
                          <p>
                            {ModeratorKrestar[user.id].Krets1}
                            <Link
                              className="mx-5"
                              to=""
                              onClick={() => handleDelete(user.id, "Krets1")}
                            >
                              <img src={del} alt="" className="iconClass4" />
                            </Link>
                          </p>
                        )}
                        {ModeratorKrestar[user.id].Krets2 && (
                          <p>
                            {ModeratorKrestar[user.id].Krets2}
                            <Link
                              className="mx-5"
                              to=""
                              onClick={() => handleDelete(user.id, "Krets2")}
                            >
                              <img src={del} alt="" className="iconClass4" />
                            </Link>
                          </p>
                        )}
                        {!ModeratorKrestar[user.id].Krets2 &&
                          ModeratorKrestar[user.id].Krets1 && (
                            <div>
                              <select
                                className="form-select form-select-sm"
                                value={selectedKretsMap[user.id] || ""}
                                onChange={(e) =>
                                  handleKretsSelection(user.id, e.target.value)
                                }
                              >
                                <option value="">Select Krets1</option>
                                {kretsarList.map((krets, index) => (
                                  <option key={index} value={krets}>
                                    {krets}
                                  </option>
                                ))}
                              </select>
                              {selectedKretsMap[user.id] && (
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm mt-2"
                                  onClick={() =>
                                    handleAddKretsConfirm(user.id, "Krets2")
                                  }
                                >
                                  Confirm
                                </button>
                              )}
                            </div>
                          )}
                        {!ModeratorKrestar[user.id].Krets2 &&
                          !ModeratorKrestar[user.id].Krets1 && (
                            <div>
                              <select
                                className="form-select form-select-sm"
                                value={selectedKretsMap[user.id] || ""}
                                onChange={(e) =>
                                  handleKretsSelection(user.id, e.target.value)
                                }
                              >
                                <option value="">Select Krets1</option>
                                {kretsarList.map((krets, index) => (
                                  <option key={index} value={krets}>
                                    {krets}
                                  </option>
                                ))}
                              </select>
                              {selectedKretsMap[user.id] && (
                                <button
                                  type="button"
                                  className="btn btn-outline-success btn-sm mt-2"
                                  onClick={() =>
                                    handleAddKretsConfirm(user.id, "Krets1")
                                  }
                                >
                                  Confirm
                                </button>
                              )}
                            </div>
                          )}
                      </>
                    ) : (
                      <div>
                        <select
                          className="form-select form-select-sm"
                          value={selectedKretsMap[user.id] || ""}
                          onChange={(e) =>
                            handleKretsSelection(user.id, e.target.value)
                          }
                        >
                          <option value="">Select Krets1</option>
                          {kretsarList.map((krets, index) => (
                            <option key={index} value={krets}>
                              {krets}
                            </option>
                          ))}
                        </select>
                        {selectedKretsMap[user.id] && (
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm mt-2"
                            onClick={() =>
                              handleAddKretsConfirm(user.id, "Krets1")
                            }
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan="3" className="PostsClass">
                    <button
                      type="button"
                      className="PostBtn btn-sm"
                      onClick={() => fetchUserPosts(user.id)}
                    >
                      {isPostsVisible[user.id]
                        ? "stäng listan"
                        : "Inlägg skrivet av moderator"}
                    </button>
                    {isPostsVisible[user.id] &&
                      userPosts[user.id] &&
                      userPosts[user.id].length > 0 && (
                        <ul className="list-group">
                          {userPosts[user.id].map((post, idx) => (
                            <li className="list-group-item userClass" key={idx}>
                              <Link
                                className="titleClass"
                                onClick={() => handleClick(post.postId)}
                              >
                                <small>{moment(post.date).format("ll")}</small>
                                &nbsp;
                                <i class="fa fa-angle-double-right pt-1 text-warning"></i>
                                &nbsp; {post.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    {isPostsVisible[user.id] &&
                      userPosts[user.id] &&
                      userPosts[user.id].length === 0 && (
                        <ul className="list-group">
                          <li className="list-group-item">
                            Ingenting publicerades
                          </li>
                        </ul>
                      )}
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


