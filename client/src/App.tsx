import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import PostLayout from './components/PostLayout'
import { Icon } from '@iconify/react'

function App() {
  const [res, setRes] = useState<string[]|''>('')


  return (
    <div className="w-[375px] min-h-[95vh] mx-auto bg-white shadow-xl rounded-xl overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="w-full p-2 border-b border-gray-200 flex items-center ">
        <Icon icon="mdi:chevron-left" height="25" width="25" className="text-gray-900" />
        <h6 className="text-xl text-blue-900 justify-center flex-grow font-semibold">
          Share post
        </h6>
      </div>

      <PostLayout />

    {/* your API results later */}
  </div>
  )
}

export default App
