import Link from "next/link";
import { FaGithub } from "react-icons/fa6";

const Header = () => {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-light font-serif p-2">PDF Editor</h1>
      <Link
        className="hover:ring-1 ease-in transition-all duration-300 rounded-full p-2"
        href={"https://github.com/ParasParashar/xinterview-assignment/"}
        target="_blank"
      >
        <FaGithub size={25} />
      </Link>
    </header>
  );
};

export default Header;
