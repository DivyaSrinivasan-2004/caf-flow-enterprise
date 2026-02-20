import { table } from "console";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Table {
  id: string;
  number: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED";
}

interface ActiveSession {
  id: string;
  table: {
    id: string;
    number: string;
  };
  customer_name: string;
  customer_phone: string;
  token_number: string;
}

const BASE_URL = "http://192.168.1.3:8000";

const Tables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  useEffect(() => {
    loadTables();
    loadSessions();
  }, []);

  // ===============================
  // LOAD TABLES
  // ===============================
  const loadTables = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/tables/list/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Failed to load tables:", res.status);
        return;
      }

      const data = await res.json();
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Tables error:", err);
    }
  };

  // ===============================
  // LOAD ACTIVE SESSIONS
  // ===============================
  const loadSessions = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/tables/session/active/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to load sessions:", res.status);
        return;
      }

      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Sessions error:", err);
    }
  };

  // ===============================
  // GET SESSION FOR TABLE
  // ===============================
  const getSessionForTable = (tableId: string) => {
    return sessions.find((s) => s.table.id === tableId);
  };

  // ===============================
  // CREATE SESSION + ORDER
  // ===============================
  const handleCreateSession = async () => {
    if (!selectedTable) return;

    try {
      // -------------------------
      // 1️⃣ CREATE SESSION
      // -------------------------
      const sessionRes = await fetch(
        `${BASE_URL}/api/tables/session/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            table: selectedTable.id,
            customer_name: name,
            customer_phone: phone,
          }),
        }
      );

      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        console.error(err);
        alert("Failed to create table session");
        return;
      }

      const sessionData: ActiveSession = await sessionRes.json();

      // -------------------------
      // 2️⃣ CREATE ORDER (WITH SESSION)
      // -------------------------
      const orderRes = await fetch(
        `${BASE_URL}/api/orders/create/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_type: "DINE_IN",
            table: selectedTable.id,
            session: sessionData.id, // ✅ IMPORTANT
            items: [],
          }),
        }
      );

      if (!orderRes.ok) {
        const err = await orderRes.json();
        console.error(err);
        alert("Failed to create order");
        return;
      }

      const orderData = await orderRes.json();

      // -------------------------
      // 3️⃣ REDIRECT TO POS
      // -------------------------
      navigate(
  `/staff/pos?order=${orderData.id}` +
  `&type=DINE_IN` +
  `&table=${selectedTable.number}` +
  `&token=${sessionData.token_number}` +
  `&customer=${name}`
);

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="p-8 space-y-8">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Table Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor live table activity
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            {tables.filter(t => t.status === "AVAILABLE").length} Available
          </div>
          <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
            {tables.filter(t => t.status === "OCCUPIED").length} Occupied
          </div>
        </div>
      </div>

      {/* TABLE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {tables.map((table) => {

          const activeSession = getSessionForTable(table.id);
          const isAvailable = table.status === "AVAILABLE";

          return (
            <div
              key={table.id}
              onClick={() => {
                if (isAvailable) setSelectedTable(table);
              }}
              className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-200
                ${isAvailable
                  ? "bg-white hover:shadow-lg hover:-translate-y-1 border-green-200"
                  : "bg-orange-50 border-orange-200"}
              `}
            >

              {/* STATUS BADGE */}
              <div
                className={`absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-medium
                  ${isAvailable
                    ? "bg-green-100 text-green-600"
                    : "bg-orange-100 text-orange-600"}
                `}
              >
                {isAvailable ? "Available" : "Occupied"}
              </div>

              {/* TABLE INFO */}
              <h2 className="text-lg font-semibold mb-2">
                {table.number}
              </h2>

              <p className="text-sm text-muted-foreground mb-4">
                {table.capacity} seats
              </p>

              {!isAvailable && activeSession && (
                <div className="mt-3 text-sm">
                  <p className="font-medium text-orange-700">
                    {activeSession.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeSession.customer_phone}
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* CUSTOMER MODAL */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8">

            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Start New Order
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Table {selectedTable.number}
              </p>
            </div>

            {/* FORM */}
            <div className="space-y-5">

              {/* NAME */}
              <div>
                <label className="text-sm font-medium">
                  Customer Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-medium">
                  Phone Number
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border"
                />
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 mt-8">

              <button
                onClick={() => setSelectedTable(null)}
                className="px-4 py-2 text-sm text-gray-500"
              >
                Cancel
              </button>

              <button
                disabled={!name || !phone}
                onClick={handleCreateSession}
                className="px-6 py-3 rounded-xl text-sm text-white bg-indigo-600"
              >
                Start Order
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Tables;