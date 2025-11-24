// components/ReduxProvider.jsx
'use client';

import { Provider, useSelector } from 'react-redux';
import store from '../../Store/store';






export default function ReduxProvider({ children }) {
  return <Provider store={store}>
    
    {children}
    </Provider>;
}