import React, { useState, useEffect, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import apiClient from "../../lib/apiClient";

const OverallMarksChart = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await apiClient.get("/api/marks");
        setMarks(res.data || []);
      } catch (err) {
        console.error("Error fetching marks for dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    return [...marks]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        score: Number(m.testMark),
        subject: m.courseName,
      }));
  }, [marks]);

  // Calculate overall percentage
  const overallPercentage = useMemo(() => {
    if (!marks.length) return 0;

    const total = marks.reduce((sum, m) => sum + Number(m.testMark), 0);
    return (total / marks.length).toFixed(1);
  }, [marks]);

  if (loading)
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Loading Chart...
      </div>
    );

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        height: "300px",
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h3 style={{ fontSize: "16px", color: "#0f172a" }}>
          Performance Trend
        </h3>

        <div
          style={{
            background: "#eff6ff",
            color: "#2563eb",
            padding: "6px 14px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {overallPercentage}%
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="date"
            fontSize={11}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
          />

          <YAxis
            domain={[0, 100]}
            fontSize={11}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b" }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
            }}
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OverallMarksChart;