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

// Check if user ID is provided
if (!isset($_GET['id']) || empty($_GET['id'])) {
    header('Location: users.php');
    exit();
}

$userId = $_GET['id'];
$currentPage = 'Detalle de Usuario';

// Get user details
$userDetails = callAPI('GET', USERS_API . '/usuario/' . $userId, null);

if (!$userDetails) {
    // User not found
    header('Location: users.php');
    exit();
}

// Get user's posts
$userPosts = callAPI('GET', POSTS_API . '/obtener-por-usuario/' . $userId, null);
$postCount = is_array($userPosts) ? count($userPosts) : 0;

// Sort posts by date (newest first)
if ($postCount > 0) {
    usort($userPosts, function($a, $b) {
        return strtotime($b['fecha_creacion'] ?? 0) - strtotime($a['fecha_creacion'] ?? 0);
    });
}

// Get user's reels
$userReels = callAPI('GET', REELS_API . '/reelsUsuario/' . $userId, null);
$reelCount = is_array($userReels) ? count($userReels) : 0;

// Sort reels by date (newest first)
if ($reelCount > 0) {
    usort($userReels, function($a, $b) {
        return strtotime($b['fecha_creacion'] ?? 0) - strtotime($a['fecha_creacion'] ?? 0);
    });
}

// Get user's comments
$userComments = callAPI('GET', COMMENTS_API . '/comentarios/' . $userId, null);
$commentCount = is_array($userComments) ? count($userComments) : 0;

// Sort comments by date (newest first)
if ($commentCount > 0) {
    usort($userComments, function($a, $b) {
        return strtotime($b['fecha_creacion'] ?? 0) - strtotime($a['fecha_creacion'] ?? 0);
    });
}

include 'views/templates/header.php';
include 'views/templates/sidebar.php';
?>

<main class="main-content position-relative border-radius-lg">
    <?php include 'views/templates/navbar.php'; ?>

    <div class="container-fluid py-4">
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0">
                        <div class="d-flex align-items-center">
                            <h6 class="mb-0">Información del Usuario</h6>
                            <a href="users.php" class="btn btn-outline-secondary btn-sm ms-auto">
                                <i class="fas fa-arrow-left me-2"></i>Volver
                            </a>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <?php if (isset($userDetails['avatar']) && !empty($userDetails['avatar'])): ?>
                                    <img src="<?php echo 'http://localhost:3009' . $userDetails['avatar']; ?>"
                                        class="img-fluid rounded-circle mb-3"
                                        style="width: 150px; height: 150px; object-fit: cover;"
                                        alt="<?php echo htmlspecialchars($userDetails['username']); ?>">
                                <?php else: ?>
                                    <div class="avatar bg-gradient-primary rounded-circle text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                                        style="width: 150px; height: 150px; font-size: 60px;">
                                        <?php echo strtoupper(substr($userDetails['username'] ?? 'U', 0, 1)); ?>
                                    </div>
                                <?php endif; ?>

                                <h4 class="font-weight-bold"><?php echo htmlspecialchars($userDetails['username'] ?? 'N/A'); ?></h4>
                                <p class="text-xs text-secondary mb-0">
                                    Estado:
                                    <span class="badge <?php echo ($userDetails['estado'] ?? '') === 'conectado' ? 'bg-gradient-success' : 'bg-gradient-secondary'; ?>">
                                        <?php echo ucfirst(htmlspecialchars($userDetails['estado'] ?? 'desconocido')); ?>
                                    </span>
                                </p>
                                <?php if (isset($userDetails['lastSeen']) && !empty($userDetails['lastSeen'])): ?>
                                    <p class="text-xs text-secondary mb-0 mt-2">
                                        Última conexión: <?php echo date('d/m/Y H:i', strtotime($userDetails['lastSeen'])); ?>
                                    </p>
                                <?php endif; ?>
                            </div>

                            <div class="col-md-8">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Nombre</label>
                                            <p class="form-control-static"><?php echo htmlspecialchars($userDetails['nombre'] ?? 'N/A'); ?></p>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Email</label>
                                            <p class="form-control-static"><?php echo htmlspecialchars($userDetails['email'] ?? 'N/A'); ?></p>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Fecha de registro</label>
                                            <p class="form-control-static">
                                                <?php echo isset($userDetails['created_at']) ? date('d/m/Y', strtotime($userDetails['created_at'])) : 'N/A'; ?>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label class="form-control-label">Rol</label>
                                            <p class="form-control-static">
                                                <span class="badge <?php echo ($userDetails['rol'] ?? '') === 'administrador' ? 'bg-gradient-primary' : 'bg-gradient-info'; ?>">
                                                    <?php echo ucfirst(htmlspecialchars($userDetails['rol'] ?? 'usuario')); ?>
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="row mt-4">
                                    <div class="col-md-4">
                                        <div class="card mini-stats-wid">
                                            <div class="card-body">
                                                <div class="d-flex">
                                                    <div class="flex-grow-1">
                                                        <p class="text-muted fw-medium mb-2">Publicaciones</p>
                                                        <h4 class="mb-0"><?php echo $postCount; ?></h4>
                                                    </div>
                                                    <div class="icon icon-shape bg-gradient-danger shadow-danger text-center rounded-circle">
                                                        <span class="avatar-title">
                                                            <i class="fas fa-image pb-2"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="card mini-stats-wid">
                                            <div class="card-body">
                                                <div class="d-flex">
                                                    <div class="flex-grow-1">
                                                        <p class="text-muted fw-medium mb-2">Reels</p>
                                                        <h4 class="mb-0"><?php echo $reelCount; ?></h4>
                                                    </div>
                                                    <div class="icon icon-shape bg-gradient-primary shadow-primary text-center rounded-circle">
                                                        <span class="avatar-title">
                                                            <i class="fas fa-video font-size-24"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="col-md-4">
                                        <div class="card mini-stats-wid">
                                            <div class="card-body">
                                                <div class="d-flex">
                                                    <div class="flex-grow-1">
                                                        <p class="text-muted fw-medium mb-2">Comentarios</p>
                                                        <h4 class="mb-0"><?php echo $commentCount; ?></h4>
                                                    </div>
                                                    <div class="icon icon-shape bg-gradient-success shadow-success text-center rounded-circle">
                                                        <span class="avatar-title">
                                                            <i class="fas fa-comment font-size-24"></i>
                                                        </span>
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
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0">
                        <h6>Actividad Reciente</h6>
                    </div>
                    <div class="card-body px-0 pt-0 pb-2">
                        <ul class="nav nav-tabs" id="activityTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="posts-tab" data-bs-toggle="tab" data-bs-target="#posts" type="button" role="tab" aria-controls="posts" aria-selected="true">Publicaciones</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="reels-tab" data-bs-toggle="tab" data-bs-target="#reels" type="button" role="tab" aria-controls="reels" aria-selected="false">Reels</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="comments-tab" data-bs-toggle="tab" data-bs-target="#comments" type="button" role="tab" aria-controls="comments" aria-selected="false">Comentarios</button>
                            </li>
                        </ul>
                        <div class="tab-content p-3" id="activityTabContent">
                            <!-- Posts Tab -->
                            <div class="tab-pane fade show active" id="posts" role="tabpanel" aria-labelledby="posts-tab">
                                <?php if ($postCount > 0): ?>
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Contenido</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Likes</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Comentarios</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($userPosts as $post): ?>
                                                    <tr>
                                                        <td>
                                                            <div class="d-flex px-2 py-1">
                                                                <?php if (isset($post['imagen']) && !empty($post['imagen'])): ?>
                                                                    <div class="me-3 position-relative">
                                                                        <?php $imageUrl = 'http://localhost:3008/uploads/' . $post['imagen']; ?>
                                                                        <img src="<?php echo $imageUrl; ?>" class="avatar avatar-sm rounded-circle" alt="post image">
                                                                        <button type="button" class="btn btn-sm btn-primary position-absolute" 
                                                                                style="bottom: -5px; right: -5px; padding: 2px 4px;" 
                                                                                onclick="showImageInModal('<?php echo $imageUrl; ?>')"
                                                                                data-bs-toggle="modal" 
                                                                                data-bs-target="#imageModal">
                                                                            <i class="fas fa-search-plus fa-xs"></i>
                                                                        </button>
                                                                    </div>
                                                                <?php endif; ?>
                                                                <div class="d-flex flex-column justify-content-center">
                                                                    <h6 class="mb-0 text-sm"><?php echo htmlspecialchars(substr($post['contenido'] ?? 'Sin contenido', 0, 50)) . (strlen($post['contenido'] ?? '') > 50 ? '...' : ''); ?></h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo isset($post['fecha_creacion']) ? date('d/m/Y H:i', strtotime($post['fecha_creacion'])) : 'N/A'; ?></p>
                                                        </td>
                                                        <td>
                                                            <?php 
                                                            $postId = isset($post['id']) && is_numeric($post['id'])? $post['id'] : 0;
                                                            $postLikes = callAPI('GET', REACCIONES_API. '/reacciones-publicacion/'. $postId, null);
                                                            $postLikesCount = is_array($postLikes)? count($postLikes) : 0;
                                                            
                                                            ?>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo $postLikesCount; ?></p>
                                                        </td>
                                                        <td>
                                                            <?php 
                                                            $postId = isset($post['id']) && is_numeric($post['id']) ? $post['id'] : 0;
                                                            $postComments = callAPI('GET', COMMENTS_API . '/publicaciones/' . $postId . '/comentarios', null);
                                                            $postCommentsCount = is_array($postComments) ? count($postComments) : 0;
                                                            ?>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo $postCommentsCount; ?></p>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php else: ?>
                                    <div class="text-center py-4">
                                        <p class="text-muted">Este usuario no tiene publicaciones.</p>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <!-- Reels Tab -->
                            <div class="tab-pane fade" id="reels" role="tabpanel" aria-labelledby="reels-tab">
                                <?php if ($reelCount > 0): ?>
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Título</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Likes</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Comentarios</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <?php foreach ($userReels as $reel): ?>
                                                    <tr>
                                                        <td>
                                                            <div class="d-flex px-2 py-1">
                                                                <div class="d-flex flex-column justify-content-center">
                                                                    <h6 class="mb-0 text-sm"><?php echo htmlspecialchars(substr($reel['descripcion'] ?? 'Sin título', 0, 50)) . (strlen($reel['titulo'] ?? '') > 50 ? '...' : ''); ?></h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo isset($reel['fecha_creacion']) ? date('d/m/Y H:i', strtotime($reel['fecha_creacion'])) : 'N/A'; ?></p>
                                                        </td>
                                                        <td>
                                                            <?php 
                                                            $reelId = isset($reel['id']) && is_numeric($reel['id'])? $reel['id'] : 0;
                                                            $reelLikes = callAPI('GET', REACCIONES_API. '/reacciones-reel/'. $reelId, null);
                                                            $reelLikesCount = is_array($reelLikes)? count($reelLikes) : 0;
                                                            
                                                            ?>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo $reelLikesCount; ?></p>
                                                        </td>
                                                        <td>
                                                            <?php 
                                                            $reelId = isset($reel['id']) && is_numeric($reel['id']) ? $reel['id'] : 0;
                                                            $reelComments = callAPI('GET', COMMENTS_API . '/reels/' . $reelId . '/comentarios', null);
                                                            $reelCommentsCount = is_array($reelComments) ? count($reelComments) : 0;
                                                            ?>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo $reelCommentsCount; ?></p>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php else: ?>
                                    <div class="text-center py-4">
                                        <p class="text-muted">Este usuario no tiene reels.</p>
                                    </div>
                                <?php endif; ?>
                            </div>

                            <!-- Comments Tab -->
                            <div class="tab-pane fade" id="comments" role="tabpanel" aria-labelledby="comments-tab">
                                <?php if ($commentCount > 0): ?>
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Comentario</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Fecha</th>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Contenido</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <?php foreach ($userComments as $comment): ?>
                                                    <tr>
                                                        <td>
                                                            <div class="d-flex px-2 py-1">
                                                                <div class="d-flex flex-column justify-content-center">
                                                                    <h6 class="mb-0 text-sm"><?php echo htmlspecialchars(substr($comment['contenido'] ?? 'Sin contenido', 0, 50)) . (strlen($comment['contenido'] ?? '') > 50 ? '...' : ''); ?></h6>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p class="text-xs font-weight-bold mb-0"><?php echo isset($comment['fecha_creacion']) ? date('d/m/Y H:i', strtotime($comment['fecha_creacion'])) : 'N/A'; ?></p>
                                                        </td>
                                                        <td>
                                                            <p class="text-xs font-weight-bold mb-0">
                                                                <?php
                                                                $contentType = $comment['tipo_contenido'] ?? 'desconocido';
                                                                $contentIcon = $contentType === 'publicacion' ? 'image' : ($contentType === 'reel' ? 'video' : 'comment');
                                                                echo '<i class="fas fa-' . $contentIcon . ' me-1"></i> ' . ucfirst($contentType);
                                                                ?>
                                                            </p>
                                                        </td>
                                                    </tr>
                                                <?php endforeach; ?>
                                            </tbody>
                                        </table>
                                    </div>
                                <?php else: ?>
                                    <div class="text-center py-4">
                                        <p class="text-muted">Este usuario no tiene comentarios.</p>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Actions -->
        <div class="row">
            <div class="col-12">
                <div class="card mb-4">
                    <div class="card-header pb-0">
                        <h6>Acciones</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <button type="button" class="btn btn-primary w-100" data-bs-toggle="modal" data-bs-target="#sendMessageModal">
                                    <i class="fas fa-bell me-2"></i>Enviar Notificacion
                                </button>
                            </div>

                            <?php if (($userDetails['estado'] ?? '') !== 'suspendido'): ?>
                                <div class="col-md-4 mb-3">
                                    <button type="button" class="btn btn-warning w-100" id="btnSuspendUser" data-user-id="<?php echo $userId; ?>">
                                        <i class="fas fa-user-slash me-2"></i>Suspender Usuario
                                    </button>
                                </div>
                            <?php else: ?>
                                <div class="col-md-4 mb-3">
                                    <button type="button" class="btn btn-success w-100" id="btnActivateUser" data-user-id="<?php echo $userId; ?>">
                                        <i class="fas fa-user-check me-2"></i>Activar Usuario
                                    </button>
                                </div>
                            <?php endif; ?>

                            <div class="col-md-4 mb-3">
                                <button type="button" class="btn btn-danger w-100" data-bs-toggle="modal" data-bs-target="#deleteUserModal">
                                    <i class="fas fa-trash me-2"></i>Eliminar Usuario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>

<!-- Send Message Modal -->
<div class="modal fade" id="sendMessageModal" tabindex="-1" aria-labelledby="sendMessageModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="sendMessageModalLabel">Enviar Notificación a <?php echo htmlspecialchars($userDetails['username'] ?? ''); ?></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="sendMessageForm">
                    <input type="hidden" name="usuario_id" value="<?php echo $userId; ?>">
                    <div class="mb-3">
                        <label for="notificationType" class="form-label">Tipo de Notificación</label>
                        <select class="form-control" id="notificationType" name="tipo" required>
                            <option value="nueva_publicacion">Nueva Publicación</option>
                            <option value="nuevo_seguidor">Nuevo Seguidor</option>
                            <option value="nuevo_comentario">Nuevo Comentario</option>
                            <option value="nueva_reaccion">Nueva Reacción</option>
                            <option value="sistema">Sistema</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="messageContent" class="form-label">Contenido</label>
                        <textarea class="form-control" id="messageContent" name="contenido" rows="5" required></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnSendMessage">Enviar</button>
            </div>
        </div>
    </div>
</div>

<!-- Delete User Modal -->
<div class="modal fade" id="deleteUserModal" tabindex="-1" aria-labelledby="deleteUserModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="deleteUserModalLabel">Confirmar Eliminación</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>¿Estás seguro de que deseas eliminar al usuario <strong><?php echo htmlspecialchars($userDetails['username'] ?? ''); ?></strong>?</p>
                <p class="text-danger">Esta acción no se puede deshacer y eliminará todos los datos asociados al usuario.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger" id="btnConfirmDelete" data-user-id="<?php echo $userId; ?>">Eliminar</button>
            </div>
        </div>
    </div>
</div>
<!-- Image Modal -->
<div class="modal fade" id="imageModal" tabindex="-1" aria-labelledby="imageModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="imageModalLabel">Vista ampliada</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <img id="expandedImage" src="" class="img-fluid" alt="Imagen ampliada">
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
    function showImageInModal(imageUrl) {
            console.log('Direct function - Image URL:', imageUrl);
            document.getElementById('expandedImage').src = imageUrl;
        }

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Bootstrap 5 tabs properly
        const triggerTabList = [].slice.call(document.querySelectorAll('#activityTab button'));
        triggerTabList.forEach(function(triggerEl) {
            const tabTrigger = new bootstrap.Tab(triggerEl);
            
            triggerEl.addEventListener('click', function(event) {
                event.preventDefault();
                tabTrigger.show();
            });
        });

                        // Send Notification
                        document.getElementById('btnSendMessage').addEventListener('click', function() {
                const form = document.getElementById('sendMessageForm');
                const formData = new FormData(form);
                const urlParams = new URLSearchParams(window.location.search);
                let userId = urlParams.get('id');
                const notificationData = {
                    usuario_id: userId,
                    tipo: formData.get('tipo'),
                    contenido: formData.get('contenido')
                };

                console.log('Sending notification data:', notificationData);

                fetch('<?php echo NOTIFICATIONS_API; ?>/send', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(notificationData)
                })
                .then(response => {
                    console.log('Response status:', response.status);
                    // Check if response is ok (status in the range 200-299)
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.status);
                    }
                    return response.text().then(text => {
                        try {
                            return text ? JSON.parse(text) : {};
                        } catch (e) {
                            console.error('Error parsing JSON:', e, 'Raw response:', text);
                            return { success: false, message: 'Invalid server response: ' + text };
                        }
                    });
                })
                .then(data => {
                    console.log('Response data:', data);
                    if (data.mensaje && data.mensaje.includes('éxito')) {
                        alert('Notificación enviada correctamente');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('sendMessageModal'));
                        modal.hide();
                        form.reset();
                    } else {
                        console.error('API Error:', data);
                        alert('Error al enviar la notificación: ' + (data.message || 'Error desconocido'));
                    }
                })
                .catch(error => {
                    console.error('Fetch Error:', error);
                    alert('Error al enviar la notificación: ' + error.message);
                });
            });

        // Suspend/Activate User
        const btnSuspendUser = document.getElementById('btnSuspendUser');
        if (btnSuspendUser) {
            btnSuspendUser.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                updateUserStatus(userId, 'suspendido');
            });
        }

        // Handle image modal
        const imageModal = document.getElementById('imageModal');
        if (imageModal) {
            imageModal.addEventListener('show.bs.modal', function(event) {
                const button = event.relatedTarget;
                const imageUrl = button.getAttribute('data-image-url');
                console.log('Image URL:', imageUrl); // Debug log
                
                document.getElementById('expandedImage').src = imageUrl;
            });
        }

        
        

        const btnActivateUser = document.getElementById('btnActivateUser');
        if (btnActivateUser) {
            btnActivateUser.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');
                updateUserStatus(userId, 'conectado');
            });
        }

        function updateUserStatus(userId, status) {
            const urlParams = new URLSearchParams(window.location.search);
            let idUser = urlParams.get('id');
            fetch(`<?php echo USERS_API; ?>/suspender-usuario/${idUser}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        estado: status
                    })
                })
                .then(response => response.json())
                .then(data => {
                    // Check for both success flag and mensaje property
                    if (data.success || data.mensaje === 'Estado del usuario actualizado') {
                        alert(`Usuario ${status === 'conectado' ? 'activado' : 'suspendido'} correctamente`);
                        location.reload();
                    } else {
                        console.error('Error response:', data);
                        alert(`Error al ${status === 'conectado' ? 'activar' : 'suspender'} al usuario: ` + (data.mensaje || 'Error desconocido'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert(`Error al ${status === 'conectado' ? 'activar' : 'suspender'} al usuario`);
                });
        }
        // Delete User
        document.getElementById('btnConfirmDelete').addEventListener('click', function() {
            const urlParams = new URLSearchParams(window.location.search);
            let idUser = urlParams.get('id');

            fetch(`<?php echo USERS_API; ?>/eliminar-usuario/${idUser}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer <?php echo $_SESSION["admin_token"] ?? ""; ?>',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    // Check for both success flag and mensaje property
                    if (data.success || data.mensaje) {
                        alert('Usuario eliminado correctamente');
                        window.location.href = 'users.php';
                    } else {
                        alert('Error al eliminar al usuario: ' + (data.message || 'Error desconocido'));
                        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteUserModal'));
                        modal.hide();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error al eliminar al usuario');
                });
        });
    });
</script>
<?php include 'views/templates/footer.php'; ?>