import React from 'react'
import { FaHeart, FaCalendarDays, FaGear, FaSistrix } from 'react-icons/fa6'
import { IoPerson } from 'react-icons/io5'
import SearchInput from './SearchInput'

const Navbar = () => {
  return (
    // slate, gray, zinc, neutral, stone
    //bg-slate-800
    <div className='bg-slate-800 text-gray-50/50 px-20 shadow-sm'>
        <div className='flex justify-evenly items-center py-3'>
   
            <h3 className='font-bold text-pink-400/80'>recipe.io</h3>
   
            <div className='flex flex-1 justify-end items-center px-5'>
                <SearchInput />
            </div>            
            
            <ul className='flex'>
                <li className='mx-2'><FaCalendarDays className='w-5 h-5 hover:cursor-pointer' /></li>
                <li className='mx-2'><IoPerson className='w-5 h-5 hover:cursor-pointer' /></li>
                <li className='mx-2'><FaHeart className='w-5 h-5 hover:cursor-pointer' /></li>
                <li className='mx-2'><FaGear className='w-5 h-5 hover:cursor-pointer' /></li>
            </ul>
 
            
        </div>
    </div>
  )
}

export default Navbar