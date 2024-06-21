import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import moment from "moment";
import del from "../img/del.png";
import edit from "../img/edit.png";
// import group from "../img/group.png";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext.js";

export const TabContent3 = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=riks`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    window.open(postUrl, '_blank');
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
  
      // Retrieve the token from local storage
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
  
      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts/${post.postId}`;
      await axios.delete(apiUrl, { headers });
  
      // Update the UI after successful deletion
      setPosts(posts.filter(p => p.id !== post.postId));
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
              <th width="10%">Post-id</th>
              <th width="20%">Datum</th>
              <th width="45%">Titel</th>
              <th>skriven av</th>
              <th width="10%">Redigera</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId}>
                <td width="10%">{post.postId}</td>
                <td width="20%" className="text-start">{moment(post.date).format("LL")}</td>
                <td width="45%" className="text-start">
                  <Link className="titleClass" onClick={() => handleClick(post.postId)}>{post.title}</Link>
                </td>
                <td>{post.username}</td>
                <td width="10%">
                  {/* Pass 'post' as an argument */}
                  <Link to={`/write?edit=2`} state={post} onClick={() => handleWriteClick(post)}>
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

export const TabContent4 = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=lans`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    window.open(postUrl, '_blank');
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
  
      // Retrieve the token from local storage
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
  
      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts/${post.postId}`;
      await axios.delete(apiUrl, { headers });
  
      // Update the UI after successful deletion
      setPosts(posts.filter(p => p.id !== post.postId));
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
              <th width="10%">Post-id</th>
              <th width="20%">Datum</th>
              <th width="40%">Titel</th>
              <th>Skriven av</th>
              <th width="10%">Redigera</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId}>
                <td width="10%">{post.postId}</td>
                <td width="20%" className="text-start">{moment(post.date).format("LL")}</td>
                <td width="40%" className="text-start">
                  <Link className="titleClass" onClick={() => handleClick(post.postId)}>{post.title}</Link>
                </td>
                <td>{post.username}</td>
                <td width="10%">
                  {/* Pass 'post' as an argument */}
                  <Link to={`/write?edit=2`} state={post} onClick={() => handleWriteClick(post)}>
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

export const TabContent2 = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=JAQT`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    window.open(postUrl, '_blank');
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
  
      // Retrieve the token from local storage
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
  
      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts/${post.postId}`;
      await axios.delete(apiUrl, { headers });
  
      // Update the UI after successful deletion
      setPosts(posts.filter(p => p.id !== post.postId));
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
              <th width="10%">Post-id</th>
              <th width="20%">Datum</th>
              <th width="45%">Titel</th>
              <th>skriven av</th>
              <th width="10%">Redigera</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId}>
                <td width="10%">{post.postId}</td>
                <td width="20%" className="text-start">{moment(post.date).format("LL")}</td>
                <td width="45%" className="text-start">
                  <Link className="titleClass" onClick={() => handleClick(post.postId)}>{post.title}</Link>
                </td>
                <td>{post.username}</td>
                <td width="10%">
                  {/* Pass 'post' as an argument */}
                  <Link to={`/write?edit=2`} state={post} onClick={() => handleWriteClick(post)}>
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

export const TabContent10 = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=open`;
        const res = await axios.get(apiUrl);
        const sortedPosts = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
    window.open(postUrl, '_blank');
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
  
      // Retrieve the token from local storage
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: `Bearer ${token}` };
  
      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts/${post.postId}`;
      await axios.delete(apiUrl, { headers });
  
      // Update the UI after successful deletion
      setPosts(posts.filter(p => p.id !== post.postId));
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
              <th width="10%">Post-id</th>
              <th width="20%">Datum</th>
              <th width="45%">Titel</th>
              <th>skriven av</th>
              <th width="10%">Redigera</th>
              <th width="10%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId}>
                <td width="10%">{post.postId}</td>
                <td width="20%" className="text-start">{moment(post.date).format("LL")}</td>
                <td width="45%" className="text-start">
                  <Link className="titleClass" onClick={() => handleClick(post.postId)}>{post.title}</Link>
                </td>
                <td>{post.username}</td>
                <td width="10%">
                  {/* Pass 'post' as an argument */}
                  <Link to={`/write?edit=2`} state={post} onClick={() => handleWriteClick(post)}>
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

export const TabContent5 = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  const kretsarList = useMemo(() => [
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
    "ÖsteråkerVaxholm"
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = kretsarList.map(async (category) => {
          const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts?cat=${category}`;
          const res = await axios.get(apiUrl);
          return res.data;
        });

        const results = await Promise.all(promises);

        const allPosts = results.reduce((acc, curr) => acc.concat(curr), []);

        setPosts(allPosts);
        const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [kretsarList]);

  const handleClick = (postId) => {
    // Construct the URL for the single post page with the clicked post ID
    const postUrl = `${window.location.origin}/post/${postId}`;
    
    // Open the URL in a new tab
    window.open(postUrl, '_blank');
  };

  const handleWriteClick = (post) => {
    // Pass the 'post' object as an argument
    navigate("/write", { state: { currentUser, ...post } });
  };

  const handleDelete = async (post) => {
    try {
      // Ask for confirmation before deleting
      const confirmDelete = window.confirm("Are you sure you want to delete this post?");
      if (!confirmDelete) return;
  
      // Retrieve the token from local storage
      const token = localStorage.getItem('accessToken');
      
      const headers = { Authorization: `Bearer ${token}` };
  
      // Perform the delete operation with the Authorization header
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts/${post.postId}`;
      await axios.delete(apiUrl, { headers });
  
      // Update the UI after successful deletion
      setPosts(posts.filter(p => p.id !== post.postId));
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
              <th width="10%">Post-id</th>
              <th width="20%">Datum</th>
              <th width="40%">Titel</th>
              <th>Kategori</th>
              <th>Skriven av</th>
              <th width="7%">Redigera</th>
              <th width="7%">Ta bort</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.postId}>
                <td width="10%">{post.postId}</td>
                <td width="20%" className="text-start">{moment(post.date).format("LL")}</td>
                <td width="40%" className="text-start">
                  <Link className="titleClass" onClick={() => handleClick(post.postId)}>{post.title}</Link>
                </td>
                <td>{post.cat}</td>
                <td>{post.username}</td>
                <td width="7%">
                  {/* Pass 'post' as an argument */}
                  <Link to={`/write?edit=2`} state={post} onClick={() => handleWriteClick(post)}>
                    <img src={edit} alt="" className="iconClass1" />
                  </Link>
                </td>
                <td width="7%">
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
