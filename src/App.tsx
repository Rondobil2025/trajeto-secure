import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PortalHome from "./pages/PortalHome";
import NovaBlitz from "./pages/NovaBlitz";
import ConsultarBlitz from "./pages/ConsultarBlitz";
import Pendencias from "./pages/Pendencias";
import PlanosAcao from "./pages/PlanosAcao";
import AdminDashboard from "./pages/AdminDashboard";
import AdminColaboradores from "./pages/AdminColaboradores";
import AdminLiderancas from "./pages/AdminLiderancas";
import AdminAuditoria from "./pages/AdminAuditoria";
import AdminInventario from "./pages/AdminInventario";
import AdminBlitz from "./pages/AdminBlitz";
import AdminPlanosAcao from "./pages/AdminPlanosAcao";
import AdminTermos from "./pages/AdminTermos";
import AdminImportar from "./pages/AdminImportar";
import AdminRelatorios from "./pages/AdminRelatorios";
import AdminConfiguracoes from "./pages/AdminConfiguracoes";
import AdminChecklist from "./pages/AdminChecklist";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Portal Liderança (mobile) */}
          <Route path="/portal" element={<PortalHome />} />
          <Route path="/portal/nova-blitz" element={<NovaBlitz />} />
          <Route path="/portal/consultar" element={<ConsultarBlitz />} />
          <Route path="/portal/pendencias" element={<Pendencias />} />
          <Route path="/portal/planos" element={<PlanosAcao />} />
          {/* Admin (web) */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/colaboradores" element={<AdminColaboradores />} />
          <Route path="/admin/inventario" element={<AdminInventario />} />
          <Route path="/admin/liderancas" element={<AdminLiderancas />} />
          <Route path="/admin/blitz" element={<AdminBlitz />} />
          <Route path="/admin/planos" element={<AdminPlanosAcao />} />
          <Route path="/admin/termos" element={<AdminTermos />} />
          <Route path="/admin/importar" element={<AdminImportar />} />
          <Route path="/admin/auditoria" element={<AdminAuditoria />} />
          <Route path="/admin/relatorios" element={<AdminRelatorios />} />
          <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
