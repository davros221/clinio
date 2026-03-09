import { useEffect } from "react";

export const AppComponent = ({children, isAuth}: {children?: any, isAuth?: boolean}) => {

  if (!isAuth) {
    useEffect(() => {
      console.log("User not authenticated");
    }, []);
  }

  return (
    <div>
      {children}
    </div>
  )
}