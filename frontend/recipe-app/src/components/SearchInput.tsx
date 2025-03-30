import React, { useState } from 'react'
import { FaSistrix } from 'react-icons/fa6';

interface Props{
    onTextEntered?: (text : string) => void;
}

const SearchInput = ({onTextEntered} : Props) => {
    const [isFocused, setIsFocused] = useState(false);
    const [inputText, setInputText] = useState("");

    const handleKeyDown = (e)=>{
        if (e.key === 'Enter'){
            setIsFocused(false);
            setInputText("")
            if(onTextEntered){
                onTextEntered(inputText)
                
            }
        }
    }
    
    return (
       <div className='flex justify-end items-center border rounded hover:cursor-pointer px-5' onClick={()=>setIsFocused(true)}>
            {/* {!isFocused && <FaSistrix className='mx-2'/> }             */}
            {/* <FaSistrix className='mx-2'/>  */}
            <input 
            className='py-1 border-none outline-none' 
            type="text" 
            placeholder={`ex: Caesar salad`} 
            value={inputText}
            onChange={(e)=>setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            /> 
        </div>
  )
}

export default SearchInput