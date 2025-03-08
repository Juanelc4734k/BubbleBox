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

// Check if reel ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: index.php');
    exit();
}

$reelId = intval($_GET['id']);
$currentPage = 'Detalle de Reel';

// Get reel details
$reel = callAPI('GET', REELS_API . '/reel/' . $reelId, null);

// If reel not found, redirect to index
if (!$reel || isset($reel['error'])) {
    header('Location: index.php?error=reel_not_found');
    exit();
}

// Get user details (creator of the reel)
$user = null;
if (isset($reel['usuario_id'])) {
    $user = callAPI('GET', USERS_API . '/usuario/' . $reel['usuario_id'], null);
}

// Get comments for this reel
$comments = callAPI('GET', COMMENTS_API . '/reels/' . $reelId . '/comentarios', null);
if (isset($comments['error'])) {
    $comments = [];
}

$reactions = callAPI('GET', REACCIONES_API. '/reacciones-reel/'. $reelId, null);
if (isset($reactions['error'])) {
    $reactions = [];
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
                        <h6>Detalle de Reel #<?php echo $reelId; ?></h6>
                        <a href="index.php" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-arrow-left me-1"></i>Volver
                        </a>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Información del Reel</h6>
                                    </div>
                                    <div class="card-body">
                                        <?php if (isset($reel['video']) && $reel['video']): ?>
                                            <div class="mb-4 text-center">
                                                <div class="ratio ratio-16x9 mb-3">
                                                    <video controls class="rounded shadow-sm">
                                                        <source src="<?php echo 'http://localhost:3002/uploads/' . $reel['archivo_video']; ?>" type="video/mp4">
                                                        Tu navegador no soporta el elemento de video.
                                                    </video>
                                                </div>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-warning" role="alert">
                                                No se pudo cargar el video del reel.
                                            </div>
                                        <?php endif; ?>

                                        <div class="mb-3">
                                            <h6 class="text-sm">Descripción:</h6>
                                            <p class="text-sm mb-2" style="white-space: pre-wrap;"><?php echo isset($reel['descripcion']) ? htmlspecialchars($reel['descripcion']) : 'Sin descripción'; ?></p>
                                        </div>

                                        <div class="mb-3">
                                            <h6 class="text-sm">Fecha de Creación:</h6>
                                            <p class="text-sm mb-0">
                                                <i class="far fa-calendar-alt me-1"></i>
                                                <?php echo isset($reel['fecha_creacion']) ? date('d/m/Y H:i:s', strtotime($reel['fecha_creacion'])) : 'Desconocida'; ?>
                                            </p>
                                        </div>

                                        <div class="mb-3">
                                            <h6 class="text-sm">Estadísticas:</h6>
                                            <div class="d-flex">
                                                <div class="me-4">
                                                    <p class="text-sm mb-0">
                                                        <i class="fas fa-heart text-danger me-1"></i>
                                                        <?php echo isset($reactions) ? count($reactions) : '0'; ?> likes
                                                    </p>
                                                </div>
                                                <div>
                                                    <p class="text-sm mb-0">
                                                        <i class="fas fa-comment text-info me-1"></i>
                                                        <?php echo is_array($comments) ? count($comments) : '0'; ?> comentarios
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-header pb-0">
                                        <h6 class="mb-0">Autor del Reel</h6>
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
                                                    <p class="text-xs text-muted mb-0">ID: <?php echo $reel['usuario_id']; ?></p>
                                                    <a href="user-detail.php?id=<?php echo $reel['id_usuario']; ?>" class="btn btn-link text-info p-0 mt-1">
                                                        <i class="fas fa-user me-1"></i>Ver Perfil
                                                    </a>
                                                </div>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-warning text-sm" role="alert">
                                                No se pudo obtener información del usuario con ID: <?php echo $reel['id_usuario']; ?>
                                            </div>
                                        <?php endif; ?>

                                        <hr class="horizontal dark my-3">

                                        <?php if (isset($reel['hashtags']) && !empty($reel['hashtags'])): ?>
                                            <div class="mb-3">
                                                <h6 class="text-sm mb-2">Hashtags:</h6>
                                                <div>
                                                    <?php
                                                    $hashtags = is_array($reel['hashtags']) ? $reel['hashtags'] : explode(',', $reel['hashtags']);
                                                    foreach ($hashtags as $hashtag):
                                                        $tag = trim($hashtag);
                                                        if (!empty($tag)):
                                                    ?>
                                                            <span class="badge bg-gradient-info me-1 mb-1">#<?php echo htmlspecialchars($tag); ?></span>
                                                    <?php
                                                        endif;
                                                    endforeach;
                                                    ?>
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
                                    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">Comentarios (<?php echo is_array($comments) ? count($comments) : '0'; ?>)</h6>
                                    </div>
                                    <div class="card-body">
                                        <?php if (is_array($comments) && count($comments) > 0): ?>
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
                                                                        <div class="d-flex flex-column justify-content-center">
                                                                            <h6 class="mb-0 text-sm">ID: <?php echo $comment['id_usuario']; ?></h6>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <p class="text-xs font-weight-bold mb-0"><?php echo htmlspecialchars(substr($comment['contenido'], 0, 50)) . (strlen($comment['contenido']) > 50 ? '...' : ''); ?></p>
                                                                </td>
                                                                <td>
                                                                    <span class="text-secondary text-xs font-weight-bold"><?php echo date('d/m/Y H:i', strtotime($comment['fecha_creacion'])); ?></span>
                                                                </td>
                                                                <td>
                                                                    <a href="comment-detail.php?id=<?php echo $comment['id']; ?>&type=reel&content_id=<?php echo $reelId; ?>" class="btn btn-link text-info p-0">
                                                                        <i class="fas fa-eye me-1"></i>Ver
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    </tbody>
                                                </table>
                                            </div>
                                        <?php else: ?>
                                            <div class="alert alert-info text-white text-sm" role="alert">
                                                No hay comentarios para este reel.
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
                                            <button type="button" class="btn btn-danger me-2" data-bs-toggle="modal" data-bs-target="#deleteReelModal">
                                                <i class="fas fa-trash me-2"></i>Eliminar Reel
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

<!-- Delete Reel Modal -->
<div class="modal fade" id="deleteReelModal" tabindex="-1" aria-labelledby="deleteReelModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteReelModalLabel">Confirmar Eliminación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                ¿Estás seguro de que deseas eliminar este reel? Esta acción no se puede deshacer.
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="confirmDeleteReel">Eliminar</button>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Handle reel deletion
        const confirmDeleteReelBtn = document.getElementById('confirmDeleteReel');

        if (confirmDeleteReelBtn) {
            confirmDeleteReelBtn.addEventListener('click', function() {
                const reelId = <?php echo $reelId; ?>;

                fetch('<?php echo REELS_API; ?>/eliminarReel/' + reelId, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error al eliminar el reel');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Show success message and redirect
                        alert('Reel eliminado correctamente');
                        window.location.href = 'index.php';
                    })
                    .then(data => {
                        // Show success message and redirect
                        alert('Reel eliminado correctamente');
                        window.location.href = 'index.php';
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Error al eliminar el reel. Por favor, inténtalo de nuevo.');
                    });
            });
        }
    });
</script>

<?php include 'views/templates/footer.php'; ?>