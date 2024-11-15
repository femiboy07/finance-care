import React from 'react';
import './App.css';
import { Link } from 'react-router-dom';

function App() {

  return (
    <div className="flex flex-col w-full mx-auto my-0" id='landing'>
      <div className='banner w-full h-full pb-[4rem]'>
        <nav id='page-header' className='max-w-[960px] text-teal-400 font-bold w-[90%] mt-0  m-[40px_auto_0px] flex justify-between items-center  py-0 px-[1em]'>
          <div className='logo-container h-[150px] w-[250px] m-[0px_auto_15px] min-w-[250px] flex flex-col items-center relative '>
            <Link to={'/'}>

            </Link>
          </div>
          <div className='nav-link m-[1em]'>
            <div id='nav-container' className='flex items-center'>
              <div className='flex flex-col relative mx-[0.5em] '>
                <Link to={'/features'} className='mr-[1em] mb-[1em] border-b-[2px] border-b-solid border-solid p-[0.15em]'>
                  Dummy
                </Link>
              </div>
              <div className='flex flex-col relative mx-[0.5em] '>
                <Link to={'/features'} className='mr-[1em] mb-[1em] border-b-[2px] border-b-solid border-solid p-[0.15em]'>
                  Features
                </Link>
              </div>
              <div className='flex flex-col relative mx-[0.5em] '>
                <Link to={'/features'} className='mr-[1em] mb-[1em] border-b-[2px] border-b-solid border-solid p-[0.15em]'>
                  Features
                </Link>
              </div>
              <div className='flex flex-col relative mx-[0.5em] '>

              </div>
              <Link to={'/features'} className='mr-[1em] mb-[1em] relative bg-white border-teal-400 rounded-[4px] border -top-[2px]   border-solid p-[0.15em]'>
                logIn
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default App;
