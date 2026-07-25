import client from './client'

export function listMappings() {
  return client.get('/mappings/').then((res) => res.data)
}

export function getDoctorsForPatient(patientId) {
  return client.get(`/mappings/${patientId}/`).then((res) => res.data)
}

export function createMapping({ patient, doctor }) {
  return client.post('/mappings/', { patient, doctor }).then((res) => res.data)
}

export function deleteMapping(mappingId) {
  return client.delete(`/mappings/${mappingId}/`)
}
