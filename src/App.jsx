import React from 'react';
import { Route, Switch } from 'wouter';
import { StoreProvider } from './hooks/useStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Interventions from './pages/Interventions';
import Catalogs from './pages/Catalogs';
import Mechanics from './pages/Mechanics';
import Equipment from './pages/Equipment';
import Warehouses from './pages/Warehouses';
import Jobs from './pages/Jobs';

function App() {
  return (
    <StoreProvider>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/catalogs" component={Catalogs} />
          <Route path="/catalogs/mecanicos" component={Mechanics} />
          <Route path="/catalogs/equipos" component={Equipment} />
          <Route path="/catalogs/almacenes" component={Warehouses} />
          <Route path="/catalogs/trabajos" component={Jobs} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/interventions" component={Interventions} />
          {/* Fallback 404 */}
          <Route>
            <div className="glass-panel p-10 text-center text-[var(--danger)]">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p>Página no encontrada</p>
            </div>
          </Route>
        </Switch>
      </Layout>
    </StoreProvider>
  );
}

export default App;
