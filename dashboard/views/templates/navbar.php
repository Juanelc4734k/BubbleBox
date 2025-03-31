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
                <div class="input-group input-group-dynamic bg-white bg-opacity-10 rounded-pill shadow-sm w-100" style="min-width: 280px; max-width: 450px;">
                    <button class="btn m-1 btn-sm btn-outline-primary dropdown-toggle rounded-start-pill border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="searchTypeBtn">
                        <i class="fas fa-filter me-1 opacity-8 d-none d-sm-inline"></i>Usuarios
                    </button>
                    <ul class="dropdown-menu shadow-lg border-0" id="searchTypeDropdown">
                        <li><a class="dropdown-item active" href="#" data-search-type="usuarios"><i class="fas fa-user me-2 text-primary"></i>Usuarios</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" data-search-type="publicaciones"><i class="fas fa-image me-2 text-info"></i>Publicaciones</a></li>
                        <li><a class="dropdown-item" href="#" data-search-type="comentarios"><i class="fas fa-comment me-2 text-success"></i>Comentarios</a></li>
                        <li><a class="dropdown-item" href="#" data-search-type="reels"><i class="fas fa-video me-2 text-warning"></i>Reels</a></li>
                        <li><a class="dropdown-item" href="#" data-search-type="comunidades"><i class="fas fa-users me-2 text-danger"></i>Comunidades</a></li>
                    </ul>
                    <input type="text" class="form-control form-control-sm border-0 ps-2" id="userSearchInput" placeholder="Buscar..." autocomplete="off">
                    <span class="input-group-text bg-transparent border-0 rounded-end-pill">
                        <i class="fas fa-search text-primary" aria-hidden="true"></i>
                    </span>
                    <div id="searchResults" class="position-absolute bg-white shadow-lg rounded-3 w-100 mt-1 d-none"
                        style="top: 100%; left: 0; right: 0; z-index: 1000; max-height: 350px; overflow-y: auto;">
                    </div>
                </div>
            </div>
            <ul class="navbar-nav justify-content-end">
                <li class="nav-item d-flex align-items-center me-2">
                    <a href="perfil.php" class="nav-link text-white font-weight-bold px-0">
                        <i class="fa fa-user me-sm-1"></i>
                        <span class="d-none d-sm-inline">
                        <?php
                            // Get user ID from session
                            $userId = isset($payload['userId']) ? $payload['userId'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);

                            if ($userId) {
                                // Make API request to get user profile
                                $userProfileUrl = USERS_API . '/perfil/' . $userId;
                                $curl = curl_init($userProfileUrl);
                                curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                                curl_setopt($curl, CURLOPT_HTTPHEADER, [
                                    'Authorization: Bearer ' . ($_SESSION["admin_token"] ?? ""),
                                    'Content-Type: application/json'
                                ]);

                                $response = curl_exec($curl);
                                $userData = json_decode($response, true);
                                curl_close($curl);

                                if ($userData && isset($userData['username'])) {
                                    echo htmlspecialchars($userData['username']);
                                } elseif (isset($_SESSION['user_name'])) {
                                    echo htmlspecialchars($_SESSION['user_name']);
                                } else {
                                    echo "Admin";
                                }
                            } else {
                                echo "Admin";
                            }
                            ?>
                        </span>
                    </a>
                </li>
                <li class="nav-item d-flex align-items-center">
                    <a href="../../includes/logout.php" class="nav-link text-white font-weight-bold px-0">
                        <i class="fas fa-sign-out-alt me-sm-1"></i>
                        <span class="d-none d-sm-inline">Logout</span>
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
        const searchTypeBtn = document.getElementById('searchTypeBtn');
        const searchTypeDropdown = document.getElementById('searchTypeDropdown');
        let searchTimeout;
        let currentSearchType = 'usuarios';

        // Set up search type dropdown
        searchTypeDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const searchType = this.getAttribute('data-search-type');
                currentSearchType = searchType;

                // Update button text
                searchTypeBtn.textContent = this.textContent;

                // Update active state
                searchTypeDropdown.querySelectorAll('.dropdown-item').forEach(el => {
                    el.classList.remove('active');
                });
                this.classList.add('active');

                // Update placeholder based on search type
                updatePlaceholder();

                // Clear current search
                searchInput.value = '';
                searchResults.classList.add('d-none');
                searchResults.innerHTML = '';
            });
        });

        function updatePlaceholder() {
            switch (currentSearchType) {
                case 'usuarios':
                    searchInput.placeholder = 'Buscar por ID, nombre o username...';
                    break;
                case 'publicaciones':
                    searchInput.placeholder = 'Buscar por ID de publicación...';
                    break;
                case 'comentarios':
                    searchInput.placeholder = 'Buscar por ID de comentario...';
                    break;
                case 'reels':
                    searchInput.placeholder = 'Buscar por ID de reel...';
                    break;
                case 'comunidades':
                    searchInput.placeholder = 'Buscar por ID de comunidad...';
                    break;
                default:
                    searchInput.placeholder = 'Buscar...';
            }
        }

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();

            if (query.length === 0) {
                searchResults.classList.add('d-none');
                searchResults.innerHTML = '';
                return;
            }

            const isIdOnlySearch = ['usuarios', 'publicaciones', 'comentarios', 'reels', 'comunidades'].includes(currentSearchType);
            if (query.length < 2 && !isIdOnlySearch) {
                searchResults.classList.add('d-none');
                searchResults.innerHTML = '';
                return;
            }

            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });

        // Hide search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target) &&
                !searchTypeBtn.contains(e.target) && !searchTypeDropdown.contains(e.target)) {
                searchResults.classList.add('d-none');
            }
        });

        function performSearch(query) {
            switch (currentSearchType) {
                case 'usuarios':
                    fetchUsers(query);
                    break;
                case 'publicaciones':
                    fetchPosts(query);
                    break;
                case 'comentarios':
                    fetchComments(query);
                    break;
                case 'reels':
                    fetchReels(query);
                    break;
                case 'comunidades':
                    fetchCommunities(query);
                    break;
            }
        }

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
                    displayUserResults(data);
                })
                .catch(error => {
                    console.error('Error searching users:', error);
                    displayError('Error al buscar usuarios');
                });
        }

        function fetchPosts(query) {
            fetch(`<?php echo API_BASE_URL; ?>/posts/buscar?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                 // Debug log
                if (data && Array.isArray(data)) {
                    displayPostResults(data);
                } else {
                    displayError('No se encontraron resultados');
                }
            })
            .catch(error => {
                console.error('Error searching posts:', error);
                displayError('Error al buscar publicaciones');
            });
        }

        function fetchComments(query) {
            fetch(`<?php echo API_BASE_URL; ?>/comments/buscar?query=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    displayCommentResults(data);
                })
                .catch(error => {
                    console.error('Error searching comments:', error);
                    displayError('Error al buscar comentarios');
                });
        }

        function fetchReels(query) {
            fetch(`<?php echo API_BASE_URL; ?>/reels/buscar?query=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    displayReelResults(data);
                })
                .catch(error => {
                    console.error('Error searching reels:', error);
                    displayError('Error al buscar reels');
                });
        }

        function fetchCommunities(query) {
            fetch(`<?php echo API_BASE_URL; ?>/communities/buscar?query=${encodeURIComponent(query)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    displayCommunityResults(data);
                })
                .catch(error => {
                    console.error('Error searching communities:', error);
                    displayError('Error al buscar comunidades');
                });
        }

        function displayError(message) {
            searchResults.innerHTML = '';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'p-3 text-danger';
            errorDiv.textContent = message;
            searchResults.appendChild(errorDiv);
            searchResults.classList.remove('d-none');
        }

        function displayUserResults(users) {
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
                                <p class="text-xs text-muted mb-0">ID: ${user.id} | ${user.email}</p>
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

        function displayPostResults(posts) {
            searchResults.innerHTML = '';

            if (!posts || posts.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'p-3 text-muted';
                noResults.textContent = 'No se encontraron publicaciones';
                searchResults.appendChild(noResults);
                searchResults.classList.remove('d-none');
                return;
            }

            posts.forEach(post => {
                const resultItem = document.createElement('div');
                resultItem.className = 'p-2 border-bottom search-result-item';
                resultItem.style.cursor = 'pointer';

                const title = post.titulo ? post.titulo.substring(0, 30) + (post.titulo.length > 30 ? '...' : '') : 'Sin título';

                resultItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <div class="icon icon-shape icon-sm bg-gradient-info shadow text-center me-2">
                            <i class="fas fa-image text-white"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 text-sm">Publicación #${post.id}</h6>
                            <p class="text-xs text-muted mb-0">${title}</p>
                        </div>
                    </div>
                `;

                resultItem.addEventListener('click', () => {
                    window.location.href = `post-detail.php?id=${post.id}`;
                });

                searchResults.appendChild(resultItem);
            });

            searchResults.classList.remove('d-none');
        }

        function displayCommentResults(comments) {
            searchResults.innerHTML = '';

            if (!comments || comments.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'p-3 text-muted';
                noResults.textContent = 'No se encontraron comentarios';
                searchResults.appendChild(noResults);
            } else {
                comments.forEach(comment => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'p-2 border-bottom search-result-item';
                    resultItem.style.cursor = 'pointer';

                    resultItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <div class="icon icon-shape icon-sm bg-gradient-success shadow text-center me-2">
                                <i class="fas fa-comment text-white"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 text-sm">Comentario #${comment.id}</h6>
                                <p class="text-xs text-muted mb-0">En contenido #${comment.id_contenido || 'N/A'}</p>
                            </div>
                        </div>
                    `;

                    resultItem.addEventListener('click', () => {
                        const contentType = comment.tipo_contenido === 'reel' ? 'reel' : 'post';
                        const contentIdField = comment.tipo_contenido === 'reel' ? 'id_contenido' : 'id_publicacion';
                        window.location.href = `comment-detail.php?id=${comment.id}&type=${contentType}&content_id=${comment[contentIdField] || comment.id_contenido}`;
                    });

                    searchResults.appendChild(resultItem);
                });
            }

            searchResults.classList.remove('d-none');
        }

        function displayReelResults(reels) {
            searchResults.innerHTML = '';

            if (!reels || reels.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'p-3 text-muted';
                noResults.textContent = 'No se encontraron reels';
                searchResults.appendChild(noResults);
            } else {
                reels.forEach(reel => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'p-2 border-bottom search-result-item';
                    resultItem.style.cursor = 'pointer';

                    resultItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <div class="icon icon-shape icon-sm bg-gradient-warning shadow text-center me-2">
                                <i class="fas fa-video text-white"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 text-sm">Reel #${reel.id}</h6>
                                <p class="text-xs text-muted mb-0">Por: ${reel.username || 'Usuario'}</p>
                            </div>
                        </div>
                    `;

                    resultItem.addEventListener('click', () => {
                        window.location.href = `reel-detail.php?id=${reel.id}`;
                    });

                    searchResults.appendChild(resultItem);
                });
            }

            searchResults.classList.remove('d-none');
        }

        function displayCommunityResults(communities) {
            searchResults.innerHTML = '';

            if (!communities || communities.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'p-3 text-muted';
                noResults.textContent = 'No se encontraron comunidades';
                searchResults.appendChild(noResults);
            } else {
                communities.forEach(community => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'p-2 border-bottom search-result-item';
                    resultItem.style.cursor = 'pointer';

                    resultItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <div class="icon icon-shape icon-sm bg-gradient-danger shadow text-center me-2">
                                <i class="fas fa-users text-white"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 text-sm">Comunidad #${community.id}</h6>
                                <p class="text-xs text-muted mb-0">${community.nombre || 'Sin nombre'}</p>
                                <p class="text-xs text-muted mb-0">Creador: ${community.username || 0} con ID: ${community.id_creador}</p>
                            </div>
                        </div>
                    `;

                    resultItem.addEventListener('click', () => {
                        window.location.href = `community-detail.php?id=${community.id}`;
                    });

                    searchResults.appendChild(resultItem);
                });
            }

            searchResults.classList.remove('d-none');
        }

        // Initialize placeholder text
        updatePlaceholder();
    });
</script>