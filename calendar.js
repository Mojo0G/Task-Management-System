document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendar-grid');
    const projectListContainer = document.getElementById('calendar-project-list');
    const monthYearElement = document.getElementById('current-month-year'); // Assuming this exists
    const prevMonthButton = document.getElementById('prev-month'); // Assuming this exists
    const nextMonthButton = document.getElementById('next-month'); // Assuming this exists

    let currentDate = new Date(); // Your existing way of managing current month/year
    let selectedProjectId = null;
    let projects = []; // To store loaded projects
    let tasks = []; // To store loaded tasks

    // --- Helper Functions (assuming these might be in script.js or similar) ---
    // Ensure these functions are available or implement them
    function getProjectsFromStorage() {
        return JSON.parse(localStorage.getItem('projects')) || [];
    }

    function getTasksFromStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }
    // --- End Helper Functions ---

    function loadData() {
        projects = getProjectsFromStorage();
        tasks = getTasksFromStorage();
    }

    function renderProjectsSidebar() {
        if (!projectListContainer) return;
        projectListContainer.innerHTML = ''; // Clear existing list

        if (projects.length === 0) {
            projectListContainer.innerHTML = '<p>No projects found.</p>';
            return;
        }

        projects.forEach(project => {
            const projectItem = document.createElement('div');
            projectItem.classList.add('project-item');
            projectItem.textContent = project.name;
            projectItem.dataset.projectId = project.id;

            if (project.id === selectedProjectId) {
                projectItem.classList.add('active');
            }

            projectItem.addEventListener('click', () => {
                if (selectedProjectId === project.id) {
                    // Deselect if clicking the same project again
                    selectedProjectId = null;
                } else {
                    selectedProjectId = project.id;
                }
                renderProjectsSidebar(); // Re-render sidebar to update active class

                // Navigate to project's start month if a project is selected
                if (selectedProjectId) {
                    const projectDetails = projects.find(p => p.id === selectedProjectId);
                    if (projectDetails && projectDetails.startDate) {
                        const projectStartDate = new Date(projectDetails.startDate);
                        currentDate = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), 1);
                    }
                } else {
                    // Optional: If deselected, maybe reset to current actual month or do nothing
                    // For now, it will stay on the last viewed month or project's month
                }

                renderCalendar(); // Re-render calendar with project selection and potentially new month
            });
            projectListContainer.appendChild(projectItem);
        });
    }

    function renderCalendar() {
        if (!calendarGrid || !monthYearElement) return;

        calendarGrid.innerHTML = ''; // Clear previous calendar
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        monthYearElement.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startingDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        // Add weekday headers (Sun, Mon, Tue...) - you might already have this
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('weekday');
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });


        // Add empty cells for days before the first of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('day', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        let selectedProjectDetails = null;
        let projectTasks = [];

        if (selectedProjectId) {
            selectedProjectDetails = projects.find(p => p.id === selectedProjectId);
            if (selectedProjectDetails) {
                projectTasks = tasks.filter(task => task.projectId === selectedProjectId && task.dueDate);
            }
        }

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('day');
            const dayNumberSpan = document.createElement('span');
            dayNumberSpan.textContent = day;
            dayCell.appendChild(dayNumberSpan);

            const cellDate = new Date(year, month, day);

            // Highlight project date range
            if (selectedProjectDetails && selectedProjectDetails.startDate && selectedProjectDetails.endDate) {
                const projectStartDate = new Date(selectedProjectDetails.startDate);
                const projectEndDate = new Date(selectedProjectDetails.endDate);
                // Normalize dates to ignore time component for comparison
                const normalizedCellDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                const normalizedProjectStart = new Date(projectStartDate.getFullYear(), projectStartDate.getMonth(), projectStartDate.getDate());
                const normalizedProjectEnd = new Date(projectEndDate.getFullYear(), projectEndDate.getMonth(), projectEndDate.getDate());


                if (normalizedCellDate >= normalizedProjectStart && normalizedCellDate <= normalizedProjectEnd) {
                    dayCell.classList.add('project-date-range');
                }
            }

            // Mark project task due dates
            if (projectTasks.length > 0) {
                projectTasks.forEach(task => {
                    const taskDueDate = new Date(task.dueDate);
                     // Normalize dates to ignore time component for comparison
                    const normalizedCellDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                    const normalizedTaskDueDate = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate());

                    if (normalizedCellDate.getTime() === normalizedTaskDueDate.getTime()) {
                        dayCell.classList.add('project-due-date');
                        // Optionally add title for hover effect
                        dayCell.title = (dayCell.title ? dayCell.title + '\n' : '') + `Due: ${task.title}`;
                    }
                });
            }
            
            // Highlight today's date (you might already have this)
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayCell.classList.add('today');
            }

            calendarGrid.appendChild(dayCell);
        }
    }

    // Event Listeners for month navigation
    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
    
    // Initial Load
    loadData();
    renderProjectsSidebar();
    renderCalendar();

    // Optional: Listen for storage changes if projects/tasks can be updated from other pages
    window.addEventListener('storage', (event) => {
        if (event.key === 'projects' || event.key === 'tasks') {
            loadData();
            renderProjectsSidebar(); // Update sidebar if projects changed
            renderCalendar(); // Re-render calendar as data might have changed
        }
    });
});