// DOM Elements
const habitInput = document.getElementById('habit-input');
const habitFrequency = document.getElementById('habit-frequency');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitsList = document.getElementById('habits-list');
const totalHabitsElement = document.getElementById('total-habits');
const completedTodayElement = document.getElementById('completed-today');
const completionRateElement = document.getElementById('completion-rate');

// State
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Event Listeners
addHabitBtn.addEventListener('click', addHabit);
document.addEventListener('DOMContentLoaded', renderHabits);

// Functions
function addHabit() {
    const habitName = habitInput.value.trim();
    const frequency = habitFrequency.value;
    
    if (habitName === '') {
        alert('Please enter a habit name');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: habitName,
        frequency: frequency,
        streak: 0,
        completedDates: [],
        created: new Date().toISOString()
    };
    
    habits.push(newHabit);
    saveHabits();
    renderHabits();
    
    // Clear input
    habitInput.value = '';
}

function deleteHabit(id) {
    habits = habits.filter(habit => habit.id !== id);
    saveHabits();
    renderHabits();
}

function toggleComplete(id) {
    const today = new Date().toISOString().split('T')[0];
    
    habits = habits.map(habit => {
        if (habit.id === id) {
            const alreadyCompletedToday = habit.completedDates.includes(today);
            
            if (alreadyCompletedToday) {
                // If already completed today, unmark it
                habit.completedDates = habit.completedDates.filter(date => date !== today);
                habit.streak = Math.max(0, habit.streak - 1);
            } else {
                // Mark as completed
                habit.completedDates.push(today);
                habit.streak += 1;
            }
        }
        return habit;
    });
    
    saveHabits();
    renderHabits();
}

function renderHabits() {
    habitsList.innerHTML = '';
    
    if (habits.length === 0) {
        habitsList.innerHTML = '<p class="no-habits">No habits added yet. Add your first habit above!</p>';
        updateStats();
        return;
    }
    
    habits.forEach(habit => {
        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = habit.completedDates.includes(today);
        
        const habitElement = document.createElement('div');
        habitElement.classList.add('habit-item');
        if (isCompletedToday) {
            habitElement.classList.add('completed');
        }
        
        habitElement.innerHTML = `
            <div class="habit-info">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-frequency">${capitalizeFirstLetter(habit.frequency)}
                    <span class="habit-streak">🔥 ${habit.streak} day streak</span>
                </div>
            </div>
            <div class="habit-actions">
                <button class="complete-btn">${isCompletedToday ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Event listeners for buttons in this habit item
        const completeBtn = habitElement.querySelector('.complete-btn');
        const deleteBtn = habitElement.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', () => toggleComplete(habit.id));
        deleteBtn.addEventListener('click', () => deleteHabit(habit.id));
        
        habitsList.appendChild(habitElement);
    });
    
    updateStats();
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const totalHabits = habits.length;
    const completedToday = habits.filter(habit => 
        habit.completedDates.includes(today)
    ).length;
    
    const completionRate = totalHabits > 0 
        ? Math.round((completedToday / totalHabits) * 100) 
        : 0;
    
    totalHabitsElement.textContent = totalHabits;
    completedTodayElement.textContent = completedToday;
    completionRateElement.textContent = `${completionRate}%`;
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}