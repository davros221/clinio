import { Outlet } from "react-router";
import classes from "./AppLayout.module.css";

export const AppLayout = () => {
  return (
    <div className={classes.background}>
      <Outlet />
    </div>
  );
};
