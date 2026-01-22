import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { HealthCheckPage } from "@/pages/dev/HealthCheckPage";

const HomePage = () => (
  <div>
    <h1>Home</h1>
    <Link to="/dev/health">
      API・DB疎通確認（Health Check）
    </Link>
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