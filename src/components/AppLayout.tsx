import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Database,
  Home,
  Link,
  List,
  PanelLeft,
  Settings,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if a route is active
  const isActive = (path: string) => {
    // Special case for the home page
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    // For other pages, check if the pathname starts with the path
    // This handles cases like /MigrationDashboard?jobId=123
    return path !== "/" && location.pathname.startsWith(path);
  };

  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5 mr-2" /> },
    { path: "/ConnectionConfig", label: "Connections", icon: <Database className="h-5 w-5 mr-2" /> },
    { path: "/ApplicationSelector", label: "Applications", icon: <List className="h-5 w-5 mr-2" /> },
    { path: "/DatabaseSchemaViewer", label: "Schema", icon: <PanelLeft className="h-5 w-5 mr-2" /> },
    { path: "/MigrationExecution", label: "Execute", icon: <Link className="h-5 w-5 mr-2" /> },
    { path: "/MigrationDashboard", label: "Dashboard", icon: <Activity className="h-5 w-5 mr-2" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4 px-6 sticky top-0 z-10 bg-background">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div 
              className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center mr-2 cursor-pointer" 
              onClick={() => navigate("/")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
            </div>
            <span className="font-bold text-lg cursor-pointer" onClick={() => navigate("/")}>
              DataBridge Pro
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className={isActive(item.path) ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </nav>
          
          {/* Mobile navigation - show just the current page and a settings button */}
          <div className="flex md:hidden items-center space-x-1">
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile navigation bar - show at bottom of screen on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border py-2 px-4 bg-background z-20">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center px-1 py-2 ${isActive(item.path) ? "text-blue-600" : ""}`}
            >
              {React.cloneElement(item.icon, { className: "h-5 w-5 mb-1 mr-0" })}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
