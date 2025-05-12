// Add this at the beginning of your document ready function
$(document).ready(function() {
    
    // Mobile menu toggle
    $('.mobile-menu-btn').click(function() {
        $('header nav ul').toggleClass('show');
    });
    
    
    // Function to get tasks from localStorage
    function getTasksFromStorage() {
        const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        // Ensure dates are properly parsed if stored as strings
        return storedTasks.map(task => ({
            ...task,
            createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
            // dueDate is stored as a string, so no need to parse here unless for date objects
        }));
    }

    // Function to save tasks to localStorage
    function saveTasksToStorage(tasksToSave) {
        localStorage.setItem('tasks', JSON.stringify(tasksToSave));
    }

    let tasks = getTasksFromStorage(); // Load tasks from localStorage

    // If localStorage is empty, initialize with some default data (optional)
    if (tasks.length === 0) {
        tasks = [
            {
                id: Date.now() + 101, // Unique ID
                title: 'Complete project proposal',
                description: 'Finish writing the project proposal document and send it to the team for review.',
                dueDate: '2024-07-15', // Example future date
                priority: 'high',
                category: 'work',
                status: 'pending',
                createdAt: new Date()
            },
            {
                id: Date.now() + 102,
                title: 'Buy groceries',
                description: 'Milk, eggs, bread, fruits, and vegetables for the week.',
                dueDate: '2024-07-10', // Example future date
                priority: 'medium',
                category: 'shopping',
                status: 'pending',
                createdAt: new Date()
            },
            {
                id: Date.now() + 103,
                title: 'Schedule dentist appointment',
                description: 'Call Dr. Smith\'s office to schedule a routine checkup.',
                dueDate: '2024-07-20', // Example future date
                priority: 'low',
                category: 'personal',
                status: 'completed',
                createdAt: new Date()
            }
        ];
        saveTasksToStorage(tasks); // Save initial data if localStorage was empty
    }
    
    
    // View toggle functionality
    $('.view-option').click(function() {
        $('.view-option').removeClass('active');
        $(this).addClass('active');
        const view = $(this).data('view');
        $('.tasks-container').removeClass('list-view grid-view').addClass(view + '-view');
    });
    
    
    // Form submission for new or edited task
    $('#task-form').submit(function(e) {
        e.preventDefault();
        
        const taskTitle = $('#task-title').val().trim();
        if (!taskTitle) {
            showNotification('Task title cannot be empty!', 'error'); // Assuming showNotification can take a type
            return;
        }

        const taskData = {
            title: taskTitle,
            description: $('#task-description').val().trim(),
            dueDate: $('#task-due-date').val(),
            priority: $('#task-priority').val(),
            category: $('#task-category').val(),
        };

        const editingTaskIdString = $('#edit-task-id').val();
        const editingTaskId = editingTaskIdString ? parseInt(editingTaskIdString) : null;

        if (editingTaskId) {
            // Editing existing task
            const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex], // Retain original id, createdAt, status
                    ...taskData, // Update with new form data
                };
                showNotification('Task updated successfully!');
            }
            $('#edit-task-id').remove(); // Clean up hidden input
        } else {
            // Adding new task
            const newTask = {
                ...taskData,
                id: Date.now(),
                status: 'pending', // Default status for new tasks
                createdAt: new Date()
            };
            tasks.push(newTask);
            showNotification('Task added successfully!');
        }
    
        saveTasksToStorage(tasks);
        renderTasks();
        $('#task-form')[0].reset();
        // Ensure edit-task-id is removed if it was added and form is reset
        if ($('#edit-task-id').length) {
            $('#edit-task-id').remove();
        }
    });
    
    
    // Filter tasks
    $('#apply-filters').click(function() {
        renderTasks();
    });
    
    
    // Clear filters
    $('#clear-filters').click(function() {
        $('#filter-priority, #filter-status, #filter-category').val('all');
        renderTasks();
    });
    
    
    // Render tasks based on filters
    function renderTasks() {
        const priorityFilter = $('#filter-priority').val();
        const statusFilter = $('#filter-status').val();
        const categoryFilter = $('#filter-category').val();
    
        let filteredTasks = tasks.filter(task => {
            return (priorityFilter === 'all' || task.priority === priorityFilter) &&
                   (statusFilter === 'all' || task.status === statusFilter) &&
                   (categoryFilter === 'all' || task.category === categoryFilter);
        });
    
        $('.task-count').text(filteredTasks.length + ' task' + (filteredTasks.length !== 1 ? 's' : ''));
        
        // Update overview statistics
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = tasks.filter(task => task.status === 'pending').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueTasks = tasks.filter(task => {
            if (!task.dueDate || task.status === 'completed') return false;
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
        }).length;
        
        // Update the overview panel
        $('#total-tasks').text(totalTasks);
        $('#completed-tasks').text(completedTasks);
        $('#pending-tasks').text(pendingTasks);
        $('#overdue-tasks').text(overdueTasks);
        
        // Update the tasks chart if it exists
        updateTasksChart(completedTasks, pendingTasks, overdueTasks);
        
        const tasksContainer = $('.tasks-container');
        tasksContainer.empty();
    
        if (filteredTasks.length === 0) {
            tasksContainer.html(`
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No tasks found. Add a new task to get started!</p>
                </div>
            `);
            return;
        }
    
        filteredTasks.forEach(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let dueDateClass = '';
            if (dueDate) {
                dueDate.setHours(0, 0, 0, 0);
                if (dueDate < today && task.status !== 'completed') {
                    dueDateClass = 'overdue';
                }
            }
    
            const dueDateFormatted = dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date';
            
            const taskElement = $(`
                <div class="task-card ${task.priority}-priority" data-id="${task.id}">
                    <div class="task-header">
                        <h3 class="task-title">${task.title}</h3>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    <p class="task-description">${task.description || 'No description'}</p>
                                       <div class="task-footer">
                        <div>
                            <span class="task-due-date ${dueDateClass}">
                                <i class="far fa-calendar-alt"></i> ${dueDateFormatted}
                            </span>
                            <span class="task-category">${task.category}</span>
                        </div>
                        <div class="task-actions">
                            <button class="task-status ${task.status.replace(' ', '-')}" data-id="${task.id}">
                                ${task.status}
                            </button>
                            <button class="edit-task" data-id="${task.id}" aria-label="Edit task">
                                <i class="far fa-edit"></i>
                            </button>
                            <button class="delete-task" data-id="${task.id}" aria-label="Delete task">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `);
    
            tasksContainer.append(taskElement);
        });
    
        // Add event listeners to dynamically created elements
        $('.task-status').click(function() {
            const taskId = parseInt($(this).data('id'));
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                if (task.status === 'pending') {
                    task.status = 'in-progress';
                } else if (task.status === 'in-progress') {
                    task.status = 'completed';
                } else {
                    task.status = 'pending';
                }
                
                saveTasksToStorage(tasks); // Save tasks to localStorage
                renderTasks();
                showNotification('Task status updated!');
            }
        });
    
        $('.delete-task').click(function() {
            const taskId = parseInt($(this).data('id'));
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasksToStorage(tasks); // Save tasks to localStorage
            renderTasks();
            showNotification('Task deleted!');
        });
    
        $('.edit-task').click(function() {
            const taskId = parseInt($(this).data('id'));
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                $('#task-title').val(task.title);
                $('#task-description').val(task.description);
                $('#task-due-date').val(task.dueDate);
                $('#task-priority').val(task.priority);
                $('#task-category').val(task.category);
                
                // Add a hidden input to the form to store the ID of the task being edited
                // Remove existing one first to prevent duplicates if user clicks edit multiple times
                if ($('#edit-task-id').length) {
                    $('#edit-task-id').remove();
                }
                $('#task-form').append(`<input type="hidden" id="edit-task-id" value="${task.id}">`);
                
                // Scroll to the form and focus the title
                $('html, body').animate({
                    scrollTop: $('.task-creation').offset().top
                }, 500, function() {
                    $('#task-title').focus();
                });
                
                showNotification('Editing task. Make changes and submit form.');
            }
        });
    }
    
    // Show notification
    function showNotification(message) {
        const notification = $(`
            <div class="notification">
                ${message}
            </div>
        `);
        
        $('body').append(notification);
        notification.css({
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 'var(--border-radius)',
            boxShadow: 'var(--box-shadow)',
            zIndex: '1000',
            transform: 'translateY(100px)',
            opacity: '0',
            transition: 'all 0.3s ease'
        });
        
        setTimeout(() => {
            notification.css({
                transform: 'translateY(0)',
                opacity: '1'
            });
        }, 10);
        
        setTimeout(() => {
            notification.css({
                transform: 'translateY(100px)',
                opacity: '0'
            });
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Initial render
    renderTasks();
    
    // Check if there's a project filter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectFilter = urlParams.get('project');
    
    if (projectFilter) {
        // If there's a project filter, we should show only tasks for that project
        // This would require adding a project field to your tasks
        // For now, we'll just show a notification
        showNotification(`Showing tasks for Project ID: ${projectFilter}`);
        
        // In a real implementation, you would filter tasks by project
        // tasks = tasks.filter(task => task.projectId === parseInt(projectFilter));
    }
});


    function updateTasksChart(completed, pending, overdue) {
        const ctx = document.getElementById('tasks-chart');
        
        // Check if chart already exists and destroy it
        if (window.tasksChart) {
            window.tasksChart.destroy();
        }
        
        // Create new chart
        window.tasksChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'Pending', 'Overdue'],
                datasets: [{
                    data: [completed, pending, overdue],
                    backgroundColor: [
                        '#4CAF50',  // Green for completed
                        '#FFC107',  // Amber for pending
                        '#F44336'   // Red for overdue
                    ],
                    borderColor: [
                        '#388E3C',  // Darker green border
                        '#FF8F00',  // Darker amber border
                        '#D32F2F'   // Darker red border
                    ],
                    borderWidth: 1,
                    hoverBackgroundColor: [
                        '#81C784',  // Lighter green on hover
                        '#FFD54F',  // Lighter amber on hover
                        '#E57373'   // Lighter red on hover
                    ],
                    hoverBorderColor: [
                        '#2E7D32',  // Even darker green border on hover
                        '#FF6F00',  // Even darker amber border on hover
                        '#C62828'   // Even darker red border on hover
                    ],
                    hoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 20,
                            usePointStyle: true,
                            boxWidth: 10
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleFont: {
                            size: 16
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
