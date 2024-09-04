import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Users } from './Users'

function AdminDashboard() {
  return (
    <div>
        <h1>Panel de Control</h1>
        <Routes>
            <Route path="/" element={<h1>Inicio</h1>} />
            <Route path="/users" element={<Users />} />
            <Route path="/comunities" element={<h1>Comunidades</h1>} />
            <Route path="/chats" element={<h1>Chats</h1>} />
        </Routes>
    </div>
  )
}

export default AdminDashboard