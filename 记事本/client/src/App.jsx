import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import NotebookPage from './pages/NotebookPage'
import SettingsPage from './pages/SettingsPage'
import ProjectManagementPage from './pages/ProjectManagementPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
            <Route path="/" element={<NotebookPage />} />
            <Route path="/projects" element={<ProjectManagementPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App