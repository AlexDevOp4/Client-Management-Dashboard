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

  const getUserData = async () => {
    try {
      const userData = await API.get("/auth/me");
      const clientData = await API.get(`/user/${userData.data.user.id}`);
      setClientId(clientData.data.clientProfile.id);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
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

  if (hiddenRoutes.includes(pathname)) return null; // Hide navbar on auth pages

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Mobile Menu Button */}
              <div className="sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500">
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>

              {/* Logo */}
              <div className="flex-shrink-0"></div>

              {/* Desktop Menu */}
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
                    <NavLink
                      href="/dashboard/client/workouts"
                      label="My Workouts"
                      active={pathname.includes("/dashboard/client/workouts")}
                    />
                  </>
                )}
              </div>

              {/* Notifications & Profile Menu */}
              <div className="flex items-center">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <BellIcon className="h-6 w-6" />
                    </MenuButton>
                  </div>

                  <MenuItems
                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-none 
          data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 
          data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}
                        >
                          Your Profile
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`block px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}
                        >
                          Settings
                        </a>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`block w-full text-left px-4 py-2 text-sm text-gray-700 ${active ? "bg-gray-100" : ""}`}
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

          {/* Mobile Menu */}
          <DisclosurePanel className="sm:hidden">
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
                    href="/client/progress"
                    label="Progress"
                    active={pathname.includes("/client/progress")}
                  />
                  <DisclosureButton
                    href="/client/workouts"
                    label="My Workouts"
                    active={pathname.includes("/client/workouts")}
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

/**  Reusable Desktop Nav Link **/
const NavLink = ({ href, label, active }) => (
  <a
    href={href}
    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
      active
        ? "border-indigo-500 text-gray-900"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
    }`}
  >
    {label}
  </a>
);

/**  Reusable Mobile Nav Button **/
const DisclosureButton = ({ href, label, onClick, active }) => (
  <Disclosure.Button
    as="a"
    href={href}
    onClick={onClick}
    className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
      active
        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
        : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
    }`}
  >
    {label}
  </Disclosure.Button>
);

export default Navbar;
