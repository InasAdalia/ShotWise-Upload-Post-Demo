import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import PostLayout from './components/PostLayout'
import { Icon } from '@iconify/react'

function App() {
  const [res, setRes] = useState<string[]|''>('')


  return (
    <div className="phone-wrapper relative w-[375px] min-h-[95vh] h-[95vh] mx-auto overflow-y-auto scrollbar-hide rounded-[20px]">
      <div className="absolute inset-0 bg-white -z-5 w-100 h-[100vh] " />
      
      <PostLayout />

    {/* your API results later */}
  </div>
  )
}

export default App
