import { useEffect, useState } from 'react'
import * as doctorsApi from '../api/doctors'

const emptyForm = { name: '', specialization: '', email: '', phone_number: '', years_of_experience: '' }

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    try {
      const data = await doctorsApi.listDoctors()
      setDoctors(data)
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

  function startEdit(doctor) {
    setEditingId(doctor.id)
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      email: doctor.email,
      phone_number: doctor.phone_number || '',
      years_of_experience: doctor.years_of_experience,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const payload = { ...form, years_of_experience: Number(form.years_of_experience) || 0 }
    try {
      if (editingId) {
        await doctorsApi.updateDoctor(editingId, payload)
      } else {
        await doctorsApi.createDoctor(payload)
      }
      cancelEdit()
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this doctor?')) return
    setError('')
    try {
      await doctorsApi.deleteDoctor(id)
      refresh()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>Doctors</h2>
      {error && <p className="error">{error}</p>}

      <form className="card inline-form" onSubmit={handleSubmit}>
        <h3>{editingId ? 'Edit doctor' : 'Add doctor'}</h3>
        <div className="form-grid">
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Specialization
            <input name="specialization" value={form.specialization} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label>
            Phone
            <input name="phone_number" value={form.phone_number} onChange={handleChange} />
          </label>
          <label>
            Years of experience
            <input
              type="number"
              name="years_of_experience"
              min="0"
              value={form.years_of_experience}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">{editingId ? 'Save changes' : 'Add doctor'}</button>
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
              <th>Specialization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Experience</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.specialization}</td>
                <td>{d.email}</td>
                <td>{d.phone_number}</td>
                <td>{d.years_of_experience} yrs</td>
                <td className="table-actions">
                  <button onClick={() => startEdit(d)}>Edit</button>
                  <button onClick={() => handleDelete(d.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan={6}>No doctors yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
