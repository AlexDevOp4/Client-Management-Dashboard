"use client";

import {
  Disclosure,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import API from "../utils/api";
import { useEffect, useState, Fragment } from "react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";
import { useCookies } from "react-cookie";
import Cookies from "js-cookie";

const Navbar = () => {
  const [cookie, setCookie] = useCookies(["token", "role"]);
  const [userRole, setUserRole] = useState(null);
  const [clientId, setClientId] = useState(null);
  const hiddenRoutes = ["/", "/auth/register", "/auth/login"];

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUserData = async () => {
      if (!cookie.token || !pathname.startsWith("/dashboard")) return null;

      try {
        const { data } = await API.get("/auth/me");
        const user = data.user;

        if (!user) return;

        if (cookie.role === "client") {
          const { data: clientData } = await API.get(`/user/${user.id}`);
          setClientId(clientData.clientProfile.id);
        } else if (cookie.role === "trainer") {
          setClientId(user.id); // or setTrainerId if needed
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    getUserData();
    setUserRole(cookie.role || null);
  }, [cookie]);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout", {}, { withCredentials: true });
      Cookies.remove("token");
      Cookies.remove("role");
      router.push("/");
    } catch (error) {
      console.log("Error logging out", error);
    }
  };

  if (hiddenRoutes.includes(pathname)) return null;

  return (
    <Disclosure
      as="nav"
      className="bg-gradient-to-b from-gray-900 to-black shadow-lg border-b border-indigo-800"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center text-indigo-100">
              <div className="sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-indigo-400 hover:text-indigo-200 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500">
                  {open ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>

              <div className="flex-shrink-0 text-xl font-bold tracking-widest text-indigo-500">
                ASHTIANY FIT
              </div>

              <div className="hidden sm:flex sm:space-x-8">
                <NavLink
                  href={`/dashboard/${userRole}`}
                  label="Dashboard"
                  active={pathname === `/dashboard/${userRole}`}
                />
                {userRole === "trainer" && (
                  <>
                    <NavLink
                      href="/dashboard/trainer/clients"
                      label="Clients"
                      active={pathname.includes("/dashboard/trainer/clients")}
                    />
                    <NavLink
                      href="/dashboard/trainer/workouts/create"
                      label="Workouts"
                      active={pathname.includes(
                        "dashboard/trainer/workouts/create"
                      )}
                    />
                  </>
                )}
                {userRole === "client" && (
                  <>
                    <NavLink
                      href={`/dashboard/client/progress/${clientId}`}
                      label="Progress"
                      active={pathname.includes("/dashboard/client/progress")}
                    />
                  </>
                )}
              </div>

              <div className="flex items-center">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <BellIcon className="h-6 w-6 text-indigo-400 hover:text-white" />
                    </MenuButton>
                  </div>

                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 text-white shadow-lg ring-1 ring-indigo-800">
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={`block px-4 py-2 text-sm ${active ? "bg-indigo-700" : ""}`}
                        >
                          Your Profile
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`block px-4 py-2 text-sm ${active ? "bg-indigo-700" : ""}`}
                        >
                          Settings
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm ${active ? "bg-indigo-700" : ""}`}
                        >
                          Sign out
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden bg-gray-900 border-t border-indigo-800">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <DisclosureButton
                href={`/dashboard/${userRole}`}
                label="Dashboard"
                active={pathname === `/dashboard/${userRole}`}
              />
              {userRole === "trainer" && (
                <>
                  <DisclosureButton
                    href="/dashboard/trainer/clients"
                    label="Clients"
                    active={pathname.includes("/dashboard/trainer/clients")}
                  />
                  <DisclosureButton
                    href="dashboard/trainer/workouts/create"
                    label="Workouts"
                    active={pathname.includes(
                      "dashboard/trainer/workouts/create"
                    )}
                  />
                </>
              )}
              {userRole === "client" && (
                <>
                  <DisclosureButton
                    href={`/dashboard/client/progress/${clientId}`}
                    label="Progress"
                    active={pathname.includes("/dashboard/client/progress")}
                  />
                  <DisclosureButton
                    href="/dashboard/client/workouts"
                    label="My Workouts"
                    active={pathname.includes("/dashboard/client/workouts")}
                  />
                </>
              )}
              <DisclosureButton onClick={handleLogout} label="Logout" />
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

const NavLink = ({ href, label, active }) => (
  <a
    href={href}
    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-semibold tracking-wide uppercase ${
      active
        ? "border-indigo-500 text-indigo-300"
        : "border-transparent text-indigo-400 hover:border-indigo-300 hover:text-white"
    }`}
  >
    {label}
  </a>
);

const DisclosureButton = ({ href, label, onClick, active }) => (
  <Disclosure.Button
    as="a"
    href={href}
    onClick={onClick}
    className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
      active
        ? "border-indigo-500 bg-gray-800 text-white"
        : "border-transparent text-indigo-400 hover:border-indigo-600 hover:bg-gray-800 hover:text-white"
    }`}
  >
    {label}
  </Disclosure.Button>
);

export default Navbar;
