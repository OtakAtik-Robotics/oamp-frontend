import { createContext, useContext, useState, useCallback } from "react";

const AdminModeContext = createContext({
  adminMode: false,
  showPinDialog: false,
  setShowPinDialog: () => {},
  attemptActivate: () => false,
  deactivate: () => {},
});

export function AdminModeProvider({ children }) {
  const [adminMode, setAdminMode] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const attemptActivate = useCallback((pin) => {
    // Hardcoded PIN for local event — keep simple, no env needed
    if (pin === "7890") {
      setAdminMode(true);
      setShowPinDialog(false);
      return true;
    }
    return false;
  }, []);

  const deactivate = useCallback(() => {
    setAdminMode(false);
  }, []);

  return (
    <AdminModeContext.Provider
      value={{ adminMode, showPinDialog, setShowPinDialog, attemptActivate, deactivate }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  return useContext(AdminModeContext);
}
