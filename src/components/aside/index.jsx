import { NavLink } from "react-router-dom";
import { FaMapLocationDot } from "react-icons/fa6";
import { GrAnnounce } from "react-icons/gr";
import { MdOutlinePercent } from "react-icons/md";
import { PiMapPinSimpleAreaBold } from "react-icons/pi";
import { BiCategory } from "react-icons/bi";
import { MdOutlineWorkHistory } from "react-icons/md";
import { RiAdvertisementLine } from "react-icons/ri";
import { PiUsersThreeDuotone } from "react-icons/pi";
import { SlBriefcase } from "react-icons/sl";

import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

export default function Aside({ open }) {
  const menuItems = [
    {
      path: "/region",
      label: "Viloyatlar",
      icon: <FaMapLocationDot size={20} />,
    },
    {
      path: "/areas",
      label: "Tumanlar",
      icon: <PiMapPinSimpleAreaBold size={20} />,
    },
    {
      path: "/categories",
      label: "Kategoriyalar",
      icon: <BiCategory size={20} />,
    },
    // {
    //   path: "/inner-categories",
    //   label: "Ichki kategoriyalar",
    //   icon: <MdOutlineCategory size={20} />,
    // },
    {
      path: "/announcement",
      label: "Elon turlari",
      icon: <GrAnnounce size={20} />,
    },
    {
      path: "/job-types",
      label: "Ishlash turi",
      icon: <MdOutlineWorkHistory size={20} />,
    },
    {
      path: "/users",
      label: "Foydalanuvchilar",
      icon: <PiUsersThreeDuotone size={20} />,
    },
    {
      path: "/ann-filters",
      label: "E'lonlar",
      icon: <SlBriefcase size={20} />,
    },
    // {
    //   path: "/ann-discount",
    //   label: "Chegirmalar",
    //   icon: <MdOutlinePercent size={20} />,
    // },

    {
      path: "/advertisement",
      label: "Reklamalar",
      icon: <RiAdvertisementLine size={20} />,
    },
  ];

  return (
    <aside
      className={`fixed top-[70px] z-[10] bg-white border-r border-gray-200 h-screen transition-all duration-300 ${
        open ? "w-[64px]" : "w-[240px]"
      }`}
    >
      <div className="pt-5 relative z-45">
        <ul className="flex flex-col gap-1 max-h-[85vh] overflow-y-auto px-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                data-tooltip-id={open ? `tooltip-${item.path}` : undefined}
                data-tooltip-content={open ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2 py-2 rounded-xl transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-blue-100 hover:text-blue-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isActive
                          ? "bg-white text-blue-600"
                          : "text-blue-500 bg-blue-100 group-hover:bg-white group-hover:text-blue-600"
                      } ${open ? "mx-auto" : ""}`}
                    >
                      {item.icon}
                    </div>
                    {!open && (
                      <p className="font-bold text-sm whitespace-nowrap">
                        {item.label}
                      </p>
                    )}
                  </>
                )}
              </NavLink>

              {open && <Tooltip className="z-[50]" id={`tooltip-${item.path}`} place="right" />}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
