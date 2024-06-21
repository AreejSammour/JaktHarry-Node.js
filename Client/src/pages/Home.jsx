import React, { useContext, useEffect, useState,useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import axios from 'axios';
import DOMPurify from 'dompurify';
import StarRating from '../components/StarRating';
import { AuthContext } from '../context/authContext';
import moment from "moment";
import 'moment/locale/sv'; 
import closed from "../img/closed.png";
import open from "../img/open.png";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const cat = useLocation().search;
  const navigate = useNavigate();
  moment.locale('sv');
  const [postsToShow, setPostsToShow] = useState([])
  const postsPerPage = 10
  const arrayForHoldingPostsRef = useRef([]);
  const ref = useRef({ current: postsPerPage });
  
  const loopWithSlice = (start, end) => {
    const slicedPosts = posts.slice(start, end);
    setPostsToShow(prevPosts => [...prevPosts, ...slicedPosts]);
    arrayForHoldingPostsRef.current = [...arrayForHoldingPostsRef.current, ...slicedPosts];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/posts${cat}`;
        
        const res = await axios.get(apiUrl);
        let filteredPosts = []
        let allPosts = res.data;

        if ( cat === "" || cat === null){
          allPosts = allPosts.filter(post => post.cat !== "aktiviteter");
        }
        
        if (!currentUser || (!currentUser.intress1 && !currentUser.intress2)) {
          const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
          setPosts(sortedPosts);
          arrayForHoldingPostsRef.current = sortedPosts.slice(0, postsPerPage);
          setPostsToShow(arrayForHoldingPostsRef.current);
          return;
        }

        if (currentUser.intress1 || currentUser.intress2 || currentUser.intress3) {
          filteredPosts = allPosts.filter(post => {
            return post.cat === currentUser.intress1 || post.cat === currentUser.intress2 || post.cat === currentUser.intress3 || post.cat === 'aktiviteter';
          })
        }else {
          filteredPosts = allPosts
        }
        const sortedPosts = filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
        arrayForHoldingPostsRef.current = sortedPosts.slice(0, postsPerPage);
        setPostsToShow(arrayForHoldingPostsRef.current);

    } catch (err) {
      console.error('Error fetching data:', err);
    } 
  };

  fetchData();
}, [cat,currentUser]);

  const truncateText = (text, limit) => {
    // Find the second occurrence of a dot (.)
    const secondDotIndex = text.indexOf('.', text.indexOf('.') + 1);
  
    // Truncate at the second dot or use the entire text if no second dot is found
    const truncatedText = secondDotIndex !== -1 ? text.substring(0, secondDotIndex + 1) : text;
  
    // Add "mer..." to indicate more content
    const moreText = text.length > truncatedText.length ? ' mer...' : '';
  
    return truncatedText + moreText;
  };

  const handleClick = (postId) => {
    // Navigate to the single post page with the clicked post ID
    navigate(`/post/${postId}`);
    window.scrollTo(0, 0);
  };

  const sanitizeHTML = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  useEffect(() => {
      loopWithSlice(0, postsPerPage)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser])


    const handleShowMorePosts = () => {
      loopWithSlice(ref.current.current, ref.current.current + postsPerPage);
      ref.current.current += postsPerPage;
    };
    
  return (
    <Container className='home'>
      {postsToShow.length === 0 ? (
      <div className="mt-4 mx-auto w-100 text-center">
        <h5>Den här kategorin är inte en av dina valda intressekategorier</h5>
        <h6>För att ändra detta, gå till <Link to="/profile">din profil</Link></h6>
      </div>
    ) : (
    <div className="posts">
      {postsToShow.map((post, index) => (
        <div className="post" key={`${post.postId}-${index}`}>
          <div className="img">
            <img src={post.img} alt="" />
          </div>
          <div className="content">
            <Link className='link' to={`/post/${post.postId}`}>
              <h1>{post.title}</h1>
              <p className="DateClass">{moment(post.date).subtract(2, 'hours').calendar()}
              {post.status === "open" && (
                <span><img src={open} alt="openIcon" style={{ width: '30px',height: 'auto' }} className='ms-2'/></span>
              )}
              {post.status === "closed" && post.cat === "aktiviteter" && (
                <span><img src={closed} alt="closedIcon" style={{ width: '30px',height: 'auto' }} className='ms-2'/></span>
              )}
              </p>
              {/* Use the truncateText function for post.desc */}
              <p dangerouslySetInnerHTML={sanitizeHTML(truncateText(post.desc, 150))}></p>
              {currentUser && currentUser.id && <StarRating userId={currentUser.id} post={post} />}
              <Button onClick={() => handleClick(post.postId)}>Läs mer</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
    )}
    <div className="mt-5 me-5 text-end">
      <button className='btn btn-dark' onClick={handleShowMorePosts}>Load more</button>
    </div>  
      
  </Container>
  );
};

export default Home;