import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { Users } from './Users'
import HomeAdmin from './Home'

function AdminDashboard() {
  return (
    <div>
        <Routes>
            <Route path="/" element={<HomeAdmin />} />
            <Route path="/users" element={<Users />} />
            <Route path="/comunities" element={<h1>Comunidades</h1>} />
            <Route path="/chats" element={<h1>Chats</h1>} />
        </Routes>
    </div>
  )
}

export default AdminDashboard