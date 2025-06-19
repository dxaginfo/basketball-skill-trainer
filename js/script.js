document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const getStartedBtn = document.getElementById('get-started-btn');
    const profileForm = document.getElementById('profile-form');
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-btn');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const builderSection = document.getElementById('builder');
    const resultsSection = document.getElementById('results');
    const planContainer = document.getElementById('plan-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    const trainingActions = document.getElementById('training-actions');
    const printBtn = document.getElementById('print-btn');
    const saveBtn = document.getElementById('save-btn');
    const startOverBtn = document.getElementById('start-over-btn');
    const contactForm = document.getElementById('contact-form');

    // Navigation and Form Functionality
    getStartedBtn.addEventListener('click', () => {
        builderSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Form navigation
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.form-step');
            const nextStep = currentStep.nextElementSibling;
            
            // Basic validation
            const inputs = currentStep.querySelectorAll('input[required], select[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.classList.add('invalid');
                    setTimeout(() => input.classList.remove('invalid'), 3000);
                }
            });
            
            // Radio button validation for step 2
            if (currentStep.id === 'step-2') {
                const radioGroups = ['shooting', 'ballhandling', 'passing', 'defense', 'conditioning'];
                radioGroups.forEach(group => {
                    const checked = currentStep.querySelector(`input[name="${group}"]:checked`);
                    if (!checked) {
                        isValid = false;
                        const groupContainer = currentStep.querySelector(`.skill-rating:has(input[name="${group}"])`);
                        groupContainer.classList.add('invalid');
                        setTimeout(() => groupContainer.classList.remove('invalid'), 3000);
                    }
                });
            }
            
            // Validation for step 3 - ensure at least one goal is selected
            if (currentStep.id === 'step-3') {
                const goalCheckboxes = currentStep.querySelectorAll('input[name="goals[]"]');
                let goalSelected = false;
                goalCheckboxes.forEach(cb => {
                    if (cb.checked) goalSelected = true;
                });
                
                if (!goalSelected) {
                    isValid = false;
                    const checkboxGroup = currentStep.querySelector('.checkbox-group');
                    checkboxGroup.classList.add('invalid');
                    setTimeout(() => checkboxGroup.classList.remove('invalid'), 3000);
                }
            }
            
            if (!isValid) return;
            
            // Move to next step
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = btn.closest('.form-step');
            const prevStep = currentStep.previousElementSibling;
            
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
        });
    });

    // Limit checkbox selection to 3
    const goalCheckboxes = document.querySelectorAll('input[name="goals[]"]');
    goalCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const checkedCount = document.querySelectorAll('input[name="goals[]"]:checked').length;
            if (checkedCount > 3) {
                checkbox.checked = false;
                alert('Please select a maximum of 3 goals');
            }
        });
    });

    // Form submission and training plan generation
    profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show results section with loading state
        resultsSection.classList.remove('hide');
        planContainer.classList.add('hide');
        trainingActions.classList.add('hide');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Gather form data
        const formData = {
            name: document.getElementById('player-name').value,
            age: document.getElementById('player-age').value,
            position: document.getElementById('player-position').value,
            experience: document.getElementById('experience-level').value,
            skills: {
                shooting: parseInt(document.querySelector('input[name="shooting"]:checked').value),
                ballhandling: parseInt(document.querySelector('input[name="ballhandling"]:checked').value),
                passing: parseInt(document.querySelector('input[name="passing"]:checked').value),
                defense: parseInt(document.querySelector('input[name="defense"]:checked').value),
                conditioning: parseInt(document.querySelector('input[name="conditioning"]:checked').value)
            },
            goals: Array.from(document.querySelectorAll('input[name="goals[]"]:checked')).map(cb => cb.value),
            frequency: document.getElementById('training-frequency').value,
            sessionLength: document.getElementById('session-length').value
        };
        
        // Generate training plan with a delay to simulate processing
        setTimeout(() => {
            generateTrainingPlan(formData);
            loadingSpinner.classList.add('hide');
            planContainer.classList.remove('hide');
            trainingActions.classList.remove('hide');
        }, 2000);
    });

    // Generate the training plan based on form data
    function generateTrainingPlan(data) {
        const planTemplate = document.getElementById('training-plan-template').content.cloneNode(true);
        
        // Fill in player info
        planTemplate.querySelector('.player-name').textContent = data.name;
        planTemplate.querySelector('.player-position').textContent = getPositionFullName(data.position);
        planTemplate.querySelector('.player-experience').textContent = capitalize(data.experience);
        
        // Fill in plan summary
        planTemplate.querySelector('.focus-areas').textContent = data.goals.map(goal => capitalize(goal)).join(', ');
        planTemplate.querySelector('.training-frequency').textContent = getTrainingFrequency(data.frequency);
        
        // Generate weekly schedule
        const weeklySchedule = planTemplate.querySelector('.weekly-schedule');
        const weeklyPlan = createWeeklyPlan(data);
        
        weeklyPlan.forEach(day => {
            const dayTemplate = document.getElementById('weekly-day-template').content.cloneNode(true);
            dayTemplate.querySelector('.day-title').textContent = day.day;
            
            const exercisesContainer = dayTemplate.querySelector('.day-exercises');
            
            if (day.focus === 'Rest') {
                const restDay = document.createElement('p');
                restDay.textContent = 'Rest and Recovery Day';
                restDay.style.fontStyle = 'italic';
                exercisesContainer.appendChild(restDay);
            } else {
                day.exercises.forEach(exercise => {
                    const exerciseTemplate = document.getElementById('exercise-template').content.cloneNode(true);
                    exerciseTemplate.querySelector('.exercise-title').textContent = exercise.title;
                    exerciseTemplate.querySelector('.exercise-duration').textContent = exercise.duration;
                    exerciseTemplate.querySelector('.exercise-description').textContent = exercise.description;
                    exercisesContainer.appendChild(exerciseTemplate);
                });
            }
            
            weeklySchedule.appendChild(dayTemplate);
        });
        
        // Generate skills chart
        planContainer.appendChild(planTemplate);
        generateSkillsChart(data.skills);
        
        // Add coaching notes
        const coachingNotes = generateCoachingNotes(data);
        planContainer.querySelector('.coaching-notes').textContent = coachingNotes;
    }

    // Generate coaching notes based on player profile
    function generateCoachingNotes(data) {
        // Find strengths and weaknesses
        const skills = Object.entries(data.skills);
        skills.sort((a, b) => b[1] - a[1]);
        
        const strengths = skills.filter(s => s[1] >= 4).map(s => capitalize(s[0]));
        const weaknesses = skills.filter(s => s[1] <= 2).map(s => capitalize(s[0]));
        
        let notes = `${data.name} is a ${data.experience} level ${getPositionFullName(data.position)} player. `;
        
        if (strengths.length > 0) {
            notes += `Showing strong abilities in ${strengths.join(', ')}. `;
        }
        
        if (weaknesses.length > 0) {
            notes += `Areas to focus on improving include ${weaknesses.join(', ')}. `;
        }
        
        // Position-specific advice
        switch (data.position) {
            case 'pg':
                notes += 'As a Point Guard, continue to develop court vision and leadership skills. Work on decision making at game speed and creating opportunities for teammates.';
                break;
            case 'sg':
                notes += 'As a Shooting Guard, focus on catch-and-shoot scenarios and moving without the ball. Develop a consistent shooting form from various ranges.';
                break;
            case 'sf':
                notes += 'As a Small Forward, develop versatility on both ends of the floor. Work on slashing to the basket and defending multiple positions.';
                break;
            case 'pf':
                notes += 'As a Power Forward, balance your interior and perimeter skills. Focus on rebounding positioning and finishing through contact.';
                break;
            case 'c':
                notes += 'As a Center, work on post footwork and protecting the rim. Develop reliable hook shots and positioning for rebounds.';
                break;
        }
        
        return notes;
    }

    // Generate skills chart
    function generateSkillsChart(skills) {
        const ctx = document.getElementById('skills-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Shooting', 'Ball Handling', 'Passing', 'Defense', 'Conditioning'],
                datasets: [{
                    label: 'Current Skill Level',
                    data: [
                        skills.shooting,
                        skills.ballhandling,
                        skills.passing,
                        skills.defense,
                        skills.conditioning
                    ],
                    backgroundColor: 'rgba(233, 72, 34, 0.2)',
                    borderColor: 'rgba(233, 72, 34, 1)',
                    pointBackgroundColor: 'rgba(233, 72, 34, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(233, 72, 34, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 14
                            }
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Action buttons
    printBtn.addEventListener('click', () => {
        window.print();
    });

    saveBtn.addEventListener('click', () => {
        alert('PDF download functionality would be implemented here in a production environment.');
        // In a real implementation, this would use a library like html2pdf.js
    });

    startOverBtn.addEventListener('click', () => {
        // Reset form and hide results
        profileForm.reset();
        formSteps.forEach((step, index) => {
            step.classList.toggle('active', index === 0);
        });
        resultsSection.classList.add('hide');
        builderSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Contact form
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Message sent! We\'ll get back to you soon.');
        contactForm.reset();
    });

    // Helper functions
    function getPositionFullName(pos) {
        const positions = {
            'pg': 'Point Guard',
            'sg': 'Shooting Guard',
            'sf': 'Small Forward',
            'pf': 'Power Forward',
            'c': 'Center'
        };
        return positions[pos] || pos;
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getTrainingFrequency(freq) {
        const frequencies = {
            '2': '1-2 days per week',
            '3': '3-4 days per week',
            '5': '5+ days per week'
        };
        return frequencies[freq] || freq;
    }
});