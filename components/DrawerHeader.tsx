import { SiOpenaigym } from "react-icons/si";
import ThemeToggle from "./ThemeToggle";
const DrawerHeader = () => {
  return (
    <div className="flex justify-center  gap-4 px-6 ">
      <SiOpenaigym className="w-8 h-8 text-primary" />
      <h2 className="text-xl font-extrabold text-primary mr-auto">GPTGenius</h2>
      <ThemeToggle />
    </div>
  );
};

export default DrawerHeader;
