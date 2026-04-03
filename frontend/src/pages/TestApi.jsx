import React, { useState } from "react";
import api from "../services/api";

function TestApi() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/test");
      setResponse(res.data);
    } catch (err) {
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test API Connection</h2>
      <button
        onClick={testConnection}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>

      {response && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700">Success!</p>
          <pre className="mt-2 text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export default TestApi;
