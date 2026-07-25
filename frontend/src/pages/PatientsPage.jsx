import { useEffect, useState } from 'react'
import * as patientsApi from '../api/patients'

const emptyForm = { name: '', age: '', gender: 'male', address: '', phone_number: '', medical_history: '' }

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const data = await patientsApi.listPatients()
      setPatients(data)
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

  function startEdit(patient) {
    setEditingId(patient.id)
    setForm({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      address: patient.address || '',
      phone_number: patient.phone_number || '',
      medical_history: patient.medical_history || '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form, age: Number(form.age) }
    try {
      if (editingId) {
        await patientsApi.updatePatient(editingId, payload)
      } else {
        await patientsApi.createPatient(payload)
      }
      cancelEdit()
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this patient?')) return
    setError('')
    try {
      await patientsApi.deletePatient(id)
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>Patients</h2>
      {error && <p className="error">{error}</p>}

      <form className="card inline-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit patient' : 'Add patient'}</h3>
        <div className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Age
            <input type="number" name="age" min="0" max="150" value={form.age} onChange={handleChange} required />
          </label>
          <label>
            Gender
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Phone
            <input name="phone_number" value={form.phone_number} onChange={handleChange} />
          </label>
          <label>
            Address
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label>
            Medical history
            <input name="medical_history" value={form.medical_history} onChange={handleChange} />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? 'Save changes' : 'Add patient'}</button>
          {editingId && (
            <button type="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Address</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.phone_number}</td>
                <td>{p.address}</td>
                <td className="table-actions">
                  <button onClick={() => startEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={6}>No patients yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
