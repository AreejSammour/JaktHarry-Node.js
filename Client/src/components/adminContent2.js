import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import del from "../img/del.png";
import edit from "../img/edit.png";
import plus from "../img/plus.png";
import circle from "../img/green-circle.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";
import "react-datetime/css/react-datetime.css";

export const TabContent7 = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=aktiviteter`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleClick = (postId) => {
    // Construct the URL for the single post page with the clicked post ID
    const postUrl = `${window.location.origin}/post/${postId}`;

    // Open the URL in a new tab
    window.open(postUrl, "_blank");
  };

  const handleWriteClick = (post) => {
    const postWithId = { ...post, id: post.ActivityId};
    
    navigate("/write", { state: { currentUser, ...postWithId } });
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

      // Create headers with the Authorization header
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
  return (
    <div className="PostClass">
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="10%">Akt-id</th>
              <th width="20%">Publicera datum</th>
              <th width="40%">Aktivitetstitel</th>
              <th width="10%">Redigera</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <React.Fragment key={post.postId}>
                <tr key={post.postId}>
                  <td width="10%">{post.postId}</td>
                  <td width="20%" className="text-start">{moment(post.date).format("LL")}</td>
                  <td width="50%" className="text-start">
                  <div>
                    <div>
                      <Link className="titleClass"
                        onClick={() => handleClick(post.postId)}>
                        <b>{post.title}</b>
                      </Link>
                    </div>
                    {post.status === "open" && ( 
                    <div className="tdbg">
                      <ul className="list-group text-start">
                        <li className="list-group-item userClass">
                          <b>{post.status}</b>
                        </li>
                        <li className="list-group-item userClass">
                          <span><b>Aktiviteten äger rum i: </b></span>
                          {moment(post.adminDate).format("LL")}
                        </li>
                        <li className="list-group-item userClass">
                          <span><b>Sista dag för anmälan: </b></span>
                          {moment(post.deadline).format("LL")}
                        </li>
                        <li className="list-group-item userClass">
                        <span><b>Total: </b></span>
                          {post.total}
                        </li>
                        <li className="list-group-item userClass">
                        <span><b>Pris: </b></span>
                          {post.price}
                        </li>
                        <li className="list-group-item userClass">
                        <span><b>Spots: </b></span>
                          {post.spots}
                        </li>
                      </ul>
                    </div>)}
                    </div>
                  </td>
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
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TabContent8 = () => {

  const [posts, setPosts] = useState([]);
  const [membershipNo, setMembershipNo] = useState("");
  const [userId, setUserId] = useState(null);
  const [userInformation, setUserInformation] = useState(null); 
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [reloadData, setReloadData] = useState(false);

  const fetchData = async (userId) => {
    setReloadData(true);
  
    if (!userId) {
      setReloadData(false);
      return;
    }
  
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/user-activity?userId=${userId}`;
  
      const res = await axios.get(apiUrl);
  
      if (res.data.message === "Sign up list fetch successful") {
        const items = res.data.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
  
        setPosts(items);
      } else {
        console.log("No data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err.response ? err.response.data : err.message);
      window.alert('An error occurred while fetching data. Please try again later.');
    } finally {
      setReloadData(false);
    }
  };

  useEffect(() => {
  if (userId) {
    fetchData(userId);
  }
}, [userId]);

  const handleClick = (postId) => {
    const postUrl = `${window.location.origin}/post/${postId}`;
    window.open(postUrl, "_blank");
  };

  const handleMembershipNoChange = (event) => {
    setMembershipNo(event.target.value);
  };

  const handleSearch = async () => {
    try {
      // Fetch user ID based on the entered username
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/check?membershipNo=${membershipNo}`;
      const res = await axios.get(apiUrl);
     
      if (res.data.userExists) {
        // If user found, set the user ID
        const user = res.data.result[0];
        setUserId(user.id);
        setUserInformation(user);
      } else {
        window.confirm("Medlemsnumret hittades inte .. Verifiera medlemsnumret");
      }
    } catch (error) {
      console.error("Error searching for user:", error);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm(
        "Är du säker på att du vill radera denna aktivitet?"
      );
      if (!confirmDelete) return;

      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };
      
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/delete/${post.postId}/${userId}`;
      
      await axios.delete(apiUrl, { headers });
      setReloadData((prev) => !prev);
      // Update the UI after successful deletion
      setPosts(posts.filter((p) => p.postId !== post.postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleAdd = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionSelect = async (optionId) => {
    setSelectedOption(options.find(option => option.postId === optionId).title);
    setShowOptions(false);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts/signup/status2?postId=${optionId}&userId=${userId}`
      );
      if (!response.data.exists) {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/posts/adminsignup`,
          { optionId: optionId,
            userId: userId, }
        );
        fetchData(userId); 

        window.alert('Perfect ... Du är registrerad för denna aktivitet');
      } else {
        window.alert('Du är redan registrerad för denna aktivitet');
      }
    } catch (error) {
      console.error('Error handling option selection:', error);
    }
  };

  useEffect(() => {
    const fetchOptionsFromDatabase = async () => {
      try {
        // Fetch options from the database
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=aktiviteter`;
        const res = await axios.get(apiUrl);
        const filteredOptions = res.data.filter((post) => post.status === "open");
        setOptions(filteredOptions); // Set the options state
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptionsFromDatabase();
  }, []);

  return (
    <div className="PostClass PostClass8">
      <label className="form-label labelClass" htmlFor="form1">
        Ange medlemsnr
      </label>
      <input
        className="inputClass"
        type="search"
        value={membershipNo}
        onChange={handleMembershipNoChange}
        onKeyDown={handleKeyDown}
      />
      
      <button className="btnClass" onClick={handleSearch}>
        Sök
      </button>
      {reloadData && <p>Loading...</p>}
      {userInformation && (
        <div className="userInfo">
          <p className="text-start ps-5 mt-3" style={{ fontSize: '13px' }}><strong>Användarnamn: </strong><span> ... {userInformation.firstName} {userInformation.lastName}</span></p>
          <p className="text-start ps-5" style={{ fontSize: '13px' }}><strong>E-post: </strong>{userInformation.email}</p>
          <p className="text-start ps-5" style={{ fontSize: '13px' }}><strong>Telefon: </strong>0{userInformation.phone}</p>
          <p className="text-start ps-5" style={{ fontSize: '13px' }}><strong>Medlemsnr: </strong>#{userInformation.membershipNo}</p>
          <h5>{userInformation.username}  är registrerad i dessa aktiviteter</h5>
        </div>
      )}
      {!userInformation && <div>
        <h5 className="my-3">Användare är registrerad i dessa aktiviteter</h5>
        </div>} 
      {userId && (
        <div className="btnDiv">
          <button className="btnClass2" onClick={handleAdd}>
            <img src={plus} alt="" className="iconClass1" />
            <span>Lägg till aktivitet</span>
          </button>
          {showOptions && (
            <div>
              <ul className="ulclass">
                {options.map((option) => (
                  <li
                    className="liOptions"
                    key={option.postId}
                    onClick={() => handleOptionSelect(option.postId)}
                  >
                    <Link className="link">{option.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedOption && <p>Selected option: {selectedOption}</p>}
        </div>
      )}

      <div className="table-responsive">
        
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="10%">#</th>
              <th width="20%">Datum</th>
              <th width="40%">Aktivitet (id-titel)</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr key={post.postId}>
                <td width="10%">{index + 1}</td>
                <td width="20%">{moment(post.date).format("LL")}</td>
                <td width="40%">
                  <Link
                    className="titleClass"
                    onClick={() => handleClick(post.postId)}
                  >
                    #{post.postId}-{post.title}
                  </Link>
                </td>
                <td width="10%">
                  <Link to="" onClick={() => handleDelete(post)}>
                    <img src={del} alt="delete" className="iconClass2" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TabContent9 = () => {
  const [posts, setPosts] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [activitySearched, setActivitySearched] = useState(false);
  const [newMedlemsnr, setMedlemsnr] = useState("");
  const [activityInformation, setActivityInformation] = useState(null); 
  const [reloadData, setReloadData] = useState(false);
  const [allActivities, setAllActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=aktiviteter`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setPosts(sortedPosts);
      setAllActivities(sortedPosts); 
        return 
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error fetching activities. Please try again later.");
      }
    };
    fetchData();
  }, []);

  const fetchUsersForActivity = async () => {
    try {
      setReloadData(true);
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/activityUsers?activity=${selectedActivity}`;
      const res = await axios.get(apiUrl);
      setUsers(res.data.data);
      setActivitySearched(true);
      if (allActivities.length > 0) {
        const selectedActivityObj = allActivities.find(activity => activity.postId.toString() === selectedActivity);
        
        if (selectedActivityObj) {
          setActivityInformation(selectedActivityObj);
        }
      }
      setReloadData(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error fetching users. Please try again later.");
      setReloadData(false);
    }
  };

  const handleOptionSelect = (e) => {
    setSelectedActivity(e.target.value);
  };

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

      const postId = selectedActivity;
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
      const postId = selectedActivity;
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

  return (
    <div className="PostClass PostClass9">
      <h3 className="labelClass" htmlFor="form1">
        Välj aktivitetens namn
      </h3>
      <select className="inputClass" onChange={handleOptionSelect}>
        <option>Välj en aktivitet</option>
        {posts.map((activity, index) => (
          <option key={index} value={activity.postId}>
            {activity.title}
          </option>
        ))}
      </select>
      <button className="btnClass" onClick={fetchUsersForActivity}>
        Sök
      </button>
      <div>

      {error && <p>Error: {error}</p>}{" "}
      {reloadData && <p>Loading...</p>}
      {activityInformation && (
        <div className="userInfo">
          <p className="text-start ps-3 mt-3"><strong>Aktivitetstitel: </strong>
          <p className="text-success ms-5">{activityInformation.title}</p></p>
          <ul className="list-group text-start mb-3 ms-5 w-75">
            <li className="list-group-item userClass text-danger">
            <span><b>Aktivitetsstatus: </b></span>
            {activityInformation.status}
            </li>
            <li className="list-group-item userClass">
              <span><b>Aktiviteten äger rum i: </b></span>
              {moment(activityInformation.adminDate).format("LL")}
            </li>
            <li className="list-group-item userClass">
              <span><b>Sista dag för anmälan: </b></span>
              {moment(activityInformation.deadline).format("LL")}
            </li>
            <li className="list-group-item userClass">
            <span><b>Antal registrerade användare: </b></span>
              {activityInformation.total}
            </li>
            <li className="list-group-item userClass">
            <span><b>Pris: </b></span>
              {activityInformation.price}
            </li>
            <li className="list-group-item userClass">
            <span><b>Totalt tillåtet antal att registrera: </b></span>
              {activityInformation.spots}
            </li>
          </ul>
          <h4 className="text-success">Användare registrerade i denna aktivitet</h4>
        </div>
      )}
      {!activityInformation && <div>
        <h5 className="my-3">Användare registrerade i denna aktivitet</h5>
        </div>}
      <div className="table-responsive">
        <table className="table table-bordered">
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
            {users.map((user) => (
              <tr key={user.id}>
                <td width="10%"># {user.membershipNo}</td>
                <td width="20%">{user.username}</td>
                <td width="30%" className="text-start"><small>{user.firstName} {user.lastName}</small></td>
                <td width="30%">{user.email}</td>
                <td width="10%">
                  <Link to="" onClick={() => handleDelete(user.id)}>
                    <img src={del} alt="delete" className="iconClass2" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {activitySearched && (
        <div className="btnDiv">
          <label className="form-label" htmlFor="form1">
          <strong>För att registrera en ny användare .. Ange medlemsnr</strong>
          </label>
          
          {activityInformation.status === "closed" && <button className="btnClass2" onClick={handleAdd} disabled>
            <img src={plus} alt="" className="iconClass1" />
            <span>Lägg till</span>
          </button>}
          {activityInformation.status === "open" && <div>
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
    </div>
  );
};

export const TabContent12 = () => {
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

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Send a PUT request to update the user's role
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/role/${userId}`;
      await axios.put(apiUrl, { role: newRole }, { headers });

      setUsers((prevUsers) => {
        return prevUsers.map((user) => {
          if (user.id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        });
      });
    } catch (error) {
      console.error("Error changing user role:", error);
    }
  };

  const handleDelete = async (user) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this post?"
      );
      if (!confirmDelete) return;

      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/users/${user.id}`;
      await axios.delete(apiUrl, { headers });

      // Update the UI after successful deletion
      setUsers(users.filter((p) => p.id !== user.id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

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
      <h6>
        "Notera att: .. användarroll = 1 (admin).. & .. roll = 2 (Moderatorer)"
      </h6>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th width="5%">Medlemsnr</th>
              <th width="20%">Senaste aktivitet</th>
              <th width="20%">Användarnamn</th>
              <th width="30%">e-post</th>
              <th width="5%">roll</th>
              <th width="10%">Byta roll</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr width="5%" key={user.id}>
                <td># {user.membershipNo}</td>
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
                <td width="30%">{user.email} </td>
                <td width="5%">{user.role}</td>
                <td width="10%">
                  <select
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                  </select>
                </td>
                <td width="10%">
                  <Link to="" onClick={() => handleDelete(user)}>
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
