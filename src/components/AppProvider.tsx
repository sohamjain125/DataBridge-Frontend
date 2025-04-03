import type { ReactNode } from "react";
import { DEFAULT_THEME } from "../constants/default-theme";
import { useEffect } from "react";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  // Set the default theme
  useEffect(() => {
    document.documentElement.classList.add(DEFAULT_THEME);
  }, []);

  return <>{children}</>;
};