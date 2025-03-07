// DOM Elements
const habitInput = document.getElementById('habit-input');
const habitFrequency = document.getElementById('habit-frequency');
const habitCategory = document.getElementById('habit-category');
const addHabitBtn = document.getElementById('add-habit-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const categoryFilter = document.getElementById('category-filter');
const habitsList = document.getElementById('habits-list');
const totalHabitsElement = document.getElementById('total-habits');
const completedTodayElement = document.getElementById('completed-today');
const completionRateElement = document.getElementById('completion-rate');
const categoryStatsContainer = document.getElementById('category-stats');
const categoryModal = document.getElementById('category-modal');
const closeModalBtn = document.querySelector('.close');
const newCategoryInput = document.getElementById('new-category-input');
const saveCategoryBtn = document.getElementById('save-category-btn');

// State
let habits = JSON.parse(localStorage.getItem('habits')) || [];
let categories = JSON.parse(localStorage.getItem('categories')) || [
    'health', 'work', 'personal', 'learning', 'other'
];
let currentFilter = 'all';

// Event Listeners
addHabitBtn.addEventListener('click', addHabit);
addCategoryBtn.addEventListener('click', openCategoryModal);
closeModalBtn.addEventListener('click', closeCategoryModal);
saveCategoryBtn.addEventListener('click', saveNewCategory);
categoryFilter.addEventListener('change', filterHabits);
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderHabits();
});

// Functions
function addHabit() {
    const habitName = habitInput.value.trim();
    const frequency = habitFrequency.value;
    const category = habitCategory.value;
    
    if (habitName === '') {
        alert('Please enter a habit name');
        return;
    }
    
    if (category === '') {
        alert('Please select a category');
        return;
    }
    
    const newHabit = {
        id: Date.now(),
        name: habitName,
        frequency: frequency,
        category: category,
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
    
    // Filter habits by category if needed
    let filteredHabits = habits;
    if (currentFilter !== 'all') {
        filteredHabits = habits.filter(habit => habit.category === currentFilter);
    }
    
    if (filteredHabits.length === 0) {
        habitsList.innerHTML = '<p class="no-habits">No habits found in this category. Add your first habit above!</p>';
        updateStats();
        return;
    }
    
    filteredHabits.forEach(habit => {
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
                <div class="habit-details">
                    <span>${capitalizeFirstLetter(habit.frequency)}</span>
                    <span class="habit-category badge-${habit.category}">${capitalizeFirstLetter(habit.category)}</span>
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
    
    // Overall statistics
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
    
    // Category statistics
    categoryStatsContainer.innerHTML = '';
    
    // Get unique categories from habits
    const usedCategories = [...new Set(habits.map(habit => habit.category))];
    
    usedCategories.forEach(category => {
        const categoryHabits = habits.filter(habit => habit.category === category);
        const categoryTotal = categoryHabits.length;
        const categoryCompleted = categoryHabits.filter(habit => 
            habit.completedDates.includes(today)
        ).length;
        
        const categoryCompletionRate = categoryTotal > 0 
            ? Math.round((categoryCompleted / categoryTotal) * 100) 
            : 0;
        
        const categoryStatElement = document.createElement('div');
        categoryStatElement.classList.add('category-stat', `category-${category}`);
        
        categoryStatElement.innerHTML = `
            <h3>${capitalizeFirstLetter(category)}</h3>
            <p>Total habits: ${categoryTotal}</p>
            <p>Completed today: ${categoryCompleted}</p>
            <p>Completion rate: ${categoryCompletionRate}%</p>
        `;
        
        categoryStatsContainer.appendChild(categoryStatElement);
    });
}

function filterHabits() {
    currentFilter = categoryFilter.value;
    renderHabits();
}

function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
    renderCategories();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderCategories() {
    // Clear current options (except the default/placeholder)
    while (habitCategory.options.length > 1) {
        habitCategory.remove(1);
    }
    
    // Clear current filter options (except "All Categories")
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add categories to both dropdowns
    categories.forEach(category => {
        // Add to habit category dropdown
        const categoryOption = document.createElement('option');
        categoryOption.value = category;
        categoryOption.textContent = capitalizeFirstLetter(category);
        habitCategory.appendChild(categoryOption);
        
        // Add to filter dropdown
        const filterOption = document.createElement('option');
        filterOption.value = category;
        filterOption.textContent = capitalizeFirstLetter(category);
        categoryFilter.appendChild(filterOption);
    });
}

function openCategoryModal() {
    categoryModal.style.display = 'block';
    newCategoryInput.focus();
}

function closeCategoryModal() {
    categoryModal.style.display = 'none';
    newCategoryInput.value = '';
}

function saveNewCategory() {
    const newCategory = newCategoryInput.value.trim().toLowerCase();
    
    if (newCategory === '') {
        alert('Please enter a category name');
        return;
    }
    
    if (categories.includes(newCategory)) {
        alert('This category already exists');
        return;
    }
    
    // Add new category
    categories.push(newCategory);
    saveCategories();
    
    // Add CSS class for the new category
    const style = document.createElement('style');
    style.textContent = `
        .category-${newCategory} {
            background-color: rgba(100, 100, 100, 0.1);
            border-left: 5px solid #555;
        }
        .badge-${newCategory} {
            background-color: #555;
        }
    `;
    document.head.appendChild(style);
    
    // Close modal
    closeCategoryModal();
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target === categoryModal) {
        closeCategoryModal();
    }
};