import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Lock, 
  Unlock, 
  History, 
  ShieldAlert, 
  Info 
} from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/encrypt', label: 'Encrypt', icon: Lock },
    { to: '/decrypt', label: 'Decrypt', icon: Unlock },
    { to: '/history', label: 'History', icon: History },
    { to: '/security', label: 'Security', icon: ShieldAlert },
    { to: '/about', label: 'About', icon: Info }
  ];

  return (
    <nav className="bottom-nav-bar" aria-label="Bottom Navigation">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="bottom-nav-icon-wrapper">
                  <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <div className="bottom-nav-active-indicator" />}
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

