$(document).ready(function() {
    
    // Mobile menu toggle
    $('.mobile-menu-btn').click(function() {
        $('header nav ul').toggleClass('show');
    });

    
    // Sample tasks data
    let tasks = [
        {
            id: 1,
            title: 'Complete project proposal',
            description: 'Finish writing the project proposal document and send it to the team for review.',
            dueDate: '2023-06-15',
            priority: 'high',
            category: 'work',
            status: 'pending',
            createdAt: new Date()
        },
        {
            id: 2,
            title: 'Buy groceries',
            description: 'Milk, eggs, bread, fruits, and vegetables for the week.',
            dueDate: '2023-06-10',
            priority: 'medium',
            category: 'shopping',
            status: 'pending',
            createdAt: new Date()
        },
        {
            id: 3,
            title: 'Schedule dentist appointment',
            description: 'Call Dr. Smith\'s office to schedule a routine checkup.',
            dueDate: '2023-06-20',
            priority: 'low',
            category: 'personal',
            status: 'completed',
            createdAt: new Date()
        }
    ];

    
    // View toggle functionality
    $('.view-option').click(function() {
        $('.view-option').removeClass('active');
        $(this).addClass('active');
        const view = $(this).data('view');
        $('.tasks-container').removeClass('list-view grid-view').addClass(view + '-view');
    });

    
    // Form submission for new task
    $('#task-form').submit(function(e) {
        e.preventDefault();
        
        const newTask = {
            id: Date.now(),
            title: $('#task-title').val().trim(),
            description: $('#task-description').val().trim(),
            dueDate: $('#task-due-date').val(),
            priority: $('#task-priority').val(),
            category: $('#task-category').val(),
            status: 'pending',
            createdAt: new Date()
        };

        if (newTask.title) {
            tasks.push(newTask);
            renderTasks();
            $('#task-form')[0].reset();
            showNotification('Task added successfully!');
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
                
                renderTasks();
                showNotification('Task status updated!');
            }
        });

        $('.delete-task').click(function() {
            const taskId = parseInt($(this).data('id'));
            tasks = tasks.filter(task => task.id !== taskId);
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
                
                // Remove the task from the array
                tasks = tasks.filter(t => t.id !== taskId);
                
                // Scroll to the form
                $('html, body').animate({
                    scrollTop: $('.task-creation').offset().top
                }, 500);
                
                showNotification('Task loaded for editing!');
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
});
