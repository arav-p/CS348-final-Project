from flask import Flask, request, jsonify
from flask_cors import CORS
from db_setup import init_app, db
from models import Workout, Exercise

app = init_app()
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
with app.app_context():
    db.create_all()

@app.route("/workouts", methods=["GET"])
def get_workouts():
    workouts = Workout.query.all()
    result = []
    for w in workouts:
        result.append({
            'id': w.id,
            'name': w.name,
            'date': w.date,
            'exercises': [
                { 'id': e.id, 'name': e.name, 'sets': e.sets, 'reps': e.reps }
                for e in w.exercises
            ]
        })
    return jsonify(result)

@app.route("/workouts", methods=["POST"])
def create_workout():
    data = request.json
    workout = Workout(name=data['name'], date=data['date'])
    db.session.add(workout)
    db.session.commit()
    for ex in data.get('exercises', []):
        e = Exercise(name=ex['name'], sets=ex['sets'], reps=ex['reps'], workout_id=workout.id)
        db.session.add(e)
    db.session.commit()
    return jsonify({ 'message': 'Workout created' })

@app.route("/workouts/<int:id>", methods=["DELETE"])
def delete_workout(id):
    workout = Workout.query.get_or_404(id)
    db.session.delete(workout)
    db.session.commit()
    return jsonify({ 'message': 'Workout deleted' })

if __name__ == '__main__':
    app.run(debug=True)
