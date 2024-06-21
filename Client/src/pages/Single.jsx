import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import moment from "moment";
import 'moment/locale/sv'; 
import { AuthContext } from "../context/authContext.js";
import { Button, Container, Card, Toast, Modal,} from "react-bootstrap";

import DOMPurify from "dompurify";
import arrow from "../img/fast-forward.gif";
import verify from "../img/verify.png";
import message from "../img/message.png";
import closed from "../img/closed.png";
import open from "../img/open.png";

import StarRating from "../components/StarRating";

const Single = () => {
  
  moment.locale('sv');
  const [post, setPost] = useState({});

  const [comment, setComment] = useState("");
  const [addPostRes, setAddPostRes] = useState("");
  const [getPostRes, setgetPostRes] = useState("");
  const [Registered, setRegistered] = useState(false);
  const [error, setError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);
  axios.defaults.withCredentials = true;
  const [isLoading, setIsLoading] = useState(false);
  const [takenSpot, setTakenSpot] = useState(0);
  const [postOwner,setPostOwner] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/users`;
        const res = await axios.get(apiUrl);
        setPostOwner(res?.data?.find(v => v?.id === post?.uid));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (post?.uid) {
      fetchData();
    }
  }, [post]);


  useEffect(() => {
    // Check if the user is not logged in, then navigate to the login page
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/posts/${postId}`
        );
        setPost(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    const getEntries = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/posts/getEntries/${postId}`
        );
        setTakenSpot(response.data);
      } catch (err) {
        console.log(err.message);
      }
    };
    const checkRegistrationStatus = async () => {
      const value1 = {  
        userId: currentUser?.id,
        activityToReg: postId}
      try {
        const exist = await userPostExist(value1 );
        setRegistered(exist);
      } catch (error) {
        console.error("Error checking registration status:", error);
      }
    };
    getEntries();
    fetchData();
    checkRegistrationStatus();
  }, [postId, currentUser?.id]);

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

      navigate("/");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleWriteClick = () => {
    const postWithId = { ...post, id: post.postId };
    
    navigate("/write", { state: { currentUser, ...postWithId } });
  }

  const splitTextAfterThirdDot = (text) => {
    const sentences = text.split(".");

    // Split the array into groups of three sentences
    const groupedSentences = [];
    for (let i = 0; i < sentences.length; i += 3) {
      const group = sentences.slice(i, i + 3).join(".");
      groupedSentences.push(group);
    }

    return groupedSentences;
  };

  const paragraphs = post.text ? splitTextAfterThirdDot(post.text) : [];

  useEffect(() => {
    const fetchCommentData = async () => {
      try {
        // making request too get the comment data of news post
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/comments/get/${postId}`
        );
        setgetPostRes(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchCommentData();
  }, [postId, addPostRes]);

  const handleUserComment = async (postId, e) => {
    e.preventDefault();
    try {
      const newComment = e.target.elements.newscomment.value;
      setComment(newComment);

      const token = localStorage.getItem("accessToken");
      const headers = { Authorization: `Bearer ${token}` };

      const values = {
        postId: postId,
        comment: newComment,
        uid: currentUser?.id,
        date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/comments/add`,
        values,
        { headers }
      );

      setAddPostRes(response);
      setShowToast(true);
      e.target.elements.newscomment.value = "";
    } catch (error) {
      setError("Urnauthorized User Please login!!");
      console.log("Error in Adding Comments", error);
    }
    setComment("");
    console.log(comment);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleUserSignUp = async (postId, userId, e) => {
    e.preventDefault();

    if (!currentUser) {
      const shouldLogin = window.confirm("Login to sign the activity");
      if (shouldLogin) {
        navigate("/login");
      }
    } else {
    if (post.total < post.spots){
      try {
        const token = localStorage.getItem('accessToken'); 
        const headers = { Authorization: `Bearer ${token}` }; 
        setIsLoading(true);

        const value = {  
          userId: userId,
          activityToReg: postId}
        const exist = await userPostExist(value);

         if (!exist) {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/posts/signup`, value, { headers });
          ;
          setRegistered(true);
          window.alert("Perfect ... Du är registrerad för denna aktivitet");

          const totalValue = {
            activityToUpdate: postId,
            NewTotal: post.total + 1
          } 
          await axios.put(`${process.env.REACT_APP_API_URL}/api/posts/totalUpdate`, totalValue, { headers });
          ; 
          setShowModal(false);
        } else {
          console.error("User already signed up for this post");
          window.alert("Du är redan registrerad för denna aktivitet");
        }
      } catch (error) {
        console.error("Error signing up for activity:", error);
      }finally {
        setIsLoading(false); // Reset loading state regardless of the outcome
      }   
    } else {
      console.error("No place to register");
      window.alert("Alla platser för denna aktivitet är tagna.");
    }
      
    }
  };

  const userPostExist = async (valueToCheck) => {
    try {
      // Make a request to your backend to check user post status
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/posts/signup/status`, 
        {
          params: valueToCheck
        }
      );
      // Response should contain a boolean indicating if the user has already signed up
      return response.data.exists;
      
    } catch (error) {
      console.error("Error checking if user post exists:", error);
      return false; // Assuming it doesn't exist if there's an error
    }
  };

  const handleSupportClick = () => {
    const email =postOwner.email;
    const subject = encodeURIComponent(post.title || '');
    const emailBody = encodeURIComponent("Hello, ");

    window.location.href = `mailto:${email}?subject=${subject}&body=${emailBody}`;
  };

  return (
     currentUser ? (
    <Container className="single">
      <div className="content">
        {/* Post Details */}
        <div>
          <div className="img">
            <img src={post.img} alt="" />
          </div>
          {currentUser && (
            <div className="user">
              {post.userImage && <img src={post.userImage} alt="" />}
              <div className="info">
                <span>{post.username}</span>
                <p>{moment(post.date).subtract(2, 'hours').calendar()}
                {post.status === "open" && (
                  <span><img src={open} alt="openIcon" className='closedIcon'/></span>
                )}
                {post.status === "closed" && post.cat === "aktiviteter" && (
                  <span><img src={closed} alt="closedIcon" className='closedIcon'/></span>
                )}
                </p>
              </div>
              {currentUser?.id === post.uid || currentUser.role === 1 ? (
                <div className="edit">
                  <Link
                    to={`/write?edit=2`}
                    state={post}
                    onClick={handleWriteClick}
                  >
                    <img
                      src="https://logowik.com/content/uploads/images/888_edit.jpg"
                      alt=""
                    />
                  </Link>
                  <img
                    onClick={() => handleDelete(post)}
                    src="https://cdn.iconscout.com/icon/free/png-256/free-delete-2902143-2411575.png"
                    alt=""
                  />
                </div>
              ) : null}
            </div>
          )}

          <h1>{post.title}</h1>
          {currentUser && currentUser?.id && <StarRating userId={currentUser?.id} post={post} />}
          <p
            className="descP"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.desc) }}
          ></p>
          {/* Render each paragraph separately */}
          {paragraphs.map((paragraph, index) => (
            <p
              key={index}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(paragraph.replace(/\n/g, "<br />")),
              }}
            />
          ))}
          
        </div>

        {/* Activities */}
        {post.cat === "aktiviteter" && post.status === "open" && (
          <div className="row RegBox">
            <div className="col-7 ActDetail border border-1 border-warning py-4 ms-2 text-start gap-2 text-success">
              <p className="pris-button">
                  <b> Pris </b>: <span className="text-danger">{post.price}</span> kr
              </p>
              <p><b>Aktivitet äger rum i: </b>: {moment(post.adminDate).format('dddd, LL')}</p>
              <p><b>Sista anmälningsdatum </b>: {moment(post.deadline).format('dddd, LL')}</p>
              <p><b>Kvot</b>: Det finns{" "}
                {post.spots ? post.spots - takenSpot : "obegränsat"} platser
                kvar av {post.spots || "obegränsat"} platser
              </p>
            </div>
            <div className="textClass ActDetail col-4 m-auto">
              { post.total < post.spots && !Registered && <div>
              <img src={arrow} alt="" />
              <Button
                onClick={() => {toggleModal();}}
                className="BtnClass"
                disabled={isLoading}
              >
                {isLoading ? "Vänta..." : "Delta i aktiviteten"}
              </Button></div>
              }
              { Registered && <div className="textClass text-center">
                <img src={verify} alt="" />
                <h5 className="">Du är registrerad för denna aktivitet</h5>
                <p className="text-center text-dark"><small> För att avbryta skicka e-post till admin</small>
                <span onClick={handleSupportClick} style={{cursor:'pointer'}}><img src={message} alt="" style={{ width: '20px',height: '20px' }}/></span>
                </p>
              </div>
              }
              { post.total >= post.spots && !Registered && <div className="textClass text-center">
                <img src={verify} alt="" />
                <h5 className="">Alla platser för denna aktivitet är tagna</h5>
              </div>
              }
            </div>
          </div>
        )}

        {/* Comments */}
        {currentUser && (
          <>
            <div style={{ marginTop: "20px" }}>
              <h5 className="CommClass">Posta en kommentar</h5>
              <form onSubmit={(e) => handleUserComment(postId, e)}>
                <div className="comment-section">
                  <textarea
                    name="newscomment"
                    id="newscomment"
                    cols="26"
                    placeholder="Gå med i diskussionen..."
                  ></textarea>
                  <div>
                    <div style={{ color: "red", padding: "4px" }}>{error}</div>
                    <Button
                      className="BtnClass"
                      type="submit"
                      variant="primary"
                    >
                      Add a Comment
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            <Card style={{ width: "100%", border: "0px" }}>
              <Card.Body>
                {getPostRes.length === 0 ? (
                  <div>
                    <Card.Title className="CommClass">
                      No Comments on this Post
                    </Card.Title>
                  </div>
                ) : (
                  <>
                    <Card.Title className="text-dark">
                      Tidigare kommentarer ..
                    </Card.Title>
                    {getPostRes && getPostRes
                    .filter(comment => comment.Visibility === 'show')
                    .map((comment, index) => (
                      <div className="comment-box" key={index}>
                        <hr />
                        <div className="user">
                          <img src={comment.userImage} alt="" />
                          <div className="info">
                            <span>{comment.userName}</span>
                            <p>{moment(comment.commentDate).subtract(2, 'hours').calendar()}</p>
                          </div>
                        </div>
                        <Card.Text className="bg-light p-4">
                          {comment.comments}
                        </Card.Text>
                      </div>
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>
          </>
        )}
      </div>
      
      <Menu cat={post.cat} />
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          zIndex: 9999,
          backgroundColor: "#0B5ED7",
          color: "white",
        }}
      >
        <Toast.Header>
          <strong className="me-auto">Success</strong>
        </Toast.Header>
        <Toast.Body>Your comment has been successfully submitted!</Toast.Body>
      </Toast>

      <Modal show={showModal} onHide={toggleModal} dialogClassName="custom-modal">
        <Modal.Header closeButton  className="bg-warning">
          <Modal.Title><span>Registreringsformulär</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <div className="mb-3">
            <strong>Medlemsnr:</strong> {currentUser.membershipNo}
          </div>
          <div className="mb-3">
            <strong>Namn:</strong> <span>{currentUser.firstName}</span> &nbsp;<span>{currentUser.lastName}</span>
          </div>
          <div className="mb-3">
            <strong>E-post:</strong> {currentUser.email}
          </div>
          <div className="mb-3">
            <strong>Telefon:</strong> 0{currentUser.phone}
          </div>
          <div className="mb-3">
            <strong>Aktivitet: </strong>{post.title}
          </div>
          <Button 
            variant="primary" 
            onClick={(e) => handleUserSignUp(postId, currentUser?.id, e)}
            className="btn-dark mt-4">
            Registrera
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  ) : (<div>
    Please log in to access this page.
  </div>)

)
};

export default Single;

