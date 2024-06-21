import React from 'react';
import Logo from "../img/JaktHarryLogo.png";

const Footer = () => {
  const designerNameStyle = {
    color: 'gold',
    position: 'relative',
    textDecoration: 'none',
    marginLeft: '5px',
  };

  const hoverTextStyle = {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'black',
    color: 'white',
    padding: '5px',
    borderRadius: '5px',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    visibility: 'hidden',
    opacity: 0,
    transition: 'opacity 0.2s',
    zIndex: 1,
  };

  const showHoverText = (e) => {
    const hoverText = e.target.querySelector('span');
    if (hoverText) {
      hoverText.style.visibility = 'visible';
      hoverText.style.opacity = 1;
    }
  };

  const hideHoverText = (e) => {
    const hoverText = e.target.querySelector('span');
    if (hoverText) {
      hoverText.style.visibility = 'hidden';
      hoverText.style.opacity = 0;
    }
  };

  const paragraphStyle = {
    display: 'inline-block',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    marginLeft: '20px',
  };

  return (
    <footer>
      <div>
      <img src={Logo} alt="Logo" /></div>
      <div>
        Copyright © 2024, <b>JaktHarry</b>.
        <span style={paragraphStyle}>
          Made and designed by
          <a
            href="mailto:areej_sammour@hotmail.com"
            style={designerNameStyle}
            onMouseEnter={showHoverText}
            onMouseLeave={hideHoverText}
          >
            {' '}Areej
            <span style={hoverTextStyle}>
              Send Areej email.
            </span>
          </a>
          {' '}and
          <a
            href="mailto:maxibahrami@gmail.com"
            style={designerNameStyle}
            onMouseEnter={showHoverText}
            onMouseLeave={hideHoverText}
          >
            {' '}Maximilian
            <span style={hoverTextStyle}>
              Send Maximilian email.
            </span>
          </a>.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
