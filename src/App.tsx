import React from 'react';
import { CrmPortalView } from './views/CrmPortalView';
import { CrmErrorBoundary } from './components/crm/CrmErrorBoundary';

export default function App() {
  return (
    <CrmErrorBoundary>
      <CrmPortalView />
    </CrmErrorBoundary>
  );
}
