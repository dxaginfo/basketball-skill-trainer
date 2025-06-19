// This file contains data structures for generating personalized training plans

/**
 * Creates a weekly training plan based on player data
 * @param {Object} playerData - The player's profile and preferences
 * @returns {Array} - Array of daily training plans
 */
function createWeeklyPlan(playerData) {
    // Determine number of training days per week
    let trainingDays = 3; // Default
    if (playerData.frequency === '2') trainingDays = 2;
    if (playerData.frequency === '3') trainingDays = 3;
    if (playerData.frequency === '5') trainingDays = 5;

    // Calculate session duration in minutes
    const sessionMinutes = parseInt(playerData.sessionLength);
    
    // Create weekly schedule based on training frequency
    const weeklySchedule = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Determine which days to train based on frequency
    let trainingDayIndices = [];
    
    switch(trainingDays) {
        case 2:
            trainingDayIndices = [0, 3]; // Monday, Thursday
            break;
        case 3:
            trainingDayIndices = [0, 2, 4]; // Monday, Wednesday, Friday
            break;
        case 5:
            trainingDayIndices = [0, 1, 2, 3, 4]; // Monday through Friday
            break;
        default:
            trainingDayIndices = [0, 2, 4]; // Default to 3 days
    }
    
    // Generate plan for each day of the week
    daysOfWeek.forEach((day, index) => {
        if (trainingDayIndices.includes(index)) {
            // Training day
            const dayPlan = createDayPlan(playerData, day, sessionMinutes);
            weeklySchedule.push(dayPlan);
        } else {
            // Rest day
            weeklySchedule.push({
                day: day,
                focus: 'Rest',
                exercises: []
            });
        }
    });
    
    return weeklySchedule;
}

/**
 * Creates a training plan for a specific day
 * @param {Object} playerData - The player's profile and preferences
 * @param {string} day - Day of the week
 * @param {number} duration - Session duration in minutes
 * @returns {Object} - Daily training plan
 */
function createDayPlan(playerData, day, duration) {
    // Determine focus areas based on goals and position
    const focusAreas = determineFocusAreas(playerData);
    
    // Assign focus areas to different days for variety
    let dayFocus = '';
    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
    
    // Rotate through focus areas for variety
    if (focusAreas.length > 0) {
        dayFocus = focusAreas[dayIndex % focusAreas.length];
    } else {
        // Default focuses if none selected
        const defaultFocuses = ['shooting', 'ballhandling', 'conditioning'];
        dayFocus = defaultFocuses[dayIndex % defaultFocuses.length];
    }
    
    // Create exercises for this day's focus
    const exercises = createExercises(playerData, dayFocus, duration);
    
    return {
        day: day,
        focus: capitalize(dayFocus),
        exercises: exercises
    };
}

/**
 * Determines focus areas based on player goals and skill levels
 * @param {Object} playerData - The player's profile
 * @returns {Array} - Array of focus areas
 */
function determineFocusAreas(playerData) {
    // Start with the player's selected goals
    const focusAreas = [...playerData.goals];
    
    // Add any weak areas that aren't already in goals
    const weakSkills = Object.entries(playerData.skills)
        .filter(([skill, rating]) => rating <= 2)
        .map(([skill]) => skill);
    
    weakSkills.forEach(skill => {
        if (!focusAreas.includes(skill)) {
            focusAreas.push(skill);
        }
    });
    
    // Add position-specific focus areas
    switch (playerData.position) {
        case 'pg':
            if (!focusAreas.includes('ballhandling')) focusAreas.push('ballhandling');
            if (!focusAreas.includes('passing')) focusAreas.push('passing');
            break;
        case 'sg':
            if (!focusAreas.includes('shooting')) focusAreas.push('shooting');
            break;
        case 'sf':
            if (!focusAreas.includes('agility')) focusAreas.push('agility');
            break;
        case 'pf':
        case 'c':
            if (!focusAreas.includes('strength')) focusAreas.push('strength');
            break;
    }
    
    return focusAreas;
}

/**
 * Creates exercises for a specific training focus
 * @param {Object} playerData - The player's profile
 * @param {string} focus - Training focus area
 * @param {number} duration - Session duration in minutes
 * @returns {Array} - Array of exercises
 */
function createExercises(playerData, focus, duration) {
    // Get exercises from the database based on focus area and skill level
    let exercises = [];
    
    // Determine how many exercises to include based on session duration
    const numExercises = Math.floor(duration / 15); // Approximately 15 minutes per exercise
    
    // Distribute session time: warmup (15%), main exercises (70%), cooldown (15%)
    exercises.push({
        title: 'Dynamic Warm-up',
        duration: '10-15 minutes',
        description: 'Light jogging, high knees, butt kicks, lateral shuffles, arm circles, and dynamic stretching.'
    });
    
    // Add main exercises based on focus area
    const mainExercises = getExercisesByFocus(focus, playerData.experience, playerData.position);
    for (let i = 0; i < Math.min(numExercises - 2, mainExercises.length); i++) {
        exercises.push(mainExercises[i]);
    }
    
    // Add cooldown
    exercises.push({
        title: 'Cool Down',
        duration: '10 minutes',
        description: 'Light shooting, stretching, and foam rolling to prevent injury and aid recovery.'
    });
    
    return exercises;
}

/**
 * Gets exercises based on focus area, experience level, and position
 * @param {string} focus - Focus area
 * @param {string} experience - Experience level
 * @param {string} position - Player position
 * @returns {Array} - Array of exercises
 */
function getExercisesByFocus(focus, experience, position) {
    // Database of exercises organized by focus area
    const exerciseDatabase = {
        shooting: {
            beginner: [
                {
                    title: 'Form Shooting',
                    duration: '15 minutes',
                    description: 'Practice proper shooting technique from close range, focusing on elbow alignment, follow-through, and balance.'
                },
                {
                    title: 'Spot Shooting',
                    duration: '15 minutes',
                    description: 'Shoot from 5 different spots around the key, 10 shots per spot.'
                },
                {
                    title: 'Free Throws',
                    duration: '10 minutes',
                    description: 'Practice free throws, focusing on consistent routine and form. Shoot 5 sets of 10.'
                }
            ],
            intermediate: [
                {
                    title: 'Catch and Shoot',
                    duration: '15 minutes',
                    description: 'Practice catching passes and quickly setting up for shots from mid-range and 3-point distances.'
                },
                {
                    title: '5-Spot Shooting',
                    duration: '15 minutes',
                    description: 'Shoot from 5 spots on the 3-point line, 10 shots per spot. Track makes and aim for improvement.'
                },
                {
                    title: 'Pull-Up Jumpers',
                    duration: '15 minutes',
                    description: 'Practice dribbling into pull-up jump shots from various angles and distances.'
                },
                {
                    title: 'Free Throws Under Fatigue',
                    duration: '10 minutes',
                    description: 'Perform a sprint, then shoot 2 free throws. Repeat 10 times to simulate game conditions.'
                }
            ],
            advanced: [
                {
                    title: 'Game-Speed Shooting',
                    duration: '20 minutes',
                    description: 'Full-speed shooting drills that simulate game situations, including shots off screens, after cuts, and with defensive pressure.'
                },
                {
                    title: 'Shot Creation Workout',
                    duration: '15 minutes',
                    description: 'Practice creating space for shots using step-backs, side-steps, and other advanced footwork.'
                },
                {
                    title: '100 Three-Pointer Challenge',
                    duration: '20 minutes',
                    description: 'Shoot 100 three-pointers from various spots, tracking makes and time to completion. Aim for at least 60% accuracy.'
                },
                {
                    title: 'Pressure Free Throws',
                    duration: '10 minutes',
                    description: 'Assign consequences for missed free throws (like defensive slides) to simulate pressure situations.'
                }
            ]
        },
        ballhandling: {
            beginner: [
                {
                    title: 'Stationary Dribbling',
                    duration: '15 minutes',
                    description: 'Practice basic dribbling with both hands: crossovers, between legs, and behind the back while stationary.'
                },
                {
                    title: 'Figure 8 Dribbling',
                    duration: '10 minutes',
                    description: 'Dribble the ball in a figure 8 pattern around and between your legs.'
                },
                {
                    title: 'Walking Dribble Series',
                    duration: '15 minutes',
                    description: 'Practice dribbling while walking, using various moves and both hands.'
                }
            ],
            intermediate: [
                {
                    title: '2-Ball Dribbling',
                    duration: '15 minutes',
                    description: 'Dribble two basketballs simultaneously, alternating heights and patterns.'
                },
                {
                    title: 'Cone Dribbling',
                    duration: '15 minutes',
                    description: 'Set up cones and practice dribbling around them with various moves and change of direction.'
                },
                {
                    title: 'Speed Dribbling',
                    duration: '10 minutes',
                    description: 'High-speed dribbling up and down the court while maintaining control.'
                },
                {
                    title: 'Reaction Dribbling',
                    duration: '15 minutes',
                    description: 'Have a partner call out moves or directions and react quickly while maintaining dribble.'
                }
            ],
            advanced: [
                {
                    title: 'Pressure Dribbling',
                    duration: '15 minutes',
                    description: 'Practice dribbling with defensive pressure or using resistance bands.'
                },
                {
                    title: 'Complex Combo Moves',
                    duration: '20 minutes',
                    description: 'String together multiple dribble moves into combinations that create space from defenders.'
                },
                {
                    title: 'Blindfolded Dribbling',
                    duration: '10 minutes',
                    description: 'Practice dribbling with limited or no visual cues to develop touch and feel.'
                },
                {
                    title: 'Game Situation Handling',
                    duration: '15 minutes',
                    description: 'Simulate specific game situations requiring advanced ball handling, such as breaking full-court pressure or navigating double teams.'
                }
            ]
        },
        passing: {
            beginner: [
                {
                    title: 'Wall Passing',
                    duration: '15 minutes',
                    description: 'Practice chest, bounce, and overhead passes against a wall, focusing on proper form and accuracy.'
                },
                {
                    title: 'Partner Passing',
                    duration: '15 minutes',
                    description: 'With a partner, practice various passes while stationary.'
                }
            ],
            intermediate: [
                {
                    title: 'Moving Passing Drills',
                    duration: '15 minutes',
                    description: 'Practice passing while moving, including give-and-go passes and passing off the dribble.'
                },
                {
                    title: '3-Man Weave',
                    duration: '15 minutes',
                    description: 'Classic 3-player drill involving continuous passing and movement up and down the court.'
                },
                {
                    title: 'No-Look Passing',
                    duration: '10 minutes',
                    description: 'Practice deceptive passes by looking away from your target while delivering accurate passes.'
                }
            ],
            advanced: [
                {
                    title: 'Pressure Passing',
                    duration: '15 minutes',
                    description: 'Practice making accurate passes against defensive pressure in confined spaces.'
                },
                {
                    title: 'Pick & Roll Passing',
                    duration: '15 minutes',
                    description: 'Work on all passing options out of the pick & roll, including pocket passes, skip passes, and lobs.'
                },
                {
                    title: 'Full-Court Transition Passing',
                    duration: '20 minutes',
                    description: 'Practice leading passes in transition, hitting teammates in stride for easy baskets.'
                }
            ]
        },
        defense: {
            beginner: [
                {
                    title: 'Defensive Stance & Slides',
                    duration: '15 minutes',
                    description: 'Practice proper defensive stance and lateral movement with defensive slides.'
                },
                {
                    title: 'Close-Out Drills',
                    duration: '15 minutes',
                    description: 'Practice approaching a shooter with proper technique to prevent both the shot and drive.'
                }
            ],
            intermediate: [
                {
                    title: 'Shell Defense Drill',
                    duration: '20 minutes',
                    description: 'Work on team defense concepts including help defense, rotations, and communication.'
                },
                {
                    title: 'Mirror Drills',
                    duration: '15 minutes',
                    description: 'With a partner, mirror their movements while maintaining proper defensive position.'
                },
                {
                    title: 'Charge/Block Recognition',
                    duration: '10 minutes',
                    description: 'Practice recognizing and positioning for taking charges vs. vertical contesting.'
                }
            ],
            advanced: [
                {
                    title: 'Pick & Roll Defense',
                    duration: '20 minutes',
                    description: 'Practice various techniques for defending pick and roll actions, including switching, hedging, and ice defense.'
                },
                {
                    title: 'Recovery Drills',
                    duration: '15 minutes',
                    description: 'Work on recovering after helping, including closing out under control and contesting shots.'
                },
                {
                    title: 'Advanced Defensive Footwork',
                    duration: '15 minutes',
                    description: 'Practice complex defensive movements including drop steps, pivots, and change of direction.'
                }
            ]
        },
        conditioning: {
            beginner: [
                {
                    title: 'Line Touches',
                    duration: '15 minutes',
                    description: 'Sprint back and forth between basketball court lines (baseline, free throw, half-court, opposite free throw, opposite baseline).'
                },
                {
                    title: 'Jump Rope',
                    duration: '10 minutes',
                    description: 'Basic jump rope intervals to improve footwork and conditioning.'
                }
            ],
            intermediate: [
                {
                    title: 'Suicide Sprints',
                    duration: '15 minutes',
                    description: 'Classic basketball conditioning drill with progressive sprinting distances.'
                },
                {
                    title: 'Defensive Slide Conditioning',
                    duration: '15 minutes',
                    description: 'Continuous defensive slides between cones or court markings.'
                },
                {
                    title: 'Full-Court Layups',
                    duration: '10 minutes',
                    description: 'Continuously sprint for layups at both ends of the court.'
                }
            ],
            advanced: [
                {
                    title: 'Timed Full-Court Transition',
                    duration: '20 minutes',
                    description: 'High-intensity full-court transitions with dribbling, passing, and shooting elements.'
                },
                {
                    title: 'Interval Training',
                    duration: '20 minutes',
                    description: 'Alternating high-intensity basketball movements with short recovery periods.'
                },
                {
                    title: 'Game Simulation Conditioning',
                    duration: '15 minutes',
                    description: 'Full-speed drills that combine skills with conditioning in game-like scenarios.'
                }
            ]
        },
        strength: {
            beginner: [
                {
                    title: 'Bodyweight Circuit',
                    duration: '20 minutes',
                    description: 'Circuit of push-ups, squats, lunges, and planks to build basic strength.'
                },
                {
                    title: 'Medicine Ball Work',
                    duration: '15 minutes',
                    description: 'Basic medicine ball exercises to develop core and upper body strength.'
                }
            ],
            intermediate: [
                {
                    title: 'Resistance Band Training',
                    duration: '20 minutes',
                    description: 'Basketball-specific movements using resistance bands to build functional strength.'
                },
                {
                    title: 'Dumbbell Workout',
                    duration: '20 minutes',
                    description: 'Compound exercises with dumbbells including squats, lunges, rows, and presses.'
                },
                {
                    title: 'Core Circuit',
                    duration: '15 minutes',
                    description: 'Advanced core exercises to develop rotational power and stability.'
                }
            ],
            advanced: [
                {
                    title: 'Plyometric Training',
                    duration: '20 minutes',
                    description: 'Box jumps, depth jumps, and other explosive exercises to develop power.'
                },
                {
                    title: 'Olympic Lift Variations',
                    duration: '25 minutes',
                    description: 'Modified clean and jerk, snatches, and other explosive lifts to develop total body power.'
                },
                {
                    title: 'Basketball-Specific Resistance Training',
                    duration: '20 minutes',
                    description: 'Resistance exercises that mimic basketball movements for sport-specific strength.'
                }
            ]
        },
        agility: {
            beginner: [
                {
                    title: 'Ladder Drills',
                    duration: '15 minutes',
                    description: 'Basic footwork patterns using an agility ladder to develop quick feet.'
                },
                {
                    title: 'Cone Patterns',
                    duration: '15 minutes',
                    description: 'Simple cone drills focusing on changing direction and acceleration/deceleration.'
                }
            ],
            intermediate: [
                {
                    title: 'T-Drill',
                    duration: '15 minutes',
                    description: 'Classic T-shaped agility drill combining forward sprinting, lateral movement, and backpedaling.'
                },
                {
                    title: 'Defensive Reaction Drills',
                    duration: '15 minutes',
                    description: 'React to visual cues to move in different directions, simulating defensive reactions.'
                },
                {
                    title: 'Lane Agility Drill',
                    duration: '15 minutes',
                    description: 'NBA combine drill that tests ability to change directions while running, backpedaling, and sliding.'
                }
            ],
            advanced: [
                {
                    title: 'Reactive Agility Training',
                    duration: '20 minutes',
                    description: 'Unpredictable drills requiring reaction to various stimuli, simulating game situations.'
                },
                {
                    title: 'Multi-directional Speed Drill',
                    duration: '20 minutes',
                    description: 'Complex patterns requiring rapid direction changes at full speed.'
                },
                {
                    title: 'Game Situation Movement',
                    duration: '15 minutes',
                    description: 'Simulated game scenarios requiring specific movement patterns at game speed.'
                }
            ]
        },
        iq: {
            beginner: [
                {
                    title: 'Basic Play Recognition',
                    duration: '20 minutes',
                    description: 'Study and walk through common basketball plays and understand positioning.'
                },
                {
                    title: 'Rule Education',
                    duration: '15 minutes',
                    description: 'Review basketball rules and how they impact game strategy.'
                }
            ],
            intermediate: [
                {
                    title: 'Film Study',
                    duration: '25 minutes',
                    description: 'Analyze game footage to recognize patterns, strengths, and weaknesses.'
                },
                {
                    title: 'Decision Making Drills',
                    duration: '20 minutes',
                    description: 'Situational drills that force quick decisions based on defensive reactions.'
                },
                {
                    title: 'Playbook Review',
                    duration: '15 minutes',
                    description: 'Study team plays and options, understanding the reads and progressions.'
                }
            ],
            advanced: [
                {
                    title: 'Advanced Scouting Techniques',
                    duration: '25 minutes',
                    description: 'Learn how to break down opponent tendencies and adjust game plans accordingly.'
                },
                {
                    title: 'Game Situation Simulation',
                    duration: '20 minutes',
                    description: 'Practice decision-making in specific game situations (end of quarter, late game, etc.).'
                },
                {
                    title: 'Position-Specific Strategy',
                    duration: '20 minutes',
                    description: 'Deep dive into advanced strategies specific to your position.'
                }
            ]
        }
    };
    
    // Get exercises for the specified focus, experience level, and position
    let exercises = [];
    
    if (exerciseDatabase[focus] && exerciseDatabase[focus][experience]) {
        exercises = [...exerciseDatabase[focus][experience]];
        
        // Add position-specific exercise if available
        // This would be expanded in a real application with more tailored exercises
        if (position === 'pg' && focus === 'ballhandling') {
            exercises.push({
                title: 'Point Guard Specific Drill',
                duration: '15 minutes',
                description: 'Practice running the offense, including pick and roll reads and transition decision making.'
            });
        } else if (position === 'sg' && focus === 'shooting') {
            exercises.push({
                title: 'Shooting Guard Specific Drill',
                duration: '15 minutes',
                description: 'Practice coming off screens and quick catch-and-shoot scenarios from various spots on the court.'
            });
        } else if ((position === 'pf' || position === 'c') && focus === 'strength') {
            exercises.push({
                title: 'Post Player Specific Drill',
                duration: '15 minutes',
                description: 'Focus on post moves, rebounding position, and finishing through contact.'
            });
        }
    }
    
    // If no exercises found, provide generic ones
    if (exercises.length === 0) {
        exercises = [
            {
                title: `General ${capitalize(focus)} Training`,
                duration: '30 minutes',
                description: `Basic exercises to improve ${focus} skills appropriate for your level.`
            },
            {
                title: 'Skill Application',
                duration: '15 minutes',
                description: 'Apply skills in simulated game situations.'
            }
        ];
    }
    
    return exercises;
}

/**
 * Capitalize the first letter of a string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}