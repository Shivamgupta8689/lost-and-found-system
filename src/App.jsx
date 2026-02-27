import { Routes, Route } from 'react-router-dom'
import Navbar from './components/common/Navbar.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import BrowseItems from './pages/BrowseItems.jsx'
import ItemDetail from './pages/ItemDetail.jsx'
import PostItem from './pages/PostItem.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MyChats from './pages/MyChats.jsx'
import ChatPage from './pages/ChatPage.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/browse"
            element={
              <ProtectedRoute>
                <BrowseItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:id"
            element={
              <ProtectedRoute>
                <ItemDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-item"
            element={
              <ProtectedRoute>
                <PostItem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <MyChats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats/:chatId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}
