import React, { useContext, useEffect, useState } from "react";
import { Col, Container, ListGroup, Row, Tab } from "react-bootstrap";
import { TabContent1, TabContent4, TabContent8 } from "../components/moderatorContent";
import { TabContent12, TabContent13 } from "../components/moderatorContent2";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import AdminChat from "../components/Chat/AdminChat"

const ModeratorPanel = () => {
  const { currentUser } = useContext(AuthContext);
  const [kretsar, setKretsar] = useState({ Krets1: "", Krets2: "" });
  const [Activities, setActivities] = useState({ Activityid1: null, Activityid2: null, Activityid3: null});

  const isModerator = currentUser && currentUser.role === 2;

  useEffect(() => {
    if (isModerator) {
      fetchKretsar(currentUser.id);
    } else {
      window.location.href = "/";
    }
  }, [currentUser, isModerator]);

  const fetchKretsar = async (userId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/moderators/krestar/${userId}`;
      const res = await axios.get(apiUrl);
      setKretsar(res.data);
      const apiUrl2 = `${process.env.REACT_APP_API_URL}/api/moderators/activities/${userId}`;
      const res2 = await axios.get(apiUrl2);
      setActivities(res2.data);
    } catch (err) {
      console.error("Error fetching moderator krestars:", err);
    }
  };

  const tabItems = [
    { id: "#link1", title: "INLÄGG" },
    { id: "#link2", title: kretsar.Krets1 || "Kretsar1", content: <TabContent1 kretsar={kretsar.Krets1} />, },
    { id: "#link3", title: kretsar.Krets2 || "Krets2 Ej specificerad", content: <TabContent1 kretsar={kretsar.Krets2} />, },
  ];

  const tabItems2 = [
    { id: "#link4", title: "Aktiviteter" },
    { id: "#link5", title: `Aktivitet1 # ${Activities.Activityid1 !== null ? Activities.Activityid1 : "Ej specificerad"}`, content: <TabContent4 activity={Activities.Activityid1} />, },
    { id: "#link6", title: `Aktivitet2 # ${Activities.Activityid2 !== null ? Activities.Activityid2 : "Ej specificerad"}`, content: <TabContent4 activity={Activities.Activityid2} />, },
    { id: "#link7", title: `Aktivitet3 # ${Activities.Activityid3 !== null ? Activities.Activityid3 : "Ej specificerad"}`, content: <TabContent4 activity={Activities.Activityid3} />, },
  ];

  const tabItems3 = [
    { id: "#link8", title: "Användarna" },
    { id: "#link9", title: "Alla användare", content: <TabContent8 /> },
  ];

  const tabItems4 = [
    { id: '#link10', title: 'Interaktion' },
    { id: '#link12', title: 'Användarkommentarer', content: <TabContent12 /> },
    { id: '#link13', title: 'Inläggets kommentarer', content: <TabContent13 /> },
    { id: '#link20', title: 'skicka meddelande', content: <AdminChat /> },
  ];

  // Define the array containing non-clickable link IDs
  const nonClickableLinks = ["#link1", "#link4", "#link8", "#link10"];

  return (
    <Container className="conLayout">
      <h1>Moderator Dashboard</h1>
      <Tab.Container id="list-group-tabs" defaultActiveKey="#link1">
        <Row className="rowClass">
          <Col className="col1Class" sm={3}>
            <ListGroup className="groupClass">
              {tabItems.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={`list-group-item list-group-item-success ${
                    nonClickableLinks.includes(item.id) ? "non-clickable" : ""
                  }`}
                  {...(nonClickableLinks.includes(item.id)
                    ? {}
                    : { action: true, href: item.id })}
                >
                  {item.title}
                </ListGroup.Item>
              ))}
              {tabItems2.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={`list-group-item list-group-item-secondary ${
                    nonClickableLinks.includes(item.id) ? "non-clickable" : ""
                  }`}
                  {...(nonClickableLinks.includes(item.id)
                    ? {}
                    : { action: true, href: item.id })}
                >
                  {item.title}
                </ListGroup.Item>
              ))}
              {tabItems3.map((item) => (
                <ListGroup.Item
                  key={item.id}
                  className={`list-group-item list-group-item-warning ${
                    nonClickableLinks.includes(item.id) ? "non-clickable" : ""
                  }`}
                  {...(nonClickableLinks.includes(item.id)
                    ? {}
                    : { action: true, href: item.id })}
                >
                  {item.title}
                </ListGroup.Item>
              ))}
              {tabItems4.map(item => (
                <ListGroup.Item 
                key={item.id} 
                className={`list-group-item list-group-item-success ${nonClickableLinks.includes(item.id) ? "non-clickable" : ""}`}
                {...(nonClickableLinks.includes(item.id) ? {} : { action: true, href: item.id })}
                >
                  {item.title}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
          <Col className="col2Class" sm={9}>
            <Tab.Content>
              {tabItems.map((item) => (
                <Tab.Pane key={item.id} eventKey={item.id}>
                  {item.content}
                </Tab.Pane>
              ))}
              {tabItems2.map((item) => (
                <Tab.Pane key={item.id} eventKey={item.id}>
                  {item.content}
                </Tab.Pane>
              ))}
              {tabItems3.map((item) => (
                <Tab.Pane key={item.id} eventKey={item.id}>
                  {item.content}
                </Tab.Pane>
              ))}
              {tabItems4.map(item => (
                <Tab.Pane key={item.id} eventKey={item.id}>
                  {item.content}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ModeratorPanel;
