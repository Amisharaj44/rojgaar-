import { useEffect, useState } from "react"
import axios from "axios"
import workersImage from "./assets/workers.jpg"
import "./App.css"

const API = "http://127.0.0.1:8000"

const workTypes = [
  ["house help", "House Help / घरेलू काम"],
  ["labour", "Labour / मजदूर"],
  ["mason", "Mason / राज मिस्त्री"],
  ["carpenter", "Carpenter / बढ़ई"],
  ["plumber", "Plumber / प्लंबर"],
  ["electrician", "Electrician / बिजली मिस्त्री"],
  ["painter", "Painter / पेंटर"],
  ["welder", "Welder / वेल्डर"],
  ["gardener", "Gardener / माली"],
  ["cleaner", "Cleaner / सफाई कर्मचारी"],
  ["driver", "Driver / ड्राइवर"],
  ["construction worker", "Construction Worker / निर्माण मजदूर"],
  ["other", "Other / अन्य"]
]

function App() {
  const [page, setPage] = useState("home")
  const [role, setRole] = useState("")

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setPage("home")
  }

  const openLogin = (selectedRole) => {
    setRole(selectedRole)
    setPage(`${selectedRole}-login`)
  }

  const openRegister = (selectedRole) => {
    setRole(selectedRole)
    setPage(`${selectedRole}-register`)
  }

  if (page === "customer-login") {
    return (
      <Login
        role="customer"
        onBack={() => setPage("home")}
        onSuccess={() => setPage("customer-dashboard")}
      />
    )
  }

  if (page === "worker-login") {
    return (
      <Login
        role="worker"
        onBack={() => setPage("home")}
        onSuccess={() => setPage("worker-dashboard")}
      />
    )
  }

  if (page === "customer-register") {
    return (
      <Register
        role="customer"
        onBack={() => setPage("home")}
      />
    )
  }

  if (page === "worker-register") {
    return (
      <Register
        role="worker"
        onBack={() => setPage("home")}
      />
    )
  }

  if (page === "customer-dashboard") {
    return <CustomerDashboard onLogout={logout} />
  }

  if (page === "worker-dashboard") {
    return <WorkerDashboard onLogout={logout} />
  }

  return (
    <div
      className="home"
      style={{ backgroundImage: `url(${workersImage})` }}
    >
      <div className="home-content">
        <div className="logo">Rojgaar / रोज़गार</div>

        <div className="tagline">
          Kaam chahiye? Kaam karwana hai?
          <br />
          <strong>Rojgaar se judiye.</strong>
          <br />
          Find trusted workers near you.
        </div>

        <div className="home-buttons">
          <button
            className="btn btn-primary"
            onClick={() => openLogin("customer")}
          >
            Customer Login / ग्राहक लॉगिन
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => openLogin("worker")}
          >
            Worker Login / कामगार लॉगिन
          </button>

          <button
            className="btn btn-primary"
            onClick={() => openRegister("customer")}
          >
            Customer Registration / ग्राहक रजिस्ट्रेशन
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => openRegister("worker")}
          >
            Worker Registration / कामगार रजिस्ट्रेशन
          </button>
        </div>
      </div>
    </div>
  )
}

function Register({ role, onBack }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    area: "",
    work_type: []
  })

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleWorkType = (value) => {
    setForm((prev) => ({
      ...prev,
      work_type: prev.work_type.includes(value)
        ? prev.work_type.filter((item) => item !== value)
        : [...prev.work_type, value]
    }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const payload =
        role === "worker"
          ? {
              name: form.name,
              phone: form.phone,
              email: form.email || null,
              password: form.password,
              work_type: form.work_type,
              area: form.area
            }
          : {
              name: form.name,
              phone: form.phone,
              email: form.email,
              password: form.password
            }

      await axios.post(`${API}/${role}s`, payload)

      setMessage("Registration successful. You can now login.")

      setTimeout(() => {
        onBack()
      }, 1200)
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Registration failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <button className="btn" onClick={onBack}>
        ← Back
      </button>

      <h1>
        {role === "worker"
          ? "Worker Registration / कामगार रजिस्ट्रेशन"
          : "Customer Registration / ग्राहक रजिस्ट्रेशन"}
      </h1>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Name / नाम</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone / मोबाइल नंबर</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email / ईमेल</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required={role === "customer"}
          />
        </div>

        <div className="form-group">
          <label>Password / पासवर्ड</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {role === "worker" && (
          <>
            <div className="form-group">
              <label>Area / क्षेत्र</label>
              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Work Type / काम का प्रकार</label>

              <div className="skills">
                {workTypes.map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    className={
                      form.work_type.includes(value)
                        ? "skill"
                        : "btn"
                    }
                    onClick={() => handleWorkType(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register / रजिस्टर"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}

function Login({ role, onBack, onSuccess }) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const response = await axios.post(`${API}/login`, {
        phone: phone ,
        password:password
      });

      localStorage.setItem("token", response.data.access_token)
      localStorage.setItem("role", response.data.role)

      onSuccess()
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Login failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <button className="btn" onClick={onBack}>
        ← Back
      </button>

      <h1>
        {role === "worker"
          ? "Worker Login / कामगार लॉगिन"
          : "Customer Login / ग्राहक लॉगिन"}
      </h1>

      <form onSubmit={submit}>
        <div className="form-group">
          <label>Phone / मोबाइल नंबर</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password / पासवर्ड</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          className="btn btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login / लॉगिन"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  )
}

function CustomerDashboard({ onLogout }) {
  const [section, setSection] = useState("find")

  return (
    <div>
      <nav className="navbar">
        <div className="nav-logo">Rojgaar / रोज़गार</div>

        <div className="nav-actions">
          <button
            className="btn btn-primary"
            onClick={() => setSection("find")}
          >
            Find Workers
          </button>

          <button
            className="btn"
            onClick={() => setSection("requests")}
          >
            My Requests
          </button>

          <button
            className="btn btn-danger"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <h1>Customer Dashboard / ग्राहक डैशबोर्ड</h1>
        <p className="subtitle">
          Find workers and manage your requests.
        </p>

        {section === "find" && <FindWorkers />}
        {section === "requests" && <MyRequests />}
      </div>
    </div>
  )
}

function FindWorkers() {
  const [workType, setWorkType] = useState("")
  const [area, setArea] = useState("")
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const searchWorkers = async () => {
    setLoading(true)
    setMessage("")

    try {
      const params = {}

      if (workType) params.work_type = workType
      if (area) params.area = area

      const response = await axios.get(`${API}/workers`, {
        params
      })

      setWorkers(response.data)

      if (response.data.length === 0) {
        setMessage("No workers found.")
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail || "Could not load workers."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="search-box">
        <select
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
        >
          <option value="">All Work Types / सभी काम</option>

          {workTypes.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          placeholder="Area / क्षेत्र"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={searchWorkers}
        >
          {loading ? "Searching..." : "Search / खोजें"}
        </button>
      </div>

      {message && <p>{message}</p>}

      <div className="worker-grid">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
          />
        ))}
      </div>
    </div>
  )
}

function WorkerCard({ worker }) {
  const [showRequest, setShowRequest] = useState(false)

  return (
    <>
      <div className="worker-card">
        <h3>{worker.name}</h3>

        <div className="worker-info">
          <div>📞 {worker.phone}</div>
          <div>📍 {worker.area}</div>

          {worker.average_rating !== undefined && (
            <div>
              ⭐ {worker.average_rating || 0}
              {" "}
              ({worker.review_count || 0} reviews)
            </div>
          )}
        </div>

        <div className="skills">
          {Array.isArray(worker.work_type) &&
            worker.work_type.map((skill) => (
              <span className="skill" key={skill}>
                {skill}
              </span>
            ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowRequest(true)}
        >
          Request Work / काम का अनुरोध
        </button>
      </div>

      {showRequest && (
        <RequestWork
          worker={worker}
          onClose={() => setShowRequest(false)}
        />
      )}
    </>
  )
}

function RequestWork({ worker, onClose }) {
  const [workType, setWorkType] = useState(
    worker.work_type?.[0] || ""
  )
  const [description, setDescription] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")

      await axios.post(
        `${API}/job-requests`,
        {
          worker_id: worker.id,
          work_type: workType,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setMessage("Request sent successfully.")

      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Could not send request."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>
          Request {worker.name}
        </h2>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Work Type / काम</label>

            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              required
            >
              {worker.work_type?.map((work) => (
                <option key={work} value={work}>
                  {work}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description / विवरण</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work..."
            />
          </div>

          <div className="request-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Request"}
            </button>

            <button
              className="btn"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

function MyRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${API}/my-job-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setRequests(response.data)

      if (response.data.length === 0) {
        setMessage("No requests yet.")
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Could not load requests."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  if (loading) {
    return <p>Loading requests...</p>
  }

  return (
    <div>
      <h2>My Requests / मेरे अनुरोध</h2>

      {message && <p>{message}</p>}

      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          onRefresh={loadRequests}
        />
      ))}
    </div>
  )
}

function RequestCard({ request, onRefresh }) {
  const [showReview, setShowReview] = useState(false)

  return (
    <div className="request-card">
      <h3>{request.work_type}</h3>

      <p>
        {request.description || "No description provided."}
      </p>

      <span className="status">
        {request.status}
      </span>

      {request.status === "completed" && (
        <div className="request-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowReview(true)}
          >
            Review Worker / समीक्षा
          </button>
        </div>
      )}

      {showReview && (
        <ReviewForm
          request={request}
          onClose={() => setShowReview(false)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}

function ReviewForm({ request, onClose, onRefresh }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("token")

      await axios.post(
        `${API}/reviews`,
        {
          job_request_id: request.id,
          rating,
          comment
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setMessage("Review submitted successfully.")

      setTimeout(() => {
        onClose()
        onRefresh()
      }, 1000)
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Could not submit review."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Review Worker / कामगार की समीक्षा</h2>

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Rating / रेटिंग</label>

            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value={5}>5 ⭐⭐⭐⭐⭐</option>
              <option value={4}>4 ⭐⭐⭐⭐</option>
              <option value={3}>3 ⭐⭐⭐</option>
              <option value={2}>2 ⭐⭐</option>
              <option value={1}>1 ⭐</option>
            </select>
          </div>

          <div className="form-group">
            <label>Comment / टिप्पणी</label>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your review..."
            />
          </div>

          <div className="request-actions">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>

            <button
              className="btn"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  )
}

function WorkerDashboard({ onLogout }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("token")

      const response = await axios.get(
        `${API}/job-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      setRequests(response.data)

      if (response.data.length === 0) {
        setMessage("No job requests yet.")
      }
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Could not load requests."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  const updateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem("token")

      await axios.patch(
        `${API}/job-requests/${requestId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      loadRequests()
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
          "Could not update request."
      )
    }
  }

  return (
    <div>
      <nav className="navbar">
        <div className="nav-logo">Rojgaar / रोज़गार</div>

        <div className="nav-actions">
          <button
            className="btn"
            onClick={loadRequests}
          >
            Refresh
          </button>

          <button
            className="btn btn-danger"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard">
        <h1>Worker Dashboard / कामगार डैशबोर्ड</h1>

        <p className="subtitle">
          Manage your incoming job requests.
        </p>

        {loading && <p>Loading requests...</p>}

        {message && !loading && <p>{message}</p>}

        {!loading &&
          requests.map((request) => (
            <div
              className="request-card"
              key={request.id}
            >
              <h3>{request.work_type}</h3>

              <p>
                {request.description ||
                  "No description provided."}
              </p>

              <span className="status">
                {request.status}
              </span>

              {request.status === "pending" && (
                <div className="request-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      updateRequest(
                        request.id,
                        "accepted"
                      )
                    }
                  >
                    Accept / स्वीकार करें
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      updateRequest(
                        request.id,
                        "rejected"
                      )
                    }
                  >
                    Reject / अस्वीकार करें
                  </button>
                </div>
              )}

              {request.status === "accepted" && (
                <div className="request-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      updateRequest(
                        request.id,
                        "completed"
                      )
                    }
                  >
                    Mark Completed / पूरा हुआ
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default App