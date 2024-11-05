import React, { useState, useEffect, forwardRef, useCallback } from 'react';
import { InputProps } from '../../@/components/ui/input';
import { createPortal } from 'react-dom';


export interface InputPropsMy
  extends React.InputHTMLAttributes<HTMLInputElement> {
  isPending: boolean,
  onBlur: (text: any) => void


}

const MyInput = forwardRef<HTMLInputElement, InputPropsMy>(({ value, type, id, isPending, className, onBlur, ...props }, ref) => {
  const [text, setText] = useState(value);
  const [initialValue, setInitialValue] = useState(value);




  const handleBlur = () => {
    if (text !== initialValue) {
      setText(value)
      onBlur(text); // Trigger update only if text has changed
    }
  };





  return (
    <form className=''>

      <input
        ref={ref}
        id={id}
        type={type}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        {...props}
        className={className}
      />
    </form>
  );
});

export default MyInput;