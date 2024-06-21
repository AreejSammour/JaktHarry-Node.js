import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ListGroup, Image, Modal } from 'react-bootstrap';
import axios from 'axios'
import { AuthContext } from "../../context/authContext";
import { collection, doc, setDoc, updateDoc, arrayUnion, } from 'firebase/firestore'
import { db } from "../../firebase"
import { useRecoilState } from 'recoil';
import { chatsState } from '../../recoil/atoms/chats';

function ConfirmModal({ show, onHide, onConfirm, loading, selected = 'all' }) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Bekräfta åtgärd</Modal.Title>
      </Modal.Header>
      <Modal.Body>Är du säker på att du vill skicka detta till {selected === "all" ? 'alla' : selected === 'mods' ? 'moderators' : 'användare'}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annullera
        </Button>
        <Button variant="warning" onClick={onConfirm} disabled={loading}>
          Bekräfta
        </Button>
      </Modal.Footer>
    </Modal>
  );
}


function ChatUI() {
  const { currentUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState({});
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState([]);
  const [allChats] = useRecoilState(chatsState)
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const isAdmin = currentUser && (currentUser.role === 1);
  const isMod = currentUser && (currentUser.role === 2);
  const isUser = currentUser && currentUser.role === 0;

  const handleSearchText = (e) => {
    setSearchText(e?.target?.value?.toLowerCase() || '')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL}/api/users`;
        const res = await axios.get(apiUrl);
        setUsers(res?.data?.filter(v => v?.id !== currentUser?.id));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (currentUser?.id) {
      fetchData();
    }
  }, [currentUser.id]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const selectedChat = allChats.find(v => v.senderId === selectedUser.id || v.receiverId === selectedUser.id)
  const allNormalUsers = users?.filter(v => v.role === 0).map(v => v.id)
  const allModerators = users?.filter(v => v.role === 2).map(v => v.id)


  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (inputText.trim() !== '' && currentUser?.id && (selectedUser?.id || selectedUser === 'all' || selectedUser === 'mods' || selectedUser === 'users')) {
      setLoading(true)

      try {
        if (selectedUser === 'all') {
          allChats.map(async v => {
            if (v?.id) {
              await updateDoc(doc(db, 'Chats', v.id), {
                conversation: arrayUnion({ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false })
              })
            }
          })
          const myChats = allChats?.filter(v => v.senderId === currentUser.id || v.receiverId === currentUser.id)
          const uids = myChats.map(v => {
            if (v.senderId !== currentUser.id) {
              return v.senderId
            } else {
              return v.receiverId
            }
          })

          const noChatsWith = users.filter(v => !uids.includes(v.id))

          await Promise.all(noChatsWith.map(async user => {
            const colRef = collection(db, 'Chats')
            const docId = doc(colRef).id
            const payload = {
              id: docId,
              time: new Date(),
              senderId: currentUser?.id,
              receiverId: user?.id,
              conversation: [{ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false }]
            }
            await setDoc(doc(db, 'Chats', docId), payload)
          }))
          setShowConfirmation(false)
          return setInputText('');
        }
        if (selectedUser === 'users') {
          allChats?.filter(v => allNormalUsers?.includes(v.receiverId) || allNormalUsers?.includes(v.senderId)).map(async v => {
            if (v?.id) {
              await updateDoc(doc(db, 'Chats', v.id), {
                conversation: arrayUnion({ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false })
              })
            }
          })
          const myChats = allChats?.filter(v => v.senderId === currentUser.id || v.receiverId === currentUser.id)
          const uids = myChats.map(v => {
            if (v.senderId !== currentUser.id) {
              return v.senderId
            } else {
              return v.receiverId
            }
          })

          const noChatsWith = users.filter(v => !uids.includes(v.id))

          await Promise.all(noChatsWith.filter(v => allNormalUsers.includes(v.id)).map(async user => {
            const colRef = collection(db, 'Chats')
            const docId = doc(colRef).id
            const payload = {
              id: docId,
              time: new Date(),
              senderId: currentUser?.id,
              receiverId: user?.id,
              conversation: [{ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false }]
            }
            await setDoc(doc(db, 'Chats', docId), payload)
          }))
          setShowConfirmation(false)
          return setInputText('');
        }
        if (selectedUser === 'mods') {
          allChats?.filter(v => allModerators?.includes(v.receiverId) || allModerators?.includes(v.senderId)).map(async v => {
            if (v?.id) {
              await updateDoc(doc(db, 'Chats', v.id), {
                conversation: arrayUnion({ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false })
              })
            }
          })
          const myChats = allChats?.filter(v => v.senderId === currentUser.id || v.receiverId === currentUser.id)
          const uids = myChats.map(v => {
            if (v.senderId !== currentUser.id) {
              return v.senderId
            } else {
              return v.receiverId
            }
          })

          const noChatsWith = users.filter(v => !uids.includes(v.id))

          await Promise.all(noChatsWith.filter(v => allModerators.includes(v.id)).map(async user => {
            const colRef = collection(db, 'Chats')
            const docId = doc(colRef).id
            const payload = {
              id: docId,
              time: new Date(),
              senderId: currentUser?.id,
              receiverId: user?.id,
              conversation: [{ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false }]
            }
            await setDoc(doc(db, 'Chats', docId), payload)
          }))
          setShowConfirmation(false)
          return setInputText('');
        }

        if (selectedChat?.id) {
          await updateDoc(doc(db, 'Chats', selectedChat.id), {
            conversation: arrayUnion({ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false })
          })
        } else {

          const colRef = collection(db, 'Chats')
          const docId = doc(colRef).id
          const payload = {
            id: docId,
            time: new Date(),
            senderId: currentUser?.id,
            receiverId: selectedUser?.id,
            conversation: [{ text: inputText, senderId: currentUser?.id, time: new Date(), isSeen: false }]
          }
          await setDoc(doc(db, 'Chats', docId), payload)
        }
        setInputText('');
      } catch (err) {

      } finally {
        setLoading(false)
      }

    }
  };

  const getTimeString = (timestamp1, timestamp2) => {
    let time1, time2;
    if (timestamp1?.seconds) {
      const providedTimeInMilliseconds1 = timestamp1.seconds * 1000 + timestamp1.nanoseconds / 1e6;
      const options1 = { hour: '2-digit', minute: '2-digit', hour12: false };
      time1 = new Date(providedTimeInMilliseconds1).toLocaleTimeString('sv-SE', options1);
    } else {
      const options1 = { hour: '2-digit', minute: '2-digit', hour12: false };
      time1 = new Date(timestamp1).toLocaleTimeString('sv-SE', options1);
    }

    if (timestamp2?.seconds) {
      const providedTimeInMilliseconds2 = timestamp2.seconds * 1000 + timestamp2.nanoseconds / 1e6;
      const options2 = { hour: '2-digit', minute: '2-digit', hour12: false };
      time2 = new Date(providedTimeInMilliseconds2).toLocaleTimeString('sv-SE', options2);
    } else {
      const options2 = { hour: '2-digit', minute: '2-digit', hour12: false };
      time2 = new Date(timestamp2).toLocaleTimeString('sv-SE', options2);
    }

    const oneHourInMs = 60 * 60 * 1000; // Number of milliseconds in an hour
    const diffInMs = timestamp2?.seconds ? Math.abs((timestamp1.seconds * 1000) + (timestamp1.nanoseconds / 1e6) - (timestamp2.seconds * 1000) - (timestamp2.nanoseconds / 1e6)) : 3600000;
    const isOneHourApart = diffInMs >= oneHourInMs;

    return { time1, time2, isOneHourApart };
  };

  useEffect(() => {
    if (selectedChat?.id) {
      (async () => {
        await updateDoc(doc(db, 'Chats', selectedChat.id), {
          conversation: selectedChat.conversation?.map((data) => {
            if (data.senderId !== currentUser.id) {
              return {
                ...data,
                isSeen: true
              }
            }
            return data
          })
        })
      })()
    }
  }, [selectedChat, currentUser.id])

  useEffect(() => {
    if (users.length) {

      const myChats = allChats?.filter(v => v.senderId === currentUser.id || v.receiverId === currentUser.id)
      const uids = myChats.map(v => {
        if (v.senderId !== currentUser.id) {
          return v.senderId
        } else {
          return v.receiverId
        }
      })

      const noChatsWith = users.filter(v => !uids.includes(v.id))
      console.log({ noChatsWith })
    }
    // eslint-disable-next-line
  }, [users, allChats])

  return (
    <Container fluid style={{ paddingTop: 10 }}>
      <Row>
        {/* {isUser && <Col sm={3} md={3} lg={3} s>
          <ListGroup>
            {allChats.filter(v => v.receiverId === currentUser.id)?.map((chat) => {
              if (!users?.find(v => v.id === chat.senderId)) {
                return null
              }
              return <ListGroup.Item
                key={chat.id}
                variant='warning'
                active={selectedUser.id === chat.senderId}
                onClick={() => handleUserSelect(users?.find(v => v.id === chat.senderId))}
                style={{ display: 'flex', gap: '10px', position: 'relative' }}
              >
                <Image src={users?.find(v => v.id === chat.senderId)?.img} style={{ width: 24, height: 24 }} roundedCircle /> {users?.find(v => v.id === chat.senderId)?.username}

                {!!allChats.filter(v => v.receiverId === currentUser.id && v.conversation.find(val => !val.isSeen && val.senderId !== currentUser.id))?.length && <span style={{
                  width: 10,
                  height: 10,
                  backgroundColor: '#664d03',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 5,
                  right: 5,
                }} />}
              </ListGroup.Item>
            }
            )}
          </ListGroup>
        </Col>} */}
        {/* {isUser && !allChats.filter(v => v.receiverId === currentUser.id)?.length && <p style={{ textAlign: 'center' }}>Inget meddelande från admin</p>} */}
        <Col sm={3} md={3} lg={3} style={{maxHeight:"75vh", overflowY:"auto"}}>
          <h6 style={{ paddingTop: 10 }}>{isUser ? 'Välj en administratör' : 'Välj en användare'}</h6>
          <ListGroup>
            <ListGroup.Item>
              <Form.Control
                type="text"
                placeholder="Sök"
                value={searchText}
                onChange={handleSearchText}
              />
            </ListGroup.Item>
            {(isAdmin || isMod) && <ListGroup.Item
              variant='warning'
              active={selectedUser === 'all'}
              onClick={() => handleUserSelect('all')}
              style={{ display: 'flex', gap: '10px', position: 'relative', textAlign: 'center' }}
            >
              Alla
            </ListGroup.Item>}
            {(isAdmin || isMod) && <ListGroup.Item
              variant='warning'
              active={selectedUser === 'users'}
              onClick={() => handleUserSelect('users')}
              style={{ display: 'flex', gap: '10px', position: 'relative', textAlign: 'center' }}
            >
              Användare
            </ListGroup.Item>}
            {isAdmin && <ListGroup.Item
              variant='warning'
              active={selectedUser === 'mods'}
              onClick={() => handleUserSelect('mods')}
              style={{ display: 'flex', gap: '10px', position: 'relative', textAlign: 'center' }}
            >
              Moderators
            </ListGroup.Item>}
            {users?.filter(v => isUser ? (v.role === 1 || v.role === 2) : true)?.filter(v => v?.username?.toLowerCase()?.includes(searchText))?.map((user) => (
              <ListGroup.Item
                key={user.id}
                variant='warning'
                active={selectedUser.id === user.id}
                onClick={() => handleUserSelect(user)}
                style={{ display: 'flex', gap: '10px', position: 'relative' }}
              >
                <Image src={user?.img} style={{ width: 24, height: 24 }} roundedCircle /> {user.username}

                {!!allChats.filter(v => (v.receiverId === currentUser.id || v.senderId === currentUser.id) && !!v.conversation.filter(val => !val.isSeen && val.senderId !== currentUser.id && val.senderId === user.id)?.length)?.length && <span style={{
                  width: 10,
                  height: 10,
                  backgroundColor: '#664d03',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: 5,
                  right: 5,
                }} />}
              </ListGroup.Item>
            ))}
            {!users?.filter(v => v?.username?.toLowerCase()?.includes(searchText))?.length && <ListGroup.Item>
              <p>Användaren hittades inte!</p>
            </ListGroup.Item>}
          </ListGroup>
        </Col>
        <Col sm={9} md={9} lg={9}>
          {(isAdmin || isMod) && <h1 style={{ fontSize: 24 }}>{selectedUser?.id ? `Chatta med ${selectedUser.username}` : 'Välj en användare'}</h1>}
          <div style={{ height: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {selectedChat?.conversation?.map((message, index) => (
              <React.Fragment key={index}>
                {(getTimeString(message.time, selectedChat?.conversation?.[index + 1]?.time).isOneHourApart || index === 0) && <small style={{ textAlign: 'center', color: '#999', fontSize: '0.75rem' }}>
                  {getTimeString(message.time).time1}
                </small>}
                <div

                  style={{
                    backgroundColor: message.senderId === currentUser.id ? '#664d03' : '#f0f0f0',
                    color: message.senderId === currentUser.id ? '#ffffff' : '#000000',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    marginBottom: '5px',
                    alignSelf: message.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  <p style={{ margin: 0 }}>{message.text}</p>
                </div>
                {selectedChat?.conversation?.length - 1 === index && message.senderId === currentUser.id && message.isSeen && <small style={{ textAlign: 'right', color: '#999', fontSize: '0.75rem' }}>
                  Sett
                </small>}
              </React.Fragment>
            ))}
          </div>
          {(selectedUser === 'all' || selectedUser === 'users' || selectedUser === 'mods' || !!selectedUser?.id) && <Form onSubmit={(selectedUser === 'all' || selectedUser === 'users' || selectedUser === 'mods') ? e => { e?.preventDefault(); setShowConfirmation(true); } : handleSubmit} style={{ display: 'flex', gap: 5 }}>
            <Form.Group controlId="formBasicMessage" style={{ flex: 1 }}>
              <Form.Control
                type="text"
                placeholder="Skriv ditt meddelande här..."
                value={inputText}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Button variant="warning" type="submit" style={{ backgroundColor: '#664d03', color: "#fff" }}
              disabled={loading || inputText.trim() === ""}
            >
              Skicka
            </Button>
          </Form>}
        </Col>
      </Row>
      <ConfirmModal show={showConfirmation} onHide={_ => setShowConfirmation(false)} onConfirm={handleSubmit} loading={loading} selected={selectedUser} />
    </Container>
  );
}

export default ChatUI;