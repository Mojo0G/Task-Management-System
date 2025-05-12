$(document).ready(function() {
    // Mobile menu toggle (if not already in a global script.js and linked)
    // $('.mobile-menu-btn').click(function() {
    //     $('header nav ul').toggleClass('show');
    // });

    // Function to get projects from localStorage
    function getProjectsFromStorage() {
        return JSON.parse(localStorage.getItem('projects')) || [];
    }

    // Function to save projects to localStorage
    function saveProjectsToStorage(projects) {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    let projectsData = getProjectsFromStorage(); // Load projects from localStorage

    // If localStorage is empty, initialize with some default data (optional)
    if (projectsData.length === 0) {
        projectsData = [
            {
                id: 'proj' + Date.now() + '1', // Unique ID
                name: 'Website Redesign',
                status: 'in-progress',
                priority: 'high',
                description: 'Complete overhaul of the company website with new branding and features.',
                startDate: '2024-01-15',
                endDate: '2024-04-30',
                progress: 65,
                team: 'Alpha'
            },
            {
                id: 'proj' + Date.now() + '2',
                name: 'Mobile App Development',
                status: 'pending',
                priority: 'medium',
                description: 'Develop a new cross-platform mobile application for task management.',
                startDate: '2024-03-01',
                endDate: '2024-09-30',
                progress: 10,
                team: 'Bravo'
            },
            {
                id: 'proj' + Date.now() + '3',
                name: 'Marketing Campaign Q2',
                status: 'completed',
                priority: 'low',
                description: 'Plan and execute the marketing campaign for the second quarter.',
                startDate: '2024-04-01',
                endDate: '2024-06-30',
                progress: 100,
                team: 'Charlie'
            }
        ];
        saveProjectsToStorage(projectsData); // Save initial data if localStorage was empty
    }

    const $projectModal = $('#project-modal');
    const $projectModalForm = $('#project-modal-form');
    const $projectModalTitle = $('#project-modal-title');

    // Function to show/hide modal
    function showProjectModal(editMode = false, project = null) {
        $projectModalForm[0].reset();
        $('#project-modal-id').val('');
        if (editMode && project) {
            $projectModalTitle.text('Edit Project');
            $('#project-modal-id').val(project.id);
            $('#project-modal-name').val(project.name);
            $('#project-modal-description').val(project.description);
            $('#project-modal-start-date').val(project.startDate);
            $('#project-modal-end-date').val(project.endDate);
            $('#project-modal-priority').val(project.priority);
            $('#project-modal-status').val(project.status);
        } else {
            $projectModalTitle.text('New Project');
        }
        $projectModal.show();
    }

    function hideProjectModal() {
        $projectModal.hide();
    }

    // Handle "New Project" button click
    $('#add-project-btn').click(function() {
        showProjectModal();
    });

    // Close modal
    $('#close-project-modal').click(hideProjectModal);
    $(window).click(function(event) {
        if (event.target == $projectModal[0]) {
            hideProjectModal();
        }
    });

    // Handle Project Form Submission
    $projectModalForm.submit(function(e) {
        e.preventDefault();
        const projectId = $('#project-modal-id').val();
        const projectDetails = {
            name: $('#project-modal-name').val().trim(),
            description: $('#project-modal-description').val().trim(),
            startDate: $('#project-modal-start-date').val(),
            endDate: $('#project-modal-end-date').val(),
            priority: $('#project-modal-priority').val(),
            status: $('#project-modal-status').val(),
            // Assuming progress and team are managed elsewhere or default
            progress: projectId ? projectsData.find(p => p.id === projectId).progress : 0,
            team: projectId ? projectsData.find(p => p.id === projectId).team : 'Default Team'
        };

        if (!projectDetails.name) {
            alert('Project name is required.');
            return;
        }

        if (projectId) { // Editing existing project
            const index = projectsData.findIndex(p => p.id === projectId);
            if (index !== -1) {
                projectsData[index] = { ...projectsData[index], ...projectDetails };
            }
        } else { // Adding new project
            projectDetails.id = 'proj' + Date.now(); // Simple unique ID
            projectsData.push(projectDetails);
        }
        saveProjectsToStorage(projectsData); // Save changes to localStorage
        renderProjects(projectsData);
        hideProjectModal();
        // showNotification(projectId ? 'Project updated!' : 'Project added!'); // If you have a notification function
    });


    // Placeholder for rendering projects - you'd fetch data and loop through it
    function renderProjects(projectsToRender) {
        const container = $('#projects-grid-container');
        container.empty(); // Clear existing projects

        if (!projectsToRender || projectsToRender.length === 0) {
            container.html(`
                <div class="empty-state" style="text-align: center; padding: 20px; color: #777;">
                    <i class="fas fa-folder-open fa-3x" style="margin-bottom: 10px;"></i>
                    <p>No projects found. Click "New Project" to add one!</p>
                </div>
            `);
            return;
        }

        projectsToRender.forEach(project => {
            const projectCard = `
                <div class="project-card ${project.priority}-priority" data-id="${project.id}">
                    <div class="project-card-header">
                        <h3 class="project-card-title">${project.name}</h3>
                        <span class="project-status ${project.status.replace(' ', '-')}">${project.status.replace('-', ' ')}</span>
                    </div>
                    <p class="project-card-description">${project.description || 'No description'}</p>
                    <div class="project-card-dates">
                        <span>Start: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</span>
                        <span>End: ${project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div class="project-progress">
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${project.progress || 0}%;"></div>
                        </div>
                        <span class="progress-text">${project.progress || 0}% Complete</span>
                    </div>
                    <div class="project-card-footer">
                        <span class="project-team">Team: ${project.team || 'N/A'}</span>
                        <div class="project-actions">
                            <button class="btn-icon view-project-tasks" aria-label="View Tasks" data-id="${project.id}"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon edit-project" aria-label="Edit Project" data-id="${project.id}"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-icon-danger delete-project" aria-label="Delete Project" data-id="${project.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            `;
            container.append(projectCard);
        });
    }

    // Initial render
    renderProjects(projectsData);

    // Event delegation for action buttons on dynamically added cards
    $('#projects-grid-container').on('click', '.view-project-tasks', function() {
        const projectId = $(this).data('id');
        const project = projectsData.find(p => p.id === projectId);
        alert('View tasks for project: ' + (project ? project.name : 'Unknown'));
        // Implement actual task viewing logic, e.g., redirect or show tasks in a section/modal
    });

    $('#projects-grid-container').on('click', '.edit-project', function() {
        const projectId = $(this).data('id');
        const project = projectsData.find(p => p.id === projectId);
        if (project) {
            showProjectModal(true, project);
        } else {
            alert('Error: Project not found for editing.');
        }
    });

    $('#projects-grid-container').on('click', '.delete-project', function() {
        const projectId = $(this).data('id');
        const project = projectsData.find(p => p.id === projectId);
        if (project && confirm('Are you sure you want to delete project: ' + project.name + '?')) {
            projectsData = projectsData.filter(p => p.id !== projectId);
            saveProjectsToStorage(projectsData); // Save changes to localStorage
            renderProjects(projectsData);
            // showNotification('Project deleted!'); // If you have a notification function
            alert('Project deleted.');
        }
    });

});