import React , { useContext }from "react";
import { Col, Container, ListGroup, Row, Tab } from "react-bootstrap";
import { TabContent3, TabContent4, TabContent2, TabContent10,
  TabContent5} from "../components/adminContent.js";
import { TabContent7, TabContent8, TabContent9,
    TabContent12} from "../components/adminContent2.js";
import { TabContent13 } from "../components/adminContent3.js";  
import { TabContent14 } from "../components/adminContent4.js";  
import { TabContent18, TabContent19  } from "../components/adminContent5.js";
import AdminChat from "../components/Chat/AdminChat"
import { AuthContext } from "../context/authContext";  


const Panel = () => {
  const { currentUser } = useContext(AuthContext); // Get the current user from the context

  // Check if the current user is an admin
  const isAdmin = currentUser && currentUser.role === 1;

  // If the user is not an admin, redirect them to the home page
  if (!isAdmin) {
    window.location.href = "/";
    return null;
  }

// Define the array containing tab items
const tabItems = [
  { id: '#link1', title: 'INLÄGG' },
  { id: '#link3', title: 'Riks', content: <TabContent3 /> },
  { id: '#link4', title: 'Läns', content: <TabContent4 /> },
  { id: '#link2', title: 'JAQT', content: <TabContent2 /> },
  { id: '#link10', title: 'Öppen', content: <TabContent10 /> },
  { id: '#link5', title: 'Kretsar', content: <TabContent5 /> },
];

const tabItems2 = [
  { id: '#link6', title: 'AKTIVITETER' },
  { id: '#link7', title: 'Alla', content: <TabContent7 /> },
  { id: '#link8', title: 'Användaraktiviteter', content: <TabContent8 /> },
  { id: '#link9', title: 'ِAktivitetsdeltagare', content: <TabContent9 /> },
];

const tabItems3 = [
  { id: '#link11', title: 'Användarna' },
  { id: '#link12', title: 'Set Användarnas roller', content: <TabContent12 /> },
  { id: '#link13', title: 'Set Moderator Kretsar', content: <TabContent13 /> },
  { id: '#link14', title: 'Set moderator Aktiviteter', content: <TabContent14 /> },
];

const tabItems4 = [
  { id: '#link15', title: 'Interaktion' },
  { id: '#link18', title: 'Användarkommentarer', content: <TabContent18 /> },
  { id: '#link19', title: 'Inläggets kommentarer', content: <TabContent19 /> },
  { id: '#link20', title: 'skicka meddelande', content: <AdminChat /> },
];

// Define the array containing non-clickable link IDs
const nonClickableLinks = ['#link1', '#link6', '#link11', '#link15'];

  return (
    <Container className="conLayout">
      <h1>Admin Dashboard</h1>
      <Tab.Container id="list-group-tabs" defaultActiveKey="#link1">
        <Row className="rowClass">
          <Col className="col1Class" sm={3}>
            <ListGroup className="groupClass">
              {tabItems.map(item => (
                <ListGroup.Item 
                key={item.id} 
                className={`list-group-item list-group-item-success ${nonClickableLinks.includes(item.id) ? "non-clickable" : ""}`}
                {...(nonClickableLinks.includes(item.id) ? {} : { action: true, href: item.id })}
                >
                  {item.title}
                </ListGroup.Item>
              ))}
              {tabItems2.map(item => (
                <ListGroup.Item 
                key={item.id} 
                className={`list-group-item list-group-item-secondary ${nonClickableLinks.includes(item.id) ? "non-clickable" : ""}`}
                {...(nonClickableLinks.includes(item.id) ? {} : { action: true, href: item.id })}
                >
                  {item.title}
                </ListGroup.Item>
              ))}
              {tabItems3.map(item => (
                <ListGroup.Item 
                key={item.id} 
                className={`list-group-item list-group-item-warning ${nonClickableLinks.includes(item.id) ? "non-clickable" : ""}`}
                {...(nonClickableLinks.includes(item.id) ? {} : { action: true, href: item.id })}
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
              {tabItems.map(item => (
                <Tab.Pane key={item.id} eventKey={item.id}>
                  {item.content}
                </Tab.Pane>
              ))}
              {tabItems2.map(item => (
                <Tab.Pane key={item.id} eventKey={item.id}>
                  {item.content}
                </Tab.Pane>
              ))}
              {tabItems3.map(item => (
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

export default Panel;