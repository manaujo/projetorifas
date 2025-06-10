import React from "react";
import {
  Plus,
  Megaphone,
  Ticket,
  Users,
  Settings,
  LogOut,
  Home,
  Gift
} from "lucide-react";

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "" }) => {
  const icons: Record<string, React.ReactNode> = {
    plus: <Plus className={className} />,
    megaphone: <Megaphone className={className} />,
    ticket: <Ticket className={className} />,
    users: <Users className={className} />,
    settings: <Settings className={className} />,
    logout: <LogOut className={className} />,
    home: <Home className={className} />,
    gift: <Gift className={className} />,
    campaign: <Megaphone className={className} />
  };

  return <>{icons[name] || null}</>;
};
