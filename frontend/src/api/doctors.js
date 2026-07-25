import client from './client'

export function listDoctors() {
  return client.get('/doctors/').then((res) => res.data)
}

export function getDoctor(id) {
  return client.get(`/doctors/${id}/`).then((res) => res.data)
}

export function createDoctor(data) {
  return client.post('/doctors/', data).then((res) => res.data)
}

export function updateDoctor(id, data) {
  return client.put(`/doctors/${id}/`, data).then((res) => res.data)
}

export function deleteDoctor(id) {
  return client.delete(`/doctors/${id}/`)
}
