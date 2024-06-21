import React, { useContext, useState } from "react";
import Avatar from "react-avatar-edit";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

import instance from "../axios";
import { AuthContext } from "../context/authContext";

const UserAvatar = ({ profileImg, onAvatarUpdate }) => {
  const [imgUrl, setImgUrl] = useState(profileImg);
  const [ImageFile, setImageFile] = useState(null);
  const { currentUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);

  const [show, setShow] = useState(false);

  const onCrop = async (ImgDataUrl) => {
    setImageFile(await dataUrlToFile(ImgDataUrl, "profilePic"));
  };

  const handleClose = async () => {
    if (!ImageFile) return;

    const apiUrl = `/api/users/update-profile-pic`;

    const formData = new FormData();
    formData.append("profilePic", ImageFile);
    formData.append("userInfo", JSON.stringify(currentUser));
    setLoading(true);

    try {
      const response = await instance.put(apiUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      localStorage.setItem("user",JSON.stringify({...currentUser,img:response?.data?.data || currentUser.img}))
      setImgUrl(response.data.data);

      onAvatarUpdate(imgUrl);

      setShow(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    setLoading(false);
  };

  async function dataUrlToFile(dataUrl, fileName) {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: "image/png" });
  }

  return (
    <>
      <div
        className="user-avi"
        role="button"
        onClick={() => setShow(true)}
        style={{ backgroundImage: `url(${imgUrl || ""})` }}
      ></div>

      <Modal show={show} keyboard={false}>
        <Modal.Body>
          <Avatar
            label="Välj en ny profilbild"
            width={460}
            height={300}
            onCrop={onCrop}
            onClose={() => setImageFile(null)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={loading}
            onClick={() => {
              setImageFile(null);
              setShow(false);
            }}
          >
            Stänga
          </Button>
          <Button
            variant="primary"
            onClick={handleClose}
            disabled={ImageFile == null || loading}
          >
            Spara ändringar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserAvatar;