import React, { ReactElement, forwardRef } from 'react';
import { matchPath, NavLink, useLocation } from 'react-router-dom';

interface CustomNavProps extends React.HTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactElement;
  exact?: boolean;
  title: string;
}

const CustomNavLinks = forwardRef<HTMLAnchorElement, CustomNavProps>(
  ({ to, children, exact = true, title, ...props }, ref) => {
    const location = useLocation();
    const currentURL = `${location.pathname}${location.search}`;
    console.log(currentURL, 'sidebar currenturl');

    // Determine if the current location matches the path
    const match = matchPath(currentURL, to || 'transactions');
    const isActive = !!match;

    const cloneWithProps = (child: React.ReactNode): React.ReactNode => {
      if (React.isValidElement(child)) {
        const props = {
          className: isActive
            ? `${child.type === 'svg' ? 'mr-[24px]' : 'mr-[24px]'}`
            : 'mr-[24px]',
          children: React.Children.map(child.props.children, cloneWithProps),
        };
        return React.cloneElement(child, props);
      }
      return child;
    };

    return (
      <NavLink
        ref={ref}
        to={to}
        title={title}
        end={exact}
        className={`min-h-[40px] text-[1rem] px-3 py-2 hover:bg-orange-200 rounded-md cursor-pointer flex items-center w-full justify-start ${isActive ? 'bg-orange-300 text-orange-600' : ''
          }`}
        {...props}
      >
        {React.Children.map(children, cloneWithProps)}
      </NavLink>
    );
  }
);

CustomNavLinks.displayName = 'CustomNavLinks';

export default CustomNavLinks;