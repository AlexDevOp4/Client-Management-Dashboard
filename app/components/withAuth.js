"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";

const withAuth = (WrappedComponent, allowedRoles) => {
  return (props) => {
    const [cookies, setCookie, removeToken] = useCookies(["token", "role"]);
    const router = useRouter();

    useEffect(() => {
      const role = cookies.role;
      if (!role || !allowedRoles.includes(role)) {
        router.push("/");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
