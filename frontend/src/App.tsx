import { HealthCheckPage } from "@/pages/dev/HealthCheckPage";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

const HomePage = () => (
  <div>
    <h1 className="text-3xl font-bold text-blue-600">Home</h1>
      <Link to="/dev/health">API・DB疎通確認（Health Check）</Link>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dev/health" element={<HealthCheckPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
