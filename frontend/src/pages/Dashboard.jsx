
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const emptyForm = {
  full_name: "",
  email: "",
  department: "",
  job_title: "",
  salary: "",
  date_joined: "",
  is_active: true,
};

function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const navigate = useNavigate();

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("employees/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployees(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        setError("Could not load employees. Check the Django backend.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingEmployeeId(null);
    setShowForm(false);
    setError("");
  }

  function handleEdit(employee) {
    setForm({
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
      job_title: employee.job_title,
      salary: employee.salary,
      date_joined: employee.date_joined,
      is_active: employee.is_active,
    });

    setEditingEmployeeId(employee.id);
    setShowForm(true);
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (editingEmployeeId !== null) {
        await api.patch(
          `employees/${editingEmployeeId}/`,
          form,
          config
        );
      } else {
        await api.post("employees/", form, config);
      }

      resetForm();
      await loadEmployees();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Could not save employee. Check the Django backend."
      );
    }
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        navigate("/login");
        return;
      }

      await api.delete(`employees/${employee.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (editingEmployeeId === employee.id) {
        resetForm();
      }

      await loadEmployees();
    } catch (err) {
      setError(
        err.response?.data
          ? JSON.stringify(err.response.data)
          : "Could not delete employee."
      );
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage your employee records</p>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="dashboard-content">
        <div className="dashboard-toolbar">
          <div>
            <h2>Employees</h2>
            <p>Total employees: {employees.length}</p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setError("");
                setShowForm(true);
              }
            }}
          >
            {showForm ? "Cancel" : "+ Add Employee"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {showForm && (
          <form className="employee-form" onSubmit={handleSubmit}>
            <h3>
              {editingEmployeeId !== null
                ? "Edit Employee"
                : "Add New Employee"}
            </h3>

            <input
              name="full_name"
              placeholder="Full name"
              value={form.full_name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="department"
              placeholder="Department"
              value={form.department}
              onChange={handleChange}
              required
            />

            <input
              name="job_title"
              placeholder="Job title"
              value={form.job_title}
              onChange={handleChange}
              required
            />

            <input
              name="salary"
              type="number"
              min="0"
              step="0.01"
              placeholder="Salary"
              value={form.salary}
              onChange={handleChange}
              required
            />

            <label>
              Date joined
              <input
                name="date_joined"
                type="date"
                value={form.date_joined}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active employee
            </label>

            <div className="employee-form-actions">
              <button type="submit">
                {editingEmployeeId !== null
                  ? "Update Employee"
                  : "Save Employee"}
              </button>

              {editingEmployeeId !== null && (
                <button type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        )}

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found. Add your first employee!</p>
        ) : (
          <div className="employee-table-wrapper">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Salary</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.full_name}</td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>{employee.job_title}</td>
                    <td>₹{employee.salary}</td>
                    <td>{employee.date_joined}</td>
                    <td>
                      {employee.is_active ? "Active" : "Inactive"}
                    </td>
                    <td>
                      <div className="employee-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(employee)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(employee)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
