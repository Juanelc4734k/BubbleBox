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

// Check if comment ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: index.php');
    exit();
}

$commentId = intval($_GET['id']);
$currentPage = 'Detalle de Comentario';

// Check if content type and content ID are provided
$contentType = isset($_GET['type']) ? $_GET['type'] : null;
$contentId = isset($_GET['content_id']) ? intval($_GET['content_id']) : null;

// Get comment details based on content type
$comment = null;
if ($contentType === 'post' && $contentId) {
    // Get comments for post and find the specific one
    $comments = callAPI('GET', COMMENTS_API . '/publicaciones/' . $contentId . '/comentarios', null);
    if (!empty($comments) && !isset($comments['error'])) {
        foreach ($comments as $comm) {
            if (isset($comm['id']) && $comm['id'] == $commentId) {
                $comment = $comm;
                break;
            }
        }
    }
} elseif ($contentType === 'reel' && $contentId) {
    // Get comments for reel and find the specific one
    $comments = callAPI('GET', COMMENTS_API . '/reels/' . $contentId . '/comentarios', null);
    if (!empty($comments) && !isset($comments['error'])) {
        foreach ($comments as $comm) {
            if (isset($comm['id']) && $comm['id'] == $commentId) {
                $comment = $comm;
                break;
            }
        }
    }
} else {
    // Fallback to direct comment retrieval if content type is not specified
    $comment = callAPI('GET', COMMENTS_API . '/obtener/' . $commentId, null);
}

// If comment not found, redirect to index
if (!$comment || isset($comment['error'])) {
    header('Location: index.php?error=comment_not_found');
    exit();
}

// Get post details if this is a post comment
$post = null;
if ($contentType === 'post' && $contentId) {
    $post = callAPI('GET', POSTS_API . '/obtener/' . $contentId, null);
} elseif (isset($comment['tipo_contenido']) && $comment['tipo_contenido'] === 'post' && isset($comment['id_contenido'])) {
    $post = callAPI('GET', POSTS_API . '/obtener/' . $comment['id_contenido'], null);
} elseif (isset($comment['id_publicacion']) && $comment['id_publicacion']) {
    $post = callAPI('GET', POSTS_API . '/obtener/' . $comment['id_publicacion'], null);
}

// Get reel details if this is a reel comment
$reel = null;
if ($contentType === 'reel' && $contentId) {
    $reel = callAPI('GET', REELS_API . '/reel/' . $contentId, null);
} elseif (isset($comment['tipo_contenido']) && $comment['tipo_contenido'] === 'reel' && isset($comment['id_contenido'])) {
    $reel = callAPI('GET', REELS_API . '/reel/' . $comment['id_contenido'], null);
} elseif (isset($comment['id_reel']) && $comment['id_reel']) {
    $reel = callAPI('GET', REELS_API . '/reel/' . $comment['id_reel'], null);
}

// Get user details
$user = null;
if (isset($comment['id_usuario'])) {
    $user = callAPI('GET', USERS_API . '/usuario/' . $comment['id_usuario'], null);
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
                        <h6>Detalle de Comentario #<?php echo $commentId; ?></h6>
                        <div>
                            <?php if (isset($comment['id_publicacion']) && $comment['id_publicacion']): ?>
                                <a href="post-comments.php?post_id=<?php echo $comment['id_publicacion']; ?>" class="btn btn-sm btn-outline-info me-2">
                                    <i class="fas fa-comments me-1"></i>Ver Todos los Comentarios
                                </a>
                            <?php endif; ?>
                            <a href="index.php" class="btn btn-sm btn-outline-primary">
                                <i class="fas fa-arrow-left me-1"></i>Volver
                            </a>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Información del Comentario</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <h6 class="text-sm">Contenido:</h6>
                                            <p class="text-sm mb-2" style="white-space: pre-wrap;"><?php echo htmlspecialchars($comment['contenido']); ?></p>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <h6 class="text-sm">Fecha de Creación:</h6>
                                            <p class="text-sm mb-0">
                                                <i class="far fa-calendar-alt me-1"></i>
                                                <?php echo date('d/m/Y H:i:s', strtotime($comment['fecha_creacion'])); ?>
                                            </p>
                                        </div>
                                        
                                        <?php if (isset($comment['fecha_actualizacion'])): ?>
                                        <div class="mb-3">
                                            <h6 class="text-sm">Última Actualización:</h6>
                                            <p class="text-sm mb-0">
                                                <i class="fas fa-edit me-1"></i>
                                                <?php echo date('d/m/Y H:i:s', strtotime($comment['fecha_actualizacion'])); ?>
                                            </p>
                                        </div>
                                        <?php endif; ?>
                                        
                                        <div class="mb-3">
                                            <h6 class="text-sm">Tipo de Contenido:</h6>
                                            <?php if ($contentType === 'post' || (isset($comment['id_publicacion']) && $comment['id_publicacion'])): ?>
                                                <span class="badge bg-gradient-info">Publicación</span>
                                            <?php elseif ($contentType === 'reel' || (isset($comment['id_reel']) && $comment['id_reel']) || (isset($comment['tipo_contenido']) && $comment['tipo_contenido'] === 'reel')): ?>
                                                <span class="badge bg-gradient-warning">Reel</span>
                                            <?php else: ?>
                                                <span class="badge bg-gradient-secondary">Desconocido</span>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Autor del Comentario</h6>
                                    </div>
                                    <div class="card-body">
                                        <?php if ($user): ?>
                                        <div class="d-flex align-items-center mb-3">
                                            <?php 
                                            $avatarUrl = isset($user['avatar']) && $user['avatar'] 
                                                ? 'http://localhost:3009' . $user['avatar'] 
                                                : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                            ?>
                                            <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-md rounded-circle me-3" alt="user avatar">
                                            <div>
                                                <h6 class="mb-0"><?php echo htmlspecialchars($user['username'] ?? 'Usuario Desconocido'); ?></h6>
                                                <p class="text-xs text-muted mb-0">ID: <?php echo $comment['id_usuario']; ?></p>
                                                <a href="user-detail.php?id=<?php echo $comment['id_usuario']; ?>" class="btn btn-link text-info p-0 mt-1">
                                                    <i class="fas fa-user me-1"></i>Ver Perfil
                                                </a>
                                            </div>
                                        </div>
                                        <?php else: ?>
                                        <div class="alert alert-warning text-sm" role="alert">
                                            No se pudo obtener información del usuario con ID: <?php echo $comment['id_usuario']; ?>
                                        </div>
                                        <?php endif; ?>
                                        
                                        <hr class="horizontal dark my-3">
                                        
                                        <h6 class="text-sm mb-3">Contenido Relacionado:</h6>
                                        
                                        <?php if (($contentType === 'post' && $contentId && isset($post) && $post) || 
                                                 (isset($comment['tipo_contenido']) && $comment['tipo_contenido'] === 'post' && isset($post) && $post) || 
                                                 (isset($comment['id_publicacion']) && $comment['id_publicacion'] && isset($post) && $post)): ?>
                                            <div class="card bg-gradient-light mb-3">
                                                <div class="card-body p-3">
                                                    <div class="d-flex">
                                                        <div class="icon icon-shape icon-sm bg-gradient-info shadow text-center">
                                                            <i class="fas fa-image text-white opacity-10"></i>
                                                        </div>
                                                        <div class="ms-3">
                                                            <h6 class="mb-0 text-sm">Publicación #<?php echo $contentId ?? $comment['id_contenido'] ?? $comment['id_publicacion']; ?></h6>
                                                            <p class="text-xs mb-0"><?php echo isset($post['titulo']) ? htmlspecialchars(substr($post['titulo'], 0, 50)) . (strlen($post['titulo']) > 50 ? '...' : '') : 'Cargando...'; ?></p>
                                                            <a href="post-detail.php?id=<?php echo $contentId ?? $comment['id_contenido'] ?? $comment['id_publicacion']; ?>" class="text-info text-xs">
                                                                Ver publicación <i class="fas fa-arrow-right ms-1"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php elseif (isset($comment['tipo_contenido']) && $comment['tipo_contenido'] === 'reel' && isset($reel) && $reel): ?>
                                            <div class="card bg-gradient-light mb-3">
                                                <div class="card-body p-3">
                                                    <div class="d-flex">
                                                        <div class="icon icon-shape icon-sm bg-gradient-warning shadow text-center">
                                                            <i class="fas fa-video text-white opacity-10"></i>
                                                        </div>
                                                        <div class="ms-3">
                                                            <h6 class="mb-0 text-sm">Reel #<?php echo $comment['id_contenido']; ?></h6>
                                                            <p class="text-xs mb-0"><?php echo isset($reel['descripcion']) ? htmlspecialchars(substr($reel['descripcion'], 0, 50)) . (strlen($reel['descripcion']) > 50 ? '...' : '') : 'Sin descripción'; ?></p>
                                                            <a href="reel-detail.php?id=<?php echo $comment['id_contenido']; ?>" class="text-warning text-xs">
                                                                Ver reel <i class="fas fa-arrow-right ms-1"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php elseif (isset($comment['id_publicacion']) && $comment['id_publicacion'] && isset($post) && $post): ?>
                                            <div class="card bg-gradient-light mb-3">
                                                <div class="card-body p-3">
                                                    <div class="d-flex">
                                                        <div class="icon icon-shape icon-sm bg-gradient-info shadow text-center">
                                                            <i class="fas fa-image text-white opacity-10"></i>
                                                        </div>
                                                        <div class="ms-3">
                                                            <h6 class="mb-0 text-sm">Publicación #<?php echo $comment['id_publicacion']; ?></h6>
                                                            <p class="text-xs mb-0"><?php echo isset($post['titulo']) ? htmlspecialchars(substr($post['titulo'], 0, 50)) . (strlen($post['titulo']) > 50 ? '...' : '') : 'Cargando...'; ?></p>
                                                            <a href="post-detail.php?id=<?php echo $comment['id_publicacion']; ?>" class="text-info text-xs">
                                                                Ver publicación <i class="fas fa-arrow-right ms-1"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php elseif (isset($comment['id_reel']) && $comment['id_reel'] && isset($reel) && $reel): ?>
                                            <div class="card bg-gradient-light mb-3">
                                                <div class="card-body p-3">
                                                    <div class="d-flex">
                                                        <div class="icon icon-shape icon-sm bg-gradient-warning shadow text-center">
                                                            <i class="fas fa-video text-white opacity-10"></i>
                                                        </div>
                                                        <div class="ms-3">
                                                            <h6 class="mb-0 text-sm">Reel #<?php echo $comment['id_reel']; ?></h6>
                                                            <p class="text-xs mb-0"><?php echo isset($reel['descripcion']) ? htmlspecialchars(substr($reel['descripcion'], 0, 50)) . (strlen($reel['descripcion']) > 50 ? '...' : '') : 'Sin descripción'; ?></p>
                                                            <a href="reel-detail.php?id=<?php echo $comment['id_reel']; ?>" class="text-warning text-xs">
                                                                Ver reel <i class="fas fa-arrow-right ms-1"></i>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-secondary text-sm" role="alert">
                                                No se pudo obtener información del contenido relacionado.
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
                                        <div class="d-flex justify-content-start">
                                            <button type="button" class="btn btn-danger me-2" data-bs-toggle="modal" data-bs-target="#deleteCommentModal">
                                                <i class="fas fa-trash me-2"></i>Eliminar Comentario
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Delete Comment Modal -->
<div class="modal fade" id="deleteCommentModal" tabindex="-1" aria-labelledby="deleteCommentModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteCommentModalLabel">Confirmar Eliminación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteComment">Eliminar</button>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteCommentModal'));
    
    // Handle delete confirmation
    document.getElementById('confirmDeleteComment').addEventListener('click', function() {
        // Send delete request to API
        fetch(`<?php echo COMMENTS_API; ?>/eliminar/<?php echo $commentId; ?>`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Check if response status is in the 2xx range (success)
            if (response.ok) {
                deleteModal.hide();
                
                // Show success message and redirect
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success';
                successAlert.innerHTML = 'Comentario eliminado correctamente';
                document.querySelector('.card-body').prepend(successAlert);
                
                // Redirect after a short delay
                setTimeout(() => {
                    <?php if (isset($comment['id_publicacion']) && $comment['id_publicacion']): ?>
                        window.location.href = 'post-comments.php?post_id=<?php echo $comment['id_publicacion']; ?>';
                    <?php else: ?>
                        window.location.href = 'index.php';
                    <?php endif; ?>
                }, 1500);
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                deleteModal.hide();
                alert('Error al eliminar el comentario');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            deleteModal.hide();
            // Redirect anyway as the deletion might have been successful
            setTimeout(() => {
                window.location.href = 'index.php';
            }, 1500);
        });
    });
});
</script>

<?php
include 'views/templates/configurations.php';
include 'views/templates/footer.php';
?>