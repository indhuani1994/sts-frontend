import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import apiClient from "../../lib/apiClient";

const AttendanceGraph = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await apiClient.get("/api/attendance/report", {
          params: { type: "all" },
        });

        setReportData(res.data || []);
      } catch (err) {
        console.error("Error fetching dashboard attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Prepare chart data
  const chartData = useMemo(() => {
    let presentCount = 0;

    return [...reportData]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((record, index) => {
        const isPresent =
          record.status === "present" || record.status === "online";

        if (isPresent) presentCount++;

        const totalSoFar = index + 1;
        const runningPercentage = Math.round(
          (presentCount / totalSoFar) * 100
        );

        return {
          date: new Date(record.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          percentage: runningPercentage,
          status: isPresent ? "P" : "A",
        };
      });
  }, [reportData]);

  // Calculate overall percentage
  const overallPercentage = useMemo(() => {
    if (reportData.length === 0) return 0;

    const presentDays = reportData.filter(
      (r) => r.status === "present" || r.status === "online"
    ).length;

    return Math.round((presentDays / reportData.length) * 100);
  }, [reportData]);

  // Custom dot for Present / Absent
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;

    const isPresent = payload.status === "P";

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={isPresent ? "#22c55e" : "#ef4444"}
        />
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fontSize={10}
          fill={isPresent ? "#22c55e" : "#ef4444"}
        >
          {payload.status}
        </text>
      </g>
    );
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", padding: "20px" }}>
        Loading Attendance Trend...
      </p>
    );

  return (
    <div
      style={{
        width: "100%",
        height: 300,
        
        background: "#fff",
        borderRadius: "16px",
        padding: "15px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <h3
        style={{
          textAlign: "center",
          fontSize: "14px",
          marginBottom: "10px",
          color: "#0f172a",
        }}
      >
        Attendance Trend ({overallPercentage}%)
      </h3>

      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4471d1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#5b53ca" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />

          <XAxis
            dataKey="date"
            fontSize={10}
            tickLine={true}
            axisLine={true}
            tick={{ fill: "#64748b" }}
          />

          <YAxis
            domain={[0, 100]}
            fontSize={10}
            tickLine={true}
            axisLine={true}
            tick={{ fill: "#64748b" }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: "none",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
          />

          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#3f1372"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAttendance)"
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceGraph;