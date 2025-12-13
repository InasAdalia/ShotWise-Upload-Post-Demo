import { Icon } from '@iconify/react'
import { useNavigate } from 'react-router-dom'

function Menu() {

    const navigate = useNavigate();


  return (
    <div className="absolute z-2 bottom-0 h-12 w-full bg-black flex flex-row justify-around items-center">
        <Icon 
            icon={'basil:search-solid'} height={'25'} 
            className='text-gray-100 hover:text-blue-800 cursor-pointer'
            onClick={()=>{navigate('/feed')}}
            />
        <Icon icon={'iconoir:camera'} height={'25'} className='text-gray-100 hover:text-blue-800 hover:text-blue-800' />
        <Icon 
            icon={'garden:plus-circle-fill-16'} height={'28'} className='text-gray-100 hover:text-blue-800 cursor-pointer'
            onClick={()=>{navigate('/upload')}}
            />
        <Icon icon={'solar:medal-ribbon-linear'} height={'25'} className='text-gray-100 hover:text-blue-800 ' />
        <Icon icon={'lsicon:user-outline'} height={'25'} className='text-gray-100 hover:text-blue-800 ' />
    </div>
  )
}

export default Menu