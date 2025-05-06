// App.jsx (Simplified: Workouts only, with edit + report filtering)
import { useState, useEffect } from 'react'

function App() {
  const [workouts, setWorkouts] = useState([])
  const [newWorkout, setNewWorkout] = useState({ name: '', date: '' })
  const [editWorkoutId, setEditWorkoutId] = useState(null)
  const [filter, setFilter] = useState({ start: '', end: '' })
  const [report, setReport] = useState({ total: 0, averageNameLength: 0, count: 0 })

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = () => {
    fetch('/api/workouts')
      .then(res => res.json())
      .then(setWorkouts)
  }

  const addOrUpdateWorkout = () => {
    const method = editWorkoutId ? 'PUT' : 'POST'
    const url = editWorkoutId ? `/api/workouts/${editWorkoutId}` : '/api/workouts'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkout)
    }).then(() => {
      setNewWorkout({ name: '', date: '' })
      setEditWorkoutId(null)
      fetchWorkouts()
    })
  }

  const deleteWorkout = (id) => {
    fetch(`/api/workouts/${id}`, { method: 'DELETE' })
      .then(fetchWorkouts)
  }

  const loadWorkoutForEdit = (workout) => {
    setNewWorkout({ name: workout.name, date: workout.date })
    setEditWorkoutId(workout.id)
  }

  const generateReport = () => {
    const query = new URLSearchParams(filter).toString()
    fetch(`/api/report/summary?${query}`)
      .then(res => res.json())
      .then(setReport)
  }

  return (
    <div>
      <h1>Workout Tracker</h1>

      <input placeholder="Workout Name" value={newWorkout.name} onChange={e => setNewWorkout({ ...newWorkout, name: e.target.value })} />
      <input type="date" value={newWorkout.date} onChange={e => setNewWorkout({ ...newWorkout, date: e.target.value })} />
      <button onClick={addOrUpdateWorkout}>{editWorkoutId ? 'Update' : 'Add'} Workout</button>

      <h2>All Workouts</h2>
      <ul>
        {workouts.map(w => (
          <li key={w.id}>
            <strong>{w.name}</strong> ({w.date})
            <button onClick={() => loadWorkoutForEdit(w)}>Edit</button>
            <button onClick={() => deleteWorkout(w.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Workout Report</h2>
      <div>
        <label>Start Date: </label>
        <input type="date" value={filter.start} onChange={e => setFilter({ ...filter, start: e.target.value })} />
        <label>End Date: </label>
        <input type="date" value={filter.end} onChange={e => setFilter({ ...filter, end: e.target.value })} />
        <button onClick={generateReport}>Generate Report</button>
      </div>

      <div>
        <p><strong>Total Workouts:</strong> {report.count}</p>
        <p><strong>Average Workout Name Length:</strong> {report.averageNameLength}</p>
        <p><strong>Workout Names Combined:</strong> {report.total}</p>
      </div>
    </div>
  )
}

export default App;

