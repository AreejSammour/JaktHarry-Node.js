import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../img/JaktHarryLogo.png";
import adsett from "../img/adsett.png";
import admin from "../img/admin.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { Navbar, NavDropdown, Container, Nav } from "react-bootstrap";
import { AuthContext } from "../context/authContext";
import { chatsState } from "../recoil/atoms/chats";
import { useRecoilState } from "recoil";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import message from "../img/message2.png";

function CustomNavbar() {
  const { currentUser, logout } = useContext(AuthContext);
  const [allChats, setAllChats] = useRecoilState(chatsState)
  // Check if currentUser is admin
  const isAdmin = currentUser && currentUser.role === 1;
  const isModerator = currentUser && currentUser.role === 2;
  const isUser = currentUser && currentUser.role === 0;
  // Define kretsarList
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

  const handleLogout = () => {
    setAllChats([])
    logout()
  }

  useEffect(() => {
    if (currentUser?.id) {
      const chatRef = collection(db, 'Chats')
      const chatQ = query(
        chatRef,
        where('senderId', '==', currentUser.id)
      )
      const receiverChatQ = query(
        chatRef,
        where('receiverId', '==', currentUser.id)
      )
      const unsubscribe = onSnapshot(chatQ, (snapshot) => {
        snapshot.docChanges().forEach((change, ind, items) => {
          const { type, doc } = change;
          if (type === "added") {
            setAllChats(prev => ([...prev, { ...doc.data(), id: doc.id }].filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.id === value.id
              ))
            )))
          }
          if (type === "removed") {
            setAllChats((prev) =>
              prev.filter((chat) => chat.id !== doc.id)
            );
          }

          if (type === "modified") {
            setAllChats((prev) =>
              prev.map((chat) =>
                chat.id === doc.id
                  ? { ...chat, ...doc.data() }
                  : chat
              )
            );
          }
        })
      })
      const unsubscribeReceiver = onSnapshot(receiverChatQ, (snapshot) => {
        snapshot.docChanges().forEach((change, ind, items) => {
          const { type, doc } = change;
          if (type === "added") {
            setAllChats(prev => ([...prev, { ...doc.data(), id: doc.id }].filter((value, index, self) =>
              index === self.findIndex((t) => (
                t.id === value.id
              ))
            )))
          }
          if (type === "removed") {
            setAllChats((prev) =>
              prev.filter((chat) => chat.id !== doc.id)
            );
          }

          if (type === "modified") {
            setAllChats((prev) =>
              prev.map((chat) =>
                chat.id === doc.id
                  ? { ...chat, ...doc.data() }
                  : chat
              )
            );
          }
        })
      })
      return () => {
        unsubscribe()
        unsubscribeReceiver()
      }
    }
    // eslint-disable-next-line
  }, [currentUser, isUser])

  const messagesCount = currentUser && allChats.filter(v => ((v.receiverId === currentUser.id || v.senderId === currentUser.id) && v.conversation.find(val => !val.isSeen && val.senderId !== currentUser.id)))?.length;

  
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-dark navbar-dark">
      <Container>
        <Navbar.Brand>
          <Link to="/">
            <img src={Logo} alt="" className="imgClass" />
          </Link>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="ms-auto navClass">
            <NavDropdown title="NYHETER" id="collapsible-nav-dropdown">
              <NavDropdown.Item className="item">
                <Link to="/" className="nav-link itemClass">
                  alla nyheter
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Item className="item">
                <Link to="/?cat=riks" className="nav-link itemClass">
                  RIKS
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Item className="item">
                <Link to="/?cat=lans" className="nav-link itemClass">
                  LÄNS
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Item className="item">
                <Link to="/?cat=nationell" className="nav-link itemClass">
                  Nationell
                </Link>
                
              </NavDropdown.Item>
              <NavDropdown.Item className="item">
                <Link to="/?cat=JAQT" className="nav-link itemClass">
                  JAQT
                </Link>
              </NavDropdown.Item>
              
              <NavDropdown.Item className="item">
                <Link to="/?cat=open" className="nav-link itemClass">
                  Öppen
                </Link>
              </NavDropdown.Item>
              <NavDropdown
                title="KRETSAR"
                id="kretsar-dropdown"
                className="item"
              >
                {kretsarList.map((krets, index) => (
                  <NavDropdown.Item key={index}>
                    <Link to={`/?cat=${krets}`} className="nav-link itemClass2">
                      {krets}
                    </Link>
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </NavDropdown>
            <Link to="/?cat=aktiviteter" className="nav-link">
              <b>AKTIVITETER</b>
            </Link>
            {currentUser ? (
              <>
                <Link to="/profile" className="nav-link">
                  {currentUser?.username} <i className="fa fa-address-card-o"></i>
                </Link>
                {!isAdmin && <Link to="/messages" className="nav-link" style={{ position: "relative" }}>
                  <span><img src={message} alt="" style={{ width: '25px', height: '25px' }} /></span>

                  {!!messagesCount && <span style={{
                    minWidth: 24,
                    minHeight: 24,
                    backgroundColor: '#664d03',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: 'white',
                    textAlign: 'center'
                  }}>{messagesCount}</span>}
                </Link>}
                <Link className="nav-link" onClick={handleLogout} to="/">
                  LoggaUt
                </Link>
              </>
            ) : (
              <Link className="nav-link" to="/login">
                loggaIN
              </Link>
            )}
            {currentUser &&
              (currentUser.role === 1 || currentUser.role === 2) && (
                <Link to="/write" className="nav-link write">
                  Skriva
                </Link>
              )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      {isAdmin && (
        <Link to="/panel" className="linkClass">
          <img src={adsett} alt="" className="adClass" />
          <h6>Adminpanel</h6>
        </Link>
      )}
      {isModerator && (
        <Link to="/moderatorPanel" className="linkClass">
          <img src={admin} alt="" className="adClass" />
          <h6>Moderator</h6>
        </Link>
      )}


    </Navbar>
  );
}

export default CustomNavbar;

