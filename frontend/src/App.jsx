import { useState, useEffect } from 'react'

function App() {
  const [workouts, setWorkouts] = useState([])
  const [newWorkout, setNewWorkout] = useState({ name: '', date: '', exercises: [] })

  useEffect(() => {
    fetch('http://127.0.0.1:5000/workouts')
      .then(res => res.json())
      .then(setWorkouts)
  }, [])

  const addWorkout = () => {
    fetch('http://127.0.0.1:5000/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkout)
    }).then(() => {
      setNewWorkout({ name: '', date: '', exercises: [] })
      window.location.reload()
    })
  }

  const deleteWorkout = (id) => {
    fetch(`http://127.0.0.1:5000/workouts/${id}`, {
      method: 'DELETE'
    }).then(() => window.location.reload())
  }

  return (
    <div>
      <h1>Workout Tracker</h1>
      <input placeholder="Workout Name" value={newWorkout.name} onChange={e => setNewWorkout({ ...newWorkout, name: e.target.value })} />
      <input placeholder="Date" value={newWorkout.date} onChange={e => setNewWorkout({ ...newWorkout, date: e.target.value })} />
      <button onClick={addWorkout}>Add Workout</button>
      <ul>
        {workouts.map(w => (
          <li key={w.id}>
            <h3>{w.name} ({w.date})</h3>
            <ul>
              {w.exercises.map(ex => (
                <li key={ex.id}>{ex.name}: {ex.sets}x{ex.reps}</li>
              ))}
            </ul>
            <button onClick={() => deleteWorkout(w.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
