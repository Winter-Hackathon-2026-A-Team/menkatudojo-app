import api from "@/api";
import { useEffect, useState } from "react";

export const HealthCheckPage = () => {
  const [status, setStatus] = useState<string>("確認中...");
  const [dbVersion, setDbVersion] = useState<string>("確認中...");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get("/health"); // /api/health を叩く
        setStatus(res.data.status);

        const dbRes = await api.get("/db-test"); // /api/db-test を叩く
        setDbVersion(dbRes.data.database_version);
      } catch (err) {
        setStatus("error");
        console.error(err);
      }
    };
    checkHealth();
  }, []);

  return (
    <div>
      <h2>Health Check</h2>
      <p>API Status: {status}</p>
      <p>DB Version: {dbVersion || "N/A"}</p>
    </div>
  );
};
