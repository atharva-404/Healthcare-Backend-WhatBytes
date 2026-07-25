import { useEffect, useState } from 'react'
import * as mappingsApi from '../api/mappings'
import * as patientsApi from '../api/patients'
import * as doctorsApi from '../api/doctors'

export default function MappingsPage() {
  const [mappings, setMappings] = useState([])
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({ patient: '', doctor: '' })
  const [filterPatient, setFilterPatient] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const [mappingData, patientData, doctorData] = await Promise.all([
        mappingsApi.listMappings(),
        patientsApi.listPatients(),
        doctorsApi.listDoctors(),
      ])
      setMappings(mappingData)
      setPatients(patientData)
      setDoctors(doctorData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.patient || !form.doctor) return
    try {
      await mappingsApi.createMapping({ patient: Number(form.patient), doctor: Number(form.doctor) })
      setForm({ patient: '', doctor: '' })
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this mapping?')) return
    setError('')
    try {
      await mappingsApi.deleteMapping(id)
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleFilter(e) {
    e.preventDefault()
    setError('')
    if (!filterPatient) {
      refresh()
      return
    }
    setLoading(true)
    try {
      const data = await mappingsApi.getDoctorsForPatient(filterPatient)
      setMappings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h2>Patient-Doctor Mappings</h2>
      {error && <p className="error">{error}</p>}

      <form className="card inline-form" onSubmit={handleSubmit}>
        <h3>Assign a doctor to a patient</h3>
        <div className="form-grid">
          <label>
            Patient
            <select name="patient" value={form.patient} onChange={handleChange} required>
              <option value="">Select patient</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Doctor
            <select name="doctor" value={form.doctor} onChange={handleChange} required>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.specialization})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">Assign</button>
        </div>
      </form>

      <form className="card inline-form" onSubmit={handleFilter}>
        <h3>Filter by patient</h3>
        <div className="form-grid">
          <label>
            Patient
            <select value={filterPatient} onChange={(e) => setFilterPatient(e.target.value)}>
              <option value="">All patients</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">Apply filter</button>
        </div>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Specialization</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.id}>
                <td>{m.patient_detail?.name}</td>
                <td>{m.doctor_detail?.name}</td>
                <td>{m.doctor_detail?.specialization}</td>
                <td className="table-actions">
                  <button onClick={() => handleDelete(m.id)}>Remove</button>
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={4}>No mappings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
