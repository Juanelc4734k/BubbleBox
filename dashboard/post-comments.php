<?php
session_start();
require_once 'includes/config.php';
require_once 'includes/functions.php';

// Check if user is authenticated
if (!isset($_SESSION['admin_token'])) {
    header('Location: http://localhost:5173/login');
    exit();
}

// Get token data
$token_parts = explode('.', $_SESSION['admin_token']);
$payload = json_decode(base64_decode($token_parts[1]), true);

// Verify admin role
if (!isset($payload['rol']) || $payload['rol'] !== 'administrador') {
    header('Location: http://localhost:5173/login');
    exit();
}

// Check if post ID is provided
if (!isset($_GET['post_id']) || empty($_GET['post_id'])) {
    header('Location: index.php');
    exit();
}

$postId = intval($_GET['post_id']);
$currentPage = 'Comentarios de Publicación';

// Get post details
$post = callAPI('GET', POSTS_API . '/obtener/' . $postId, null);

// If post not found, redirect to index
if (!$post || isset($post['error'])) {
    header('Location: index.php?error=post_not_found');
    exit();
}

// Get comments for this post
$comments = callAPI('GET', COMMENTS_API . '/publicaciones/' . $postId . '/comentarios', null);

// Fetch user details for each comment and sort by date
if (!empty($comments) && !isset($comments['error'])) {
    foreach ($comments as &$comment) {
        if (isset($comment['id_usuario'])) {
            $userData = callAPI('GET', USERS_API . '/usuario/' . $comment['id_usuario'], null);
            if ($userData && !isset($userData['error'])) {
                $comment['username'] = $userData['username'] ?? null;
                $comment['avatar_usuario'] = $userData['avatar'] ?? null;
            }
        }
    }
    unset($comment); // Break the reference

    // Sort comments by date (newest first)
    usort($comments, function($a, $b) {
        return strtotime($b['fecha_creacion']) - strtotime($a['fecha_creacion']);
    });
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
                        <h6>Comentarios de la Publicación #<?php echo $postId; ?></h6>
                        <a href="post-detail.php?id=<?php echo $postId; ?>" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-arrow-left me-2"></i>Volver a la Publicación
                        </a>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-12">
                                <div class="card bg-gradient-light">
                                    <div class="card-body p-3">
                                        <div class="d-flex">
                                            <div class="avatar avatar-xl bg-gradient-primary rounded-circle">
                                                <i class="fas fa-file-alt text-white position-absolute top-50 start-50 translate-middle"></i>
                                            </div>
                                            <div class="ms-3">
                                                <h5 class="mb-0"><?php echo htmlspecialchars($post['titulo']); ?></h5>
                                                <p class="text-sm mb-0 text-truncate" style="max-width: 500px;">
                                                    <?php echo htmlspecialchars(substr($post['contenido'], 0, 100)) . (strlen($post['contenido']) > 100 ? '...' : ''); ?>
                                                </p>
                                                <p class="text-xs text-muted mb-0">
                                                    <i class="far fa-calendar-alt me-1"></i>
                                                    <?php echo date('d/m/Y H:i:s', strtotime($post['fecha_creacion'])); ?>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <?php if (empty($comments) || isset($comments['error'])): ?>
                            <div class="alert alert-info" role="alert">
                                Esta publicación no tiene comentarios.
                            </div>
                        <?php else: ?>
                            <div class="table-responsive">
                                <table class="table align-items-center mb-0">
                                    <thead>
                                        <tr>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Usuario</th>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Comentario</th>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php foreach ($comments as $comment): ?>
                                            <tr>
                                                <td>
                                                    <div class="d-flex px-2 py-1">
                                                        <?php 
                                                        $avatarUrl = isset($comment['avatar_usuario']) && $comment['avatar_usuario'] 
                                                            ? 'http://localhost:3009' . $comment['avatar_usuario'] 
                                                            : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnEIMyG8RRFZ7fqoANeSGL6uYoJug8PiXIKg&s';
                                                        
                                                        $username = isset($comment['username']) && $comment['username'] 
                                                            ? $comment['username'] 
                                                            : 'Usuario ' . $comment['id_usuario'];
                                                        ?>
                                                        <div>
                                                            <img src="<?php echo $avatarUrl; ?>" class="avatar avatar-sm me-3" alt="user avatar">
                                                        </div>
                                                        <div class="d-flex flex-column justify-content-center">
                                                            <h6 class="mb-0 text-sm"><?php echo htmlspecialchars($username); ?></h6>
                                                            <p class="text-xs text-secondary mb-0">ID: <?php echo $comment['id_usuario']; ?></p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p class="text-sm mb-0"><?php echo htmlspecialchars($comment['contenido']); ?></p>
                                                </td>
                                                <td>
                                                    <span class="text-xs font-weight-bold">
                                                        <?php echo date('d/m/Y H:i', strtotime($comment['fecha_creacion'])); ?>
                                                    </span>
                                                </td>
                                                <td>
                                                    <button type="button" class="btn btn-sm btn-danger delete-comment" data-id="<?php echo $comment['id']; ?>">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        <?php endforeach; ?>
                                    </tbody>
                                </table>
                            </div>
                        <?php endif; ?>
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
    let commentIdToDelete = null;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteCommentModal'));
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-comment').forEach(button => {
        button.addEventListener('click', function() {
            commentIdToDelete = this.getAttribute('data-id');
            deleteModal.show();
        });
    });
    
    // Handle delete confirmation
    document.getElementById('confirmDeleteComment').addEventListener('click', function() {
        if (commentIdToDelete) {
            // Send delete request to API
            fetch(`<?php echo COMMENTS_API; ?>/eliminar/${commentIdToDelete}`, {
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
                    // Show success message
                    const successAlert = document.createElement('div class="alert alert-success" role="alert');
                    successAlert.className = 'alert alert-success';
                    successAlert.innerHTML = 'Comentario eliminado correctamente';
                    document.querySelector('.card-body').prepend(successAlert);
                    
                    // Reload the page after a short delay
                    setTimeout(() => {
                        window.location.reload();
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
                // Even if there's an error in processing the response,
                // the deletion might have been successful
                deleteModal.hide();
                window.location.reload();
            });
        }
    });
});
</script>

<?php
include 'views/templates/configurations.php';
include 'views/templates/footer.php';
?>