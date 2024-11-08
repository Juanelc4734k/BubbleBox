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
            <Route path="/posts" element={<h1>Posts</h1>} />
            <Route path="/comments" element={<h1>Comments</h1>} />
            <Route path="/reports" element={<h1>Reports</h1>} />
            <Route path="/settings" element={<h1>Settings</h1>} />
            <Route path="/profile" element={<h1>Profile</h1>} />
            <Route path="/recover" element={<h1>Recover DB</h1>} />
        </Routes>
    </div>
  )
}

export default AdminDashboard