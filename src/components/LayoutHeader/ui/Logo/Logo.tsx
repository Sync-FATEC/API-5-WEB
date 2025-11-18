import { FC } from "react";
import type { Logo as LogoProps } from "@/components/LayoutHeader/model/types";

const Logo: FC<LogoProps> = ({ logoName }: LogoProps) => {
  return (
    <div className="navbar-center">
      <a className="btn-ghost btn text-xl normal-case">{logoName}</a>
    </div>
  );
};

export default Logo;
