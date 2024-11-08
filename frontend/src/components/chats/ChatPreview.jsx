import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function ChatPreview({ friend }) {
  return (
    <Link to={`/chats/${friend.id}`} className="chat-preview">
      <div className="chat-info">
        <h3>{friend.name}</h3>
      </div>
    </Link>
  );
}

ChatPreview.propTypes = {
  friend: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChatPreview;
