import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Register } from "@/pages/Register";
import { Analytics } from "@/pages/Analytics";
import { Export } from "@/pages/Export";
import { Participants } from "@/pages/Participants";
import { Competitif } from "@/pages/Competitif";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
    },
  },
});

function App() {
  return (
<<<<<<< Updated upstream
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/register" element={<Register />} />
            <Route path="/analytics/:uid" element={<Analytics />} />
            <Route path="/export" element={<Export />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
=======
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/participants" element={<Participants />} />
              <Route path="/register" element={<Register />} />
              <Route path="/paywall/:uid" element={<Paywall />} />
              <Route path="/analytics/:uid" element={<Analytics />} />
              <Route path="/export" element={<Export />} />
              <Route path="/competitif" element={<Competitif />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
>>>>>>> Stashed changes
  );
}

export default App;
