import React from "react";
import { Button } from "react-bootstrap";

const PostCard = ({ post = {}, onButtonClick }) => {

  return (
    <div className="post-card w-100">
      {post.img && (
        <div
          className="post-image"
          style={{ backgroundImage: `url(${post.img})` }}
        ></div>
      )}
      <div className="post-content">
        <h6># {post.postId} 
        <span> <strong>- {post.title}</strong></span></h6>
      </div>
      <div>
        <Button className="btn btn-dark" size="sm" href={`/post/${post.postId}`}>
          Mer info
        </Button>
      </div>
    </div>
  );
};

export default PostCard;
