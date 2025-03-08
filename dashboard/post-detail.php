<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Check if user is authenticated
if (!isset($_SESSION['admin_token'])) {
    header('Location: http://localhost:5173/login');
    exit();
}

if (!isset($_SESSION['user_name']) && isset($_SESSION['user_id'])) {
    getUserDetails();
}

// Get token data
$token_parts = explode('.', $_SESSION['admin_token']);
$payload = json_decode(base64_decode($token_parts[1]), true);

// Verify admin role
if (!isset($payload['rol']) || $payload['rol'] !== 'administrador') {
    header('Location: http://localhost:5173/login');
    exit();
}

// User is authenticated and is an admin
$userId = $payload['userId'];
$userRole = $payload['rol'];

// Check if post ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: index.php');
    exit();
}

$postId = intval($_GET['id']);
$currentPage = 'Detalle de Publicación';

// Get post details
$post = callAPI('GET', POSTS_API . '/obtener/' . $postId, null);

// If post not found, redirect to index
if (!$post || isset($post['error'])) {
    header('Location: index.php?error=post_not_found');
    exit();
}

// Fetch user details if post has user ID but missing avatar or username
if (isset($post['id_usuario'])) {
    $userData = callAPI('GET', USERS_API . '/usuario/' . $post['id_usuario'], null);
    if ($userData && !isset($userData['error'])) {
        // Store user data in a variable that will be used in the template
        $user = $userData;
        
        // Also update post data for backward compatibility
        $post['avatar_usuario'] = $userData['avatar'] ?? null;
        $post['nombre_usuario'] = $userData['username'] ?? ($userData['nombre'] ?? 'Usuario Desconocido');
    } else {
        // Create a default user object if API call fails
        $user = [
            'avatar' => null,
            'username' => 'Usuario Desconocido'
        ];
    }
} else {
    // Create a default user object if no user ID
    $user = [
        'avatar' => null,
        'username' => 'Usuario Desconocido'
    ];
}

// Include header
include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">
    
    <?php include 'views/templates/navbar.php' ?>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
                        <h6>Detalle de Publicación #<?php echo $postId; ?></h6>
                        <a href="index.php" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-arrow-left me-2"></i>Volver
                        </a>
                    </div>
                    <div class="card-body">
                        <?php if ($post): ?>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header pb-0">
                                            <h6 class="mb-0">Información de la Publicación</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <h5 class="text-gradient text-primary mb-0"><?php echo htmlspecialchars($post['titulo']); ?></h5>
                                                <p class="text-sm text-muted mt-2">
                                                    <i class="far fa-calendar-alt me-1"></i>
                                                    <?php echo date('d/m/Y H:i:s', strtotime($post['fecha_creacion'])); ?>
                                                </p>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <h6 class="text-sm">Contenido:</h6>
                                                <p class="text-sm mb-2" style="white-space: pre-wrap;"><?php echo htmlspecialchars($post['contenido']); ?></p>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <h6 class="text-sm">Tipo:</h6>
                                                <span class="badge badge-sm <?php echo $post['es_comunidad'] ? 'bg-gradient-primary' : 'bg-gradient-success'; ?>">
                                                    <?php echo $post['es_comunidad'] ? 'Comunidad' : 'Personal'; ?>
                                                </span>
                                            </div>
                                            
                                            <?php if ($post['es_comunidad'] && isset($post['nombre_comunidad'])): ?>
                                            <div class="mb-3">
                                                <h6 class="text-sm">Comunidad:</h6>
                                                <p class="text-sm mb-0"><?php echo htmlspecialchars($post['nombre_comunidad']); ?></p>
                                            </div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card h-100">
                                        <div class="card-header pb-0">
                                            <h6 class="mb-0">Autor y Contenido Multimedia</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="d-flex align-items-center mb-3">
                                                <?php 
                                                $avatarUrl = isset($user['avatar']) && $user['avatar'] 
                                                    ? 'http://localhost:3009' . $user['avatar'] 
                                                    : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                                ?>
                                                <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-md rounded-circle me-3" alt="user avatar">
                                                <div>
                                                    <h6 class="mb-0"><?php echo htmlspecialchars($user['username'] ?? 'Usuario Desconocido'); ?></h6>
                                                    <p class="text-xs text-muted mb-0">ID: <?php echo $post['id_usuario']; ?></p>
                                                </div>
                                            </div>
                                            
                                            <?php if (isset($post['imagen']) && $post['imagen']): ?>
                                            <div class="text-center mt-4">
                                                <h6 class="text-sm mb-2">Imagen:</h6>
                                                <img src="http://localhost:3008/uploads/<?php echo $post['imagen']; ?>" 
                                                     class="img-fluid rounded shadow" 
                                                     alt="Post Image" 
                                                     style="max-height: 300px; object-fit: contain;">
                                            </div>
                                            <?php else: ?>
                                            <div class="text-center mt-4">
                                                <div class="alert alert-secondary text-sm" role="alert">
                                                    Esta publicación no contiene imágenes
                                                </div>
                                            </div>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="card">
                                        <div class="card-header pb-0">
                                            <h6 class="mb-0">Acciones</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="d-flex justify-content-between">
                                                <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#deleteModal">
                                                    <i class="fas fa-trash me-2"></i>Eliminar Publicación
                                                </button>
                                                
                                                <a href="post-comments.php?post_id=<?php echo $postId; ?>" class="btn btn-sm btn-info">
                                                    <i class="fas fa-comments me-2"></i>Ver Comentarios
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Delete Modal -->
                            <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
                                <div class="modal-dialog">
                                    <div class="modal-content">
                                        <div class="modal-header">
                                            <h5 class="modal-title" id="deleteModalLabel">Confirmar Eliminación</h5>
                                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                        </div>
                                        <div class="modal-body">
                                            ¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                            <button type="button" class="btn btn-danger" id="confirmDelete">Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                        <?php else: ?>
                            <div class="alert alert-warning" role="alert">
                                No se pudo encontrar la publicación solicitada.
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            // Send delete request to API
            fetch('<?php echo POSTS_API; ?>/eliminar/<?php echo $postId; ?>', {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    // Redirect to index on success
                    window.location.href = 'index.php?deleted=true';
                } else {
                    alert('Error al eliminar la publicación');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar la publicación');
            });
        });
    }
});
</script>

<?php
include 'views/templates/configurations.php';
include 'views/templates/footer.php';
?>