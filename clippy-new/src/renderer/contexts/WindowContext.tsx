import { createContext, useContext, useState } from "react";

export type WindowContextType = {
  isChatWindowOpen?: boolean;
  setIsChatWindowOpen?: (isOpen: boolean) => void;
  currentWindow: Window;
};

export const WindowContext = createContext<WindowContextType>({
  currentWindow: window,
});

export const WindowProvider = ({ children }: { children: React.ReactNode }) => {
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

  return (
    <WindowContext.Provider
      value={{ isChatWindowOpen, setIsChatWindowOpen, currentWindow: window }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindow = () => {
  const context = useContext(WindowContext);
  if (context === undefined) {
    throw new Error("useWindow must be used within a WindowProvider");
  }
  return context;
};

export const useWindowContext = useWindow;
