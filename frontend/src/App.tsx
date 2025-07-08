import { Provider } from 'react-redux';
import { store } from './store';
import SmartBriefApp from './components/SmartBriefApp';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <SmartBriefApp />
    </Provider>
  );
}

export default App;
