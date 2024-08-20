import React from 'react'

function Friend({ friend }) {
  return (
    <div className='friend'>
      <div className='friend-info'>
        {friend.avatar_usuario2 && (
          <img src={friend.avatar_usuario2} alt={friend.nombre_usuario2 || 'Amigo'} />
        )}
        <p>{friend.nombre_usuario2 || 'Amigo'}</p>
      </div>
    </div>
  )
}

export default Friend;