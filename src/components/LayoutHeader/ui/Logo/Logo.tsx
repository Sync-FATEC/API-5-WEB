import { FC } from "react";
import type { Logo } from "@/components/LayoutHeader/model/types";

const Logo: FC<Logo> = ({ logoName }: Logo) => {
  return (
    <div className="navbar-center">
      <a className="btn-ghost btn text-xl normal-case">{logoName}</a>
    </div>
  );
};

export default Logo;
