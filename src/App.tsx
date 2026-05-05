import Navbar from './components/Navbar';
import Feed from './components/Feed';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <Feed />
    </div>
  );
}

export default App;
