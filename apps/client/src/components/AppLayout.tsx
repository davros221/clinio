import { Outlet } from "react-router";
import classes from "./AppLayout.module.css";
import { useRefreshUser } from "../hooks/useRefreshUser.ts";

export const AppLayout = () => {
  useRefreshUser();

  return (
    <div className={classes.background}>
      <Outlet />
    </div>
  );
};
