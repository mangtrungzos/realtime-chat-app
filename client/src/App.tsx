import './App.css';
import { Join } from "./components/CreateButton";

const WS = 'http://localhost:8080';

function App() {
  return (
    <div className="App flex items-center justify-center w-screen h-screen">
      <Join />
    </div>
  );
}

export default App;
