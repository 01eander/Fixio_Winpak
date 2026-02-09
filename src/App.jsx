import { Route, Switch, Router } from 'wouter';
import { useHashLocation } from './hooks/useHashLocation';
import { StoreProvider } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Interventions from './pages/Interventions';
import Catalogs from './pages/Catalogs';
import Mechanics from './pages/Mechanics';
import Areas from './pages/Areas';
import Equipment from './pages/Equipment';
import Warehouses from './pages/Warehouses';
import Jobs from './pages/Jobs';
import Bitacoras from './pages/Bitacoras';
import BitacoraConversion from './pages/BitacoraConversion';
import BitacoraDiecut from './pages/BitacoraDiecut';
import InventoryAudit from './pages/InventoryAudit';
import Departments from './pages/Departments';
import Roles from './pages/Roles';
import AssetCategories from './pages/AssetCategories';
import InventoryCategories from './pages/InventoryCategories';

function App() {
  return (
    <StoreProvider>
      <Router hook={useHashLocation}>
        <Layout>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/bitacoras" component={Bitacoras} />
            <Route path="/bitacoras/conversion" component={BitacoraConversion} />
            <Route path="/bitacoras/diecut" component={BitacoraDiecut} />
            <Route path="/catalogs" component={Catalogs} />
            <Route path="/catalogs/areas" component={Areas} />
            <Route path="/catalogs/mecanicos" component={Mechanics} />
            <Route path="/catalogs/departments" component={Departments} />
            <Route path="/catalogs/roles" component={Roles} />
            <Route path="/catalogs/equipos" component={Equipment} />
            <Route path="/catalogs/asset-categories" component={AssetCategories} />
            <Route path="/catalogs/almacenes" component={Warehouses} />
            <Route path="/catalogs/trabajos" component={Jobs} />
            <Route path="/catalogs/inventory-categories" component={InventoryCategories} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/inventory/audit" component={InventoryAudit} />
            <Route path="/interventions" component={Interventions} />
            <Route path="/bitacoras/ordenes" component={Interventions} />
            {/* Fallback 404 */}
            <Route>
              <div className="glass-panel p-10 text-center text-[var(--danger)]">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p>Página no encontrada</p>
              </div>
            </Route>
          </Switch>
        </Layout>
      </Router>
    </StoreProvider >
  );
}

export default App;
