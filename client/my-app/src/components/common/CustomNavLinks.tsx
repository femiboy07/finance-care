import React, { ReactElement } from 'react';
import { matchPath, NavLink, NavLinkProps, useLocation } from 'react-router-dom';


interface CustomNavProps {
    to:string;
    children:ReactElement;
    exact?:boolean;
    title:string;
    
}


const CustomNavLinks:React.FC<CustomNavProps>=({to,children,exact=false,title})=>{

    const location = useLocation();
    const currentURL = location.pathname + location.search;
    // Determine if the current location matches the path
    const isActive = !!matchPath(currentURL ,to || 'transactions/*');
   

    const cloneWithProps = (child: React.ReactNode): React.ReactNode => {
        if (React.isValidElement(child)) {
          const props = {
            className: isActive ? `  ${child.type === 'svg' ? 'mr-[24px]' : 'mr-[24px]'}` : 'mr-[24px]',
            fill: child.type === 'svg' ? (isActive ? '' : 'white') : undefined,
            
            children: React.Children.map(child.props.children, cloneWithProps),
          };
          return React.cloneElement(child, props);
        }
        return child;
      };
    return(
        <NavLink to={to}  title={title}  className={`min-h-[40px]  px-3  py-2  cursor-pointer flex items-center w-full justify-start  ${isActive ? 'bg-orange-300 text-orange-600  ':" "} `} >
          {React.Children.map(children,cloneWithProps)}
        </NavLink>
    )
}

export default CustomNavLinks;