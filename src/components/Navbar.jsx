"use client";

import { GithubIcon, LinkedinIcon, TwitterIcon } from "lucide-react";

const Navbar = () => {
  const socialLinks = [
    {
      name: "Twitter",
      link: "https://x.com/rdmondal100",
      icon: <TwitterIcon className="h-5 w-5" />,
      color: "hover:text-sky-500",
    },
    {
      name: "LinkedIn",
      link: "https://www.linkedin.com/in/ridaymondal100/",
      icon: <LinkedinIcon className="h-5 w-5" />,
      color: "hover:text-blue-600",
    },
    {
      name: "Github",
      link: "https://github.com/rdmondal100",
      icon: <GithubIcon className="h-5 w-5" />,
      color: "hover:text-gray-700",
    },
  ];

  return (
    <nav className="flex w-full container mx-auto items-center justify-between px-6 py-3 border-b shadow-sm bg-background/80 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center cursor-pointer select-none">
        <div className="flex items-center border-2 border-dashed border-primary rounded-sm gap-1 text-xl md:text-2xl font-bold">
          <span className="bg-primary text-white px-2 py-1  shadow-sm">
            GenAi
          </span>
          <span className="text-foreground pr-1">Tokenizer</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex gap-3">
        {socialLinks.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-md border px-3 py-1 text-sm font-medium transition-all duration-200 hover:shadow-md ${item.color}`}
          >
            {item.icon}
            <span className="hidden md:inline">{item.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
