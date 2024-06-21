import axios from "axios";
import React, { useContext, useEffect, useState, useCallback } from "react";
import moment from "moment";
import del from "../img/del.png";
import edit from "../img/edit.png";
import circle from "../img/green-circle.png";
import plus from "../img/plus.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";

export const TabContent1 = ({ kretsar }) => {
  const [posts, setPosts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (!kretsar) {
      setErrorMessage("Det finns ingen tillåtelse att gå in i ett annat krets");
      return;
    }
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=${kretsar}`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setPosts(sortedPosts);
        setErrorMessage("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMessage("Error fetching posts.");
      }
    };

    fetchData();
  }, [kretsar]);

  const handleClick = (postId) => {
    // Construct the URL for the single post page with the clicked post ID
    const postUrl = `${window.location.origin}/post/${postId}`;

    // Open the URL in a new tab
    window.open(postUrl, "_blank");
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (!confirmDelete) return;

      // Retrieve the token from local storage
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts/${post.postId}`;
      await axios.delete(apiUrl, { headers });

      // Update the UI after successful deletion
      setPosts(posts.filter((p) => p.id !== post.postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (errorMessage) {
    return <h5 className="text-danger m-5">{errorMessage}</h5>;
  }

  return (
    <div className="PostClass">
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th width="20%">Datum</th>
              <th width="40%">Titel</th>
              <th>Skriven av</th>
              <th width="10%">Redigera</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post.postId}>
                <td>{index + 1}</td>
                <td width="20%" className="text-start">
                  {moment(post.date).format("LL")}
                </td>
                <td width="40%" className="text-start">
                  <Link
                    className="titleClass"
                    onClick={() => handleClick(post.postId)}
                  >
                    {post.title}
                  </Link>
                </td>
                <td>{post.username}</td>
                <td width="10%">
                  {/* Pass 'post' as an argument */}
                  <Link
                    to={`/write?edit=2`}
                    state={post}
                    onClick={() => handleWriteClick(post)}
                  >
                    <img src={edit} alt="" className="iconClass1" />
                  </Link>
                </td>
                <td width="10%">
                  <Link to="" onClick={() => handleDelete(post)}>
                    <img src={del} alt="" className="iconClass2" />
                  </Link>
                </td>
                {/* Add your edit and delete buttons here */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TabContent4 = ({ activity }) => {
  const [post, setPost] = useState([]);
  const [users, setUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadData, setReloadData] = useState(false);
  const [newMedlemsnr, setMedlemsnr] = useState("");
  const [activitySearched, setActivitySearched] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const fetchUsersForActivity = useCallback(async () => {
    try {
      setReloadData(true);
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/activityUsers?activity=${activity}`;
      const res = await axios.get(apiUrl);
      setUsers(res.data.data);
      setErrorMessage("");
      setReloadData(false);
      setActivitySearched(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setErrorMessage("Error fetching posts.");
      setReloadData(false);
    }
  }, [activity]);

  useEffect(() => {
    if (!activity) {
      setErrorMessage("Det finns inget tillstånd till annan aktivitet");
      return;
    }

    const fetchActivity = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/posts/${activity}`
        );
        setPost(response.data);
        setErrorMessage("");
      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMessage("Error fetching posts.");
      }
    };

    fetchActivity();
    fetchUsersForActivity();
  }, [activity, fetchUsersForActivity]);

  const handleDelete = async (userId) => {
    try {
      setReloadData(true);
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm(
        "Är du säker på att du vill avregistrera användaren från denna aktivitet?"
      );
      if (!confirmDelete) return;

      // Retrieve the token from local storage
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const postId = activity;
      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/delete/${postId}/${userId}`;
      await axios.delete(apiUrl, { headers });
      fetchUsersForActivity();
    } catch (error) {
      console.error("Error deleting user from activity:", error);
      setReloadData(false);
    }
  };

  const handleAdd = async () => {
    try {
      const postId = activity;
      const userId  = await checkUserExist(); // Wait for checkUserExist to complete

      // Proceed only if userId is not null (i.e., user exists)
      if (userId  !== null) {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/posts/adminsignup`,
            { optionId: postId, userId: userId  });
            
        fetchUsersForActivity();
        window.alert("Perfekt ... Användaren har lagt till aktivitet");
      } else {
        // Handle case where userId is null (user does not exist)
        window.alert(
          "Användaren hittades inte. Vänligen verifiera användarnamnet."
        );
      }

      // Reset newUserName after adding
      setMedlemsnr("");
    } catch (error) {
      console.error("Error adding user to activity:", error);
    }
  };

  const checkUserExist = async () => {
    
    try {
      // Fetch user ID based on the entered username
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/check?membershipNo=${newMedlemsnr}`;
      const res = await axios.get(apiUrl); // Wait for axios call to finish
      const userData = res.data;
      if (userData.userExists) {
        return userData.result[0].id;
      } else {
        window.confirm("Användaren hittades inte .. Verifiera användarnamnet");
        return null;
      }
    } catch (error) {
      console.error("Error searching for user:", error);
      throw error;
    }
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  if (errorMessage) {
    return <h5 className="text-danger m-5">{errorMessage}</h5>;
  }

  return (
    <div className="PostClass PostClass9">
      {reloadData && <p>Loading...</p>}
      {post && (
        <div className="userInfo">
          <p className="text-start ps-3 mt-3">
            <strong>Aktivitetstitel: </strong><br />
            <span className="text-success ms-5 ">{post.title}</span>
            <Link className="mx-5" to={`/write?edit=2`} state={post} onClick={() => handleWriteClick(post)}>
              <img src={edit} alt="" className="iconClass1" />
            </Link>
          </p>
          <ul className="list-group text-start mb-3 ms-5 w-75">
            <li className="list-group-item userClass text-danger">
              <span>
                <b>Aktivitetsstatus: </b>
              </span>
              {post.status}
            </li>
            <li className="list-group-item userClass">
              <span>
                <b>Aktiviteten äger rum i: </b>
              </span>
              {moment(post.adminDate).format("LL")}
            </li>
            <li className="list-group-item userClass">
              <span>
                <b>Sista dag för anmälan: </b>
              </span>
              {moment(post.deadline).format("LL")}
            </li>
            <li className="list-group-item userClass">
              <span>
                <b>Antal registrerade användare: </b>
              </span>
              {post.total}
            </li>
            <li className="list-group-item userClass">
              <span>
                <b>Pris: </b>
              </span>
              {post.price}
            </li>
            <li className="list-group-item userClass">
              <span>
                <b>Totalt tillåtet antal att registrera: </b>
              </span>
              {post.spots}
            </li>
          </ul>
          <h4 className="text-success">
            Användare registrerade i denna aktivitet
          </h4>
        </div>
      )}
      <div className="table-responsive">
        <table className="table table-bordered mt-5">
          <thead>
            <tr>
              <th width="10%">Medlemsnr</th>
              <th width="20%">Användarnamn</th>
              <th width="30%">Förnamn/Efternamn</th>
              <th width="30%">e-post</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center bg-dark">
                  <h5 className="text-warning mt-2">Inga användare registrerade</h5>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td width="10%"># {user.membershipNo}</td>
                  <td width="20%">{user.username}</td>
                  <td width="30%" className="text-start">
                    <small>
                      {user.firstName} {user.lastName}
                    </small>
                  </td>
                  <td width="30%">{user.email}</td>
                  <td width="10%">
                    <Link to="" onClick={() => handleDelete(user.id)}>
                      <img src={del} alt="delete" className="iconClass2" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {activitySearched && (
        <div className="btnDiv">
          <label className="form-label" htmlFor="form1">
          <strong>För att registrera en ny användare .. Ange medlemsnr</strong>
          </label>
          
          {post.status === "closed" && <button className="btnClass2" onClick={handleAdd} disabled>
            <img src={plus} alt="" className="iconClass1" />
            <span>Lägg till</span>
          </button>}
          {post.status === "open" && <div>
          <input
            type="text"
            value={newMedlemsnr}
            onChange={(e) => setMedlemsnr(e.target.value)}
            placeholder="användarmedlemsnr" />
          <button className="btn btn-dark btn-sm" onClick={handleAdd}>
            <img src={plus} alt="" className="iconClass1" />
            <span>Lägg till</span>
          </button></div>}
        </div>
      )}
    </div>
  );
};

export const TabContent8 = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/users`;
        const res = await axios.get(apiUrl);
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const formatLastActivity = (lastActivity) => {
    const now = moment();
    const activityTime = moment(lastActivity);
    const minutesDiff = now.diff(activityTime, "minutes");

    if (minutesDiff < 5) {
      return "Online";
    } else {
      return activityTime.format("LLL"); // Format the timestamp as desired
    }
  };
  const sortedUsers = [...users].sort((a, b) => {
    const isAOnline = formatLastActivity(a.lastActivity) === "Online";
    const isBOnline = formatLastActivity(b.lastActivity) === "Online";
    return isBOnline - isAOnline;
  });

  return (
    <div className="PostClass">
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="10%">medlemsnr</th>
              <th width="20%">Senaste aktivitet</th>
              <th width="20%">Användarnamn</th>
              <th width="30%">Förnamn/Efternamn</th>
              <th width="20%">e-post/Telefon</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr width="5%" key={user.id}>
                <td width="10%"># {user.membershipNo}</td>
                <td width="20%">
                  {formatLastActivity(user.lastActivity) === "Online" && (
                    <img
                      src={circle}
                      alt="Online"
                      style={{ width: "12px", marginRight: "5px" }}
                    />
                  )}
                  {formatLastActivity(user.lastActivity)}
                </td>
                <td width="20%">{user.username}</td>
                <td width="30%" className="text-start">{user.firstName} {user.lastName}</td>
                <td width="20%" className="text-start">
                  <p className="m-0">{user.email} </p>
                  <p className="m-0 text-dark">0{user.phone} </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
