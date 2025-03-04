
<!-- Navbar -->
<nav class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl " id="navbarBlur" data-scroll="false">
        <div class="container-fluid py-1 px-3">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                    <li class="breadcrumb-item text-sm"><a class="opacity-5 text-white" href="index.php">Dashboard</a></li>
                    <?php if (isset($currentPage) && $currentPage != 'dashboard'): ?>
                        <li class="breadcrumb-item text-sm text-white" aria-current="page"><?php echo ucfirst($currentPage); ?></li>
                    <?php endif; ?>
                </ol>
                <h6 class="font-weight-bolder text-white mb-0"><?php echo isset($currentPage) ? ucfirst($currentPage) : 'Dashboard'; ?></h6>
            </nav>
            <div class="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
                <div class="ms-md-auto pe-md-3 d-flex align-items-center">
                    <div class="input-group" style="min-width: 160px;">
                        <span class="input-group-text text-body"><i class="fas fa-search" aria-hidden="true"></i></span>
                        <input type="text" class="form-control" id="userSearchInput" placeholder="Buscar usuarios..." autocomplete="off">
                        <div id="searchResults" class="position-absolute bg-white shadow rounded w-100 mt-1 d-none" 
                            style="top: 100%; left: 0; right: 0; z-index: 1000; max-height: 300px; overflow-y: auto;">
                        </div>
                    </div>
                </div>
                <ul class="navbar-nav justify-content-end">
                    <li class="nav-item d-flex align-items-center me-3">
                        <a href="javascript:;" class="nav-link text-white font-weight-bold px-0">
                            <i class="fa fa-user me-sm-1"></i>
                            <span class="d-sm-inline d-none">
                                <?php 
                                    if (isset($_SESSION['user_name'])) {
                                        echo htmlspecialchars($_SESSION['user_name']);
                                    } else {
                                        // Try to get user details if function exists
                                        if (function_exists('getUserDetails')) {
                                            echo htmlspecialchars(getUserDetails());
                                        } else {
                                            echo "Admin";
                                        }
                                    }
                                ?>
                            </span>
                        </a>
                    </li>
                    <li class="nav-item d-flex align-items-center">
                        <a href="logout.php" class="nav-link text-white font-weight-bold px-0">
                            <i class="fas fa-sign-out-alt me-sm-1"></i>
                            <span class="d-sm-inline d-none">Logout</span>
                        </a>
                    </li>
                    <li class="nav-item d-xl-none ps-3 d-flex align-items-center">
                        <a href="javascript:;" class="nav-link text-white p-0" id="iconNavbarSidenav">
                            <div class="sidenav-toggler-inner">
                            <i class="sidenav-toggler-line bg-white"></i>
                            <i class="sidenav-toggler-line bg-white"></i>
                            <i class="sidenav-toggler-line bg-white"></i>
                            </div>
                        </a>
                    </li>
                    <li class="nav-item px-3 d-flex align-items-center">
                        <a href="javascript:;" class="nav-link text-white p-0">
                            <i class="fa fa-cog fixed-plugin-button-nav cursor-pointer"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <!-- End Navbar -->

        <!-- End Navbar -->
    
        <script>
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.getElementById('userSearchInput');
        const searchResults = document.getElementById('searchResults');
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                searchResults.classList.add('d-none');
                searchResults.innerHTML = '';
                return;
            }
            
            searchTimeout = setTimeout(() => {
                fetchUsers(query);
            }, 300);
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add('d-none');
            }
        });
        
        function fetchUsers(query) {
            fetch(`<?php echo API_BASE_URL; ?>/users/buscar-usuarios/${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                console.error('Error searching users:', error);
            });
        }
        
        function displayResults(users) {
            searchResults.innerHTML = '';
            
            if (!users || users.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'p-3 text-muted';
                noResults.textContent = 'No se encontraron usuarios';
                searchResults.appendChild(noResults);
            } else {
                users.forEach(user => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'p-2 border-bottom search-result-item';
                    resultItem.style.cursor = 'pointer';
                    
                    const userAvatar = user.avatar ? 
                        `<img src="http://localhost:3009${user.avatar}" class="avatar avatar-sm rounded-circle me-2" alt="${user.username}">` : 
                        `<div class="avatar avatar-sm bg-gradient-primary rounded-circle text-white me-2 d-flex align-items-center justify-content-center">${user.username.charAt(0).toUpperCase()}</div>`;
                    
                    resultItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            ${userAvatar}
                            <div>
                                <h6 class="mb-0 text-sm">${user.username}</h6>
                                <p class="text-xs text-muted mb-0">${user.email}</p>
                            </div>
                        </div>
                    `;
                    
                    resultItem.addEventListener('click', () => {
                        window.location.href = `user-detail.php?id=${user.id}`;
                    });
                    
                    searchResults.appendChild(resultItem);
                });
            }
            
            searchResults.classList.remove('d-none');
        }
    });
    </script>