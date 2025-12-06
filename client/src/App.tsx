import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'
import PostLayout from './components/PostLayout'

function App() {
  const [res, setRes] = useState<string[]|''>('')

  const fetchAPI = async () => {
    try {
      //this is normal fetch method
      // const response : any = await fetch('http://localhost:8080/')
      // const text = response.text()
      // console.log(text)
      // setRes(text)

      //this is axios method
      // const response = await axios.get('http://localhost:8080/api')
      // const data = response.data

      //this is axios and external api
      console.log('test')
      const url = 'https://againstlab.com/products.json?limit=10'
      const response = await axios.get(url)
      const data = response.data
      console.log(data)
      setRes(data.products)
    } catch (error) {
      
    }
  }

  useEffect(()=>{
    fetchAPI()
  }, [])

  return (
    <div className="w-[375px] min-h-[95vh] mx-auto bg-white shadow-xl rounded-xl overflow-y-auto scrollbar-hide">
      <h3 className="text-3xl font-bold text-blue-500">
        Tailwind v4 works
      </h3>

      <PostLayout />

    {/* your API results later */}
  </div>
  )
}

export default App
