import React from 'react';
import { Link } from 'react-router-dom';



export default function SideNavBar(){
    
    return (
        <div className='absolute shadow-2xl rounded-md left-4' data-openBar={false}>
           <ul className='flex flex-col px-0 py-1 '>
                <li>
                    <Link to='settings'></Link>
                </li>

                <li>
                  <Link to='favourites'></Link>
                </li>

                <li>
                  <Link to='dashboard'></Link>
                </li>
           </ul>
        
        </div>
    )
}