import { useEffect, useState } from "react";

export const AppComponent = ({children, isAuth}: {children?: any, isAuth?: boolean}) => {

  const [counter] = useState(0);

  if (!isAuth) {
    useEffect(() => {
      console.log("User not authenticated");
    }, []);
  }

  const handleClick = () => {
    counter = counter + 1;
  }

  return (
    <div>
      {counter}
      <button onClick={handleClick}>Increment</button>
      {children}
    </div>
  )
}