import { CustomerAppProvider } from './business-logic/context/CustomerAppContext';
import ErrorBoundary from './infrastructure/ErrorBoundary';
import Router from './infrastructure/Router';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <CustomerAppProvider>
        <Router />
      </CustomerAppProvider>
    </ErrorBoundary>
  );
}

export default App;
