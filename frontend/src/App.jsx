import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [tasks, setTasks] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTasks, setAdminTasks] = useState([]);
  const [me, setMe] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) init(token);
  }, [token]);

  async function request(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      throw new Error("Błąd zapytania");
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  async function init(currentToken) {
    try {
      const meRes = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (!meRes.ok) throw new Error();

      const meData = await meRes.json();
      setMe(meData);

      await loadTasks(currentToken);

      if (meData.role === "ADMIN") {
        await loadAdminData(currentToken);
      }
    } catch {
      logout();
    }
  }

  async function login() {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Wpisz login i hasło.");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        setError("Zły login albo hasło.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } catch {
      setError("Backend nie odpowiada.");
    }
  }

  async function register() {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Wpisz login i hasło.");
      return;
    }

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        setError("Nie udało się zarejestrować.");
        return;
      }

      setError("Konto utworzone. Możesz się zalogować.");
    } catch {
      setError("Backend nie odpowiada.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setMe(null);
    setTasks([]);
    setAdminUsers([]);
    setAdminTasks([]);
    setContent("");
  }

  async function loadTasks(currentToken = token) {
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (res.ok) {
      setTasks(await res.json());
    }
  }

  async function loadAdminData(currentToken = token) {
    const headers = { Authorization: `Bearer ${currentToken}` };

    const usersRes = await fetch(`${API}/admin/users`, { headers });
    const tasksRes = await fetch(`${API}/admin/tasks`, { headers });

    if (usersRes.ok) setAdminUsers(await usersRes.json());
    if (tasksRes.ok) setAdminTasks(await tasksRes.json());
  }

  async function addTask() {
    const value = content.trim();

    if (!value) {
      setError("Nie możesz dodać pustego taska.");
      return;
    }

    setError("");

    await request(`${API}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        content: value,
        completed: false,
      }),
    });

    setContent("");
    await loadTasks();

    if (me?.role === "ADMIN") {
      await loadAdminData();
    }
  }

  async function deleteTask(id) {
    await request(`${API}/tasks/${id}`, { method: "DELETE" });
    await loadTasks();

    if (me?.role === "ADMIN") {
      await loadAdminData();
    }
  }

  async function toggleTask(task) {
    await request(`${API}/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify({
        content: task.content,
        completed: !task.completed,
      }),
    });

    await loadTasks();

    if (me?.role === "ADMIN") {
      await loadAdminData();
    }
  }

  async function adminDeleteTask(id) {
    await request(`${API}/admin/tasks/${id}`, { method: "DELETE" });
    await loadAdminData();
    await loadTasks();
  }

  function getOwner(task) {
    return (
      task.ownerUsername ||
      task.username ||
      task.owner?.username ||
      task.user?.username ||
      "brak z backendu"
    );
  }

  if (!token) {
    return (
      <div className="page">
        <div className="auth-card">
          <div className="brand">
            <div className="logo">✓</div>
            <div>
              <h1>Task Manager</h1>
              <p>Logowanie i rejestracja</p>
            </div>
          </div>

          <div className="form">
            <input
              placeholder="Login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />

            <input
              placeholder="Hasło"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
            />

            {error && <div className="message">{error}</div>}

            <button className="primary-btn" onClick={login}>
              Zaloguj
            </button>

            <button className="ghost-btn" onClick={register}>
              Zarejestruj konto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="app-shell">
        <header className="topbar">
          <div className="brand">
            <div className="logo">✓</div>
            <div>
              <h1>Task Manager</h1>
              <p>
                Zalogowano jako <strong>{me?.username}</strong>{" "}
                <span className="role">{me?.role}</span>
              </p>
            </div>
          </div>

          <button className="logout-btn" onClick={logout}>
            Wyloguj
          </button>
        </header>

        <main className="grid">
          <section className="panel">
            <div className="section-head">
              <div>
                <h2>Moje taski</h2>
                <p>{tasks.length} zadań</p>
              </div>
            </div>

            <div className="add-row">
              <input
                placeholder="Wpisz nowy task..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />

              <button
                className="add-btn"
                onClick={addTask}
                disabled={!content.trim()}
              >
                Dodaj
              </button>
            </div>

            {error && <div className="message">{error}</div>}

            <div className="tasks">
              {tasks.length === 0 && (
                <div className="empty">Nie masz jeszcze żadnych tasków.</div>
              )}

              {tasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div className="task-main">
                    <span className={task.completed ? "task done" : "task"}>
                      {task.content}
                    </span>

                    <span className={task.completed ? "badge green" : "badge red"}>
                      {task.completed ? "Zrobione" : "Do zrobienia"}
                    </span>
                  </div>

                  <div className="task-actions">
                    <button className="small-btn" onClick={() => toggleTask(task)}>
                      {task.completed ? "Cofnij" : "Zrobione"}
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => deleteTask(task.id)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {me?.role === "ADMIN" && (
            <section className="panel admin-panel">
              <div className="section-head">
                <div>
                  <h2>Panel admina</h2>
                  <p>Użytkownicy i wszystkie taski</p>
                </div>
              </div>

              <h3>Użytkownicy</h3>

              <div className="table">
                <div className="table-row table-head">
                  <span>ID</span>
                  <span>Login</span>
                  <span>Rola</span>
                </div>

                {adminUsers.map((user) => (
                  <div className="table-row" key={user.id}>
                    <span>#{user.id}</span>
                    <strong>{user.username}</strong>
                    <span className="role">{user.role}</span>
                  </div>
                ))}
              </div>

              <h3>Wszystkie taski</h3>

              <div className="admin-tasks">
                {adminTasks.length === 0 && (
                  <div className="empty">Brak tasków w systemie.</div>
                )}

                {adminTasks.map((task) => (
                  <div className="admin-task" key={task.id}>
                    <div>
                      <strong>{task.content}</strong>

                      <div className="meta">
                        <span>Właściciel: {getOwner(task)}</span>
                        <span>#{task.id}</span>
                      </div>
                    </div>

                    <div className="admin-actions">
                      <span className={task.completed ? "badge green" : "badge red"}>
                        {task.completed ? "Zrobione" : "Do zrobienia"}
                      </span>

                      <button
                        className="danger-btn"
                        onClick={() => adminDeleteTask(task.id)}
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}